import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldExclamationIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  BellAlertIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface SecurityAlert {
  id: string;
  type: 'unattended_bag' | 'suspicious_package' | 'loitering' | 'crowd_density' | 'perimeter_breach';
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  zone: string;
  camera: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_alarm';
  description: string;
  imageUrl?: string;
  durationSeconds?: number;
}

const ALERT_TYPES = {
  unattended_bag: { label: 'Unattended Bag', icon: BriefcaseIcon, color: 'text-red-500', bg: 'bg-red-500/20' },
  suspicious_package: { label: 'Suspicious Package', icon: ExclamationTriangleIcon, color: 'text-orange-500', bg: 'bg-orange-500/20' },
  loitering: { label: 'Loitering', icon: ClockIcon, color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
  crowd_density: { label: 'Crowd Density', icon: UserGroupIcon, color: 'text-blue-500', bg: 'bg-blue-500/20' },
  perimeter_breach: { label: 'Perimeter Breach', icon: ShieldExclamationIcon, color: 'text-purple-500', bg: 'bg-purple-500/20' },
};

const DEMO_ZONES = [
  'Departure Lounge',
  'Baggage Claim',
  'Security Checkpoint',
  'Gate Area B1-B10',
  'Arrivals Hall',
];

const DEMO_CAMERAS = [
  'Departure Lounge Cam 1',
  'Departure Lounge Cam 2',
  'Baggage Claim Cam',
  'Security Checkpoint Cam',
  'Gate Area Cam',
  'Arrivals Hall Cam',
];

// Generate demo alerts
const generateAlerts = (): SecurityAlert[] => {
  const alerts: SecurityAlert[] = [];
  const types: Array<SecurityAlert['type']> = ['unattended_bag', 'suspicious_package', 'loitering', 'crowd_density', 'perimeter_breach'];
  const severities: Array<SecurityAlert['severity']> = ['critical', 'high', 'medium', 'low'];
  const statuses: Array<SecurityAlert['status']> = ['active', 'investigating', 'resolved', 'false_alarm'];

  for (let i = 0; i < 15; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const zone = DEMO_ZONES[Math.floor(Math.random() * DEMO_ZONES.length)];
    const camera = DEMO_CAMERAS[Math.floor(Math.random() * DEMO_CAMERAS.length)];
    
    alerts.push({
      id: `alert-${i + 1}`,
      type,
      severity: type === 'unattended_bag' || type === 'suspicious_package' ? 
        (Math.random() > 0.5 ? 'critical' : 'high') : 
        severities[Math.floor(Math.random() * severities.length)],
      location: `Terminal A, ${zone}`,
      zone,
      camera,
      timestamp: new Date(Date.now() - Math.random() * 3600000 * 4).toISOString(),
      status: i < 3 ? 'active' : statuses[Math.floor(Math.random() * statuses.length)],
      description: type === 'unattended_bag' 
        ? `Unattended bag detected for ${Math.floor(60 + Math.random() * 180)} seconds`
        : type === 'loitering'
        ? `Person loitering for ${Math.floor(5 + Math.random() * 15)} minutes`
        : type === 'crowd_density'
        ? `Crowd density above threshold: ${Math.floor(80 + Math.random() * 20)}%`
        : `${ALERT_TYPES[type].label} detected`,
      durationSeconds: type === 'unattended_bag' ? Math.floor(60 + Math.random() * 300) : undefined,
    });
  }

  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default function AirportSecurity() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setAlerts(generateAlerts());
    
    // Simulate real-time alerts
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newAlert: SecurityAlert = {
          id: `alert-${Date.now()}`,
          type: Math.random() > 0.6 ? 'unattended_bag' : 'loitering',
          severity: Math.random() > 0.5 ? 'critical' : 'high',
          location: `Terminal A, ${DEMO_ZONES[Math.floor(Math.random() * DEMO_ZONES.length)]}`,
          zone: DEMO_ZONES[Math.floor(Math.random() * DEMO_ZONES.length)],
          camera: DEMO_CAMERAS[Math.floor(Math.random() * DEMO_CAMERAS.length)],
          timestamp: new Date().toISOString(),
          status: 'active',
          description: 'New alert detected - requires immediate attention',
          durationSeconds: 0,
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 14)]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    if (filter !== 'all' && alert.type !== filter) return false;
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    unattendedBags: alerts.filter(a => a.type === 'unattended_bag').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  const handleResolve = (alertId: string, resolution: 'resolved' | 'false_alarm') => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: resolution } : a
    ));
    setSelectedAlert(null);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldExclamationIcon className="w-8 h-8 text-blue-400" />
            Airport Security Monitor
          </h1>
          <p className="text-gray-400 mt-1">Real-time unattended bag and security threat detection</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live Monitoring
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BellAlertIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Alerts</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-4 border border-red-500/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.active}</p>
              <p className="text-sm text-gray-500">Active Alerts</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4 border border-orange-500/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <BriefcaseIcon className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">{stats.unattendedBags}</p>
              <p className="text-sm text-gray-500">Unattended Bags</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
              <p className="text-sm text-gray-500">Resolved</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="all">All Alert Types</option>
          <option value="unattended_bag">Unattended Bag</option>
          <option value="suspicious_package">Suspicious Package</option>
          <option value="loitering">Loitering</option>
          <option value="crowd_density">Crowd Density</option>
          <option value="perimeter_breach">Perimeter Breach</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="false_alarm">False Alarm</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert List */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Security Alerts</h2>
          </div>
          <div className="divide-y divide-gray-700 max-h-[600px] overflow-y-auto">
            {filteredAlerts.map((alert) => {
              const alertType = ALERT_TYPES[alert.type];
              const Icon = alertType.icon;
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-4 cursor-pointer hover:bg-gray-700/50 transition-colors ${
                    alert.status === 'active' ? 'bg-red-500/10' : ''
                  } ${selectedAlert?.id === alert.id ? 'bg-gray-700' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${alertType.bg}`}>
                      <Icon className={`w-6 h-6 ${alertType.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${alertType.color}`}>
                          {alertType.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-500 text-white' :
                          alert.severity === 'high' ? 'bg-orange-500 text-white' :
                          alert.severity === 'medium' ? 'bg-yellow-500 text-black' :
                          'bg-gray-500 text-white'
                        }`}>
                          {alert.severity}
                        </span>
                        {alert.status === 'active' && (
                          <span className="flex items-center gap-1 text-red-400 text-xs">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{alert.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3" />
                          {alert.zone}
                        </span>
                        <span className="flex items-center gap-1">
                          <VideoCameraIcon className="w-3 h-3" />
                          {alert.camera}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {formatTime(alert.timestamp)}
                        </span>
                        {alert.durationSeconds && (
                          <span className="text-orange-400">
                            Duration: {formatDuration(alert.durationSeconds)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      alert.status === 'active' ? 'bg-red-500/20 text-red-400' :
                      alert.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                      alert.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {alert.status.replace('_', ' ')}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Alert Detail / Camera Preview */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {selectedAlert ? (
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Alert Details</h3>
              
              {/* Simulated Camera Feed */}
              <div className="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                <div className="relative text-center">
                  <VideoCameraIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">{selectedAlert.camera}</p>
                  <p className="text-gray-600 text-xs">Live Feed</p>
                </div>
                {selectedAlert.status === 'active' && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-red-500 rounded text-xs text-white">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                )}
                {selectedAlert.type === 'unattended_bag' && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="border-2 border-red-500 border-dashed rounded-lg p-2 bg-red-500/20">
                      <p className="text-red-400 text-xs text-center">
                        Unattended bag detected in this area
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Alert Info */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className={ALERT_TYPES[selectedAlert.type].color}>
                    {ALERT_TYPES[selectedAlert.type].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Severity</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    selectedAlert.severity === 'critical' ? 'bg-red-500 text-white' :
                    selectedAlert.severity === 'high' ? 'bg-orange-500 text-white' :
                    'bg-yellow-500 text-black'
                  }`}>
                    {selectedAlert.severity.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span className="text-white">{selectedAlert.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Detected</span>
                  <span className="text-white">{new Date(selectedAlert.timestamp).toLocaleString()}</span>
                </div>
                {selectedAlert.durationSeconds && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="text-orange-400 font-mono">
                      {formatDuration(selectedAlert.durationSeconds)}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedAlert.status === 'active' && (
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => handleResolve(selectedAlert.id, 'resolved')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleResolve(selectedAlert.id, 'false_alarm')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    False Alarm
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 h-full flex flex-col items-center justify-center text-gray-500">
              <ShieldExclamationIcon className="w-12 h-12 mb-2" />
              <p>Select an alert to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
