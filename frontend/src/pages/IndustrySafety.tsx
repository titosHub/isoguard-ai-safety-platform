import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  DocumentChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PrinterIcon,
  EyeIcon,
  ClockIcon,
  MapPinIcon,
  ArrowTrendingDownIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
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
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';

// Industry configuration
export const INDUSTRY_CONFIG: Record<string, {
  name: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  incidentTypes: { id: string; label: string; color: string }[];
  zones: string[];
  roles: string[];
  riskFactors: string[];
}> = {
  agriculture: {
    name: 'Agriculture',
    color: 'green',
    bgGradient: 'from-green-900/50 to-gray-800',
    borderColor: 'border-green-500/30',
    incidentTypes: [
      { id: 'machinery', label: 'Machinery Accident', color: 'bg-red-500' },
      { id: 'chemical', label: 'Chemical Exposure', color: 'bg-orange-500' },
      { id: 'fall', label: 'Fall from Height', color: 'bg-yellow-500' },
      { id: 'animal', label: 'Animal Related', color: 'bg-blue-500' },
      { id: 'heat', label: 'Heat Stress', color: 'bg-purple-500' },
      { id: 'near_miss', label: 'Near Miss', color: 'bg-gray-500' },
    ],
    zones: ['Field A', 'Field B', 'Barn', 'Storage Facility', 'Processing Plant', 'Equipment Shed'],
    roles: ['Farm Worker', 'Tractor Operator', 'Supervisor', 'Harvester Operator', 'Livestock Handler'],
    riskFactors: ['Pesticide exposure', 'Equipment malfunction', 'Weather conditions', 'Fatigue'],
  },
  health: {
    name: 'Healthcare',
    color: 'red',
    bgGradient: 'from-red-900/50 to-gray-800',
    borderColor: 'border-red-500/30',
    incidentTypes: [
      { id: 'needlestick', label: 'Needlestick Injury', color: 'bg-red-500' },
      { id: 'patient_handling', label: 'Patient Handling', color: 'bg-orange-500' },
      { id: 'slip_fall', label: 'Slip/Fall', color: 'bg-yellow-500' },
      { id: 'violence', label: 'Workplace Violence', color: 'bg-purple-500' },
      { id: 'exposure', label: 'Chemical/Bio Exposure', color: 'bg-blue-500' },
      { id: 'near_miss', label: 'Near Miss', color: 'bg-gray-500' },
    ],
    zones: ['Emergency Room', 'ICU', 'Operating Theater', 'Ward A', 'Ward B', 'Laboratory', 'Pharmacy'],
    roles: ['Nurse', 'Doctor', 'Technician', 'Porter', 'Cleaner', 'Administrator'],
    riskFactors: ['Infection risk', 'Manual handling', 'Shift fatigue', 'Aggressive patients'],
  },
  airport: {
    name: 'Airport',
    color: 'cyan',
    bgGradient: 'from-cyan-900/50 to-gray-800',
    borderColor: 'border-cyan-500/30',
    incidentTypes: [
      { id: 'ground_collision', label: 'Ground Collision', color: 'bg-red-500' },
      { id: 'fod', label: 'FOD Incident', color: 'bg-orange-500' },
      { id: 'baggage', label: 'Baggage Handling', color: 'bg-yellow-500' },
      { id: 'security', label: 'Security Breach', color: 'bg-purple-500' },
      { id: 'jet_blast', label: 'Jet Blast Injury', color: 'bg-blue-500' },
      { id: 'near_miss', label: 'Near Miss', color: 'bg-gray-500' },
    ],
    zones: ['Terminal A', 'Terminal B', 'Runway 1', 'Runway 2', 'Apron', 'Cargo Area', 'Maintenance Hangar'],
    roles: ['Ground Crew', 'Baggage Handler', 'Security Officer', 'Maintenance Tech', 'Traffic Controller'],
    riskFactors: ['Aircraft movement', 'Heavy equipment', 'Noise exposure', 'Weather conditions'],
  },
  border: {
    name: 'Border Control',
    color: 'green',
    bgGradient: 'from-emerald-900/50 to-gray-800',
    borderColor: 'border-emerald-500/30',
    incidentTypes: [
      { id: 'perimeter_breach', label: 'Perimeter Breach', color: 'bg-red-500' },
      { id: 'unauthorized_crossing', label: 'Unauthorized Crossing', color: 'bg-orange-500' },
      { id: 'contraband', label: 'Contraband Detected', color: 'bg-yellow-500' },
      { id: 'document_fraud', label: 'Document Fraud', color: 'bg-purple-500' },
      { id: 'vehicle_inspection', label: 'Vehicle Inspection Incident', color: 'bg-blue-500' },
      { id: 'near_miss', label: 'Near Miss', color: 'bg-gray-500' },
    ],
    zones: ['Checkpoint A', 'Checkpoint B', 'Perimeter Fence', 'Cargo Screening', 'Vehicle Lanes', 'Holding Area'],
    roles: ['Border Agent', 'Security Officer', 'Supervisor', 'K9 Unit', 'Customs Inspector'],
    riskFactors: ['High throughput periods', 'Low visibility', 'Perimeter gaps', 'Insider risk'],
  },
  smart_city: {
    name: 'Smart City',
    color: 'cyan',
    bgGradient: 'from-sky-900/50 to-gray-800',
    borderColor: 'border-sky-500/30',
    incidentTypes: [
      { id: 'crowd_surge', label: 'Crowd Surge / Gathering', color: 'bg-red-500' },
      { id: 'public_disorder', label: 'Public Disorder', color: 'bg-orange-500' },
      { id: 'traffic_anomaly', label: 'Traffic Anomaly', color: 'bg-yellow-500' },
      { id: 'vehicle_watch', label: 'Vehicle of Interest (non-identifying)', color: 'bg-purple-500' },
      { id: 'camera_tamper', label: 'Camera Tamper', color: 'bg-blue-500' },
      { id: 'near_miss', label: 'Near Miss', color: 'bg-gray-500' },
    ],
    zones: ['CBD', 'North Suburb', 'East Suburb', 'West Suburb', 'South Suburb', 'Industrial Park', 'Transport Hub'],
    roles: ['Dispatcher', 'Patrol Unit', 'Operations Supervisor', 'Control Room Analyst'],
    riskFactors: ['Event days', 'Low visibility', 'High footfall corridors', 'Congestion points'],
  },
  manufacturing: {
    name: 'Manufacturing',
    color: 'blue',
    bgGradient: 'from-blue-900/50 to-gray-800',
    borderColor: 'border-blue-500/30',
    incidentTypes: [
      { id: 'machine_guarding', label: 'Machine Guarding', color: 'bg-red-500' },
      { id: 'lockout_tagout', label: 'LOTO Violation', color: 'bg-orange-500' },
      { id: 'ergonomic', label: 'Ergonomic Injury', color: 'bg-yellow-500' },
      { id: 'chemical', label: 'Chemical Spill', color: 'bg-purple-500' },
      { id: 'forklift', label: 'Forklift Incident', color: 'bg-blue-500' },
      { id: 'near_miss', label: 'Near Miss', color: 'bg-gray-500' },
    ],
    zones: ['Assembly Line 1', 'Assembly Line 2', 'Welding Bay', 'Paint Shop', 'Warehouse', 'Loading Dock'],
    roles: ['Machine Operator', 'Assembler', 'Welder', 'Forklift Driver', 'Quality Inspector', 'Supervisor'],
    riskFactors: ['Moving machinery', 'Repetitive motion', 'Chemical exposure', 'Noise'],
  },
  construction: {
    name: 'Construction',
    color: 'orange',
    bgGradient: 'from-orange-900/50 to-gray-800',
    borderColor: 'border-orange-500/30',
    incidentTypes: [
      { id: 'fall', label: 'Fall from Height', color: 'bg-red-500' },
      { id: 'struck_by', label: 'Struck By Object', color: 'bg-orange-500' },
      { id: 'caught_between', label: 'Caught Between', color: 'bg-yellow-500' },
      { id: 'electrocution', label: 'Electrocution', color: 'bg-purple-500' },
      { id: 'collapse', label: 'Structural Collapse', color: 'bg-blue-500' },
      { id: 'near_miss', label: 'Near Miss', color: 'bg-gray-500' },
    ],
    zones: ['Building A', 'Building B', 'Excavation Site', 'Scaffolding Area', 'Material Storage', 'Office Trailer'],
    roles: ['Laborer', 'Carpenter', 'Electrician', 'Crane Operator', 'Foreman', 'Safety Officer'],
    riskFactors: ['Working at height', 'Heavy equipment', 'Unstable structures', 'Weather'],
  },
  warehouse: {
    name: 'Warehousing',
    color: 'purple',
    bgGradient: 'from-purple-900/50 to-gray-800',
    borderColor: 'border-purple-500/30',
    incidentTypes: [
      { id: 'forklift', label: 'Forklift Collision', color: 'bg-red-500' },
      { id: 'falling_object', label: 'Falling Object', color: 'bg-orange-500' },
      { id: 'manual_handling', label: 'Manual Handling', color: 'bg-yellow-500' },
      { id: 'slip_trip', label: 'Slip/Trip/Fall', color: 'bg-purple-500' },
      { id: 'dock', label: 'Loading Dock', color: 'bg-blue-500' },
      { id: 'near_miss', label: 'Near Miss', color: 'bg-gray-500' },
    ],
    zones: ['Receiving Dock', 'Shipping Dock', 'Aisle A', 'Aisle B', 'Cold Storage', 'Packing Area', 'Office'],
    roles: ['Picker', 'Packer', 'Forklift Operator', 'Dock Worker', 'Inventory Clerk', 'Supervisor'],
    riskFactors: ['Forklift traffic', 'Heavy lifting', 'Racking collapse', 'Temperature extremes'],
  },
};

// Generate demo incidents for an industry
const generateIncidents = (industry: string) => {
  const config = INDUSTRY_CONFIG[industry];
  if (!config) return [];
  
  const incidents = [];
  const now = new Date();
  
  for (let i = 0; i < 15; i++) {
    const type = config.incidentTypes[Math.floor(Math.random() * config.incidentTypes.length)];
    const zone = config.zones[Math.floor(Math.random() * config.zones.length)];
    const role = config.roles[Math.floor(Math.random() * config.roles.length)];
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    incidents.push({
      id: `INC-${industry.toUpperCase().slice(0, 3)}-${String(i + 1).padStart(3, '0')}`,
      type: type.id,
      typeLabel: type.label,
      typeColor: type.color,
      zone,
      role,
      dateTime: date.toISOString(),
      description: `${type.label} incident reported in ${zone}`,
      severity: ['minor', 'moderate', 'serious', 'critical'][Math.floor(Math.random() * 4)],
      status: ['open', 'investigating', 'resolved', 'closed'][Math.floor(Math.random() * 4)],
      rootCause: ['human', 'equipment', 'environmental', 'procedural'][Math.floor(Math.random() * 4)],
      correctiveAction: 'Investigation in progress. Corrective measures being implemented.',
      ppeWorn: Math.random() > 0.3,
      hasMedia: Math.random() > 0.5,
      thumbnail: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=400`,
    });
  }
  
  return incidents.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
};

// Generate analytics data for an industry
const generateAnalytics = (industry: string) => {
  const config = INDUSTRY_CONFIG[industry];
  if (!config) return null;
  
  const monthlyTrend = [
    { month: 'Sep', incidents: 12, nearMiss: 18, resolved: 10 },
    { month: 'Oct', incidents: 15, nearMiss: 22, resolved: 14 },
    { month: 'Nov', incidents: 10, nearMiss: 15, resolved: 12 },
    { month: 'Dec', incidents: 8, nearMiss: 20, resolved: 9 },
    { month: 'Jan', incidents: 11, nearMiss: 25, resolved: 10 },
    { month: 'Feb', incidents: 6, nearMiss: 12, resolved: 8 },
  ];
  
  const byType = config.incidentTypes.map(type => ({
    name: type.label,
    count: Math.floor(Math.random() * 20) + 5,
    color: type.color.replace('bg-', '').replace('-500', ''),
  }));
  
  const byZone = config.zones.map(zone => ({
    zone,
    incidents: Math.floor(Math.random() * 15) + 3,
    severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
  }));
  
  const byShift = [
    { shift: 'Day (06:00-14:00)', incidents: 45, percentage: 45 },
    { shift: 'Afternoon (14:00-22:00)', incidents: 35, percentage: 35 },
    { shift: 'Night (22:00-06:00)', incidents: 20, percentage: 20 },
  ];
  
  return {
    monthlyTrend,
    byType,
    byZone,
    byShift,
    kpis: {
      totalIncidents: 62,
      openIncidents: 8,
      resolvedThisMonth: 12,
      avgResolutionDays: 4.5,
      trir: 2.3,
      ltifr: 0.8,
      nearMissRatio: 3.2,
      complianceRate: 94.5,
    },
  };
};

// Tab configuration
const TABS = [
  { id: 'overview', label: 'Overview', icon: ShieldCheckIcon },
  { id: 'incidents', label: 'Incidents', icon: ExclamationTriangleIcon },
  { id: 'analytics', label: 'Analytics', icon: DocumentChartBarIcon },
];

interface IndustrySafetyProps {
  industry: string;
  defaultTab?: string;
}

export default function IndustrySafety({ industry, defaultTab = 'overview' }: IndustrySafetyProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  const config = INDUSTRY_CONFIG[industry];
  const incidents = generateIncidents(industry);
  const analytics = generateAnalytics(industry);
  
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  
  if (!config || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Industry configuration not found</p>
      </div>
    );
  }
  
  const filteredIncidents = incidents.filter(inc => {
    if (filterStatus !== 'all' && inc.status !== filterStatus) return false;
    if (filterType !== 'all' && inc.type !== filterType) return false;
    return true;
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/20 text-red-400';
      case 'investigating': return 'bg-yellow-500/20 text-yellow-400';
      case 'resolved': return 'bg-blue-500/20 text-blue-400';
      case 'closed': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'serious': return 'text-orange-400';
      case 'moderate': return 'text-yellow-400';
      case 'minor': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };
  
  const colorClasses: Record<string, string> = {
    green: 'text-green-400',
    red: 'text-red-400',
    cyan: 'text-cyan-400',
    blue: 'text-blue-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
  };
  
  const buttonColorClasses: Record<string, string> = {
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
    cyan: 'bg-cyan-600 hover:bg-cyan-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheckIcon className={`w-8 h-8 ${colorClasses[config.color]}`} />
            {config.name} Safety
          </h1>
          <p className="text-gray-400 mt-1">Safety monitoring and incident management</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
            <PrinterIcon className="w-5 h-5" />
            Export Report
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg ${buttonColorClasses[config.color]}`}>
            <DocumentTextIcon className="w-5 h-5" />
            New Incident
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">Open Incidents</p>
              <p className="text-3xl font-bold text-red-400">{analytics.kpis.openIncidents}</p>
              <p className="text-xs text-gray-500 mt-1">Requires attention</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">Resolved This Month</p>
              <p className="text-3xl font-bold text-green-400">{analytics.kpis.resolvedThisMonth}</p>
              <p className="text-xs text-gray-500 mt-1">+23% vs last month</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">TRIR</p>
              <p className="text-3xl font-bold text-yellow-400">{analytics.kpis.trir}</p>
              <p className="text-xs text-gray-500 mt-1">Total Recordable Rate</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">Compliance</p>
              <p className="text-3xl font-bold text-blue-400">{analytics.kpis.complianceRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Safety compliance rate</p>
            </motion.div>
          </div>

          {/* Quick Stats & Recent Incidents */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Incident Trend (6 Months)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={analytics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Legend />
                  <Area type="monotone" dataKey="nearMiss" stackId="1" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.3} name="Near Miss" />
                  <Area type="monotone" dataKey="incidents" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="Incidents" />
                  <Area type="monotone" dataKey="resolved" stackId="3" stroke="#22C55E" fill="#22C55E" fillOpacity={0.3} name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Risk Factors</h3>
              <div className="space-y-3">
                {config.riskFactors.map((factor, i) => (
                  <div key={factor} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <span className="text-gray-300">{factor}</span>
                    <span className={`text-sm font-medium ${i < 2 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {i < 2 ? 'High' : 'Medium'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Incidents Preview */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Incidents</h3>
              <button onClick={() => setActiveTab('incidents')} className="text-sm text-primary-400 hover:text-primary-300">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {incidents.slice(0, 5).map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-900/80 cursor-pointer" onClick={() => setSelectedIncident(incident)}>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs ${incident.typeColor} text-white`}>{incident.typeLabel}</span>
                    <div>
                      <p className="text-white text-sm">{incident.zone}</p>
                      <p className="text-xs text-gray-500">{new Date(incident.dateTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(incident.status)}`}>{incident.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
              <option value="all">All Types</option>
              {config.incidentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
            <span className="text-gray-500">{filteredIncidents.length} incidents found</span>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-6 gap-3">
            {config.incidentTypes.map(type => {
              const count = incidents.filter(i => i.type === type.id).length;
              return (
                <div key={type.id} className="bg-gray-800 rounded-lg border border-gray-700 p-3">
                  <p className="text-xs text-gray-500 truncate">{type.label}</p>
                  <p className={`text-2xl font-bold ${type.color.replace('bg-', 'text-').replace('-500', '-400')}`}>{count}</p>
                </div>
              );
            })}
          </div>

          {/* Incidents Table */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Zone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-white font-mono">{incident.id}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${incident.typeColor} text-white`}>{incident.typeLabel}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{incident.zone}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{new Date(incident.dateTime).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium capitalize ${getSeverityColor(incident.severity)}`}>{incident.severity}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(incident.status)}`}>{incident.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedIncident(incident)} className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Overview */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">Total Incidents (YTD)</p>
              <p className="text-3xl font-bold text-white">{analytics.kpis.totalIncidents}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowTrendingDownIcon className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">-15% vs last year</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">LTIFR</p>
              <p className="text-3xl font-bold text-yellow-400">{analytics.kpis.ltifr}</p>
              <p className="text-xs text-gray-500 mt-1">Lost Time Injury Rate</p>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">Near Miss Ratio</p>
              <p className="text-3xl font-bold text-blue-400">{analytics.kpis.nearMissRatio}:1</p>
              <p className="text-xs text-gray-500 mt-1">Near miss per incident</p>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">Avg Resolution Time</p>
              <p className="text-3xl font-bold text-purple-400">{analytics.kpis.avgResolutionDays}</p>
              <p className="text-xs text-gray-500 mt-1">days</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Incident Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={analytics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Legend />
                  <Line type="monotone" dataKey="incidents" stroke="#EF4444" strokeWidth={2} name="Incidents" />
                  <Line type="monotone" dataKey="nearMiss" stroke="#FBBF24" strokeWidth={2} name="Near Miss" />
                  <Line type="monotone" dataKey="resolved" stroke="#22C55E" strokeWidth={2} name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">By Incident Type</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={analytics.byType} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count" label={({ name, count }) => `${name.split(' ')[0]}: ${count}`}>
                    {analytics.byType.map((_, index) => (
                      <Cell key={index} fill={['#EF4444', '#F97316', '#FBBF24', '#A855F7', '#3B82F6', '#6B7280'][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Incidents by Zone</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.byZone} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="zone" type="category" stroke="#9CA3AF" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Bar dataKey="incidents" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Incidents by Shift</h3>
              <div className="space-y-4">
                {analytics.byShift.map((shift) => (
                  <div key={shift.shift} className="p-4 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white">{shift.shift}</span>
                      <span className="text-blue-400 font-bold">{shift.incidents} ({shift.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${shift.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Zone Risk Heatmap */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Zone Risk Assessment</h3>
            <div className="grid grid-cols-6 gap-3">
              {analytics.byZone.map((zone) => (
                <div key={zone.zone} className={`p-4 rounded-lg text-center ${
                  zone.severity === 'high' ? 'bg-red-500/20 border border-red-500/50' :
                  zone.severity === 'medium' ? 'bg-yellow-500/20 border border-yellow-500/50' :
                  'bg-green-500/20 border border-green-500/50'
                }`}>
                  <p className="text-white font-medium text-sm truncate">{zone.zone}</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    zone.severity === 'high' ? 'text-red-400' :
                    zone.severity === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>{zone.incidents}</p>
                  <p className="text-xs text-gray-400">incidents</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setSelectedIncident(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white font-mono bg-gray-700 px-2 py-1 rounded">{selectedIncident.id}</span>
                    <span className={`px-2 py-1 rounded text-xs ${selectedIncident.typeColor} text-white`}>{selectedIncident.typeLabel}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedIncident.status)}`}>{selectedIncident.status}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">{selectedIncident.description}</h2>
                </div>
                <button onClick={() => setSelectedIncident(null)} className="p-2 hover:bg-gray-700 rounded-lg">
                  <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Location</h4>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-primary-400" />
                    <span className="text-white">{selectedIncident.zone}</span>
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Date & Time</h4>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-primary-400" />
                    <span className="text-white">{new Date(selectedIncident.dateTime).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Severity</h4>
                  <span className={`text-lg font-bold capitalize ${getSeverityColor(selectedIncident.severity)}`}>{selectedIncident.severity}</span>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Root Cause</h4>
                  <span className="text-white capitalize">{selectedIncident.rootCause}</span>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Corrective Action</h4>
                <p className="text-white">{selectedIncident.correctiveAction}</p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Role: <span className="text-white">{selectedIncident.role}</span></span>
                  <span className="text-sm text-gray-500">PPE: {selectedIncident.ppeWorn ? <CheckCircleIcon className="w-5 h-5 text-green-400 inline" /> : <XCircleIcon className="w-5 h-5 text-red-400 inline" />}</span>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  <PrinterIcon className="w-4 h-4" /> Export
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
