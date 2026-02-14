import { type SolutionId } from '../solutions/registry'

export type DemoSite = { id: string; name: string }
export type DemoZone = { id: string; name: string; zone_type: string; site_id: string }
export type DemoCamera = {
  id: string
  name: string
  site_id: string
  zone_id: string
  status: 'online' | 'offline' | 'warning'
  fps: number
  latency_ms: number
  ai_enabled: boolean
  rules_enabled: boolean
  last_seen_at: string
}

export type DemoEvidence = {
  id: string
  media_type: 'image' | 'video'
  created_at: string
  thumbnail_url: string
  download_blurred_url: string
  download_original_url: string
}

export type DemoViolation = {
  id: string
  sector_id: SolutionId
  organization_id: string
  site_id: string
  zone_id: string
  camera_id: string
  rule_id: string
  rule_name: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved'
  detected_at: string
  ai_confidence: number
  model_version: string
  acknowledged: boolean
  acknowledged_by?: string | null
  assigned_to?: string | null
  is_false_positive: boolean
  comment_count: number
  comments: Array<{ id: string; user_name: string; content: string; created_at: string }>
  evidence: DemoEvidence[]
}

export type DemoAnalyticsSummary = {
  sector_id: SolutionId
  days: number
  violations: {
    total: number
    by_severity: Record<string, number>
    by_status: Record<string, number>
    top_rules: Array<{ rule_name: string; count: number }>
  }
  cameras: { total: number; online: number; offline: number; warning: number }
}

export type DemoAnalyticsTrend = {
  sector_id: SolutionId
  days: number
  items: Array<{ date: string; count: number }>
}

export type DemoModel = {
  id: string
  name: string
  kind: string
  enabled: boolean
  version: string
  settings: Record<string, any>
}

export type SectorDemo = {
  sector_id: SolutionId
  label: string
  accent: string
  sites: DemoSite[]
  zones: DemoZone[]
  cameras: DemoCamera[]
  models: DemoModel[]
  buildViolations: (total?: number) => DemoViolation[]
  buildAnalyticsSummary: (days?: number) => DemoAnalyticsSummary
  buildAnalyticsTrend: (days?: number) => DemoAnalyticsTrend
}

type RuleTemplate = {
  id: string
  name: string
  severity: DemoViolation['severity']
  accent: string
  model_version: string
}

type SectorCfg = {
  label: string
  accent: string
  sites: string[]
  zones: Array<{ site_idx: number; zone_type: string; name: string }>
  rules: RuleTemplate[]
  models: DemoModel[]
  fleet: { total: number; online: number; offline: number; warning: number }
}

function isoNowMinusMinutes(mins: number) {
  return new Date(Date.now() - mins * 60 * 1000).toISOString()
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function svgDataUri(title: string, sub: string, accent: string, sectorLabel: string) {
  const safeTitle = escapeXml(title)
  const safeSub = escapeXml(sub)
  const safeSector = escapeXml(sectorLabel)

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1220"/>
      <stop offset="1" stop-color="#111827"/>
    </linearGradient>
  </defs>
  <rect width="960" height="540" fill="url(#g)"/>
  <rect x="0" y="0" width="960" height="56" fill="#000000" opacity="0.45"/>
  <circle cx="36" cy="28" r="10" fill="${accent}"/>
  <text x="56" y="34" font-family="ui-sans-serif, system-ui" font-size="18" fill="#e5e7eb">IsoGuard.AI • ${safeSector} • Demo Evidence</text>
  <text x="40" y="150" font-family="ui-sans-serif, system-ui" font-size="34" font-weight="700" fill="#f9fafb">${safeTitle}</text>
  <text x="40" y="190" font-family="ui-sans-serif, system-ui" font-size="18" fill="#d1d5db">${safeSub}</text>
  <rect x="120" y="260" width="260" height="180" fill="none" stroke="#ef4444" stroke-width="6"/>
  <rect x="430" y="280" width="280" height="200" fill="none" stroke="#f59e0b" stroke-width="6"/>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const VIDEO_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

function siteId(sector: SolutionId, idx1: number) {
  return `${sector}-site-${String(idx1).padStart(3, '0')}`
}

function zoneId(site_id: string, idx1: number) {
  return `${site_id}-zone-${String(idx1).padStart(3, '0')}`
}

function cameraId(sector: SolutionId, idx1: number) {
  return `${sector}-cam-${String(idx1).padStart(5, '0')}`
}

const SECTOR_CFG: Record<SolutionId, SectorCfg> = {
  agriculture: {
    label: 'Agriculture',
    accent: '#22c55e',
    sites: ['Green Valley Farm', 'North Field Estate', 'Silo & Storage Yard'],
    zones: [
      { site_idx: 0, zone_type: 'livestock', name: 'Livestock Area' },
      { site_idx: 0, zone_type: 'restricted', name: 'Chemical Storage' },
      { site_idx: 1, zone_type: 'active_field', name: 'Active Field Zone' },
      { site_idx: 1, zone_type: 'machinery', name: 'Machinery Operating Zone' },
      { site_idx: 2, zone_type: 'silo', name: 'Silo Zone' },
      { site_idx: 2, zone_type: 'traffic', name: 'Loading / Traffic Lane' },
    ],
    rules: [
      { id: 'agri-rule-ppe-boots', name: 'Worker without safety boots', severity: 'high', accent: '#22c55e', model_version: 'agri-ppe:v2026.02' },
      { id: 'agri-rule-ppe-gloves', name: 'Worker without gloves', severity: 'medium', accent: '#22c55e', model_version: 'agri-ppe:v2026.02' },
      { id: 'agri-rule-chem-entry', name: 'Unauthorized entry: chemical storage', severity: 'critical', accent: '#84cc16', model_version: 'agri-access:v2026.01' },
      { id: 'agri-rule-tractor-prox', name: 'Tractor proximity to human < 4m', severity: 'critical', accent: '#84cc16', model_version: 'agri-proximity:v2026.02' },
      { id: 'agri-rule-fall', name: 'Worker fall / immobility detected', severity: 'high', accent: '#a3e635', model_version: 'agri-fall:v2026.01' },
      { id: 'agri-rule-livestock', name: 'Aggressive animal behavior detected', severity: 'medium', accent: '#a3e635', model_version: 'agri-animal:v2026.01' },
    ],
    models: [
      { id: 'agri-ppe', name: 'Agriculture PPE Detector', kind: 'yolo', enabled: true, version: '2026.02', settings: { confidence_threshold: 0.7, outdoor_mode: true } },
      { id: 'agri-proximity', name: 'Human–Machinery Proximity', kind: 'tracker', enabled: true, version: '2026.02', settings: { min_distance_meters: 4.0, speed_sensitive: true } },
      { id: 'agri-fall', name: 'Fall / Collapse (Outdoor)', kind: 'classifier', enabled: true, version: '2026.01', settings: { min_duration_seconds: 2.0 } },
    ],
    fleet: { total: 120, online: 97, offline: 12, warning: 11 },
  },

  health: {
    label: 'Healthcare',
    accent: '#ef4444',
    sites: ['General Hospital', 'Outpatient Clinic', 'Pharmacy & Lab'],
    zones: [
      { site_idx: 0, zone_type: 'er', name: 'Emergency Department' },
      { site_idx: 0, zone_type: 'icu', name: 'ICU' },
      { site_idx: 0, zone_type: 'or', name: 'Operating Theater Corridor' },
      { site_idx: 1, zone_type: 'ward', name: 'Ward A' },
      { site_idx: 2, zone_type: 'lab', name: 'Laboratory' },
      { site_idx: 2, zone_type: 'restricted', name: 'Medication Storage' },
    ],
    rules: [
      { id: 'hlth-rule-hand-hyg', name: 'Hand hygiene non-compliance (entry/exit)', severity: 'medium', accent: '#ef4444', model_version: 'hlth-hygiene:v2026.01' },
      { id: 'hlth-rule-fall', name: 'Patient fall detected', severity: 'high', accent: '#f97316', model_version: 'hlth-fall:v2026.02' },
      { id: 'hlth-rule-restricted', name: 'Unauthorized access: medication storage', severity: 'critical', accent: '#dc2626', model_version: 'hlth-access:v2026.01' },
      { id: 'hlth-rule-violence', name: 'Aggressive behavior / violence risk', severity: 'high', accent: '#f97316', model_version: 'hlth-behavior:v2026.02' },
      { id: 'hlth-rule-ppe', name: 'PPE missing in isolation zone', severity: 'high', accent: '#dc2626', model_version: 'hlth-ppe:v2026.01' },
      { id: 'hlth-rule-spill', name: 'Biohazard spill risk area intrusion', severity: 'medium', accent: '#ef4444', model_version: 'hlth-spill:v2026.01' },
    ],
    models: [
      { id: 'hlth-fall', name: 'Fall / Collapse (Clinical)', kind: 'classifier', enabled: true, version: '2026.02', settings: { sensitivity: 'high', min_duration_seconds: 1.5 } },
      { id: 'hlth-access', name: 'Restricted Access', kind: 'rule', enabled: true, version: '2026.01', settings: { badge_required: true } },
      { id: 'hlth-hygiene', name: 'Hand Hygiene Compliance', kind: 'vision', enabled: true, version: '2026.01', settings: { entry_exit_events: true } },
    ],
    fleet: { total: 260, online: 239, offline: 8, warning: 13 },
  },

  construction: {
    label: 'Construction',
    accent: '#f97316',
    sites: ['Tower Build Site', 'Roadworks Zone', 'Materials & Yard'],
    zones: [
      { site_idx: 0, zone_type: 'scaffold', name: 'Scaffolding Area' },
      { site_idx: 0, zone_type: 'crane', name: 'Crane Swing Radius' },
      { site_idx: 0, zone_type: 'exclusion', name: 'Exclusion Zone' },
      { site_idx: 1, zone_type: 'traffic', name: 'Traffic Management' },
      { site_idx: 2, zone_type: 'storage', name: 'Material Storage' },
      { site_idx: 2, zone_type: 'trench', name: 'Excavation / Trench' },
    ],
    rules: [
      { id: 'cstr-rule-fall', name: 'Fall from height risk (no harness)', severity: 'critical', accent: '#f97316', model_version: 'cstr-ppe:v2026.02' },
      { id: 'cstr-rule-helmet', name: 'Worker without hard hat', severity: 'high', accent: '#fb923c', model_version: 'cstr-ppe:v2026.02' },
      { id: 'cstr-rule-vest', name: 'Worker without high-vis vest', severity: 'medium', accent: '#fb923c', model_version: 'cstr-ppe:v2026.02' },
      { id: 'cstr-rule-exclusion', name: 'Person detected in exclusion zone', severity: 'critical', accent: '#ea580c', model_version: 'cstr-zones:v2026.01' },
      { id: 'cstr-rule-crane', name: 'Crane load path intrusion', severity: 'high', accent: '#f97316', model_version: 'cstr-zones:v2026.01' },
      { id: 'cstr-rule-trench', name: 'Trench collapse risk / unsafe entry', severity: 'critical', accent: '#ea580c', model_version: 'cstr-hazard:v2026.01' },
    ],
    models: [
      { id: 'cstr-ppe', name: 'Construction PPE', kind: 'yolo', enabled: true, version: '2026.02', settings: { helmet: true, vest: true, harness: true } },
      { id: 'cstr-zones', name: 'Exclusion Zones', kind: 'segmentation', enabled: true, version: '2026.01', settings: { buffer_meters: 1.5 } },
      { id: 'cstr-hazard', name: 'Hazard State', kind: 'classifier', enabled: true, version: '2026.01', settings: { trench_depth_threshold_m: 1.2 } },
    ],
    fleet: { total: 340, online: 312, offline: 11, warning: 17 },
  },

  warehouse: {
    label: 'Warehousing',
    accent: '#a855f7',
    sites: ['Distribution Center A', 'Cold Storage', 'Shipping & Receiving'],
    zones: [
      { site_idx: 0, zone_type: 'aisle', name: 'High Traffic Aisle' },
      { site_idx: 0, zone_type: 'racking', name: 'Racking Area' },
      { site_idx: 2, zone_type: 'receiving', name: 'Receiving Dock' },
      { site_idx: 2, zone_type: 'shipping', name: 'Shipping Dock' },
      { site_idx: 1, zone_type: 'cold', name: 'Cold Storage' },
      { site_idx: 0, zone_type: 'packing', name: 'Packing Area' },
    ],
    rules: [
      { id: 'wh-rule-forklift', name: 'Forklift proximity to pedestrian < 3m', severity: 'critical', accent: '#a855f7', model_version: 'wh-proximity:v2026.02' },
      { id: 'wh-rule-speed', name: 'Forklift overspeed in aisle', severity: 'high', accent: '#c084fc', model_version: 'wh-speed:v2026.01' },
      { id: 'wh-rule-obstruction', name: 'Aisle obstruction / spill detected', severity: 'medium', accent: '#c084fc', model_version: 'wh-spill:v2026.01' },
      { id: 'wh-rule-ppe', name: 'Worker without safety shoes', severity: 'medium', accent: '#a855f7', model_version: 'wh-ppe:v2026.02' },
      { id: 'wh-rule-racking', name: 'Unsafe activity near racking', severity: 'high', accent: '#a855f7', model_version: 'wh-hazard:v2026.01' },
      { id: 'wh-rule-dock', name: 'Dock door safety non-compliance', severity: 'high', accent: '#7c3aed', model_version: 'wh-dock:v2026.01' },
    ],
    models: [
      { id: 'wh-proximity', name: 'Forklift Proximity', kind: 'tracker', enabled: true, version: '2026.02', settings: { min_distance_meters: 3.0 } },
      { id: 'wh-speed', name: 'Vehicle Speed Estimation', kind: 'vision', enabled: true, version: '2026.01', settings: { speed_limit_kph: 8 } },
      { id: 'wh-spill', name: 'Spill / Obstruction', kind: 'segmentation', enabled: true, version: '2026.01', settings: { detect_liquid: true } },
    ],
    fleet: { total: 410, online: 389, offline: 7, warning: 14 },
  },

  manufacturing: {
    label: 'Manufacturing',
    accent: '#60a5fa',
    sites: ['Plant 1', 'Welding & Fabrication', 'Warehouse & Loading'],
    zones: [
      { site_idx: 0, zone_type: 'assembly', name: 'Assembly Line 1' },
      { site_idx: 0, zone_type: 'assembly', name: 'Assembly Line 2' },
      { site_idx: 1, zone_type: 'welding', name: 'Welding Bay' },
      { site_idx: 1, zone_type: 'paint', name: 'Paint Shop' },
      { site_idx: 2, zone_type: 'warehouse', name: 'Warehouse' },
      { site_idx: 2, zone_type: 'dock', name: 'Loading Dock' },
    ],
    rules: [
      { id: 'mfg-rule-loto', name: 'LOTO violation detected', severity: 'critical', accent: '#60a5fa', model_version: 'mfg-loto:v2026.01' },
      { id: 'mfg-rule-guard', name: 'Machine guarding removed / unsafe', severity: 'critical', accent: '#3b82f6', model_version: 'mfg-guard:v2026.02' },
      { id: 'mfg-rule-forklift', name: 'Forklift/pedestrian proximity < 3m', severity: 'high', accent: '#60a5fa', model_version: 'mfg-proximity:v2026.02' },
      { id: 'mfg-rule-chem', name: 'Chemical spill risk area intrusion', severity: 'high', accent: '#3b82f6', model_version: 'mfg-spill:v2026.01' },
      { id: 'mfg-rule-ppe', name: 'Eye/ear PPE missing in welding bay', severity: 'high', accent: '#60a5fa', model_version: 'mfg-ppe:v2026.02' },
      { id: 'mfg-rule-ergonomic', name: 'Ergonomic risk posture detected', severity: 'medium', accent: '#93c5fd', model_version: 'mfg-ergonomic:v2026.01' },
    ],
    models: [
      { id: 'mfg-loto', name: 'LOTO Compliance', kind: 'rule', enabled: true, version: '2026.01', settings: { tag_required: true } },
      { id: 'mfg-ppe', name: 'Manufacturing PPE', kind: 'yolo', enabled: true, version: '2026.02', settings: { eye_protection: true, hearing_protection: true } },
      { id: 'mfg-guard', name: 'Machine Guarding', kind: 'classifier', enabled: true, version: '2026.02', settings: { detect_open_guard: true } },
    ],
    fleet: { total: 280, online: 262, offline: 6, warning: 12 },
  },

  smart_city: {
    label: 'Smart City',
    accent: '#38bdf8',
    sites: ['Downtown', 'Transport Hub', 'Stadium District'],
    zones: [
      { site_idx: 0, zone_type: 'public_square', name: 'Central Plaza' },
      { site_idx: 0, zone_type: 'intersection', name: 'Main Intersection' },
      { site_idx: 1, zone_type: 'station', name: 'Transit Station' },
      { site_idx: 1, zone_type: 'parking', name: 'Public Parking' },
      { site_idx: 2, zone_type: 'event', name: 'Event Entry Gates' },
      { site_idx: 2, zone_type: 'perimeter', name: 'Perimeter Walkway' },
    ],
    rules: [
      { id: 'city-rule-crowd', name: 'Crowd surge / gathering threshold exceeded', severity: 'high', accent: '#38bdf8', model_version: 'city-crowd:v2026.02' },
      { id: 'city-rule-disorder', name: 'Public disorder / fight risk', severity: 'critical', accent: '#0ea5e9', model_version: 'city-behavior:v2026.01' },
      { id: 'city-rule-traffic', name: 'Traffic anomaly (stopped vehicle / wrong-way)', severity: 'medium', accent: '#38bdf8', model_version: 'city-traffic:v2026.02' },
      { id: 'city-rule-tamper', name: 'Camera tampering detected', severity: 'high', accent: '#0ea5e9', model_version: 'city-tamper:v2026.01' },
      { id: 'city-rule-perimeter', name: 'Restricted area entry detected', severity: 'high', accent: '#38bdf8', model_version: 'city-access:v2026.01' },
      { id: 'city-rule-hazard', name: 'Road hazard / debris detected', severity: 'medium', accent: '#7dd3fc', model_version: 'city-hazard:v2026.01' },
    ],
    models: [
      { id: 'city-crowd', name: 'Crowd Density', kind: 'vision', enabled: true, version: '2026.02', settings: { density_threshold: 0.78 } },
      { id: 'city-traffic', name: 'Traffic Analytics', kind: 'tracker', enabled: true, version: '2026.02', settings: { wrong_way: true, stopped_vehicle_seconds: 20 } },
      { id: 'city-tamper', name: 'Camera Tamper', kind: 'classifier', enabled: true, version: '2026.01', settings: { occlusion_seconds: 4 } },
    ],
    fleet: { total: 900, online: 871, offline: 9, warning: 20 },
  },

  border: {
    label: 'Border Control',
    accent: '#34d399',
    sites: ['Checkpoint Alpha', 'Cargo Screening', 'Perimeter Sector 7'],
    zones: [
      { site_idx: 0, zone_type: 'checkpoint', name: 'Primary Inspection Lane' },
      { site_idx: 0, zone_type: 'secondary', name: 'Secondary Inspection' },
      { site_idx: 1, zone_type: 'cargo', name: 'Cargo X-Ray Bay' },
      { site_idx: 1, zone_type: 'holding', name: 'Holding Area' },
      { site_idx: 2, zone_type: 'perimeter', name: 'Fence Line' },
      { site_idx: 2, zone_type: 'patrol', name: 'Patrol Road' },
    ],
    rules: [
      { id: 'brd-rule-breach', name: 'Perimeter breach / fence crossing detected', severity: 'critical', accent: '#34d399', model_version: 'brd-perimeter:v2026.02' },
      { id: 'brd-rule-tailgate', name: 'Vehicle tailgating at checkpoint', severity: 'high', accent: '#10b981', model_version: 'brd-traffic:v2026.01' },
      { id: 'brd-rule-contraband', name: 'Contraband detection event', severity: 'critical', accent: '#10b981', model_version: 'brd-contraband:v2026.02' },
      { id: 'brd-rule-doc', name: 'Document fraud risk (non-identifying)', severity: 'medium', accent: '#34d399', model_version: 'brd-doc:v2026.01' },
      { id: 'brd-rule-loiter', name: 'Loitering in restricted zone', severity: 'high', accent: '#10b981', model_version: 'brd-behavior:v2026.01' },
      { id: 'brd-rule-inspection', name: 'Unsafe behavior in inspection area', severity: 'medium', accent: '#6ee7b7', model_version: 'brd-safety:v2026.01' },
    ],
    models: [
      { id: 'brd-perimeter', name: 'Perimeter Intrusion', kind: 'vision', enabled: true, version: '2026.02', settings: { tripwire: true } },
      { id: 'brd-traffic', name: 'Traffic / Tailgating', kind: 'tracker', enabled: true, version: '2026.01', settings: { min_gap_meters: 2.0 } },
      { id: 'brd-contraband', name: 'Contraband Detector', kind: 'classifier', enabled: true, version: '2026.02', settings: { non_identifying: true } },
    ],
    fleet: { total: 520, online: 501, offline: 5, warning: 14 },
  },

  mining: {
    label: 'Mining',
    accent: '#f59e0b',
    sites: ['Open Pit North', 'Processing Plant', 'Workshop & Yard'],
    zones: [
      { site_idx: 0, zone_type: 'high_risk', name: 'High-Risk Zone (Pit Edge)' },
      { site_idx: 0, zone_type: 'haul_road', name: 'Haul Road' },
      { site_idx: 1, zone_type: 'crusher', name: 'Crusher Area' },
      { site_idx: 1, zone_type: 'conveyor', name: 'Conveyor Corridor' },
      { site_idx: 2, zone_type: 'workshop', name: 'Workshop' },
      { site_idx: 2, zone_type: 'storage', name: 'Explosives Storage (Restricted)' },
    ],
    rules: [
      { id: 'mine-rule-ppe', name: 'PPE missing in active work area', severity: 'high', accent: '#f59e0b', model_version: 'mine-ppe:v2026.02' },
      { id: 'mine-rule-prox', name: 'Vehicle/person proximity < 5m', severity: 'critical', accent: '#f59e0b', model_version: 'mine-proximity:v2026.02' },
      { id: 'mine-rule-exclusion', name: 'Unauthorized entry: exclusion zone', severity: 'critical', accent: '#fbbf24', model_version: 'mine-zones:v2026.01' },
      { id: 'mine-rule-fatigue', name: 'Fatigue risk posture detected', severity: 'medium', accent: '#fbbf24', model_version: 'mine-fatigue:v2026.01' },
      { id: 'mine-rule-spill', name: 'Spill / obstruction on haul road', severity: 'medium', accent: '#f59e0b', model_version: 'mine-hazard:v2026.01' },
      { id: 'mine-rule-damage', name: 'Equipment damage / smoke detected', severity: 'high', accent: '#f59e0b', model_version: 'mine-equipment:v2026.01' },
    ],
    models: [
      { id: 'mine-ppe', name: 'Mining PPE', kind: 'yolo', enabled: true, version: '2026.02', settings: { helmet: true, vest: true } },
      { id: 'mine-proximity', name: 'Proximity', kind: 'tracker', enabled: true, version: '2026.02', settings: { min_distance_meters: 5.0 } },
      { id: 'mine-zones', name: 'Exclusion Zones', kind: 'segmentation', enabled: true, version: '2026.01', settings: { buffer_meters: 2.0 } },
    ],
    fleet: { total: 680, online: 651, offline: 9, warning: 20 },
  },

  airport: {
    label: 'Airport',
    accent: '#22d3ee',
    sites: ['Terminal A', 'Apron & Ground Ops', 'Perimeter North'],
    zones: [
      { site_idx: 0, zone_type: 'terminal', name: 'Security Checkpoint' },
      { site_idx: 0, zone_type: 'queue', name: 'Queue Zone' },
      { site_idx: 1, zone_type: 'apron', name: 'Apron Active Area' },
      { site_idx: 1, zone_type: 'baggage', name: 'Baggage Handling' },
      { site_idx: 2, zone_type: 'perimeter', name: 'Perimeter Fence Line' },
      { site_idx: 2, zone_type: 'gate', name: 'Service Gate' },
    ],
    rules: [
      { id: 'air-rule-breach', name: 'Perimeter breach detected', severity: 'critical', accent: '#22d3ee', model_version: 'air-perimeter:v2026.02' },
      { id: 'air-rule-queue', name: 'Queue density threshold exceeded', severity: 'high', accent: '#67e8f9', model_version: 'air-queue:v2026.01' },
      { id: 'air-rule-baggage', name: 'Baggage handling unsafe behavior', severity: 'medium', accent: '#22d3ee', model_version: 'air-safety:v2026.01' },
      { id: 'air-rule-apron', name: 'Apron intrusion / FOD risk', severity: 'critical', accent: '#06b6d4', model_version: 'air-apron:v2026.02' },
      { id: 'air-rule-vehicle', name: 'Ground vehicle near aircraft unsafe', severity: 'high', accent: '#22d3ee', model_version: 'air-ground:v2026.01' },
      { id: 'air-rule-tamper', name: 'Camera tamper detected', severity: 'high', accent: '#06b6d4', model_version: 'air-tamper:v2026.01' },
    ],
    models: [
      { id: 'air-perimeter', name: 'Perimeter Intrusion', kind: 'vision', enabled: true, version: '2026.02', settings: { tripwire: true } },
      { id: 'air-queue', name: 'Queue Monitoring', kind: 'vision', enabled: true, version: '2026.01', settings: { density_threshold: 0.8 } },
      { id: 'air-apron', name: 'Apron Hazard', kind: 'classifier', enabled: true, version: '2026.02', settings: { fod: true } },
    ],
    fleet: { total: 740, online: 711, offline: 8, warning: 21 },
  },
}

function buildSectorDemo(sector: SolutionId): SectorDemo {
  const cfg = SECTOR_CFG[sector]

  const sites: DemoSite[] = cfg.sites.map((name, i) => ({ id: siteId(sector, i + 1), name }))

  const zones: DemoZone[] = cfg.zones.map((z, i) => {
    const s = sites[z.site_idx]
    return {
      id: zoneId(s.id, i + 1),
      name: z.name,
      zone_type: z.zone_type,
      site_id: s.id,
    }
  })

  const cameras: DemoCamera[] = zones.map((z, i) => {
    const siteIdx = cfg.zones[i]?.site_idx ?? 0
    const baseStatus: Array<DemoCamera['status']> = ['online', 'online', 'online', 'warning', 'online', 'offline']
    const st = baseStatus[i % baseStatus.length]

    return {
      id: cameraId(sector, i + 1),
      name: `${z.name} Cam`,
      site_id: sites[siteIdx].id,
      zone_id: z.id,
      status: st,
      fps: st === 'offline' ? 0 : 16 + (i % 7),
      latency_ms: st === 'offline' ? 0 : 58 + (i % 6) * 7,
      ai_enabled: st !== 'offline',
      rules_enabled: st !== 'offline',
      last_seen_at: isoNowMinusMinutes(st === 'offline' ? 70 : 2 + (i % 9)),
    }
  })

  const zonesById = Object.fromEntries(zones.map((z) => [z.id, z])) as Record<string, DemoZone>

  const buildViolations = (total = 48): DemoViolation[] => {
    const statuses: Array<DemoViolation['status']> = ['open', 'investigating', 'resolved']

    const out: DemoViolation[] = []
    for (let i = 0; i < total; i++) {
      const r = cfg.rules[i % cfg.rules.length]
      const cam = cameras[i % cameras.length]
      const zone = zonesById[cam.zone_id]
      const detectedAt = new Date(Date.now() - (i * 17 + 5) * 60 * 1000).toISOString()

      const st = statuses[(i + 1) % statuses.length]
      const isVideo = i % 5 === 0

      const evId = `demo-evd-${sector}-${String(i + 1).padStart(4, '0')}`
      const thumb = svgDataUri(r.name, `${cam.name} • ${zone?.name ?? cam.zone_id}`, r.accent, cfg.label)

      const evidence: DemoEvidence = {
        id: evId,
        media_type: isVideo ? 'video' : 'image',
        created_at: detectedAt,
        thumbnail_url: thumb,
        download_blurred_url: isVideo ? VIDEO_URL : thumb,
        download_original_url: isVideo ? VIDEO_URL : thumb,
      }

      out.push({
        id: `${sector.toUpperCase().slice(0, 4)}-DEMO-${String(i + 1).padStart(6, '0')}`,
        sector_id: sector,
        organization_id: 'org-001',
        site_id: cam.site_id,
        zone_id: cam.zone_id,
        camera_id: cam.id,
        rule_id: r.id,
        rule_name: r.name,
        severity: r.severity,
        status: st,
        detected_at: detectedAt,
        ai_confidence: Math.max(0.71, 0.93 - (i % 9) * 0.02),
        model_version: r.model_version,
        acknowledged: i % 3 === 0,
        acknowledged_by: i % 3 === 0 ? 'demo.admin@isoguard.ai' : null,
        assigned_to: i % 4 === 0 ? 'Supervisor' : null,
        is_false_positive: i % 17 === 0,
        comment_count: i % 4 === 0 ? 1 : 0,
        comments:
          i % 4 === 0
            ? [
                {
                  id: `cmt-${sector}-${i}`,
                  user_name: 'Safety Manager',
                  content: 'Reviewed in demo mode — awaiting backend integration.',
                  created_at: isoNowMinusMinutes(i * 10),
                },
              ]
            : [],
        evidence: [evidence],
      })
    }

    return out
  }

  const buildAnalyticsSummary = (days = 30): DemoAnalyticsSummary => {
    const items = buildViolations(Math.min(90, Math.max(40, Math.floor(days * 1.6))))

    const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 }
    const byStatus: Record<string, number> = { open: 0, investigating: 0, resolved: 0 }
    const byRule: Record<string, number> = {}

    for (const v of items) {
      bySeverity[v.severity] = (bySeverity[v.severity] || 0) + 1
      byStatus[v.status] = (byStatus[v.status] || 0) + 1
      byRule[v.rule_name] = (byRule[v.rule_name] || 0) + 1
    }

    const top_rules = Object.entries(byRule)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([rule_name, count]) => ({ rule_name, count }))

    return {
      sector_id: sector,
      days,
      violations: {
        total: items.length,
        by_severity: bySeverity,
        by_status: byStatus,
        top_rules,
      },
      cameras: cfg.fleet,
    }
  }

  const buildAnalyticsTrend = (days = 30): DemoAnalyticsTrend => {
    const items: Array<{ date: string; count: number }> = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const base = 2 + (d.getDay() % 3)
      const spike = (i % 9 === 0 ? 4 : 0) + (i % 13 === 0 ? 3 : 0)
      items.push({ date: d.toISOString().slice(0, 10), count: base + spike })
    }

    return { sector_id: sector, days, items }
  }

  return {
    sector_id: sector,
    label: cfg.label,
    accent: cfg.accent,
    sites,
    zones,
    cameras,
    models: cfg.models,
    buildViolations,
    buildAnalyticsSummary,
    buildAnalyticsTrend,
  }
}

const DEMO_CACHE: Partial<Record<SolutionId, SectorDemo>> = {}

export function getSectorDemo(sector: string | undefined | null): SectorDemo | null {
  const s = sector as SolutionId
  if (!s) return null
  if (!(s in SECTOR_CFG)) return null

  if (!DEMO_CACHE[s]) DEMO_CACHE[s] = buildSectorDemo(s)
  return DEMO_CACHE[s]!
}
