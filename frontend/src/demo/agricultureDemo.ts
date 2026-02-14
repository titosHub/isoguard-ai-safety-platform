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
  sector_id: 'agriculture'
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
  sector_id: 'agriculture'
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
  sector_id: 'agriculture'
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

function isoNowMinusMinutes(mins: number) {
  return new Date(Date.now() - mins * 60 * 1000).toISOString()
}

function svgDataUri(label: string, sub: string, accent: string) {
  const safeLabel = label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const safeSub = sub.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

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
  <text x="56" y="34" font-family="ui-sans-serif, system-ui" font-size="18" fill="#e5e7eb">IsoGuard.AI • Demo Evidence</text>
  <text x="40" y="150" font-family="ui-sans-serif, system-ui" font-size="34" font-weight="700" fill="#f9fafb">${safeLabel}</text>
  <text x="40" y="190" font-family="ui-sans-serif, system-ui" font-size="18" fill="#d1d5db">${safeSub}</text>
  <rect x="120" y="260" width="260" height="180" fill="none" stroke="#ef4444" stroke-width="6"/>
  <rect x="430" y="280" width="280" height="200" fill="none" stroke="#f59e0b" stroke-width="6"/>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const AGRI_DEMO_SITES: DemoSite[] = [
  { id: 'agriculture-site-001', name: 'Green Valley Farm' },
  { id: 'agriculture-site-002', name: 'North Field Estate' },
  { id: 'agriculture-site-003', name: 'Silo & Storage Yard' },
]

export const AGRI_DEMO_ZONES: DemoZone[] = [
  { id: 'agriculture-site-001-zone-001', site_id: 'agriculture-site-001', zone_type: 'livestock', name: 'Livestock Area' },
  { id: 'agriculture-site-001-zone-002', site_id: 'agriculture-site-001', zone_type: 'restricted', name: 'Chemical Storage' },
  { id: 'agriculture-site-002-zone-001', site_id: 'agriculture-site-002', zone_type: 'active_field', name: 'Active Field Zone' },
  { id: 'agriculture-site-002-zone-002', site_id: 'agriculture-site-002', zone_type: 'machinery', name: 'Machinery Operating Zone' },
  { id: 'agriculture-site-003-zone-001', site_id: 'agriculture-site-003', zone_type: 'silo', name: 'Silo Zone' },
  { id: 'agriculture-site-003-zone-002', site_id: 'agriculture-site-003', zone_type: 'traffic', name: 'Loading / Traffic Lane' },
]

export const AGRI_DEMO_CAMERAS: DemoCamera[] = [
  {
    id: 'agriculture-cam-00001',
    name: 'Barn Entrance Cam',
    site_id: 'agriculture-site-001',
    zone_id: 'agriculture-site-001-zone-001',
    status: 'online',
    fps: 19,
    latency_ms: 64,
    ai_enabled: true,
    rules_enabled: true,
    last_seen_at: isoNowMinusMinutes(2),
  },
  {
    id: 'agriculture-cam-00002',
    name: 'Chemical Store Cam',
    site_id: 'agriculture-site-001',
    zone_id: 'agriculture-site-001-zone-002',
    status: 'warning',
    fps: 14,
    latency_ms: 92,
    ai_enabled: true,
    rules_enabled: true,
    last_seen_at: isoNowMinusMinutes(7),
  },
  {
    id: 'agriculture-cam-00003',
    name: 'Field PTZ Cam',
    site_id: 'agriculture-site-002',
    zone_id: 'agriculture-site-002-zone-001',
    status: 'online',
    fps: 21,
    latency_ms: 58,
    ai_enabled: true,
    rules_enabled: true,
    last_seen_at: isoNowMinusMinutes(1),
  },
  {
    id: 'agriculture-cam-00004',
    name: 'Harvester Cam',
    site_id: 'agriculture-site-002',
    zone_id: 'agriculture-site-002-zone-002',
    status: 'offline',
    fps: 0,
    latency_ms: 0,
    ai_enabled: false,
    rules_enabled: false,
    last_seen_at: isoNowMinusMinutes(62),
  },
  {
    id: 'agriculture-cam-00005',
    name: 'Silo Top Cam',
    site_id: 'agriculture-site-003',
    zone_id: 'agriculture-site-003-zone-001',
    status: 'online',
    fps: 16,
    latency_ms: 71,
    ai_enabled: true,
    rules_enabled: true,
    last_seen_at: isoNowMinusMinutes(4),
  },
  {
    id: 'agriculture-cam-00006',
    name: 'Loading Lane Cam',
    site_id: 'agriculture-site-003',
    zone_id: 'agriculture-site-003-zone-002',
    status: 'online',
    fps: 18,
    latency_ms: 66,
    ai_enabled: true,
    rules_enabled: true,
    last_seen_at: isoNowMinusMinutes(3),
  },
]

export const AGRI_DEMO_MODELS: DemoModel[] = [
  {
    id: 'agri-ppe-v1',
    name: 'Agriculture PPE Detector',
    kind: 'yolo',
    enabled: true,
    version: '2026.02',
    settings: { confidence_threshold: 0.7, outdoor_mode: true },
  },
  {
    id: 'agri-proximity-v1',
    name: 'Human–Machinery Proximity',
    kind: 'tracker',
    enabled: true,
    version: '2026.02',
    settings: { min_distance_meters: 4.0, speed_sensitive: true },
  },
  {
    id: 'agri-fall-v1',
    name: 'Fall / Collapse (Outdoor)',
    kind: 'classifier',
    enabled: true,
    version: '2026.01',
    settings: { min_duration_seconds: 2.0 },
  },
]

const VIDEO_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

export function buildDemoAgricultureViolations(total = 48): DemoViolation[] {
  const rules = [
    { id: 'agri-rule-ppe-boots', name: 'Worker without safety boots', severity: 'high' as const, accent: '#22c55e' },
    { id: 'agri-rule-ppe-gloves', name: 'Worker without gloves', severity: 'medium' as const, accent: '#22c55e' },
    { id: 'agri-rule-chem-entry', name: 'Unauthorized entry: chemical storage', severity: 'critical' as const, accent: '#84cc16' },
    { id: 'agri-rule-tractor-prox', name: 'Tractor proximity to human < 4m', severity: 'critical' as const, accent: '#84cc16' },
    { id: 'agri-rule-fall', name: 'Worker fall / immobility detected', severity: 'high' as const, accent: '#a3e635' },
    { id: 'agri-rule-livestock', name: 'Aggressive animal behavior detected', severity: 'medium' as const, accent: '#a3e635' },
  ]

  const statuses: Array<DemoViolation['status']> = ['open', 'investigating', 'resolved']

  const out: DemoViolation[] = []
  for (let i = 0; i < total; i++) {
    const r = rules[i % rules.length]
    const cam = AGRI_DEMO_CAMERAS[i % AGRI_DEMO_CAMERAS.length]
    const detectedAt = new Date(Date.now() - (i * 17 + 5) * 60 * 1000).toISOString()
    const sev = r.severity
    const st = statuses[(i + 1) % statuses.length]
    const isVideo = i % 5 === 0

    const evId = `demo-evd-agri-${String(i + 1).padStart(4, '0')}`
    const thumb = svgDataUri(
      r.name,
      `${cam.name} • ${cam.zone_id}`,
      r.accent
    )

    const evidence: DemoEvidence = {
      id: evId,
      media_type: isVideo ? 'video' : 'image',
      created_at: detectedAt,
      thumbnail_url: thumb,
      download_blurred_url: isVideo ? VIDEO_URL : thumb,
      download_original_url: isVideo ? VIDEO_URL : thumb,
    }

    out.push({
      id: `AGRI-DEMO-${String(i + 1).padStart(6, '0')}`,
      sector_id: 'agriculture',
      organization_id: 'org-001',
      site_id: cam.site_id,
      zone_id: cam.zone_id,
      camera_id: cam.id,
      rule_id: r.id,
      rule_name: r.name,
      severity: sev,
      status: st,
      detected_at: detectedAt,
      ai_confidence: Math.max(0.72, 0.92 - (i % 7) * 0.02),
      model_version: `agri-ppe-v1:v2026.02`,
      acknowledged: i % 3 === 0,
      acknowledged_by: i % 3 === 0 ? 'demo.admin@isoguard.ai' : null,
      assigned_to: i % 4 === 0 ? 'Supervisor' : null,
      is_false_positive: i % 17 === 0,
      comment_count: i % 4 === 0 ? 1 : 0,
      comments:
        i % 4 === 0
          ? [
              {
                id: `cmt-${i}`,
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

export function buildDemoAgricultureAnalyticsSummary(days = 30): DemoAnalyticsSummary {
  const bySeverity = { low: 12, medium: 18, high: 11, critical: 7 }
  const byStatus = { open: 16, investigating: 18, resolved: 14 }
  const topRules = [
    { rule_name: 'Worker without safety boots', count: 12 },
    { rule_name: 'Tractor proximity to human < 4m', count: 9 },
    { rule_name: 'Unauthorized entry: chemical storage', count: 8 },
    { rule_name: 'Worker fall / immobility detected', count: 7 },
  ]

  const total = Object.values(bySeverity).reduce((a, b) => a + b, 0)

  return {
    sector_id: 'agriculture',
    days,
    violations: { total, by_severity: bySeverity, by_status: byStatus, top_rules: topRules },
    cameras: { total: 120, online: 97, offline: 12, warning: 11 },
  }
}

export function buildDemoAgricultureAnalyticsTrend(days = 30): DemoAnalyticsTrend {
  const items: Array<{ date: string; count: number }> = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const base = 2 + (d.getDay() % 3)
    const noise = (i % 5 === 0 ? 4 : 0) + (i % 11 === 0 ? 3 : 0)
    items.push({ date: d.toISOString().slice(0, 10), count: base + noise })
  }

  return { sector_id: 'agriculture', days, items }
}
