import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
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
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
  UserCircleIcon,
  PrinterIcon,
  ShieldCheckIcon,
  SignalIcon,
  TruckIcon,
  EyeIcon,
  XMarkIcon,
  PlayIcon,
  MapPinIcon,
  VideoCameraIcon,
  PhotoIcon,
  DocumentMagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { BellAlertIcon as BellAlertSolid } from '@heroicons/react/24/solid';
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

// Tab configuration - MSO-focused workflow
const TABS = [
  { id: 'myday', label: 'My Day', icon: UserCircleIcon },
  { id: 'live', label: 'Live Signals', icon: SignalIcon },
  { id: 'inspector', label: 'Inspector Mode', icon: ShieldCheckIcon },
  { id: 'incidents', label: 'Incidents', icon: ExclamationTriangleIcon },
  { id: 'analytics', label: 'Analytics', icon: DocumentChartBarIcon },
  { id: 'monitoring', label: 'AI Monitoring', icon: EyeIcon },
  { id: 'forensics', label: 'Forensics', icon: DocumentMagnifyingGlassIcon },
  { id: 'dust', label: 'Dust & Hygiene', icon: CloudIcon },
  { id: 'health', label: 'Health', icon: HeartIcon },
  { id: 'training', label: 'Training', icon: AcademicCapIcon },
  { id: 'equipment', label: 'Equipment & PPE', icon: ShieldExclamationIcon },
  { id: 'environmental', label: 'Environmental', icon: BeakerIcon },
  { id: 'predictive', label: 'Predictive AI', icon: LightBulbIcon },
  { id: 'dailylog', label: 'Daily Log', icon: ClipboardDocumentCheckIcon },
];

// AI Monitoring Alerts - Heavy Machinery, Conveyor, Dust/Smoke, Zone Access, Fatigue
const AI_MONITORING_ALERTS = [
  // Heavy Machinery Proximity
  { id: 'MON-001', type: 'proximity', severity: 'critical', title: 'Heavy Machinery Proximity Alert', message: 'Worker detected within 3m of active LHD', zone: 'Level 2 Tramway', camera: 'CAM-12', time: '2 min ago', acknowledged: false, mediaType: 'video', mediaUrl: '/footage/proximity_001.mp4', thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400' },
  { id: 'MON-002', type: 'proximity', severity: 'warning', title: 'Dozer Blind Spot Entry', message: 'Personnel entered dozer reverse zone without spotter', zone: 'Surface Stockpile', camera: 'CAM-08', time: '8 min ago', acknowledged: true, mediaType: 'video', mediaUrl: '/footage/proximity_002.mp4', thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400' },
  // Conveyor Belt Hazard
  { id: 'MON-003', type: 'conveyor', severity: 'critical', title: 'Conveyor Belt Hazard', message: 'Unauthorized person near moving conveyor belt', zone: 'Belt Road 2', camera: 'CAM-15', time: '5 min ago', acknowledged: false, mediaType: 'video', mediaUrl: '/footage/conveyor_001.mp4', thumbnail: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400' },
  { id: 'MON-004', type: 'conveyor', severity: 'warning', title: 'Belt Misalignment Detected', message: 'AI detected belt tracking issue - potential friction fire risk', zone: 'Main Conveyor', camera: 'CAM-16', time: '12 min ago', acknowledged: false, mediaType: 'image', mediaUrl: '/footage/conveyor_002.jpg', thumbnail: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400' },
  // Dust and Smoke Detection
  { id: 'MON-005', type: 'dust_smoke', severity: 'critical', title: 'Smoke Detected', message: 'Possible fire - smoke plume detected near electrical panel', zone: 'Workshop', camera: 'CAM-22', time: '1 min ago', acknowledged: false, mediaType: 'video', mediaUrl: '/footage/smoke_001.mp4', thumbnail: 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=400' },
  { id: 'MON-006', type: 'dust_smoke', severity: 'warning', title: 'Excessive Dust Cloud', message: 'Dust levels exceeding visual threshold at crusher', zone: 'Crusher Area', camera: 'CAM-18', time: '15 min ago', acknowledged: true, mediaType: 'image', mediaUrl: '/footage/dust_001.jpg', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  // Unauthorized Zone Access
  { id: 'MON-007', type: 'zone_access', severity: 'critical', title: 'Unauthorized Zone Entry', message: 'Unidentified person entered blasting exclusion zone', zone: 'Level 4 Stope', camera: 'CAM-31', time: '3 min ago', acknowledged: false, mediaType: 'video', mediaUrl: '/footage/zone_001.mp4', thumbnail: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400' },
  { id: 'MON-008', type: 'zone_access', severity: 'warning', title: 'After-Hours Access', message: 'Movement detected in restricted area during non-operational hours', zone: 'Magazine', camera: 'CAM-35', time: '22 min ago', acknowledged: true, mediaType: 'video', mediaUrl: '/footage/zone_002.mp4', thumbnail: 'https://images.unsplash.com/photo-1558618047-f4b511d398e6?w=400' },
  // Fatigue & Distraction
  { id: 'MON-009', type: 'fatigue', severity: 'critical', title: 'Operator Fatigue Detected', message: 'LHD operator showing signs of drowsiness - 3 micro-sleeps in 10 min', zone: 'Level 1 Tramway', camera: 'CAM-CAB-04', time: '1 min ago', acknowledged: false, mediaType: 'video', mediaUrl: '/footage/fatigue_001.mp4', thumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400' },
  { id: 'MON-010', type: 'fatigue', severity: 'warning', title: 'Distracted Operator', message: 'Drill operator looking away from task for extended period', zone: 'Level 3 Stope', camera: 'CAM-CAB-07', time: '6 min ago', acknowledged: false, mediaType: 'video', mediaUrl: '/footage/fatigue_002.mp4', thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400' },
];

// Forensic Reports Data
const FORENSIC_REPORTS = [
  { id: 'FOR-001', incidentId: 'INC-002', title: 'Winch Cable Failure Analysis', date: '2024-02-08', investigator: 'J. van der Merwe', status: 'completed', findings: 'Cable fatigue due to inadequate inspection interval', recommendations: ['Reduce inspection interval to 7 days', 'Replace all cables >2 years old', 'Install real-time tension monitoring'], rootCause: 'equipment', contributingFactors: ['Deferred maintenance', 'Budget constraints', 'Lack of condition monitoring'], evidenceCount: 12, videoClips: 3, photos: 8 },
  { id: 'FOR-002', incidentId: 'INC-003', title: 'Conveyor Fire Investigation', date: '2024-02-07', investigator: 'P. Mokoena', status: 'in_progress', findings: 'Belt misalignment caused friction heating', recommendations: ['Install thermal cameras on all belt drives', 'Automated belt tracking system'], rootCause: 'equipment', contributingFactors: ['Belt wear', 'Delayed maintenance', 'Insufficient monitoring'], evidenceCount: 8, videoClips: 2, photos: 6 },
  { id: 'FOR-003', incidentId: 'INC-008', title: 'Blasting Misfire Root Cause', date: '2024-02-02', investigator: 'S. Naidoo', status: 'completed', findings: 'Detonator connection fault', recommendations: ['100% pre-blast connection verification', 'Upgrade to electronic detonators'], rootCause: 'human', contributingFactors: ['Rush to meet production targets', 'Inadequate supervision', 'Training gap'], evidenceCount: 15, videoClips: 4, photos: 11 },
  { id: 'FOR-004', incidentId: 'INC-010', title: 'LHD Rollover Investigation', date: '2024-01-29', investigator: 'T. Botha', status: 'completed', findings: 'Excessive speed on wet decline', recommendations: ['Mandatory speed limiters', 'Improved road conditions', 'Operator retraining'], rootCause: 'human', contributingFactors: ['Production pressure', 'Wet conditions', 'Operator fatigue'], evidenceCount: 20, videoClips: 5, photos: 15 },
];

// Comprehensive incident data
const DEMO_INCIDENTS: IncidentReport[] = [
  { id: 'INC-001', mineName: 'Gold Mine Alpha', rightNumber: 'MR-2024-001', shaftSection: 'Level 3 Stope', dateTime: '2024-02-08T14:30:00', incidentType: 'near_miss', occupation: 'Rock Drill Operator', ppeWorn: true, ppeType: ['Helmet', 'Respirator', 'Safety boots'], immediateCause: 'Rock fall from hanging wall', rootCause: 'environmental', correctiveActions: 'Support installation reviewed, barring down procedure reinforced', inspectorNotified: '2024-02-08T15:00:00', status: 'submitted' },
  { id: 'INC-002', mineName: 'Platinum Mine Beta', rightNumber: 'MR-2024-002', shaftSection: 'Main Decline', dateTime: '2024-02-07T08:15:00', incidentType: 'lti', occupation: 'Winch Operator', ppeWorn: true, ppeType: ['Helmet', 'Gloves', 'Safety boots'], immediateCause: 'Winch cable snapped during hoisting', rootCause: 'equipment', correctiveActions: 'Winch replaced, cable inspection protocol updated', inspectorNotified: '2024-02-07T09:00:00', status: 'acknowledged' },
  { id: 'INC-003', mineName: 'Coal Mine Gamma', rightNumber: 'MR-2024-003', shaftSection: 'Conveyor Section', dateTime: '2024-02-06T22:45:00', incidentType: 'dangerous_occurrence', occupation: 'Belt Attendant', ppeWorn: false, ppeType: [], immediateCause: 'Conveyor belt friction ignition', rootCause: 'equipment', correctiveActions: 'Fire suppression upgraded, belt alignment corrected', inspectorNotified: '2024-02-06T23:00:00', status: 'pending' },
  { id: 'INC-004', mineName: 'Gold Mine Alpha', rightNumber: 'MR-2024-001', shaftSection: 'Level 2 Crosscut', dateTime: '2024-02-05T11:20:00', incidentType: 'near_miss', occupation: 'Locomotive Driver', ppeWorn: true, ppeType: ['Helmet', 'Reflective vest'], immediateCause: 'Near collision at intersection', rootCause: 'human', correctiveActions: 'Traffic management review, signage improved', inspectorNotified: '2024-02-05T12:00:00', status: 'acknowledged' },
  { id: 'INC-005', mineName: 'Platinum Mine Beta', rightNumber: 'MR-2024-002', shaftSection: 'Shaft Station', dateTime: '2024-02-04T16:45:00', incidentType: 'fai', occupation: 'Shaft Timberman', ppeWorn: true, ppeType: ['Helmet', 'Gloves', 'Safety harness'], immediateCause: 'Hand caught between timber supports', rootCause: 'human', correctiveActions: 'Task risk assessment updated, refresher training', inspectorNotified: '', status: 'submitted' },
  { id: 'INC-006', mineName: 'Coal Mine Gamma', rightNumber: 'MR-2024-003', shaftSection: 'Surface Stockpile', dateTime: '2024-02-03T09:30:00', incidentType: 'mti', occupation: 'Dozer Operator', ppeWorn: true, ppeType: ['Helmet', 'Safety boots', 'Dust mask'], immediateCause: 'Slipped on wet coal surface', rootCause: 'environmental', correctiveActions: 'Housekeeping improved, anti-slip measures', inspectorNotified: '', status: 'acknowledged' },
  { id: 'INC-007', mineName: 'Gold Mine Alpha', rightNumber: 'MR-2024-001', shaftSection: 'Processing Plant', dateTime: '2024-02-02T14:00:00', incidentType: 'near_miss', occupation: 'Process Controller', ppeWorn: true, ppeType: ['Helmet', 'Safety glasses', 'Ear plugs'], immediateCause: 'Chemical spill near walkway', rootCause: 'equipment', correctiveActions: 'Pipe fitting replaced, bunding installed', inspectorNotified: '2024-02-02T14:30:00', status: 'acknowledged' },
  { id: 'INC-008', mineName: 'Platinum Mine Beta', rightNumber: 'MR-2024-002', shaftSection: 'Level 4 Stope', dateTime: '2024-02-01T07:45:00', incidentType: 'dangerous_occurrence', occupation: 'Blaster', ppeWorn: true, ppeType: ['Helmet', 'Respirator', 'Ear protection'], immediateCause: 'Misfire during blasting round', rootCause: 'human', correctiveActions: 'Blasting procedure audit, competency re-assessment', inspectorNotified: '2024-02-01T08:00:00', status: 'submitted' },
  { id: 'INC-009', mineName: 'Coal Mine Gamma', rightNumber: 'MR-2024-003', shaftSection: 'Main Fan', dateTime: '2024-01-30T23:15:00', incidentType: 'near_miss', occupation: 'Ventilation Officer', ppeWorn: true, ppeType: ['Helmet', 'Respirator'], immediateCause: 'Fan bearing overheating detected', rootCause: 'equipment', correctiveActions: 'Bearing replaced, monitoring frequency increased', inspectorNotified: '', status: 'acknowledged' },
  { id: 'INC-010', mineName: 'Gold Mine Alpha', rightNumber: 'MR-2024-001', shaftSection: 'Level 1 Tramming', dateTime: '2024-01-28T13:00:00', incidentType: 'lti', occupation: 'LHD Operator', ppeWorn: true, ppeType: ['Helmet', 'Seatbelt'], immediateCause: 'LHD rolled on decline ramp', rootCause: 'human', correctiveActions: 'Speed limit enforcement, ROPS inspection', inspectorNotified: '2024-01-28T13:30:00', status: 'acknowledged' },
  { id: 'INC-011', mineName: 'Platinum Mine Beta', rightNumber: 'MR-2024-002', shaftSection: 'Workshop', dateTime: '2024-01-25T10:30:00', incidentType: 'fai', occupation: 'Fitter', ppeWorn: false, ppeType: [], immediateCause: 'Grinder disc shattered', rootCause: 'equipment', correctiveActions: 'Disc inspection protocol, PPE enforcement', inspectorNotified: '', status: 'submitted' },
  { id: 'INC-012', mineName: 'Coal Mine Gamma', rightNumber: 'MR-2024-003', shaftSection: 'Belt Road 2', dateTime: '2024-01-22T19:00:00', incidentType: 'near_miss', occupation: 'Electrician', ppeWorn: true, ppeType: ['Helmet', 'Insulated gloves'], immediateCause: 'Exposed live cable identified', rootCause: 'equipment', correctiveActions: 'Cable replaced, isolation procedures reviewed', inspectorNotified: '2024-01-22T19:30:00', status: 'acknowledged' },
];

// Extended incidents with media
const INCIDENTS_WITH_MEDIA = [
  { ...DEMO_INCIDENTS[0], mediaType: 'video' as const, mediaUrl: '/footage/inc_001.mp4', thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', duration: '13s' },
  { ...DEMO_INCIDENTS[1], mediaType: 'video' as const, mediaUrl: '/footage/inc_002.mp4', thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', duration: '13s' },
  { ...DEMO_INCIDENTS[2], mediaType: 'video' as const, mediaUrl: '/footage/inc_003.mp4', thumbnail: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400', duration: '13s' },
  { ...DEMO_INCIDENTS[3], mediaType: 'image' as const, mediaUrl: '/footage/inc_004.jpg', thumbnail: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400' },
  { ...DEMO_INCIDENTS[4], mediaType: 'video' as const, mediaUrl: '/footage/inc_005.mp4', thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', duration: '13s' },
  { ...DEMO_INCIDENTS[5], mediaType: 'image' as const, mediaUrl: '/footage/inc_006.jpg', thumbnail: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400' },
];

// Analytics data for charts
const INCIDENT_ANALYTICS = {
  monthlyTrend: [
    { month: 'Sep', fatalities: 0, lti: 2, mti: 3, fai: 5, nearMiss: 18, dangerous: 1 },
    { month: 'Oct', fatalities: 0, lti: 1, mti: 4, fai: 7, nearMiss: 22, dangerous: 2 },
    { month: 'Nov', fatalities: 1, lti: 3, mti: 2, fai: 4, nearMiss: 15, dangerous: 1 },
    { month: 'Dec', fatalities: 0, lti: 1, mti: 2, fai: 6, nearMiss: 25, dangerous: 0 },
    { month: 'Jan', fatalities: 0, lti: 2, mti: 3, fai: 5, nearMiss: 28, dangerous: 2 },
    { month: 'Feb', fatalities: 0, lti: 1, mti: 1, fai: 3, nearMiss: 12, dangerous: 1 },
  ],
  byRootCause: [
    { cause: 'Human Error', count: 45, percentage: 38 },
    { cause: 'Equipment Failure', count: 42, percentage: 35 },
    { cause: 'Environmental', count: 32, percentage: 27 },
  ],
  byLocation: [
    { location: 'Stope Areas', incidents: 35, severity: 'high' },
    { location: 'Tramming/Haulage', incidents: 28, severity: 'medium' },
    { location: 'Surface Operations', incidents: 18, severity: 'low' },
    { location: 'Workshop/Maintenance', incidents: 15, severity: 'medium' },
    { location: 'Shaft/Stations', incidents: 12, severity: 'high' },
    { location: 'Processing Plant', incidents: 11, severity: 'low' },
  ],
  byShift: [
    { shift: 'Day Shift (06:00-14:00)', incidents: 48, percentage: 40 },
    { shift: 'Afternoon (14:00-22:00)', incidents: 42, percentage: 35 },
    { shift: 'Night Shift (22:00-06:00)', incidents: 29, percentage: 25 },
  ],
  byOccupation: [
    { occupation: 'Rock Drill Operators', incidents: 22 },
    { occupation: 'LHD/TMM Operators', incidents: 18 },
    { occupation: 'Artisans (Fitters/Electricians)', incidents: 15 },
    { occupation: 'General Workers', incidents: 28 },
    { occupation: 'Supervisors', incidents: 8 },
    { occupation: 'Blasters', incidents: 12 },
    { occupation: 'Others', incidents: 16 },
  ],
  safetyRates: {
    ltifr: 2.34,
    ltifrTarget: 2.0,
    trifr: 8.56,
    trifrTarget: 7.5,
    fatalities2024: 1,
    fatalities2023: 3,
    nearMissRatio: 4.2,
  },
  section54Notices: [
    { date: '2024-01-15', reason: 'Ventilation non-compliance', duration: '4 hours', resolved: true },
    { date: '2024-01-28', reason: 'Fall of ground investigation', duration: '8 hours', resolved: true },
    { date: '2024-02-06', reason: 'Belt fire investigation', duration: 'Ongoing', resolved: false },
  ],
};

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
    { type: 'warning', message: 'Level 2 has 63% probability of dust exceedance in 14 days', confidence: 87, reasons: ['Dust up 18% over 7 days', 'Ventilation below target 3 shifts', 'P3 respirator usage dropped 12%'] },
    { type: 'alert', message: 'Ventilation degradation correlated with PPE non-compliance in Stope area', confidence: 92, reasons: ['Airflow dropped to 38.5 m³/s', 'PPE violations up 45% this week', 'Temperature rising'] },
    { type: 'info', message: 'Near-miss frequency increased 23% in night shift - recommend intervention', confidence: 78, reasons: ['12 near-misses last 7 days', 'Night shift has 3x day shift rate', 'Fatigue indicators present'] },
    { type: 'success', message: 'FOG incidents reduced 45% after support pattern changes', confidence: 95, reasons: ['New support installed Level 3', 'Ground stability improved', 'Seismic activity down'] },
  ],
};

// MSO "Fix Today" actionable tasks
const FIX_TODAY_TASKS = [
  { id: 1, priority: 'critical', task: 'Investigate dust exceedance at Level 2 Stope Face', deadline: '14:00', category: 'dust', zone: 'Level 2', status: 'pending' },
  { id: 2, priority: 'high', task: 'Address ventilation shortfall at Level 2 (38.5 vs 40 m³/s required)', deadline: '16:00', category: 'environmental', zone: 'Level 2', status: 'pending' },
  { id: 3, priority: 'high', task: 'Retrain Crew B - 12 workers with expired blasting certificates', deadline: 'Today', category: 'training', zone: 'All', status: 'in_progress' },
  { id: 4, priority: 'medium', task: 'Review repeated PPE violations in Zone C (5 repeat offenders)', deadline: 'Today', category: 'ppe', zone: 'Zone C', status: 'pending' },
  { id: 5, priority: 'medium', task: 'Follow up Section 23 notice for INC-003 (Belt fire)', deadline: '17:00', category: 'incidents', zone: 'Conveyor', status: 'pending' },
  { id: 6, priority: 'low', task: 'Schedule monthly dust calibration', deadline: 'This week', category: 'dust', zone: 'All', status: 'pending' },
];

// Live safety signals (real-time alerts)
const LIVE_SIGNALS = [
  { id: 1, type: 'ppe', severity: 'warning', message: 'No helmet detected - Haul Road Camera 3', zone: 'Haul Road', time: '2 min ago', acknowledged: false },
  { id: 2, type: 'gas', severity: 'info', message: 'CH₄ rising slowly (0.3% → 0.4%)', zone: 'Level 3', time: '5 min ago', acknowledged: true },
  { id: 3, type: 'dust', severity: 'critical', message: 'RCS at 92% of limit - approaching exceedance', zone: 'Level 2 Stope', time: '8 min ago', acknowledged: false },
  { id: 4, type: 'ppe', severity: 'warning', message: 'Respirator removed in dust zone', zone: 'Crusher Area', time: '12 min ago', acknowledged: false },
  { id: 5, type: 'ventilation', severity: 'warning', message: 'Airflow dropped below threshold', zone: 'Level 2', time: '15 min ago', acknowledged: true },
  { id: 6, type: 'near_miss', severity: 'alert', message: 'Near-miss reported: Rock fragment', zone: 'Level 3 Stope', time: '23 min ago', acknowledged: false },
];

// MSO KPIs
const MSO_KPIS = {
  daysSinceLastIncident: 47,
  daysSinceLastFatality: 312,
  dustExceedanceFreeDays: 3,
  auditReadinessScore: 94,
  correctiveActionsClosed: 87,
  personalLiabilityRisk: 'low',
  inspectorVisitDue: 12,
};

// Inspector Mode compliance proof
const INSPECTOR_PROOF = {
  lastSubmissions: [
    { type: 'Monthly Incident Return', date: '2024-02-01', status: 'submitted' },
    { type: 'Dust Monitoring Report', date: '2024-02-05', status: 'submitted' },
    { type: 'Training Compliance', date: '2024-01-28', status: 'submitted' },
    { type: 'Section 23 Notice (INC-002)', date: '2024-02-07', status: 'acknowledged' },
  ],
  correctiveActions: [
    { incident: 'INC-001', action: 'Support installation reviewed', status: 'completed', date: '2024-02-09' },
    { incident: 'INC-002', action: 'Winch replaced', status: 'completed', date: '2024-02-08' },
    { incident: 'INC-002', action: 'Training refreshed', status: 'completed', date: '2024-02-09' },
    { incident: 'INC-003', action: 'Fire suppression upgraded', status: 'in_progress', date: '2024-02-10' },
  ],
  complianceGaps: [
    { area: 'Training', gap: '120 expired certificates', severity: 'medium' },
    { area: 'Dust Monitoring', gap: '2 active exceedances', severity: 'high' },
    { area: 'Ventilation', gap: 'Level 2 below requirement', severity: 'medium' },
  ],
};

// Daily log entries
const DAILY_LOG_ENTRIES = [
  { time: '06:00', entry: 'Shift handover completed', category: 'admin', user: 'J. Smith' },
  { time: '06:30', entry: 'Morning inspection - all areas cleared', category: 'inspection', user: 'J. Smith' },
  { time: '08:15', entry: 'Near-miss reported Level 3 - rock fragment', category: 'incident', user: 'M. Johnson' },
  { time: '09:00', entry: 'Dust reading taken - Level 2 at 0.08 mg/m³ (EXCEEDANCE)', category: 'dust', user: 'P. Williams' },
  { time: '10:30', entry: 'PPE violation addressed - worker counseled', category: 'ppe', user: 'J. Smith' },
  { time: '12:00', entry: 'Toolbox talk conducted - 24 attendees', category: 'training', user: 'J. Smith' },
];

interface MiningSafetyProps {
  defaultTab?: string;
}

export default function MiningSafety({ defaultTab = 'myday' }: MiningSafetyProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionStep, setSubmissionStep] = useState(0);
  const [selectedIncident, setSelectedIncident] = useState<typeof INCIDENTS_WITH_MEDIA[0] | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<typeof AI_MONITORING_ALERTS[0] | null>(null);
  const [monitoringFilter, setMonitoringFilter] = useState<string>('all');

  // Sync activeTab when navigating via sidebar
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const getMonitoringTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      proximity: 'Heavy Machinery',
      conveyor: 'Conveyor Belt',
      dust_smoke: 'Dust/Smoke',
      zone_access: 'Zone Access',
      fatigue: 'Fatigue/Distraction',
    };
    return labels[type] || type;
  };

  const getMonitoringTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      proximity: 'bg-orange-500',
      conveyor: 'bg-blue-500',
      dust_smoke: 'bg-gray-500',
      zone_access: 'bg-red-500',
      fatigue: 'bg-purple-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const filteredAlerts = monitoringFilter === 'all' 
    ? AI_MONITORING_ALERTS 
    : AI_MONITORING_ALERTS.filter(a => a.type === monitoringFilter);

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
      {/* MSO Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CubeIcon className="w-8 h-8 text-amber-400" />
            Mining Safety Control Room
          </h1>
          <p className="text-gray-400 mt-1">Good morning, Safety Officer • {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('inspector')} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
            <ShieldCheckIcon className="w-5 h-5" />
            Inspector Mode
          </button>
          <button onClick={handleSubmitToBoard} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <PaperAirplaneIcon className="w-5 h-5" />
            Submit to Board
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg">
            <BellAlertSolid className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-white font-medium">{LIVE_SIGNALS.filter(s => !s.acknowledged).length}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1 overflow-x-auto scrollbar-thin">
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
            {tab.id === 'live' && LIVE_SIGNALS.filter(s => !s.acknowledged).length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{LIVE_SIGNALS.filter(s => !s.acknowledged).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* MY DAY Tab - MSO Morning Briefing */}
      {activeTab === 'myday' && (
        <div className="space-y-6">
          {/* Top KPI Strip */}
          <div className="grid grid-cols-6 gap-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-4 border border-green-500/30">
              <p className="text-xs text-green-400 uppercase tracking-wide">Days Since Incident</p>
              <p className="text-3xl font-bold text-green-400">{MSO_KPIS.daysSinceLastIncident}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 rounded-xl p-4 border border-emerald-500/30">
              <p className="text-xs text-emerald-400 uppercase tracking-wide">Fatality Free</p>
              <p className="text-3xl font-bold text-emerald-400">{MSO_KPIS.daysSinceLastFatality}</p>
              <p className="text-xs text-gray-500">days</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-red-900/50 to-red-800/30 rounded-xl p-4 border border-red-500/30">
              <p className="text-xs text-red-400 uppercase tracking-wide">Dust Exceedance Free</p>
              <p className="text-3xl font-bold text-red-400">{MSO_KPIS.dustExceedanceFreeDays}</p>
              <p className="text-xs text-gray-500">days</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-4 border border-blue-500/30">
              <p className="text-xs text-blue-400 uppercase tracking-wide">Audit Ready Score</p>
              <p className="text-3xl font-bold text-blue-400">{MSO_KPIS.auditReadinessScore}%</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-4 border border-purple-500/30">
              <p className="text-xs text-purple-400 uppercase tracking-wide">Corrective Actions</p>
              <p className="text-3xl font-bold text-purple-400">{MSO_KPIS.correctiveActionsClosed}%</p>
              <p className="text-xs text-gray-500">closed</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={`bg-gradient-to-br rounded-xl p-4 border ${MSO_KPIS.personalLiabilityRisk === 'low' ? 'from-green-900/50 to-green-800/30 border-green-500/30' : MSO_KPIS.personalLiabilityRisk === 'medium' ? 'from-yellow-900/50 to-yellow-800/30 border-yellow-500/30' : 'from-red-900/50 to-red-800/30 border-red-500/30'}`}>
              <p className="text-xs uppercase tracking-wide" style={{ color: MSO_KPIS.personalLiabilityRisk === 'low' ? '#4ADE80' : MSO_KPIS.personalLiabilityRisk === 'medium' ? '#FBBF24' : '#F87171' }}>Liability Risk</p>
              <p className="text-2xl font-bold capitalize" style={{ color: MSO_KPIS.personalLiabilityRisk === 'low' ? '#4ADE80' : MSO_KPIS.personalLiabilityRisk === 'medium' ? '#FBBF24' : '#F87171' }}>{MSO_KPIS.personalLiabilityRisk}</p>
              <p className="text-xs text-gray-500">Inspector in {MSO_KPIS.inspectorVisitDue}d</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Fix Today - Actionable Tasks */}
            <div className="col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <WrenchScrewdriverIcon className="w-5 h-5 text-amber-400" />
                  What to Fix Today
                </h3>
                <span className="text-sm text-gray-500">{FIX_TODAY_TASKS.filter(t => t.status === 'pending').length} pending</span>
              </div>
              <div className="space-y-3">
                {FIX_TODAY_TASKS.map((task) => (
                  <motion.div key={task.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: task.id * 0.05 }}
                    className={`p-4 rounded-lg border-l-4 ${task.priority === 'critical' ? 'bg-red-500/10 border-red-500' : task.priority === 'high' ? 'bg-orange-500/10 border-orange-500' : task.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-gray-700/50 border-gray-500'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${task.priority === 'critical' ? 'bg-red-500/20 text-red-400' : task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>{task.priority}</span>
                          <span className="text-xs text-gray-500">{task.zone}</span>
                        </div>
                        <p className="text-white">{task.task}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-400">Due: {task.deadline}</p>
                        <button className="mt-1 text-xs text-primary-400 hover:text-primary-300">Mark Done →</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 7-Day Risk Forecast */}
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <LightBulbIcon className="w-5 h-5 text-purple-400" />
                  7-Day Risk Forecast
                </h3>
                <div className="space-y-3">
                  {PREDICTIVE_DATA.dustRiskIndex.filter(d => d.risk > 50).map((item) => (
                    <div key={item.shaft} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{item.shaft}</span>
                        <span className="text-red-400 font-bold">{item.risk}% risk</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Dust exceedance likely</p>
                    </div>
                  ))}
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">⚠️ Near-miss trend up 23% on night shift</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white text-left">📝 New Incident</button>
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white text-left">🧪 Log Dust Sample</button>
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white text-left">🦺 PPE Violation</button>
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white text-left">📋 Toolbox Talk</button>
                </div>
              </div>
            </div>
          </div>

          {/* High-Risk Areas Map */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Where Am I Exposed Right Now?</h3>
            <div className="grid grid-cols-6 gap-3">
              {[{ zone: 'Level 1', risk: 'low', issues: 0 },{ zone: 'Level 2', risk: 'critical', issues: 3 },{ zone: 'Level 3', risk: 'medium', issues: 1 },{ zone: 'Surface', risk: 'low', issues: 0 },{ zone: 'Processing', risk: 'medium', issues: 2 },{ zone: 'Equipment Bay', risk: 'low', issues: 1 }].map((area) => (
                <div key={area.zone} className={`p-4 rounded-lg text-center cursor-pointer transition-all hover:scale-105 ${area.risk === 'critical' ? 'bg-red-500/30 border-2 border-red-500' : area.risk === 'medium' ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-green-500/10 border border-green-500/30'}`}>
                  <p className="font-medium text-white">{area.zone}</p>
                  <p className={`text-2xl font-bold ${area.risk === 'critical' ? 'text-red-400' : area.risk === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>{area.issues}</p>
                  <p className="text-xs text-gray-400">active issues</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LIVE SIGNALS Tab - Real-time Safety Monitoring */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <SignalIcon className="w-6 h-6 text-green-400 animate-pulse" />
              Live Safety Signals
            </h2>
            <span className="text-sm text-gray-500">Auto-refreshing every 30s</span>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-xs text-red-400 uppercase">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-400">{LIVE_SIGNALS.filter(s => s.severity === 'critical' && !s.acknowledged).length}</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <p className="text-xs text-orange-400 uppercase">Alerts</p>
              <p className="text-3xl font-bold text-orange-400">{LIVE_SIGNALS.filter(s => s.severity === 'alert' && !s.acknowledged).length}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-xs text-yellow-400 uppercase">Warnings</p>
              <p className="text-3xl font-bold text-yellow-400">{LIVE_SIGNALS.filter(s => s.severity === 'warning' && !s.acknowledged).length}</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-xs text-blue-400 uppercase">Info</p>
              <p className="text-3xl font-bold text-blue-400">{LIVE_SIGNALS.filter(s => s.severity === 'info').length}</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-white">Active Signals</h3>
              <button className="text-sm text-primary-400 hover:text-primary-300">Acknowledge All</button>
            </div>
            <div className="divide-y divide-gray-700">
              {LIVE_SIGNALS.map((signal) => (
                <div key={signal.id} className={`p-4 flex items-center justify-between ${!signal.acknowledged ? 'bg-gray-800' : 'bg-gray-900/50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${signal.severity === 'critical' ? 'bg-red-500 animate-pulse' : signal.severity === 'alert' ? 'bg-orange-500 animate-pulse' : signal.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                    <div>
                      <p className="text-white">{signal.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{signal.zone}</span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500">{signal.time}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${signal.type === 'ppe' ? 'bg-purple-500/20 text-purple-400' : signal.type === 'dust' ? 'bg-orange-500/20 text-orange-400' : signal.type === 'gas' ? 'bg-red-500/20 text-red-400' : signal.type === 'ventilation' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{signal.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!signal.acknowledged && (
                      <button className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700">Acknowledge</button>
                    )}
                    {signal.acknowledged && (
                      <span className="text-xs text-gray-500">✓ Acknowledged</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INSPECTOR MODE Tab - Panic Button / Audit Ready */}
      {activeTab === 'inspector' && (
        <div className="space-y-6">
          <div className="bg-amber-500/10 border-2 border-amber-500 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <ShieldCheckIcon className="w-12 h-12 text-amber-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Inspector Mode Active</h2>
                <p className="text-gray-400">All compliance proof ready for regulator audit</p>
              </div>
              <div className="ml-auto">
                <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                  <PrinterIcon className="w-5 h-5" />
                  Print Full Audit Pack
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Latest Submissions */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DocumentChartBarIcon className="w-5 h-5 text-blue-400" />
                Latest Submissions
              </h3>
              <div className="space-y-3">
                {INSPECTOR_PROOF.lastSubmissions.map((sub, i) => (
                  <div key={i} className="p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm">{sub.type}</p>
                      <span className={`px-2 py-0.5 rounded text-xs ${sub.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{sub.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{sub.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Corrective Actions */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <WrenchScrewdriverIcon className="w-5 h-5 text-green-400" />
                Corrective Actions
              </h3>
              <div className="space-y-3">
                {INSPECTOR_PROOF.correctiveActions.map((action, i) => (
                  <div key={i} className="p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm">{action.action}</p>
                      {action.status === 'completed' ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <ArrowPathIcon className="w-5 h-5 text-yellow-400 animate-spin" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{action.incident} • {action.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Gaps */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                Known Compliance Gaps
              </h3>
              <div className="space-y-3">
                {INSPECTOR_PROOF.complianceGaps.map((gap, i) => (
                  <div key={i} className={`p-3 rounded-lg ${gap.severity === 'high' ? 'bg-red-500/10 border border-red-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm font-medium">{gap.area}</p>
                      <span className={`px-2 py-0.5 rounded text-xs uppercase ${gap.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{gap.severity}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{gap.gap}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">Tip: Address high-severity gaps before inspector visit</p>
            </div>
          </div>

          {/* Quick Access Documents */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">What Will the Inspector Ask?</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Incident Register', status: 'ready' },
                { label: 'Dust Monitoring Logs', status: 'ready' },
                { label: 'Training Records', status: 'gaps' },
                { label: 'Equipment Inspections', status: 'ready' },
                { label: 'Section 23 Notices', status: 'ready' },
                { label: 'Health Surveillance', status: 'ready' },
                { label: 'Ventilation Records', status: 'warning' },
                { label: 'PPE Issue Register', status: 'ready' },
              ].map((doc, i) => (
                <button key={i} className={`p-4 rounded-lg text-left transition-all hover:scale-105 ${doc.status === 'ready' ? 'bg-green-500/10 border border-green-500/30' : doc.status === 'gaps' ? 'bg-red-500/10 border border-red-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                  <p className="text-white font-medium">{doc.label}</p>
                  <p className={`text-xs mt-1 ${doc.status === 'ready' ? 'text-green-400' : doc.status === 'gaps' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {doc.status === 'ready' ? '✓ Audit Ready' : doc.status === 'gaps' ? '✗ Has Gaps' : '⚠ Review Needed'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DAILY LOG Tab - End of Day Evidence */}
      {activeTab === 'dailylog' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-400" />
              Daily Safety Log
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-gray-400">{new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <PrinterIcon className="w-5 h-5" />
                Generate Daily Report
              </button>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">Incidents Today</p>
              <p className="text-2xl font-bold text-green-400">0</p>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">Near Misses</p>
              <p className="text-2xl font-bold text-yellow-400">1</p>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">Dust Exceedances</p>
              <p className="text-2xl font-bold text-red-400">1</p>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">PPE Violations</p>
              <p className="text-2xl font-bold text-orange-400">3</p>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">Corrective Actions</p>
              <p className="text-2xl font-bold text-blue-400">2</p>
            </div>
          </div>

          {/* Log Timeline */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Activity Timeline</h3>
            <div className="space-y-4">
              {DAILY_LOG_ENTRIES.map((entry, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="text-right w-16">
                    <span className="text-white font-mono">{entry.time}</span>
                  </div>
                  <div className="flex-shrink-0 w-3 h-3 mt-1.5 rounded-full bg-primary-500" />
                  <div className="flex-1 pb-4 border-b border-gray-700">
                    <p className="text-white">{entry.entry}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${entry.category === 'incident' ? 'bg-red-500/20 text-red-400' : entry.category === 'dust' ? 'bg-orange-500/20 text-orange-400' : entry.category === 'ppe' ? 'bg-purple-500/20 text-purple-400' : entry.category === 'training' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>{entry.category}</span>
                      <span className="text-xs text-gray-500">by {entry.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Entry */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add Log Entry</h3>
            <div className="flex gap-4">
              <input type="text" placeholder="What happened?" className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500" />
              <select className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500">
                <option value="admin">Admin</option>
                <option value="inspection">Inspection</option>
                <option value="incident">Incident</option>
                <option value="dust">Dust</option>
                <option value="ppe">PPE</option>
                <option value="training">Training</option>
              </select>
              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Add Entry</button>
            </div>
          </div>

          {/* Supervisor Sign-off */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">End of Day Sign-off</h3>
                <p className="text-gray-400 text-sm">Confirm all safety activities have been logged and reviewed</p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <CheckCircleIcon className="w-5 h-5" />
                Sign Off & Close Day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Incident & Accident Register</h2>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm">
                <PrinterIcon className="w-4 h-4" />
                Export Register
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <DocumentTextIcon className="w-5 h-5" />
                New Incident Report
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-6 gap-3">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-3">
              <p className="text-xs text-gray-500 uppercase">Total (YTD)</p>
              <p className="text-2xl font-bold text-white">{DEMO_INCIDENTS.length}</p>
            </div>
            <div className="bg-red-500/10 rounded-lg border border-red-500/30 p-3">
              <p className="text-xs text-red-400 uppercase">Fatalities</p>
              <p className="text-2xl font-bold text-red-400">{INCIDENT_ANALYTICS.safetyRates.fatalities2024}</p>
            </div>
            <div className="bg-orange-500/10 rounded-lg border border-orange-500/30 p-3">
              <p className="text-xs text-orange-400 uppercase">LTIs</p>
              <p className="text-2xl font-bold text-orange-400">{DEMO_INCIDENTS.filter(i => i.incidentType === 'lti').length}</p>
            </div>
            <div className="bg-yellow-500/10 rounded-lg border border-yellow-500/30 p-3">
              <p className="text-xs text-yellow-400 uppercase">Near Misses</p>
              <p className="text-2xl font-bold text-yellow-400">{DEMO_INCIDENTS.filter(i => i.incidentType === 'near_miss').length}</p>
            </div>
            <div className="bg-pink-500/10 rounded-lg border border-pink-500/30 p-3">
              <p className="text-xs text-pink-400 uppercase">Dangerous Occ.</p>
              <p className="text-2xl font-bold text-pink-400">{DEMO_INCIDENTS.filter(i => i.incidentType === 'dangerous_occurrence').length}</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg border border-blue-500/30 p-3">
              <p className="text-xs text-blue-400 uppercase">Pending</p>
              <p className="text-2xl font-bold text-blue-400">{DEMO_INCIDENTS.filter(i => i.status === 'pending').length}</p>
            </div>
          </div>

          {/* Incident Cards with Media */}
          <div className="grid grid-cols-3 gap-4">
            {INCIDENTS_WITH_MEDIA.map((incident) => (
              <motion.div key={incident.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => setSelectedIncident(incident)}>
                <div className="relative">
                  <img src={incident.thumbnail} alt={incident.id} className="w-full h-40 object-cover" />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded text-xs ${getIncidentTypeColor(incident.incidentType)} text-white`}>
                      {getIncidentTypeLabel(incident.incidentType)}
                    </span>
                  </div>
                  {incident.mediaType === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <PlayIcon className="w-6 h-6 text-white" />
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">{incident.duration}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-mono text-sm">{incident.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${incident.status === 'acknowledged' ? 'bg-green-500/20 text-green-400' : incident.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{incident.status}</span>
                  </div>
                  <p className="text-white text-sm font-medium">{incident.mineName}</p>
                  <p className="text-gray-400 text-xs mt-1">{incident.shaftSection}</p>
                  <p className="text-gray-500 text-xs mt-2 line-clamp-2">{incident.immediateCause}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <span className="text-xs text-gray-500">{new Date(incident.dateTime).toLocaleDateString()}</span>
                    <button className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm">
                      <EyeIcon className="w-4 h-4" /> View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Full Incident Table */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-white">Full Incident Register</h3>
              <div className="flex items-center gap-2">
                <select className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-white">
                  <option>All Types</option>
                  <option>Fatalities</option>
                  <option>LTI</option>
                  <option>MTI</option>
                  <option>FAI</option>
                  <option>Near Miss</option>
                  <option>Dangerous Occurrence</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Mine / Section</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date/Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Root Cause</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {DEMO_INCIDENTS.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm text-white font-mono">{incident.id}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-white">{incident.mineName}</div>
                        <div className="text-xs text-gray-500">{incident.shaftSection}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getIncidentTypeColor(incident.incidentType)} text-white`}>
                          {getIncidentTypeLabel(incident.incidentType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{new Date(incident.dateTime).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${incident.rootCause === 'human' ? 'bg-purple-500/20 text-purple-400' : incident.rootCause === 'equipment' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                          {incident.rootCause}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${incident.status === 'acknowledged' ? 'bg-green-500/20 text-green-400' : incident.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' : incident.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {incident.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 54 Notices */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              Section 54 Stoppage Notices (2024)
            </h3>
            <div className="space-y-3">
              {INCIDENT_ANALYTICS.section54Notices.map((notice, i) => (
                <div key={i} className={`p-4 rounded-lg ${notice.resolved ? 'bg-gray-700/50' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{notice.reason}</p>
                      <p className="text-sm text-gray-400">{notice.date} • Duration: {notice.duration}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${notice.resolved ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {notice.resolved ? 'Resolved' : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auto Reports Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <DocumentTextIcon className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="text-blue-400 font-medium">Auto-Generated Reports</h4>
                <p className="text-sm text-gray-400 mt-1">System auto-generates Section 23 notices (within 24hrs of fatality/serious injury), Section 54 compliance reports, and monthly DMRE incident returns.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Safety Analytics & Statistics</h2>
            <div className="flex items-center gap-2">
              <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                <option>Last 6 Months</option>
                <option>Last 12 Months</option>
                <option>Year to Date</option>
                <option>2023</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                <PrinterIcon className="w-5 h-5" />
                Export Report
              </button>
            </div>
          </div>

          {/* Safety Performance Rates */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">LTIFR</p>
              <div className="flex items-end gap-2">
                <p className={`text-3xl font-bold ${INCIDENT_ANALYTICS.safetyRates.ltifr > INCIDENT_ANALYTICS.safetyRates.ltifrTarget ? 'text-red-400' : 'text-green-400'}`}>
                  {INCIDENT_ANALYTICS.safetyRates.ltifr}
                </p>
                <p className="text-sm text-gray-500 mb-1">Target: {INCIDENT_ANALYTICS.safetyRates.ltifrTarget}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Lost Time Injury Frequency Rate</p>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">TRIFR</p>
              <div className="flex items-end gap-2">
                <p className={`text-3xl font-bold ${INCIDENT_ANALYTICS.safetyRates.trifr > INCIDENT_ANALYTICS.safetyRates.trifrTarget ? 'text-red-400' : 'text-green-400'}`}>
                  {INCIDENT_ANALYTICS.safetyRates.trifr}
                </p>
                <p className="text-sm text-gray-500 mb-1">Target: {INCIDENT_ANALYTICS.safetyRates.trifrTarget}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Total Recordable Injury Frequency Rate</p>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">Near Miss Ratio</p>
              <p className="text-3xl font-bold text-blue-400">{INCIDENT_ANALYTICS.safetyRates.nearMissRatio}:1</p>
              <p className="text-xs text-gray-500 mt-1">Near misses per recordable injury</p>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">Fatality Reduction</p>
              <p className="text-3xl font-bold text-green-400">
                {Math.round(((INCIDENT_ANALYTICS.safetyRates.fatalities2023 - INCIDENT_ANALYTICS.safetyRates.fatalities2024) / INCIDENT_ANALYTICS.safetyRates.fatalities2023) * 100)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">vs. Previous Year ({INCIDENT_ANALYTICS.safetyRates.fatalities2023} → {INCIDENT_ANALYTICS.safetyRates.fatalities2024})</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Incident Trend (6 Months)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={INCIDENT_ANALYTICS.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Legend />
                  <Area type="monotone" dataKey="nearMiss" stackId="1" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.3} name="Near Miss" />
                  <Area type="monotone" dataKey="fai" stackId="2" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="FAI" />
                  <Area type="monotone" dataKey="mti" stackId="3" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} name="MTI" />
                  <Area type="monotone" dataKey="lti" stackId="4" stroke="#F97316" fill="#F97316" fillOpacity={0.3} name="LTI" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Incidents by Root Cause</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={INCIDENT_ANALYTICS.byRootCause} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count" label={({ cause, percentage }) => `${cause}: ${percentage}%`}>
                    <Cell fill="#A855F7" />
                    <Cell fill="#3B82F6" />
                    <Cell fill="#22C55E" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 bg-purple-500 rounded"></span>Human</span>
                <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 bg-blue-500 rounded"></span>Equipment</span>
                <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 bg-green-500 rounded"></span>Environmental</span>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Incidents by Location</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={INCIDENT_ANALYTICS.byLocation} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="location" type="category" stroke="#9CA3AF" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Bar dataKey="incidents" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Incidents by Occupation</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={INCIDENT_ANALYTICS.byOccupation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="occupation" stroke="#9CA3AF" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                  <Bar dataKey="incidents" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Shift Analysis */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Incidents by Shift</h3>
            <div className="grid grid-cols-3 gap-4">
              {INCIDENT_ANALYTICS.byShift.map((shift) => (
                <div key={shift.shift} className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-white font-medium">{shift.shift}</p>
                  <div className="flex items-end gap-3 mt-2">
                    <p className="text-3xl font-bold text-blue-400">{shift.incidents}</p>
                    <p className="text-gray-500 mb-1">({shift.percentage}%)</p>
                  </div>
                  <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${shift.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Risk Locations */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">High Risk Locations</h3>
            <div className="grid grid-cols-6 gap-3">
              {INCIDENT_ANALYTICS.byLocation.map((loc) => (
                <div key={loc.location} className={`p-4 rounded-lg text-center ${loc.severity === 'high' ? 'bg-red-500/20 border border-red-500/50' : loc.severity === 'medium' ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-green-500/20 border border-green-500/50'}`}>
                  <p className="text-white font-medium text-sm">{loc.location}</p>
                  <p className={`text-2xl font-bold mt-1 ${loc.severity === 'high' ? 'text-red-400' : loc.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>{loc.incidents}</p>
                  <p className="text-xs text-gray-400">incidents</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">AI-Powered Safety Monitoring</h2>
            <div className="flex items-center gap-3">
              <select value={monitoringFilter} onChange={(e) => setMonitoringFilter(e.target.value)} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                <option value="all">All Alerts</option>
                <option value="proximity">Heavy Machinery</option>
                <option value="conveyor">Conveyor Belt</option>
                <option value="dust_smoke">Dust/Smoke</option>
                <option value="zone_access">Zone Access</option>
                <option value="fatigue">Fatigue/Distraction</option>
              </select>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">{filteredAlerts.filter(a => !a.acknowledged).length} Active</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-5 gap-3">
            <div className={`bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 cursor-pointer hover:bg-orange-500/20 transition-colors ${monitoringFilter === 'proximity' ? 'ring-2 ring-orange-500' : ''}`} onClick={() => setMonitoringFilter('proximity')}>
              <div className="flex items-center gap-2 mb-2">
                <TruckIcon className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-gray-400">Heavy Machinery</span>
              </div>
              <p className="text-2xl font-bold text-orange-400">{AI_MONITORING_ALERTS.filter(a => a.type === 'proximity').length}</p>
              <p className="text-xs text-gray-500">{AI_MONITORING_ALERTS.filter(a => a.type === 'proximity' && !a.acknowledged).length} active</p>
            </div>
            <div className={`bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 cursor-pointer hover:bg-blue-500/20 transition-colors ${monitoringFilter === 'conveyor' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setMonitoringFilter('conveyor')}>
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">Conveyor Belt</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{AI_MONITORING_ALERTS.filter(a => a.type === 'conveyor').length}</p>
              <p className="text-xs text-gray-500">{AI_MONITORING_ALERTS.filter(a => a.type === 'conveyor' && !a.acknowledged).length} active</p>
            </div>
            <div className={`bg-gray-500/10 border border-gray-500/30 rounded-lg p-4 cursor-pointer hover:bg-gray-500/20 transition-colors ${monitoringFilter === 'dust_smoke' ? 'ring-2 ring-gray-500' : ''}`} onClick={() => setMonitoringFilter('dust_smoke')}>
              <div className="flex items-center gap-2 mb-2">
                <CloudIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">Dust/Smoke</span>
              </div>
              <p className="text-2xl font-bold text-gray-400">{AI_MONITORING_ALERTS.filter(a => a.type === 'dust_smoke').length}</p>
              <p className="text-xs text-gray-500">{AI_MONITORING_ALERTS.filter(a => a.type === 'dust_smoke' && !a.acknowledged).length} active</p>
            </div>
            <div className={`bg-red-500/10 border border-red-500/30 rounded-lg p-4 cursor-pointer hover:bg-red-500/20 transition-colors ${monitoringFilter === 'zone_access' ? 'ring-2 ring-red-500' : ''}`} onClick={() => setMonitoringFilter('zone_access')}>
              <div className="flex items-center gap-2 mb-2">
                <MapPinIcon className="w-5 h-5 text-red-400" />
                <span className="text-sm text-gray-400">Zone Access</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{AI_MONITORING_ALERTS.filter(a => a.type === 'zone_access').length}</p>
              <p className="text-xs text-gray-500">{AI_MONITORING_ALERTS.filter(a => a.type === 'zone_access' && !a.acknowledged).length} active</p>
            </div>
            <div className={`bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 cursor-pointer hover:bg-purple-500/20 transition-colors ${monitoringFilter === 'fatigue' ? 'ring-2 ring-purple-500' : ''}`} onClick={() => setMonitoringFilter('fatigue')}>
              <div className="flex items-center gap-2 mb-2">
                <EyeIcon className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-400">Fatigue</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">{AI_MONITORING_ALERTS.filter(a => a.type === 'fatigue').length}</p>
              <p className="text-xs text-gray-500">{AI_MONITORING_ALERTS.filter(a => a.type === 'fatigue' && !a.acknowledged).length} active</p>
            </div>
          </div>

          {/* Alert Cards */}
          <div className="grid grid-cols-2 gap-4">
            {filteredAlerts.map((alert) => (
              <motion.div key={alert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-gray-800 rounded-xl border overflow-hidden cursor-pointer hover:border-gray-600 transition-colors ${
                  alert.severity === 'critical' ? 'border-red-500/50' : 'border-gray-700'
                }`}
                onClick={() => setSelectedAlert(alert)}>
                <div className="relative">
                  <img src={alert.thumbnail} alt={alert.title} className="w-full h-48 object-cover" />
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${getMonitoringTypeColor(alert.type)} text-white`}>
                      {getMonitoringTypeLabel(alert.type)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'} text-white`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  {alert.mediaType === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <PlayIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2">
                    <span className="px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                      <VideoCameraIcon className="w-3 h-3" /> {alert.camera}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium">{alert.title}</h3>
                    {!alert.acknowledged && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  </div>
                  <p className="text-gray-400 text-sm">{alert.message}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPinIcon className="w-4 h-4" /> {alert.zone}
                    </div>
                    <span className="text-xs text-gray-500">{alert.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Forensics Tab */}
      {activeTab === 'forensics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Forensic Investigation Reports</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <DocumentMagnifyingGlassIcon className="w-5 h-5" /> New Investigation
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <p className="text-xs text-gray-500 uppercase">Total Investigations</p>
              <p className="text-2xl font-bold text-white">{FORENSIC_REPORTS.length}</p>
            </div>
            <div className="bg-green-500/10 rounded-lg border border-green-500/30 p-4">
              <p className="text-xs text-green-400 uppercase">Completed</p>
              <p className="text-2xl font-bold text-green-400">{FORENSIC_REPORTS.filter(r => r.status === 'completed').length}</p>
            </div>
            <div className="bg-yellow-500/10 rounded-lg border border-yellow-500/30 p-4">
              <p className="text-xs text-yellow-400 uppercase">In Progress</p>
              <p className="text-2xl font-bold text-yellow-400">{FORENSIC_REPORTS.filter(r => r.status === 'in_progress').length}</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg border border-blue-500/30 p-4">
              <p className="text-xs text-blue-400 uppercase">Total Evidence</p>
              <p className="text-2xl font-bold text-blue-400">{FORENSIC_REPORTS.reduce((sum, r) => sum + r.evidenceCount, 0)}</p>
            </div>
          </div>

          {/* Forensic Reports Grid */}
          <div className="space-y-4">
            {FORENSIC_REPORTS.map((report) => (
              <motion.div key={report.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-mono text-sm bg-gray-700 px-2 py-1 rounded">{report.id}</span>
                        <span className="text-gray-500">→</span>
                        <span className="text-primary-400 font-mono text-sm">{report.incidentId}</span>
                        <span className={`px-2 py-1 rounded text-xs ${report.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {report.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">{report.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">Investigator: {report.investigator} • {report.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-center px-3 py-2 bg-gray-700 rounded-lg">
                        <VideoCameraIcon className="w-5 h-5 text-blue-400 mx-auto" />
                        <p className="text-white font-bold">{report.videoClips}</p>
                        <p className="text-xs text-gray-500">clips</p>
                      </div>
                      <div className="text-center px-3 py-2 bg-gray-700 rounded-lg">
                        <PhotoIcon className="w-5 h-5 text-green-400 mx-auto" />
                        <p className="text-white font-bold">{report.photos}</p>
                        <p className="text-xs text-gray-500">photos</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-900 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Key Findings</h4>
                      <p className="text-white">{report.findings}</p>
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${report.rootCause === 'human' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          Root Cause: {report.rootCause}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Contributing Factors</h4>
                      <ul className="space-y-1">
                        {report.contributingFactors.map((factor, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {report.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" /> {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-700">
                    <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm">
                      <PrinterIcon className="w-4 h-4" /> Export PDF
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                      <EyeIcon className="w-4 h-4" /> View Full Report
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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

      {/* Incident Detail Modal with Video/Image */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setSelectedIncident(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
            className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              {/* Media Display */}
              <div className="relative bg-black aspect-video">
                {selectedIncident.mediaType === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img src={selectedIncident.thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <button className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center hover:bg-primary-700 transition-colors">
                        <PlayIcon className="w-10 h-10 text-white" />
                      </button>
                    </div>
                    <span className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white text-sm rounded">13 sec clip</span>
                  </div>
                ) : (
                  <img src={selectedIncident.thumbnail} alt="Incident" className="w-full h-full object-cover" />
                )}
              </div>
              {/* Close Button */}
              <button onClick={() => setSelectedIncident(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70">
                <XMarkIcon className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white font-mono bg-gray-700 px-2 py-1 rounded">{selectedIncident.id}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getIncidentTypeColor(selectedIncident.incidentType)} text-white`}>
                      {getIncidentTypeLabel(selectedIncident.incidentType)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${selectedIncident.status === 'acknowledged' ? 'bg-green-500/20 text-green-400' : selectedIncident.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {selectedIncident.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">{selectedIncident.mineName}</h2>
                  <p className="text-gray-400">{selectedIncident.shaftSection}</p>
                </div>
                <div className="text-right">
                  <p className="text-white">{new Date(selectedIncident.dateTime).toLocaleDateString()}</p>
                  <p className="text-gray-500 text-sm">{new Date(selectedIncident.dateTime).toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Immediate Cause</h4>
                  <p className="text-white">{selectedIncident.immediateCause}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Root Cause</h4>
                  <span className={`px-3 py-1 rounded text-sm ${selectedIncident.rootCause === 'human' ? 'bg-purple-500/20 text-purple-400' : selectedIncident.rootCause === 'equipment' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                    {selectedIncident.rootCause.charAt(0).toUpperCase() + selectedIncident.rootCause.slice(1)}
                  </span>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Corrective Actions</h4>
                <p className="text-white">{selectedIncident.correctiveActions}</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">Occupation: <span className="text-white">{selectedIncident.occupation}</span></span>
                  <span className="text-sm text-gray-500">PPE Worn: {selectedIncident.ppeWorn ? <CheckCircleIcon className="w-5 h-5 text-green-400 inline" /> : <XCircleIcon className="w-5 h-5 text-red-400 inline" />}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm">
                    <PrinterIcon className="w-4 h-4" /> Export
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
                    <DocumentMagnifyingGlassIcon className="w-4 h-4" /> Open Forensic Report
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Monitoring Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setSelectedAlert(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
            className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              {/* Media Display */}
              <div className="relative bg-black aspect-video">
                {selectedAlert.mediaType === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img src={selectedAlert.thumbnail} alt="Alert thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <button className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors">
                        <PlayIcon className="w-10 h-10 text-white" />
                      </button>
                    </div>
                    <span className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white text-sm rounded">Live Recording</span>
                  </div>
                ) : (
                  <img src={selectedAlert.thumbnail} alt="Alert" className="w-full h-full object-cover" />
                )}
              </div>
              {/* Close Button */}
              <button onClick={() => setSelectedAlert(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70">
                <XMarkIcon className="w-6 h-6 text-white" />
              </button>
              {/* Severity Badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded text-sm font-bold ${selectedAlert.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'} text-white`}>
                  {selectedAlert.severity.toUpperCase()} ALERT
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white font-mono bg-gray-700 px-2 py-1 rounded">{selectedAlert.id}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getMonitoringTypeColor(selectedAlert.type)} text-white`}>
                      {getMonitoringTypeLabel(selectedAlert.type)}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">{selectedAlert.title}</h2>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">{selectedAlert.time}</p>
                  <p className="text-gray-500 text-xs">Camera: {selectedAlert.camera}</p>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Alert Details</h4>
                <p className="text-white text-lg">{selectedAlert.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Location</h4>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-primary-400" />
                    <span className="text-white">{selectedAlert.zone}</span>
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Status</h4>
                  <span className={`px-3 py-1 rounded ${selectedAlert.acknowledged ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {selectedAlert.acknowledged ? 'Acknowledged' : 'Requires Action'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                  <PrinterIcon className="w-4 h-4" /> Export Report
                </button>
                <div className="flex items-center gap-2">
                  {!selectedAlert.acknowledged && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <CheckCircleIcon className="w-5 h-5" /> Acknowledge Alert
                    </button>
                  )}
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    <ExclamationTriangleIcon className="w-5 h-5" /> Create Incident
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
