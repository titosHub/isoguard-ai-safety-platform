import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CubeIcon,
  CloudIcon,
  HeartIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BeakerIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  LightBulbIcon,
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
  AreaChart,
  Area,
} from 'recharts';

// Types
interface IncidentReport {
  id: string;
  mineName: string;
  rightNumber: string;
  shaftSection: string;
  dateTime: string;
  incidentType: 'fatality' | 'lti' | 'mti' | 'fai' | 'near_miss' | 'dangerous_occurrence';
  occupation: string;
  ppeWorn: boolean;
  ppeType: string[];
  immediateCause: string;
  rootCause: 'human' | 'equipment' | 'environmental';
  correctiveActions: string;
  inspectorNotified: string;
  status: 'draft' | 'pending' | 'submitted' | 'acknowledged';
}

interface DustReading {
  id: string;
  location: string;
  dustType: 'rcs' | 'coal' | 'dpm';
  exposure: number;
  limit: number;
  shiftDuration: number;
  samplingMethod: string;
  respiratorType: string;
  exceedance: boolean;
  date: string;
}

// Tab configuration
const TABS = [
  { id: 'overview', label: 'Overview', icon: ChartBarIcon },
  { id: 'incidents', label: 'Incidents & Accidents', icon: ExclamationTriangleIcon },
  { id: 'dust', label: 'Dust & Hygiene', icon: CloudIcon },
  { id: 'health', label: 'Health Surveillance', icon: HeartIcon },
  { id: 'training', label: 'Training & Competency', icon: AcademicCapIcon },
  { id: 'equipment', label: 'Equipment & PPE', icon: ShieldExclamationIcon },
  { id: 'environmental', label: 'Environmental', icon: BeakerIcon },
  { id: 'predictive', label: 'Predictive AI', icon: LightBulbIcon },
  { id: 'submit', label: 'Submit to Board', icon: PaperAirplaneIcon },
];

// Demo data
const DEMO_INCIDENTS: IncidentReport[] = [
  { id: 'INC-001', mineName: 'Gold Mine Alpha', rightNumber: 'MR-2024-001', shaftSection: 'Level 3 Stope', dateTime: '2024-02-08T14:30:00', incidentType: 'near_miss', occupation: 'Rock Drill Operator', ppeWorn: true, ppeType: ['Helmet', 'Respirator'], immediateCause: 'Rock fall', rootCause: 'environmental', correctiveActions: 'Support installation reviewed', inspectorNotified: '2024-02-08T15:00:00', status: 'submitted' },
  { id: 'INC-002', mineName: 'Platinum Mine Beta', rightNumber: 'MR-2024-002', shaftSection: 'Main Decline', dateTime: '2024-02-07T08:15:00', incidentType: 'lti', occupation: 'Winch Operator', ppeWorn: true, ppeType: ['Helmet', 'Gloves', 'Safety boots'], immediateCause: 'Equipment malfunction', rootCause: 'equipment', correctiveActions: 'Winch replaced, training refreshed', inspectorNotified: '2024-02-07T09:00:00', status: 'acknowledged' },
  { id: 'INC-003', mineName: 'Coal Mine Gamma', rightNumber: 'MR-2024-003', shaftSection: 'Conveyor Section', dateTime: '2024-02-06T22:45:00', incidentType: 'dangerous_occurrence', occupation: 'Belt Attendant', ppeWorn: false, ppeType: [], immediateCause: 'Belt fire', rootCause: 'equipment', correctiveActions: 'Fire suppression upgraded', inspectorNotified: '2024-02-06T23:00:00', status: 'pending' },
];

const DEMO_DUST_READINGS: DustReading[] = [
  { id: 'DUST-001', location: 'Level 2 Stope Face', dustType: 'rcs', exposure: 0.08, limit: 0.05, shiftDuration: 8, samplingMethod: 'Gravimetric', respiratorType: 'P3 Half-mask', exceedance: true, date: '2024-02-08' },
  { id: 'DUST-002', location: 'Main Haul Road', dustType: 'coal', exposure: 1.8, limit: 2.0, shiftDuration: 8, samplingMethod: 'Gravimetric', respiratorType: 'P2 Half-mask', exceedance: false, date: '2024-02-08' },
  { id: 'DUST-003', location: 'Equipment Bay', dustType: 'dpm', exposure: 0.12, limit: 0.16, shiftDuration: 10, samplingMethod: 'EC/OC', respiratorType: 'P3 Full-face', exceedance: false, date: '2024-02-08' },
  { id: 'DUST-004', location: 'Crusher Area', dustType: 'rcs', exposure: 0.06, limit: 0.05, shiftDuration: 8, samplingMethod: 'Gravimetric', respiratorType: 'P3 Half-mask', exceedance: true, date: '2024-02-07' },
];

const HEALTH_STATS = {
  totalScreened: 4250,
  lungFunctionNormal: 3820,
  lungFunctionAbnormal: 430,
  tbScreened: 4250,
  tbPositive: 23,
  nihlCases: 156,
  silicosisNew: 12,
  compensationClaims: 45,
};

const TRAINING_COMPLIANCE = {
  safetyInductions: { completed: 4150, total: 4250, percentage: 97.6 },
  ppeTraining: { completed: 4080, total: 4250, percentage: 96.0 },
  competencyCerts: { valid: 3950, expiring: 180, expired: 120 },
  refresherTraining: { upToDate: 3800, due: 450 },
  toolboxTalks: { thisMonth: 124, target: 130 },
};

const EQUIPMENT_COMPLIANCE = {
  ppeIssued: 4250,
  ppeInspectionsPassed: 4100,
  ppeInspectionsFailed: 150,
  equipmentBreakdowns: 23,
  lotoViolations: 5,
  machineGuardingCompliance: 96.8,
};

const ENVIRONMENTAL_DATA = {
  ventilation: [
    { location: 'Level 1', airflow: 45.2, required: 40, status: 'ok' },
    { location: 'Level 2', airflow: 38.5, required: 40, status: 'warning' },
    { location: 'Level 3', airflow: 42.1, required: 40, status: 'ok' },
  ],
  gasLevels: [
    { gas: 'CH₄ (Methane)', level: 0.3, limit: 1.0, unit: '%' },
    { gas: 'CO (Carbon Monoxide)', level: 12, limit: 30, unit: 'ppm' },
    { gas: 'NO₂ (Nitrogen Dioxide)', level: 1.2, limit: 3.0, unit: 'ppm' },
    { gas: 'H₂S (Hydrogen Sulfide)', level: 2.1, limit: 10, unit: 'ppm' },
  ],
  temperature: 28.5,
  humidity: 78,
};

const PREDICTIVE_DATA = {
  dustRiskIndex: [
    { shaft: 'Level 1', risk: 42, trend: 'stable' },
    { shaft: 'Level 2', risk: 78, trend: 'increasing' },
    { shaft: 'Level 3', risk: 35, trend: 'decreasing' },
    { shaft: 'Surface', risk: 22, trend: 'stable' },
  ],
  ppeNonCompliance: [
    { zone: 'Stope Face', probability: 23, incidents: 12 },
    { zone: 'Haul Road', probability: 45, incidents: 28 },
    { zone: 'Equipment Bay', probability: 18, incidents: 8 },
    { zone: 'Processing', probability: 31, incidents: 15 },
  ],
  injuryLikelihood: { next30: 12, next60: 28, next90: 45 },
  aiInsights: [
    { type: 'warning', message: 'Level 2 has 63% probability of dust exceedance in 14 days', confidence: 87 },
    { type: 'alert', message: 'Ventilation degradation correlated with PPE non-compliance in Stope area', confidence: 92 },
    { type: 'info', message: 'Near-miss frequency increased 23% in night shift - recommend intervention', confidence: 78 },
    { type: 'success', message: 'FOG incidents reduced 45% after support pattern changes', confidence: 95 },
  ],
};

export default function MiningSafety() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionStep, setSubmissionStep] = useState(0);

  const getIncidentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fatality: 'Fatality',
      lti: 'Lost Time Injury (LTI)',
      mti: 'Medical Treatment Injury (MTI)',
      fai: 'First Aid Injury (FAI)',
      near_miss: 'Near Miss',
      dangerous_occurrence: 'Dangerous Occurrence',
    };
    return labels[type] || type;
  };

  const getIncidentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      fatality: 'bg-red-500',
      lti: 'bg-orange-500',
      mti: 'bg-yellow-500',
      fai: 'bg-blue-500',
      near_miss: 'bg-purple-500',
      dangerous_occurrence: 'bg-pink-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const handleSubmitToBoard = () => {
    setShowSubmitModal(true);
    setSubmissionStep(1);
    setTimeout(() => setSubmissionStep(2), 1500);
    setTimeout(() => setSubmissionStep(3), 3000);
    setTimeout(() => setSubmissionStep(4), 4500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CubeIcon className="w-8 h-8 text-amber-400" />
            Mining Safety & Compliance
          </h1>
          <p className="text-gray-400 mt-1">DMRE Regulatory Compliance & AI-Powered Safety Monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSubmitToBoard} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <PaperAirplaneIcon className="w-5 h-5" />
            Submit to Mining Board
          </button>
          <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Systems Active
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
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
          <div className="grid grid-cols-5 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg"><ArrowTrendingDownIcon className="w-6 h-6 text-green-400" /></div>
                <div><p className="text-2xl font-bold text-green-400">34%</p><p className="text-xs text-gray-500">Fatality Reduction YoY</p></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-800 rounded-xl p-4 border border-red-500/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg"><ExclamationTriangleIcon className="w-6 h-6 text-red-400" /></div>
                <div><p className="text-2xl font-bold text-red-400">{DEMO_DUST_READINGS.filter(d => d.exceedance).length}</p><p className="text-xs text-gray-500">Dust Exceedances</p></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-800 rounded-xl p-4 border border-amber-500/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg"><DocumentTextIcon className="w-6 h-6 text-amber-400" /></div>
                <div><p className="text-2xl font-bold text-amber-400">{DEMO_INCIDENTS.filter(i => i.status === 'pending').length}</p><p className="text-xs text-gray-500">Pending Reports</p></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg"><AcademicCapIcon className="w-6 h-6 text-blue-400" /></div>
                <div><p className="text-2xl font-bold text-blue-400">{TRAINING_COMPLIANCE.safetyInductions.percentage}%</p><p className="text-xs text-gray-500">Training Compliance</p></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg"><ShieldExclamationIcon className="w-6 h-6 text-purple-400" /></div>
                <div><p className="text-2xl font-bold text-purple-400">{EQUIPMENT_COMPLIANCE.machineGuardingCompliance}%</p><p className="text-xs text-gray-500">PPE Compliance</p></div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Incident Trend (Last 6 Months)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={[
                  { month: 'Sep', incidents: 12, nearMiss: 28 },
                  { month: 'Oct', incidents: 8, nearMiss: 32 },
                  { month: 'Nov', incidents: 15, nearMiss: 25 },
                  { month: 'Dec', incidents: 6, nearMiss: 38 },
                  { month: 'Jan', incidents: 9, nearMiss: 30 },
                  { month: 'Feb', incidents: 5, nearMiss: 35 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Legend />
                  <Area type="monotone" dataKey="incidents" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="Incidents" />
                  <Area type="monotone" dataKey="nearMiss" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} name="Near Misses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Dust Exposure by Type</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { type: 'RCS', readings: 45, exceedances: 8 },
                  { type: 'Coal Dust', readings: 38, exceedances: 3 },
                  { type: 'DPM', readings: 28, exceedances: 2 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="type" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Legend />
                  <Bar dataKey="readings" fill="#3B82F6" name="Total Readings" />
                  <Bar dataKey="exceedances" fill="#EF4444" name="Exceedances" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Incidents</h3>
              <div className="space-y-3">
                {DEMO_INCIDENTS.map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${getIncidentTypeColor(incident.incidentType)}`} />
                      <div>
                        <p className="text-white text-sm">{incident.mineName} - {incident.shaftSection}</p>
                        <p className="text-xs text-gray-500">{getIncidentTypeLabel(incident.incidentType)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      incident.status === 'acknowledged' ? 'bg-green-500/20 text-green-400' :
                      incident.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>{incident.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Compliance Status</h3>
              <div className="space-y-4">
                {[
                  { label: 'Incident Reports', value: 94, color: 'bg-green-500' },
                  { label: 'Dust Monitoring', value: 88, color: 'bg-blue-500' },
                  { label: 'Health Surveillance', value: 92, color: 'bg-purple-500' },
                  { label: 'Training Records', value: 96, color: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Incident & Accident Data (DMRE Submission)</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <DocumentTextIcon className="w-5 h-5" />
              New Incident Report
            </button>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Mine / Section</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date/Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Root Cause</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">PPE</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {DEMO_INCIDENTS.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-white font-mono">{incident.id}</td>
                      <td className="px-4 py-3"><div className="text-sm text-white">{incident.mineName}</div><div className="text-xs text-gray-500">{incident.shaftSection}</div></td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getIncidentTypeColor(incident.incidentType)} text-white`}>{getIncidentTypeLabel(incident.incidentType)}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-400">{new Date(incident.dateTime).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 capitalize">{incident.rootCause}</td>
                      <td className="px-4 py-3">{incident.ppeWorn ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <XCircleIcon className="w-5 h-5 text-red-400" />}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${incident.status === 'acknowledged' ? 'bg-green-500/20 text-green-400' : incident.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{incident.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <DocumentTextIcon className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <div><h4 className="text-blue-400 font-medium">Auto-Generated Reports</h4><p className="text-sm text-gray-400 mt-1">System auto-generates Section 23 notices, statutory incident reports, and DMRE submission forms.</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Dust Tab */}
      {activeTab === 'dust' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Occupational Hygiene & Dust Monitoring</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"><BeakerIcon className="w-5 h-5" />New Sample</button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[{ label: 'RCS Readings', value: 45, exceedances: 8, color: 'text-purple-400' },{ label: 'Coal Dust', value: 38, exceedances: 3, color: 'text-gray-400' },{ label: 'DPM Readings', value: 28, exceedances: 2, color: 'text-blue-400' },{ label: 'Total Exceedances', value: 13, exceedances: null, color: 'text-red-400' }].map((stat) => (
              <div key={stat.label} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                {stat.exceedances !== null && <p className="text-xs text-red-400">{stat.exceedances} exceedances</p>}
              </div>
            ))}
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700"><h3 className="font-semibold text-white">Recent Dust Samples</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Dust Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Exposure (mg/m³)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Limit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Respirator</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {DEMO_DUST_READINGS.map((reading) => (
                    <tr key={reading.id} className={reading.exceedance ? 'bg-red-500/10' : ''}>
                      <td className="px-4 py-3 text-sm text-white">{reading.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 uppercase">{reading.dustType}</td>
                      <td className="px-4 py-3 text-sm font-mono"><span className={reading.exceedance ? 'text-red-400' : 'text-green-400'}>{reading.exposure}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{reading.limit}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{reading.respiratorType}</td>
                      <td className="px-4 py-3">{reading.exceedance ? <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">EXCEEDANCE</span> : <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">OK</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationCircleIcon className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div><h4 className="text-amber-400 font-medium">Early Silicosis Risk Warning</h4><p className="text-sm text-gray-400 mt-1">Level 2 Stope Face has shown 3 consecutive RCS exceedances. Recommend immediate ventilation review.</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Health Tab */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Health Surveillance Data (Anonymised)</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4"><p className="text-sm text-gray-500">Total Screened</p><p className="text-2xl font-bold text-white">{HEALTH_STATS.totalScreened.toLocaleString()}</p></div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4"><p className="text-sm text-gray-500">TB Positive</p><p className="text-2xl font-bold text-red-400">{HEALTH_STATS.tbPositive}</p></div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4"><p className="text-sm text-gray-500">NIHL Cases</p><p className="text-2xl font-bold text-blue-400">{HEALTH_STATS.nihlCases}</p></div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4"><p className="text-sm text-gray-500">New Silicosis</p><p className="text-2xl font-bold text-purple-400">{HEALTH_STATS.silicosisNew}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Lung Function Results</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={[{ name: 'Normal', value: HEALTH_STATS.lungFunctionNormal, color: '#22C55E' },{ name: 'Abnormal', value: HEALTH_STATS.lungFunctionAbnormal, color: '#EF4444' }]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    <Cell fill="#22C55E" /><Cell fill="#EF4444" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Disease Trends</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={[{ year: '2022', silicosis: 18, tb: 32, nihl: 145 },{ year: '2023', silicosis: 15, tb: 28, nihl: 152 },{ year: '2024', silicosis: 12, tb: 23, nihl: 156 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Legend />
                  <Line type="monotone" dataKey="silicosis" stroke="#A855F7" strokeWidth={2} name="Silicosis" />
                  <Line type="monotone" dataKey="tb" stroke="#EF4444" strokeWidth={2} name="TB" />
                  <Line type="monotone" dataKey="nihl" stroke="#3B82F6" strokeWidth={2} name="NIHL" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Training Tab */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Training & Competency Records</h2>
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4"><p className="text-sm text-gray-500">Safety Inductions</p><p className="text-2xl font-bold text-green-400">{TRAINING_COMPLIANCE.safetyInductions.percentage}%</p></div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4"><p className="text-sm text-gray-500">PPE Training</p><p className="text-2xl font-bold text-blue-400">{TRAINING_COMPLIANCE.ppeTraining.percentage}%</p></div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4"><p className="text-sm text-gray-500">Valid Certificates</p><p className="text-2xl font-bold text-white">{TRAINING_COMPLIANCE.competencyCerts.valid}</p><p className="text-xs text-yellow-400">{TRAINING_COMPLIANCE.competencyCerts.expiring} expiring</p></div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4"><p className="text-sm text-gray-500">Refresher Due</p><p className="text-2xl font-bold text-yellow-400">{TRAINING_COMPLIANCE.refresherTraining.due}</p></div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4"><p className="text-sm text-gray-500">Toolbox Talks</p><p className="text-2xl font-bold text-purple-400">{TRAINING_COMPLIANCE.toolboxTalks.thisMonth}/{TRAINING_COMPLIANCE.toolboxTalks.target}</p></div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Compliance Readiness Score</h3>
            <div className="flex items-center gap-8">
              <div className="text-center"><div className="text-5xl font-bold text-green-400">94</div><p className="text-gray-500">Audit Ready</p></div>
              <div className="flex-1 space-y-3">
                {[{ label: 'Mandatory Inductions', value: 97.6 },{ label: 'Competency Certificates', value: 93.0 },{ label: 'Refresher Training', value: 89.4 },{ label: 'Toolbox Talks', value: 95.4 }].map((item) => (
                  <div key={item.label}><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">{item.label}</span><span className="text-white">{item.value}%</span></div><div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${item.value}%` }} /></div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Equipment & PPE Compliance</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">PPE Inspection Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-400">Total Issued</span><span className="text-white font-bold">{EQUIPMENT_COMPLIANCE.ppeIssued}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Passed Inspection</span><span className="text-green-400 font-bold">{EQUIPMENT_COMPLIANCE.ppeInspectionsPassed}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Failed Inspection</span><span className="text-red-400 font-bold">{EQUIPMENT_COMPLIANCE.ppeInspectionsFailed}</span></div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Equipment Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-400">Breakdowns (MTD)</span><span className="text-yellow-400 font-bold">{EQUIPMENT_COMPLIANCE.equipmentBreakdowns}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">LOTO Violations</span><span className="text-red-400 font-bold">{EQUIPMENT_COMPLIANCE.lotoViolations}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Machine Guarding</span><span className="text-green-400 font-bold">{EQUIPMENT_COMPLIANCE.machineGuardingCompliance}%</span></div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">AI Vision Detection</h3>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-400">PPE Detection Accuracy</span><span className="text-green-400 font-bold">94.7%</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Violations Today</span><span className="text-yellow-400 font-bold">23</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Auto-Alerts Sent</span><span className="text-blue-400 font-bold">18</span></div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Non-Compliance Heatmap by Zone</h3>
            <div className="grid grid-cols-6 gap-2">
              {['Level 1', 'Level 2', 'Level 3', 'Surface', 'Processing', 'Equipment Bay'].map((zone, i) => (
                <div key={zone} className={`p-4 rounded-lg text-center ${i === 1 ? 'bg-red-500/30' : i === 3 ? 'bg-green-500/30' : 'bg-yellow-500/30'}`}>
                  <p className="text-sm font-medium text-white">{zone}</p>
                  <p className="text-lg font-bold">{[12, 28, 15, 5, 18, 10][i]}</p>
                  <p className="text-xs text-gray-400">violations</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Environmental Tab */}
      {activeTab === 'environmental' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Environmental & Operational Data</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Ventilation Status</h3>
              <div className="space-y-3">
                {ENVIRONMENTAL_DATA.ventilation.map((v) => (
                  <div key={v.location} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div><p className="text-white">{v.location}</p><p className="text-xs text-gray-500">Required: {v.required} m³/s</p></div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${v.status === 'ok' ? 'text-green-400' : 'text-yellow-400'}`}>{v.airflow} m³/s</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${v.status === 'ok' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{v.status.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Gas Levels</h3>
              <div className="space-y-3">
                {ENVIRONMENTAL_DATA.gasLevels.map((g) => (
                  <div key={g.gas} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div><p className="text-white">{g.gas}</p><p className="text-xs text-gray-500">Limit: {g.limit} {g.unit}</p></div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${(g.level / g.limit) > 0.8 ? 'bg-red-500' : (g.level / g.limit) > 0.5 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min((g.level / g.limit) * 100, 100)}%` }} />
                      </div>
                      <span className="text-white font-mono w-16 text-right">{g.level} {g.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4"><p className="text-sm text-gray-500">Temperature</p><p className="text-2xl font-bold text-white">{ENVIRONMENTAL_DATA.temperature}°C</p></div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4"><p className="text-sm text-gray-500">Humidity</p><p className="text-2xl font-bold text-white">{ENVIRONMENTAL_DATA.humidity}%</p></div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4"><p className="text-sm text-gray-500">Next Blast</p><p className="text-2xl font-bold text-yellow-400">14:30</p></div>
          </div>
        </div>
      )}

      {/* Predictive AI Tab */}
      {activeTab === 'predictive' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Predictive Intelligence</h2>
            <span className="text-sm text-gray-500">Powered by AI/ML Models</span>
          </div>
          <div className="space-y-3">
            {PREDICTIVE_DATA.aiInsights.map((insight, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-lg border ${insight.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' : insight.type === 'alert' ? 'bg-red-500/10 border-red-500/30' : insight.type === 'success' ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                <div className="flex items-start gap-3">
                  <LightBulbIcon className={`w-6 h-6 flex-shrink-0 ${insight.type === 'warning' ? 'text-yellow-400' : insight.type === 'alert' ? 'text-red-400' : insight.type === 'success' ? 'text-green-400' : 'text-blue-400'}`} />
                  <div className="flex-1"><p className="text-white">{insight.message}</p><p className="text-xs text-gray-500 mt-1">Confidence: {insight.confidence}%</p></div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🔮 Dust Risk Index</h3>
              <div className="space-y-3">
                {PREDICTIVE_DATA.dustRiskIndex.map((item) => (
                  <div key={item.shaft} className="flex items-center justify-between">
                    <span className="text-gray-400">{item.shaft}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.risk > 70 ? 'bg-red-500' : item.risk > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${item.risk}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${item.risk > 70 ? 'text-red-400' : item.risk > 40 ? 'text-yellow-400' : 'text-green-400'}`}>{item.risk}%</span>
                      {item.trend === 'increasing' && <ArrowTrendingUpIcon className="w-4 h-4 text-red-400" />}
                      {item.trend === 'decreasing' && <ArrowTrendingDownIcon className="w-4 h-4 text-green-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📊 PPE Non-Compliance Risk</h3>
              <div className="space-y-3">
                {PREDICTIVE_DATA.ppeNonCompliance.map((item) => (
                  <div key={item.zone} className="flex items-center justify-between">
                    <span className="text-gray-400">{item.zone}</span>
                    <span className={`text-sm font-bold ${item.probability > 40 ? 'text-red-400' : item.probability > 25 ? 'text-yellow-400' : 'text-green-400'}`}>{item.probability}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">⚠️ Injury Forecast</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg"><span className="text-gray-400">Next 30 days</span><span className="text-yellow-400 font-bold">{PREDICTIVE_DATA.injuryLikelihood.next30}%</span></div>
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg"><span className="text-gray-400">Next 60 days</span><span className="text-orange-400 font-bold">{PREDICTIVE_DATA.injuryLikelihood.next60}%</span></div>
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg"><span className="text-gray-400">Next 90 days</span><span className="text-red-400 font-bold">{PREDICTIVE_DATA.injuryLikelihood.next90}%</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Tab */}
      {activeTab === 'submit' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Submit to Mining Board (DMRE)</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Available Reports</h3>
              {[{ name: 'Monthly Incident Report', status: 'ready' },{ name: 'Dust Exceedance Log', status: 'ready' },{ name: 'Quarterly Health Summary', status: 'pending' },{ name: 'Training Compliance Report', status: 'ready' },{ name: 'Section 23 Notice (INC-003)', status: 'draft' }].map((report, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3"><DocumentChartBarIcon className="w-6 h-6 text-gray-400" /><p className="text-white">{report.name}</p></div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${report.status === 'ready' ? 'bg-green-500/20 text-green-400' : report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>{report.status}</span>
                    <button className="text-primary-400 hover:text-primary-300 text-sm">Download</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Submission Process</h3>
              <div className="space-y-4">
                {[{ step: 1, label: 'Validate', desc: 'Check mandatory fields & regulatory bounds' },{ step: 2, label: 'Normalize', desc: 'Convert to DMRE CSV/Excel/PDF format' },{ step: 3, label: 'Generate', desc: 'Auto-create statutory reports' },{ step: 4, label: 'Submit', desc: 'Download or email to regulator' }].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{item.step}</div>
                    <div><p className="text-white font-medium">{item.label}</p><p className="text-sm text-gray-500">{item.desc}</p></div>
                  </div>
                ))}
              </div>
              <button onClick={handleSubmitToBoard} className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <PaperAirplaneIcon className="w-5 h-5" />Begin Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">Submitting to Mining Board</h3>
            <div className="space-y-4">
              {[{ step: 1, label: 'Validating data...' },{ step: 2, label: 'Normalizing to DMRE schema...' },{ step: 3, label: 'Generating reports...' },{ step: 4, label: 'Ready for submission' }].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  {submissionStep >= item.step ? <CheckCircleIcon className="w-6 h-6 text-green-400" /> : <div className="w-6 h-6 border-2 border-gray-600 rounded-full flex items-center justify-center">{submissionStep === item.step - 1 && <ArrowPathIcon className="w-4 h-4 text-primary-400 animate-spin" />}</div>}
                  <span className={submissionStep >= item.step ? 'text-white' : 'text-gray-500'}>{item.label}</span>
                </div>
              ))}
            </div>
            {submissionStep === 4 && (
              <div className="mt-6 space-y-3">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"><DocumentChartBarIcon className="w-5 h-5" />Download Reports (ZIP)</button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"><PaperAirplaneIcon className="w-5 h-5" />Email to DMRE</button>
                <button onClick={() => setShowSubmitModal(false)} className="w-full text-gray-400 hover:text-white text-sm">Close</button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
