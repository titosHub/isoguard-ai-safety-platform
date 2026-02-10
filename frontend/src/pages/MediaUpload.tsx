import { useState, useCallback, useRef } from 'react';
import {
  CloudArrowUpIcon,
  PhotoIcon,
  VideoCameraIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
  BeakerIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface UploadedMedia {
  id: string;
  filename: string;
  type: 'image' | 'video';
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  thumbnail?: string;
  purpose: 'analysis' | 'training';
  analysisResults?: {
    detections: Array<{ type: string; confidence: number }>;
    safetyScore: number;
    violationsFound: number;
  };
  error?: string;
}

const DETECTION_TYPES = [
  'no_hardhat',
  'no_safety_vest',
  'no_safety_glasses',
  'no_gloves',
  'proximity_violation',
  'exclusion_zone_breach',
  'fall_detection',
  'fire_smoke',
];

export default function MediaUpload() {
  const [uploads, setUploads] = useState<UploadedMedia[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [purpose, setPurpose] = useState<'analysis' | 'training'>('analysis');
  const [selectedDetectionType, setSelectedDetectionType] = useState('');
  const [labels, setLabels] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = (file: File): UploadedMedia => {
    const id = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const isVideo = file.type.startsWith('video/');
    
    return {
      id,
      filename: file.name,
      type: isVideo ? 'video' : 'image',
      size: file.size,
      status: 'uploading',
      progress: 0,
      purpose,
      thumbnail: isVideo ? undefined : URL.createObjectURL(file),
    };
  };

  const simulateUploadAndAnalysis = (upload: UploadedMedia) => {
    // Simulate upload progress
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(uploadInterval);
        
        // Start processing
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, progress: 100, status: 'processing' } : u
        ));
        
        // Simulate analysis
        setTimeout(() => {
          const hasViolation = Math.random() > 0.3;
          setUploads(prev => prev.map(u => 
            u.id === upload.id ? {
              ...u,
              status: 'completed',
              analysisResults: {
                detections: hasViolation ? [
                  { type: 'no_hardhat', confidence: 0.94 },
                  { type: 'no_safety_vest', confidence: 0.87 },
                ] : [
                  { type: 'person', confidence: 0.98 },
                ],
                safetyScore: hasViolation ? 45 + Math.floor(Math.random() * 30) : 90 + Math.floor(Math.random() * 10),
                violationsFound: hasViolation ? 1 + Math.floor(Math.random() * 2) : 0,
              }
            } : u
          ));
        }, 2000);
      } else {
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, progress } : u
        ));
      }
    }, 200);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const mediaFiles = files.filter(f => 
      f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    
    mediaFiles.forEach(file => {
      const upload = processFile(file);
      setUploads(prev => [...prev, upload]);
      simulateUploadAndAnalysis(upload);
    });
  }, [purpose]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const upload = processFile(file);
        setUploads(prev => [...prev, upload]);
        simulateUploadAndAnalysis(upload);
      });
    }
  };

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'processing':
        return <ArrowPathIcon className="w-5 h-5 text-yellow-400 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'error':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Media Upload</h1>
        <p className="text-gray-400 mt-1">Upload images and videos for AI analysis or model training</p>
      </div>

      {/* Purpose Selection */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Upload Purpose</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setPurpose('analysis')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              purpose === 'analysis'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <MagnifyingGlassIcon className={`w-8 h-8 mx-auto mb-2 ${
              purpose === 'analysis' ? 'text-blue-400' : 'text-gray-500'
            }`} />
            <h4 className={`font-medium ${purpose === 'analysis' ? 'text-white' : 'text-gray-400'}`}>
              Safety Analysis
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              Analyze images/videos for safety violations
            </p>
          </button>
          
          <button
            onClick={() => setPurpose('training')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
              purpose === 'training'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <BeakerIcon className={`w-8 h-8 mx-auto mb-2 ${
              purpose === 'training' ? 'text-purple-400' : 'text-gray-500'
            }`} />
            <h4 className={`font-medium ${purpose === 'training' ? 'text-white' : 'text-gray-400'}`}>
              AI Training Data
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              Add labeled data to improve AI accuracy
            </p>
          </button>
        </div>

        {/* Training-specific options */}
        {purpose === 'training' && (
          <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Detection Type</label>
              <select
                value={selectedDetectionType}
                onChange={(e) => setSelectedDetectionType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Select type...</option>
                {DETECTION_TYPES.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Labels (comma-separated)</label>
              <input
                type="text"
                value={labels}
                onChange={(e) => setLabels(e.target.value)}
                placeholder="e.g., hardhat, vest, person"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-700 hover:border-gray-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <CloudArrowUpIcon className={`w-16 h-16 mx-auto mb-4 ${
          dragActive ? 'text-blue-400' : 'text-gray-600'
        }`} />
        
        <h3 className="text-lg font-semibold text-white mb-2">
          {dragActive ? 'Drop files here' : 'Drag and drop files'}
        </h3>
        <p className="text-gray-500 mb-4">or</p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Files
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          Supports: JPG, PNG, GIF, MP4, MOV, AVI (max 500MB)
        </p>
      </div>

      {/* Upload List */}
      {uploads.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Uploads ({uploads.length})</h3>
          </div>
          
          <div className="divide-y divide-gray-700">
            {uploads.map(upload => (
              <div key={upload.id} className="p-4">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {upload.thumbnail ? (
                      <img src={upload.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : upload.type === 'video' ? (
                      <VideoCameraIcon className="w-8 h-8 text-gray-500" />
                    ) : (
                      <PhotoIcon className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(upload.status)}
                      <h4 className="font-medium text-white truncate">{upload.filename}</h4>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(upload.size)} • {upload.type} • {upload.purpose}
                    </p>
                    
                    {/* Progress bar */}
                    {(upload.status === 'uploading' || upload.status === 'processing') && (
                      <div className="mt-2">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              upload.status === 'processing' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {upload.status === 'uploading' ? 'Uploading...' : 'Processing with AI...'}
                        </p>
                      </div>
                    )}
                    
                    {/* Analysis Results */}
                    {upload.status === 'completed' && upload.analysisResults && (
                      <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Analysis Results</span>
                          <span className={`text-sm font-bold ${
                            upload.analysisResults.safetyScore >= 80 ? 'text-green-400' : 
                            upload.analysisResults.safetyScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            Safety Score: {upload.analysisResults.safetyScore}%
                          </span>
                        </div>
                        
                        {upload.analysisResults.violationsFound > 0 ? (
                          <div className="space-y-1">
                            {upload.analysisResults.detections
                              .filter(d => d.type !== 'person')
                              .map((detection, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <span className="text-red-400">
                                    ⚠ {detection.type.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-gray-400">
                                    {Math.round(detection.confidence * 100)}% confidence
                                  </span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-green-400">✓ No safety violations detected</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Remove button */}
                  <button
                    onClick={() => removeUpload(upload.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Training Datasets Summary */}
      {purpose === 'training' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Training Datasets</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DETECTION_TYPES.slice(0, 4).map(type => (
              <div key={type} className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">{type.replace(/_/g, ' ')}</p>
                <p className="text-2xl font-bold text-white">{Math.floor(Math.random() * 500) + 100}</p>
                <p className="text-xs text-gray-500">samples</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
