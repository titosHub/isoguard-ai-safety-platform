import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  BellAlertIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CubeIcon,
  FireIcon,
  SpeakerWaveIcon,
  CloudIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  HeartIcon,
  DocumentChartBarIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Types
interface SafetyAlert {
  id: string;
  type: 'fog' | 'tmm_collision' | 'ppe_violation' | 'air_quality' | 'noise_level' | 'fire_detection' | 'seismic' | 'confined_space' | 'equipment_malfunction';
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  zone: string;
  camera: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_alarm';
  description: string;
  commodity: 'gold' | 'platinum' | 'coal' | 'chrome' | 'other';
  durationSeconds?: number;
  readings?: { label: string; value: string; status: 'normal' | 'warning' | 'critical' }[];
}

interface CommodityStats {
  name: string;
  fatalities2021: number;
  fatalities2022: number;
  injuries2021: number;
  injuries2022: number;
  improvement: number;
  color: string;
}

interface OccupationalHealth {
  disease: string;
  cases2020: number;
  cases2021: number;
  change: number;
  icon: typeof HeartIcon;
  color: string;
}

// Alert type configurations
const ALERT_TYPES = {
  fog: { label: 'Fall of Ground', icon: CubeIcon, color: 'text-red-500', bg: 'bg-red-500/20', description: 'Rock instability detected' },
  tmm_collision: { label: 'TMM Collision Risk', icon: TruckIcon, color: 'text-orange-500', bg: 'bg-orange-500/20', description: 'Vehicle proximity warning' },
  ppe_violation: { label: 'PPE Violation', icon: ShieldExclamationIcon, color: 'text-yellow-500', bg: 'bg-yellow-500/20', description: 'Safety equipment not detected' },
  air_quality: { label: 'Air Quality Alert', icon: CloudIcon, color: 'text-purple-500', bg: 'bg-purple-500/20', description: 'Dust/silica levels elevated' },
  noise_level: { label: 'Noise Level Warning', icon: SpeakerWaveIcon, color: 'text-blue-500', bg: 'bg-blue-500/20', description: 'Hazardous noise exposure' },
  fire_detection: { label: 'Fire/Smoke Detected', icon: FireIcon, color: 'text-red-600', bg: 'bg-red-600/20', description: 'Thermal anomaly detected' },
  seismic: { label: 'Seismic Activity', icon: ExclamationTriangleIcon, color: 'text-amber-500', bg: 'bg-amber-500/20', description: 'Ground movement detected' },
  confined_space: { label: 'Confined Space', icon: MapPinIcon, color: 'text-cyan-500', bg: 'bg-cyan-500/20', description: 'Personnel in restricted area' },
  equipment_malfunction: { label: 'Equipment Issue', icon: WrenchScrewdriverIcon, color: 'text-gray-400', bg: 'bg-gray-500/20', description: 'Machinery malfunction detected' },
};

const COMMODITY_COLORS = {
  gold: '#FFD700',
  platinum: '#E5E4E2',
  coal: '#36454F',
  chrome: '#4A90A4',
  other: '#8B5CF6',
};

// Demo data based on Ministry statistics
const COMMODITY_STATS: CommodityStats[] = [
  { name: 'Gold', fatalities2021: 30, fatalities2022: 15, injuries2021: 738, injuries2022: 586, improvement: 50, color: '#FFD700' },
  { name: 'Platinum', fatalities2021: 21, fatalities2022: 18, injuries2021: 1027, injuries2022: 1030, improvement: 14, color: '#E5E4E2' },
  { name: 'Coal', fatalities2021: 10, fatalities2022: 5, injuries2021: 170, injuries2022: 180, improvement: 50, color: '#36454F' },
  { name: 'Other', fatalities2021: 13, fatalities2022: 11, injuries2021: 208, injuries2022: 260, improvement: 15, color: '#8B5CF6' },
];

const ACCIDENT_CAUSES = [
  { name: 'TMM/Transport', fatalities2021: 16, fatalities2022: 17, injuries2021: 329, injuries2022: 376 },
  { name: 'General Hazards', fatalities2021: 21, fatalities2022: 16, injuries2021: 1171, injuries2022: 1124 },
  { name: 'Fall of Ground', fatalities2021: 20, fatalities2022: 6, injuries2021: 373, injuries2022: 295 },
];

const OCCUPATIONAL_HEALTH: OccupationalHealth[] = [
  { disease: 'Silicosis', cases2020: 271, cases2021: 240, change: -11.4, icon: CloudIcon, color: 'text-purple-400' },
  { disease: 'Pulmonary TB', cases2020: 849, cases2021: 793, change: -6.6, icon: HeartIcon, color: 'text-red-400' },
  { disease: 'NIHL', cases2020: 738, cases2021: 776, change: 5.2, icon: SpeakerWaveIcon, color: 'text-blue-400' },
];

const MINE_ZONES = [
  'Shaft Level 1 - Main Excavation',
  'Shaft Level 2 - Development Area',
  'Shaft Level 3 - Stope Mining',
  'Surface Operations',
  'Processing Plant',
  'Conveyor System',
  'Ventilation Shaft',
  'Equipment Bay',
];

const MINE_CAMERAS = [
  'Underground Cam L1-A',
  'Underground Cam L2-B',
  'Stope Face Cam',
  'Conveyor Monitoring Cam',
  'Processing Area Cam',
  'Equipment Bay Cam',
  'Surface Operations Cam',
  'Ventilation Shaft Cam',
];

// Generate demo alerts
const generateAlerts = (): SafetyAlert[] => {
  const alerts: SafetyAlert[] = [];
  const types: Array<SafetyAlert['type']> = ['fog', 'tmm_collision', 'ppe_violation', 'air_quality', 'noise_level', 'fire_detection', 'seismic', 'confined_space'];
  const severities: Array<SafetyAlert['severity']> = ['critical', 'high', 'medium', 'low'];
  const statuses: Array<SafetyAlert['status']> = ['active', 'investigating', 'resolved', 'false_alarm'];
  const commodities: Array<SafetyAlert['commodity']> = ['gold', 'platinum', 'coal', 'chrome', 'other'];

  for (let i = 0; i < 20; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const zone = MINE_ZONES[Math.floor(Math.random() * MINE_ZONES.length)];
    const camera = MINE_CAMERAS[Math.floor(Math.random() * MINE_CAMERAS.length)];
    const commodity = commodities[Math.floor(Math.random() * commodities.length)];

    const readings: { label: string; value: string; status: 'normal' | 'warning' | 'critical' }[] | undefined = type === 'air_quality' ? [
      { label: 'Dust Level', value: `${(Math.random() * 5 + 2).toFixed(1)} mg/m³`, status: Math.random() > 0.5 ? 'warning' as const : 'critical' as const },
      { label: 'Silica', value: `${(Math.random() * 0.1).toFixed(3)} mg/m³`, status: 'warning' as const },
      { label: 'Ventilation', value: `${Math.floor(60 + Math.random() * 40)}%`, status: 'normal' as const },
    ] : type === 'noise_level' ? [
      { label: 'Current Level', value: `${Math.floor(85 + Math.random() * 20)} dB`, status: 'critical' as const },
      { label: 'Exposure Time', value: `${Math.floor(2 + Math.random() * 6)}h`, status: 'warning' as const },
      { label: 'Peak', value: `${Math.floor(100 + Math.random() * 15)} dB`, status: 'critical' as const },
    ] : undefined;

    alerts.push({
      id: `alert-${i + 1}`,
      type,
      severity: type === 'fog' || type === 'fire_detection' || type === 'seismic'
        ? (Math.random() > 0.3 ? 'critical' : 'high')
        : severities[Math.floor(Math.random() * severities.length)],
      location: `${commodity.charAt(0).toUpperCase() + commodity.slice(1)} Mine - ${zone}`,
      zone,
      camera,
      timestamp: new Date(Date.now() - Math.random() * 3600000 * 8).toISOString(),
      status: i < 4 ? 'active' : statuses[Math.floor(Math.random() * statuses.length)],
      description: ALERT_TYPES[type].description,
      commodity,
      durationSeconds: Math.floor(30 + Math.random() * 600),
      readings,
    });
  }

  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default function MiningSafety() {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SafetyAlert | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [commodityFilter, setCommodityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'realtime' | 'statistics' | 'health' | 'compliance'>('realtime');

  useEffect(() => {
    setAlerts(generateAlerts());

    // Simulate real-time alerts
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const types: Array<SafetyAlert['type']> = ['fog', 'tmm_collision', 'ppe_violation', 'air_quality', 'noise_level'];
        const type = types[Math.floor(Math.random() * types.length)];
        const commodities: Array<SafetyAlert['commodity']> = ['gold', 'platinum', 'coal'];
        const commodity = commodities[Math.floor(Math.random() * commodities.length)];
        
        const newAlert: SafetyAlert = {
          id: `alert-${Date.now()}`,
          type,
          severity: Math.random() > 0.5 ? 'critical' : 'high',
          location: `${commodity.charAt(0).toUpperCase() + commodity.slice(1)} Mine - ${MINE_ZONES[Math.floor(Math.random() * MINE_ZONES.length)]}`,
          zone: MINE_ZONES[Math.floor(Math.random() * MINE_ZONES.length)],
          camera: MINE_CAMERAS[Math.floor(Math.random() * MINE_CAMERAS.length)],
          timestamp: new Date().toISOString(),
          status: 'active',
          description: 'New hazard detected - immediate attention required',
          commodity,
          durationSeconds: 0,
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    if (typeFilter !== 'all' && alert.type !== typeFilter) return false;
    if (commodityFilter !== 'all' && alert.commodity !== commodityFilter) return false;
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
    fogAlerts: alerts.filter(a => a.type === 'fog').length,
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

  // Prepare chart data
  const fatalityChartData = COMMODITY_STATS.map(c => ({
    name: c.name,
    '2021': c.fatalities2021,
    '2022': c.fatalities2022,
  }));

  const causesChartData = ACCIDENT_CAUSES.map(c => ({
    name: c.name,
    Fatalities: c.fatalities2022,
    Injuries: Math.round(c.injuries2022 / 10), // Scale down for visibility
  }));

  const pieData = COMMODITY_STATS.map(c => ({
    name: c.name,
    value: c.fatalities2022,
    color: c.color,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CubeIcon className="w-8 h-8 text-amber-400" />
            Mining Safety Monitor
          </h1>
          <p className="text-gray-400 mt-1">AI-powered mine health and safety monitoring system</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            All Systems Active
          </span>
          <span className="text-sm text-gray-500">
            Last sync: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <ArrowTrendingDownIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">34%</p>
              <p className="text-xs text-gray-500">Fatality Reduction</p>
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
              <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
              <p className="text-xs text-gray-500">Critical Alerts</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4 border border-amber-500/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <CubeIcon className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{stats.fogAlerts}</p>
              <p className="text-xs text-gray-500">FOG Alerts</p>
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
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BellAlertIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-xs text-gray-500">Active Alerts</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
              <p className="text-xs text-gray-500">Resolved Today</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {[
          { id: 'realtime', label: 'Real-time Monitoring', icon: VideoCameraIcon },
          { id: 'statistics', label: 'Safety Statistics', icon: ChartBarIcon },
          { id: 'health', label: 'Occupational Health', icon: HeartIcon },
          { id: 'compliance', label: 'Compliance', icon: DocumentChartBarIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'realtime' && (
        <>
          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Alert Types</option>
              <option value="fog">Fall of Ground (FOG)</option>
              <option value="tmm_collision">TMM Collision</option>
              <option value="ppe_violation">PPE Violation</option>
              <option value="air_quality">Air Quality</option>
              <option value="noise_level">Noise Level</option>
              <option value="fire_detection">Fire Detection</option>
              <option value="seismic">Seismic Activity</option>
              <option value="confined_space">Confined Space</option>
            </select>

            <select
              value={commodityFilter}
              onChange={(e) => setCommodityFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Commodities</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
              <option value="coal">Coal</option>
              <option value="chrome">Chrome</option>
              <option value="other">Other</option>
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
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Safety Alerts</h2>
                <span className="text-sm text-gray-500">{filteredAlerts.length} alerts</span>
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
                          <div className="flex items-center gap-2 flex-wrap">
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
                            <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: COMMODITY_COLORS[alert.commodity] + '40', color: COMMODITY_COLORS[alert.commodity] }}>
                              {alert.commodity}
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

            {/* Alert Detail */}
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
                      <p className="text-gray-600 text-xs">Underground Feed</p>
                    </div>
                    {selectedAlert.status === 'active' && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-red-500 rounded text-xs text-white">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        LIVE
                      </div>
                    )}
                    {selectedAlert.type === 'fog' && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="border-2 border-red-500 border-dashed rounded-lg p-2 bg-red-500/20">
                          <p className="text-red-400 text-xs text-center">
                            Rock instability zone detected
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Readings if available */}
                  {selectedAlert.readings && (
                    <div className="mb-4 p-3 bg-gray-900 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Sensor Readings</p>
                      <div className="space-y-2">
                        {selectedAlert.readings.map((reading, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">{reading.label}</span>
                            <span className={`text-sm font-mono ${
                              reading.status === 'critical' ? 'text-red-400' :
                              reading.status === 'warning' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {reading.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alert Info */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className={ALERT_TYPES[selectedAlert.type].color}>
                        {ALERT_TYPES[selectedAlert.type].label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Commodity</span>
                      <span style={{ color: COMMODITY_COLORS[selectedAlert.commodity] }}>
                        {selectedAlert.commodity.charAt(0).toUpperCase() + selectedAlert.commodity.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Location</span>
                      <span className="text-white text-right text-sm">{selectedAlert.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Detected</span>
                      <span className="text-white">{new Date(selectedAlert.timestamp).toLocaleString()}</span>
                    </div>
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
                  <CubeIcon className="w-12 h-12 mb-2" />
                  <p>Select an alert to view details</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'statistics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fatalities by Commodity */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Fatalities by Commodity (YoY)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fatalityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Legend />
                <Bar dataKey="2021" fill="#EF4444" name="2021" />
                <Bar dataKey="2022" fill="#22C55E" name="2022" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fatalities by Cause */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Incidents by Cause (2022)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={causesChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Legend />
                <Bar dataKey="Fatalities" fill="#EF4444" />
                <Bar dataKey="Injuries" fill="#F59E0B" name="Injuries (÷10)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Commodity Distribution */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Fatalities Distribution by Commodity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Improvement Stats */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Year-over-Year Improvement</h3>
            <div className="space-y-4">
              {COMMODITY_STATS.map((commodity) => (
                <div key={commodity.name} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: commodity.color }} />
                    <span className="text-white font-medium">{commodity.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Fatalities</p>
                      <p className="text-white">{commodity.fatalities2021} → {commodity.fatalities2022}</p>
                    </div>
                    <div className="flex items-center gap-1 text-green-400">
                      <ArrowTrendingDownIcon className="w-5 h-5" />
                      <span className="font-bold">{commodity.improvement}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Occupational Health Overview */}
          <div className="grid grid-cols-3 gap-4">
            {OCCUPATIONAL_HEALTH.map((health) => {
              const Icon = health.icon;
              const isIncrease = health.change > 0;
              return (
                <motion.div
                  key={health.disease}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800 rounded-xl border border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gray-700`}>
                        <Icon className={`w-6 h-6 ${health.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{health.disease}</h3>
                    </div>
                    <div className={`flex items-center gap-1 ${isIncrease ? 'text-red-400' : 'text-green-400'}`}>
                      {isIncrease ? (
                        <ArrowTrendingUpIcon className="w-5 h-5" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-5 h-5" />
                      )}
                      <span className="font-bold">{Math.abs(health.change)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-3xl font-bold text-white">{health.cases2021}</p>
                      <p className="text-sm text-gray-500">Cases (2021)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg text-gray-400">{health.cases2020}</p>
                      <p className="text-xs text-gray-500">Previous (2020)</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Health Trends Chart */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Occupational Disease Trends</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={[
                  { year: '2019', Silicosis: 290, PTB: 900, NIHL: 700 },
                  { year: '2020', Silicosis: 271, PTB: 849, NIHL: 738 },
                  { year: '2021', Silicosis: 240, PTB: 793, NIHL: 776 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Silicosis" stroke="#A855F7" strokeWidth={2} dot={{ fill: '#A855F7' }} />
                <Line type="monotone" dataKey="PTB" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444' }} />
                <Line type="monotone" dataKey="NIHL" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Prevention Measures */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI-Powered Prevention Measures</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Dust Monitoring', desc: 'Real-time silica and particulate tracking', status: 'active', icon: CloudIcon },
                { title: 'Noise Exposure Tracking', desc: 'Personal dosimetry and zone monitoring', status: 'active', icon: SpeakerWaveIcon },
                { title: 'Ventilation Analysis', desc: 'Airflow optimization recommendations', status: 'active', icon: CloudIcon },
                { title: 'PPE Compliance', desc: 'Respirator and hearing protection detection', status: 'active', icon: ShieldExclamationIcon },
              ].map((measure) => (
                <div key={measure.title} className="flex items-start gap-3 p-4 bg-gray-900 rounded-lg">
                  <div className="p-2 bg-primary-600/20 rounded-lg">
                    <measure.icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{measure.title}</h4>
                    <p className="text-sm text-gray-500">{measure.desc}</p>
                    <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-400">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      {measure.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          {/* Compliance Overview */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Inspections Completed', value: '47', total: '52', color: 'text-green-400' },
              { label: 'Directives Compliance', value: '94%', total: '', color: 'text-blue-400' },
              { label: 'Medical Reports Filed', value: '931', total: '', color: 'text-purple-400' },
              { label: 'Safety Campaigns', value: '12', total: '', color: 'text-amber-400' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Chief Inspector Directives */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Chief Inspector Directives (2022)</h3>
            <div className="space-y-3">
              {[
                { title: 'Covid-19 Prevention & Management', status: 'compliant', date: '2022-01-15' },
                { title: 'Mine Fires & Explosions Emergency Response', status: 'compliant', date: '2022-03-20' },
                { title: 'Conveyor Belt Fire Prevention', status: 'compliant', date: '2022-05-10' },
                { title: 'Mine Residue Deposits (MRD) Management', status: 'partial', date: '2022-07-01' },
                { title: 'Diesel Trackless Mobile Machines - Collision Avoidance', status: 'compliant', date: '2022-12-21' },
              ].map((directive) => (
                <div key={directive.title} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      directive.status === 'compliant' ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                    <span className="text-white">{directive.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{directive.date}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      directive.status === 'compliant'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {directive.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Inspections */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-blue-400" />
                Scheduled Inspections
              </h3>
              <div className="space-y-3">
                {[
                  { mine: 'Gold Mine A - Level 3', date: 'Feb 12, 2026', type: 'Safety Audit' },
                  { mine: 'Platinum Mine B', date: 'Feb 15, 2026', type: 'Health Inspection' },
                  { mine: 'Coal Mine C - Conveyor', date: 'Feb 18, 2026', type: 'Equipment Check' },
                  { mine: 'Chrome Mine D', date: 'Feb 22, 2026', type: 'Full Audit' },
                ].map((inspection, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div>
                      <p className="text-white text-sm">{inspection.mine}</p>
                      <p className="text-xs text-gray-500">{inspection.type}</p>
                    </div>
                    <span className="text-sm text-blue-400">{inspection.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-green-400" />
                Stakeholder Engagement
              </h3>
              <div className="space-y-3">
                {[
                  { event: 'Regional Tripartite Forum', status: 'Scheduled', date: 'Feb 20, 2026' },
                  { event: 'OHS Awareness Campaign', status: 'In Progress', date: 'Ongoing' },
                  { event: 'CEO Safety Meeting', status: 'Completed', date: 'Feb 5, 2026' },
                  { event: 'Union Leadership Briefing', status: 'Scheduled', date: 'Feb 25, 2026' },
                ].map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div>
                      <p className="text-white text-sm">{event.event}</p>
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      event.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                      event.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
