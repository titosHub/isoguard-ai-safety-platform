import { useState, useRef, useCallback, useEffect } from 'react';
import {
  VideoCameraIcon,
  CameraIcon,
  StopIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

interface CapturedFrame {
  id: string;
  dataUrl: string;
  timestamp: Date;
  analyzed: boolean;
  violations?: string[];
}

interface DeviceCameraProps {
  onCapture?: (frame: CapturedFrame) => void;
  onAnalyze?: (frame: CapturedFrame) => void;
}

export default function DeviceCamera({ onCapture, onAnalyze }: DeviceCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedFrames, setCapturedFrames] = useState<CapturedFrame[]>([]);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Get available cameras
  useEffect(() => {
    const getDevices = async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0 && !selectedDevice) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error getting devices:', err);
      }
    };
    getDevices();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const constraints: MediaStreamConstraints = {
        video: selectedDevice 
          ? { deviceId: { exact: selectedDevice }, width: 1280, height: 720 }
          : { width: 1280, height: 720 },
        audio: false,
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      setStream(mediaStream);
      setIsStreaming(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  }, [selectedDevice]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const frame: CapturedFrame = {
      id: `frame-${Date.now()}`,
      dataUrl,
      timestamp: new Date(),
      analyzed: false,
    };
    
    setCapturedFrames(prev => [frame, ...prev].slice(0, 10));
    onCapture?.(frame);
  }, [onCapture]);

  const analyzeFrame = useCallback(async (frame: CapturedFrame) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const hasViolation = Math.random() > 0.4;
    const violations = hasViolation 
      ? [
          'No hardhat detected',
          Math.random() > 0.5 ? 'No safety vest' : undefined,
        ].filter(Boolean) as string[]
      : [];
    
    const analyzedFrame = { ...frame, analyzed: true, violations };
    
    setCapturedFrames(prev => 
      prev.map(f => f.id === frame.id ? analyzedFrame : f)
    );
    
    onAnalyze?.(analyzedFrame);
    setIsAnalyzing(false);
  }, [onAnalyze]);

  const switchCamera = useCallback(() => {
    const currentIndex = devices.findIndex(d => d.deviceId === selectedDevice);
    const nextIndex = (currentIndex + 1) % devices.length;
    setSelectedDevice(devices[nextIndex].deviceId);
    
    if (isStreaming) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  }, [devices, selectedDevice, isStreaming, stopCamera, startCamera]);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Camera Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <VideoCameraIcon className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Device Camera</h3>
          {isStreaming && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Live</span>
            </span>
          )}
        </div>
        
        {devices.length > 1 && (
          <button
            onClick={switchCamera}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Switch Camera"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Camera Feed */}
      <div className="relative aspect-video bg-gray-900">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <VideoCameraIcon className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Camera not active</p>
            <p className="text-sm mt-1">Click Start to begin streaming</p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 bg-red-500/10">
            <ExclamationCircleIcon className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Camera Error</p>
            <p className="text-sm mt-1 max-w-xs text-center">{error}</p>
          </div>
        )}

        {/* Overlay Controls */}
        {isStreaming && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <button
              onClick={captureFrame}
              className="p-4 bg-white rounded-full text-gray-900 hover:bg-gray-200 transition-colors shadow-lg"
              title="Capture Frame"
            >
              <CameraIcon className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          {!isStreaming ? (
            <button
              onClick={startCamera}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <VideoCameraIcon className="w-5 h-5" />
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <StopIcon className="w-5 h-5" />
              Stop Camera
            </button>
          )}
          
          {devices.length > 0 && (
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              {devices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${devices.indexOf(device) + 1}`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Captured Frames */}
      {capturedFrames.length > 0 && (
        <div className="p-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Captured Frames</h4>
          <div className="grid grid-cols-5 gap-2">
            {capturedFrames.slice(0, 5).map(frame => (
              <div
                key={frame.id}
                className="relative aspect-video rounded-lg overflow-hidden bg-gray-900 group cursor-pointer"
                onClick={() => !frame.analyzed && analyzeFrame(frame)}
              >
                <img
                  src={frame.dataUrl}
                  alt="Captured frame"
                  className="w-full h-full object-cover"
                />
                
                {/* Analysis Status */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {frame.analyzed ? (
                    frame.violations && frame.violations.length > 0 ? (
                      <div className="text-center">
                        <ExclamationCircleIcon className="w-6 h-6 text-red-400 mx-auto" />
                        <p className="text-xs text-red-400 mt-1">
                          {frame.violations.length} violation(s)
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <CheckCircleIcon className="w-6 h-6 text-green-400 mx-auto" />
                        <p className="text-xs text-green-400 mt-1">Safe</p>
                      </div>
                    )
                  ) : isAnalyzing ? (
                    <ArrowPathIcon className="w-6 h-6 text-blue-400 animate-spin" />
                  ) : (
                    <p className="text-xs text-white">Click to analyze</p>
                  )}
                </div>
                
                {/* Status Badge */}
                {frame.analyzed && (
                  <div className="absolute top-1 right-1">
                    {frame.violations && frame.violations.length > 0 ? (
                      <span className="w-3 h-3 bg-red-500 rounded-full block" />
                    ) : (
                      <span className="w-3 h-3 bg-green-500 rounded-full block" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
