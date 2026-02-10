import { useState, useEffect, useRef } from 'react';
import {
  BellAlertIcon,
  XMarkIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  site: string;
  zone: string;
  camera: string;
  timestamp: Date;
  acknowledged: boolean;
  thumbnailUrl?: string;
}

interface AlertScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simulated alerts for demo
const generateDemoAlert = (): Alert => {
  const titles = [
    { type: 'critical', text: 'No Hardhat Detected' },
    { type: 'critical', text: 'Exclusion Zone Breach' },
    { type: 'warning', text: 'Missing Safety Vest' },
    { type: 'warning', text: 'Proximity Alert' },
    { type: 'info', text: 'Camera Offline' },
    { type: 'info', text: 'Shift Change Detected' },
  ];
  const sites = ['Main Construction Site', 'Warehouse Complex B', 'Manufacturing Plant'];
  const zones = ['Heavy Equipment Area', 'Loading Dock', 'Assembly Line', 'Entrance'];
  const cameras = ['Entrance Camera', 'Dock Camera', 'Line Camera 1', 'Storage Camera'];
  
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  
  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: randomTitle.type as Alert['type'],
    title: randomTitle.text,
    description: `Safety violation detected requiring immediate attention.`,
    site: sites[Math.floor(Math.random() * sites.length)],
    zone: zones[Math.floor(Math.random() * zones.length)],
    camera: cameras[Math.floor(Math.random() * cameras.length)],
    timestamp: new Date(),
    acknowledged: false,
    thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/200/150`,
  };
};

export default function AlertScreen({ isOpen, onClose }: AlertScreenProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate initial alerts
  useEffect(() => {
    if (isOpen && alerts.length === 0) {
      const initialAlerts = Array.from({ length: 5 }, generateDemoAlert);
      setAlerts(initialAlerts);
    }
  }, [isOpen]);

  // Simulate new alerts coming in
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAlert = generateDemoAlert();
        setAlerts(prev => [newAlert, ...prev].slice(0, 50));
        
        if (soundEnabled && newAlert.type === 'critical') {
          playAlertSound();
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isOpen, soundEnabled]);

  const playAlertSound = () => {
    // In production, you would play an actual audio file
    // For demo, we'll use Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
      
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        osc2.connect(gainNode);
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        osc2.start();
        osc2.stop(audioContext.currentTime + 0.2);
      }, 250);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
    );
  };

  const acknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  const clearAcknowledged = () => {
    setAlerts(prev => prev.filter(a => !a.acknowledged));
  };

  const filteredAlerts = alerts.filter(a => 
    filter === 'all' || a.type === filter
  );

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <BellAlertIcon className="w-6 h-6 text-red-400 animate-pulse" />
            <h1 className="text-xl font-bold text-white">Alert Monitor</h1>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4 ml-8">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-400">{criticalCount} Critical</span>
            </div>
            <div className="text-sm text-gray-400">
              {unacknowledgedCount} Unacknowledged
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-500'
            }`}
            title={soundEnabled ? 'Sound On' : 'Sound Off'}
          >
            {soundEnabled ? (
              <SpeakerWaveIcon className="w-5 h-5" />
            ) : (
              <SpeakerXMarkIcon className="w-5 h-5" />
            )}
          </button>
          
          <button
            onClick={acknowledgeAll}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            Acknowledge All
          </button>
          
          <button
            onClick={clearAcknowledged}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
          >
            Clear Acknowledged
          </button>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-700 bg-gray-800/50">
        {(['all', 'critical', 'warning', 'info'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? f === 'critical' ? 'bg-red-500/20 text-red-400' :
                  f === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  f === 'info' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-700 text-white'
                : 'text-gray-500 hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="ml-2">
                ({alerts.filter(a => a.type === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts Grid */}
      <div className="p-4 overflow-auto" style={{ height: 'calc(100vh - 140px)' }}>
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <CheckCircleIcon className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">No alerts to display</p>
            <p className="text-sm mt-1">All clear!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={`bg-gray-800 rounded-xl border overflow-hidden transition-all ${
                  alert.acknowledged
                    ? 'border-gray-700 opacity-60'
                    : alert.type === 'critical'
                    ? 'border-red-500 shadow-lg shadow-red-500/20 animate-pulse-slow'
                    : alert.type === 'warning'
                    ? 'border-yellow-500'
                    : 'border-blue-500'
                }`}
              >
                {/* Thumbnail */}
                {alert.thumbnailUrl && (
                  <div className="relative aspect-video bg-gray-900">
                    <img
                      src={alert.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                      alert.type === 'critical' ? 'bg-red-500 text-white' :
                      alert.type === 'warning' ? 'bg-yellow-500 text-black' :
                      'bg-blue-500 text-white'
                    }`}>
                      {alert.type.toUpperCase()}
                    </div>
                  </div>
                )}
                
                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-white">{alert.title}</h3>
                    {!alert.acknowledged && alert.type === 'critical' && (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 animate-bounce" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">{alert.description}</p>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>📍 {alert.site} • {alert.zone}</p>
                    <p>📹 {alert.camera}</p>
                    <p className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className={`w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        alert.type === 'critical'
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : alert.type === 'warning'
                          ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      Acknowledge
                    </button>
                  )}
                  
                  {alert.acknowledged && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-green-400 text-sm">
                      <CheckCircleIcon className="w-4 h-4" />
                      Acknowledged
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audio element for alerts */}
      <audio ref={audioRef} />
      
      {/* CSS for custom animation */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
