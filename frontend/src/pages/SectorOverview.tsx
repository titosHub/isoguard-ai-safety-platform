import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  ChartBarIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { apiClient } from '../services/api'
import { useSector } from '../solutions/SectorContext'
import { solutionPath } from '../solutions/registry'
import { getSectorDemo } from '../demo/sectorDemo'
import { INDUSTRY_CONFIG } from './IndustrySafety'

type Site = { id: string; name: string }

type Evidence = {
  id: string
  media_type: 'image' | 'video'
  created_at: string
  thumbnail_url: string
  download_blurred_url: string
  download_original_url: string
}

type Violation = {
  id: string
  rule_id?: string
  site_id: string
  zone_id: string
  camera_id: string
  rule_name: string
  severity: string
  status: string
  detected_at: string
  ai_confidence: number
  model_version: string
  acknowledged: boolean
  is_false_positive: boolean
  evidence: Evidence[]
}

type ViolationsResponse = {
  items: Violation[]
  total: number
  skip: number
  limit: number
}

type SummaryResponse = {
  sector_id: string
  days: number
  violations: {
    total: number
    by_severity: Record<string, number>
    by_status: Record<string, number>
    top_rules: Array<{ rule_name: string; count: number }>
  }
  cameras: { total: number; online: number; offline: number; warning: number }
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function joinBaseUrl(base: string, path: string) {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  if (!base) return path
  if (base.endsWith('/') && path.startsWith('/')) return base.slice(0, -1) + path
  if (!base.endsWith('/') && !path.startsWith('/')) return base + '/' + path
  return base + path
}

function severityChip(sev: string) {
  const s = (sev || '').toLowerCase()
  if (s === 'critical') return 'bg-red-500/15 text-red-300 border-red-500/30'
  if (s === 'high') return 'bg-orange-500/15 text-orange-300 border-orange-500/30'
  if (s === 'medium') return 'bg-yellow-500/15 text-yellow-200 border-yellow-500/30'
  if (s === 'low') return 'bg-green-500/15 text-green-300 border-green-500/30'
  return 'bg-gray-800 text-gray-300 border-dashboard-border'
}

export default function SectorOverview() {
  const { sector } = useParams()
  const location = useLocation()
  const { activeSolution } = useSector()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)

  const [sites, setSites] = useState<Site[]>([])
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [recent, setRecent] = useState<Violation[]>([])

  const apiBaseUrl = apiClient.defaults.baseURL ?? ''
  const isDev = import.meta.env.DEV

  const demo = useMemo(() => getSectorDemo(sector), [sector])
  const canDemo = isDev && !!demo
  const forceDemo = canDemo && new URLSearchParams(location.search).get('demo') === '1'

  const industryCfg = useMemo(() => {
    if (!sector) return null
    return (INDUSTRY_CONFIG as any)[sector] ?? null
  }, [sector])

  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({})
  const thumbUrlsRef = useRef<Record<string, string>>({})

  useEffect(() => {
    thumbUrlsRef.current = thumbUrls
  }, [thumbUrls])

  useEffect(() => {
    if (!demoMode) return

    setThumbUrls((prev) => {
      for (const url of Object.values(prev)) {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      }
      return {}
    })
  }, [demoMode])

  const load = async () => {
    if (!sector) return

    setLoading(true)
    setError(null)

    if ((forceDemo || demoMode) && demo) {
      setDemoMode(true)
      setSites(demo.sites)
      setSummary(demo.buildAnalyticsSummary(30) as any)
      setRecent(demo.buildViolations(12) as any)
      setLoading(false)
      return
    }

    try {
      const [s, v, sitesRes] = await Promise.all([
        apiClient.get<SummaryResponse>(`/api/v1/sectors/${sector}/analytics/summary`, { params: { days: 30 } }),
        apiClient.get<ViolationsResponse>(`/api/v1/sectors/${sector}/violations`, { params: { skip: 0, limit: 12 } }),
        apiClient.get<{ items: Site[] }>(`/api/v1/sectors/${sector}/sites`),
      ])

      setSummary(s.data)
      setRecent(v.data.items || [])
      setSites(sitesRes.data.items || [])
      setDemoMode(false)
    } catch (e: any) {
      const msg = e?.message ?? 'Failed to load overview'
      if (canDemo && demo) {
        setDemoMode(true)
        setSites(demo.sites)
        setSummary(demo.buildAnalyticsSummary(30) as any)
        setRecent(demo.buildViolations(12) as any)
        setError(`${msg} (showing ${demo.label} demo overview)`)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sector, forceDemo])

  // Evidence thumbnails (API mode only)
  useEffect(() => {
    if (demoMode) return

    const evidence = (recent || []).map((v) => v.evidence?.[0]).filter(Boolean) as Evidence[]
    const ids = evidence.map((e) => e.id)

    setThumbUrls((prev) => {
      const next: Record<string, string> = {}
      for (const id of ids) {
        if (prev[id]) next[id] = prev[id]
      }
      for (const [id, url] of Object.entries(prev)) {
        if (!next[id] && url.startsWith('blob:')) URL.revokeObjectURL(url)
      }
      return next
    })

    let cancelled = false
    const run = async () => {
      for (const ev of evidence) {
        if (thumbUrlsRef.current[ev.id]) continue
        try {
          const res = await apiClient.get(joinBaseUrl(apiBaseUrl, ev.thumbnail_url), { responseType: 'blob' })
          const url = URL.createObjectURL(res.data)
          if (!cancelled) setThumbUrls((p) => ({ ...p, [ev.id]: url }))
          else URL.revokeObjectURL(url)
        } catch {
          // ignore
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [recent, demoMode, apiBaseUrl])

  useEffect(() => {
    return () => {
      for (const url of Object.values(thumbUrlsRef.current)) {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      }
    }
  }, [])

  const sectorName = activeSolution?.name ?? demo?.label ?? industryCfg?.name ?? sector ?? 'Sector'
  const tagline = activeSolution?.shortDescription

  const openHigh = useMemo(() => {
    return (recent || []).filter((v) => {
      const sev = String(v.severity).toLowerCase()
      const st = String(v.status).toLowerCase()
      return (sev === 'critical' || sev === 'high') && st !== 'resolved'
    }).length
  }, [recent])

  const kpis = useMemo(() => {
    const items = recent || []

    const matchRule = (v: Violation, re: RegExp) => re.test(v.rule_name || '') || re.test(v.rule_id || '')

    const count = (re: RegExp) => items.filter((v) => matchRule(v, re)).length

    const countOpen = (re: RegExp) =>
      items.filter((v) => {
        if (!matchRule(v, re)) return false
        return String(v.status).toLowerCase() !== 'resolved'
      }).length

    const camerasOnline = summary?.cameras.online ?? '—'
    const camerasWarning = summary?.cameras.warning ?? '—'

    const base = [
      { label: 'Open high/critical (recent)', value: openHigh, hint: 'Recent snapshot', tone: 'red' as const },
      { label: 'Violations (30d)', value: summary?.violations.total ?? '—', hint: 'Analytics summary', tone: 'neutral' as const },
      { label: 'Cameras Online', value: camerasOnline, hint: 'Aggregate', tone: 'green' as const },
      { label: 'Camera Warnings', value: camerasWarning, hint: 'Aggregate', tone: 'amber' as const },
    ]

    switch (sector) {
      case 'health':
        return [
          { label: 'Patient falls (open)', value: countOpen(/patient fall|\bfall\b/i), hint: 'Recent', tone: 'red' as const },
          { label: 'Aggression risk', value: countOpen(/aggressive|violence/i), hint: 'Recent', tone: 'amber' as const },
          { label: 'Restricted access', value: countOpen(/medication|restricted access|unauthorized access/i), hint: 'Recent', tone: 'red' as const },
          { label: 'Hand hygiene', value: count(/hand hygiene/i), hint: 'Recent', tone: 'neutral' as const },
        ]

      case 'warehouse':
        return [
          { label: 'Forklift proximity (open)', value: countOpen(/forklift.*proximity|proximity.*forklift/i), hint: 'Recent', tone: 'red' as const },
          { label: 'Dock safety (open)', value: countOpen(/dock/i), hint: 'Recent', tone: 'amber' as const },
          { label: 'Spill / obstruction', value: count(/spill|obstruction/i), hint: 'Recent', tone: 'neutral' as const },
          { label: 'Overspeed', value: count(/overspeed|speed/i), hint: 'Recent', tone: 'neutral' as const },
        ]

      case 'construction':
        return [
          { label: 'Fall risk (harness)', value: countOpen(/harness|fall from height|\bfall\b/i), hint: 'Recent', tone: 'red' as const },
          { label: 'Exclusion zone (open)', value: countOpen(/exclusion zone/i), hint: 'Recent', tone: 'red' as const },
          { label: 'Crane intrusions', value: countOpen(/crane/i), hint: 'Recent', tone: 'amber' as const },
          { label: 'Trench safety', value: countOpen(/trench/i), hint: 'Recent', tone: 'red' as const },
        ]

      case 'manufacturing':
        return [
          { label: 'LOTO violations (open)', value: countOpen(/\bloto\b/i), hint: 'Recent', tone: 'red' as const },
          { label: 'Machine guarding', value: countOpen(/guard/i), hint: 'Recent', tone: 'red' as const },
          { label: 'Welding PPE', value: count(/welding|eye\/ear|ppe/i), hint: 'Recent', tone: 'amber' as const },
          { label: 'Ergonomic risk', value: count(/ergonomic/i), hint: 'Recent', tone: 'neutral' as const },
        ]

      case 'smart_city':
        return [
          { label: 'Crowd surges (open)', value: countOpen(/crowd/i), hint: 'Recent', tone: 'amber' as const },
          { label: 'Public disorder', value: countOpen(/disorder|fight/i), hint: 'Recent', tone: 'red' as const },
          { label: 'Traffic anomalies', value: count(/traffic|wrong-way|stopped/i), hint: 'Recent', tone: 'neutral' as const },
          { label: 'Camera tamper', value: countOpen(/tamper/i), hint: 'Recent', tone: 'amber' as const },
        ]

      case 'border':
        return [
          { label: 'Perimeter breaches', value: countOpen(/perimeter breach|fence|crossing/i), hint: 'Recent', tone: 'red' as const },
          { label: 'Contraband events', value: count(/contraband/i), hint: 'Recent', tone: 'red' as const },
          { label: 'Tailgating', value: countOpen(/tailgating/i), hint: 'Recent', tone: 'amber' as const },
          { label: 'Loitering', value: countOpen(/loiter/i), hint: 'Recent', tone: 'neutral' as const },
        ]

      case 'agriculture':
        return [
          { label: 'Tractor proximity', value: countOpen(/tractor|machinery.*proximity|proximity.*human/i), hint: 'Recent', tone: 'red' as const },
          { label: 'Chemical storage access', value: countOpen(/chemical storage|unauthorized entry/i), hint: 'Recent', tone: 'red' as const },
          { label: 'Falls / immobility', value: countOpen(/fall|immobility/i), hint: 'Recent', tone: 'amber' as const },
          { label: 'Livestock aggression', value: count(/animal|livestock|aggressive/i), hint: 'Recent', tone: 'neutral' as const },
        ]

      default:
        return base
    }
  }, [recent, summary, openHigh, sector])

  const quickLink = (to: string, label: string, icon: any, tone: 'primary' | 'neutral' = 'neutral') => {
    const Icon = icon
    return (
      <Link
        to={to}
        className={clsx(
          'px-4 py-3 rounded-xl border inline-flex items-center gap-2 text-sm transition-colors',
          tone === 'primary'
            ? 'bg-primary-600/20 border-primary-500/30 text-primary-100 hover:bg-primary-600/30'
            : 'bg-dashboard-card border-dashboard-border text-gray-200 hover:bg-dashboard-bg'
        )}
      >
        <Icon className="w-5 h-5" />
        {label}
      </Link>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{sectorName} Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">{tagline ?? 'Sector overview (scaffold) — sites, alerts, and evidence snapshots.'}</p>
          {industryCfg?.riskFactors?.length ? (
            <p className="mt-2 text-xs text-gray-500">Focus risks: {industryCfg.riskFactors.slice(0, 4).join(' • ')}</p>
          ) : null}
        </div>

        <button
          onClick={load}
          className="px-3 py-2 rounded-lg border border-dashboard-border text-gray-200 hover:bg-dashboard-bg"
          disabled={loading || !sector}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {demoMode && demo && (
        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm">
          Demo Mode: showing {demo.label} overview data (pictures + demo videos) until the backend feed is connected.
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const tone = k.tone ?? 'neutral'
          const border =
            tone === 'red'
              ? 'border-red-500/30'
              : tone === 'amber'
                ? 'border-amber-500/30'
                : tone === 'green'
                  ? 'border-green-500/30'
                  : 'border-dashboard-border'

          return (
            <div key={k.label} className={clsx('card p-4 border', border)}>
              <div className="text-xs text-gray-500">{k.label}</div>
              <div className="text-2xl font-semibold text-white mt-1">{k.value}</div>
              {k.hint ? <div className="text-xs text-gray-600 mt-1">{k.hint}</div> : null}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-xs text-gray-500">Sites</div>
          <div className="text-2xl font-semibold text-white mt-1">{sites.length || '—'}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Cameras (aggregate)</div>
          <div className="text-2xl font-semibold text-white mt-1">{summary?.cameras.total ?? '—'}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Violations (30d)</div>
          <div className="text-2xl font-semibold text-white mt-1">{summary?.violations.total ?? '—'}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Top rule (30d)</div>
          <div className="text-lg font-semibold text-white mt-1 truncate">
            {summary?.violations.top_rules?.[0]?.rule_name ?? '—'}
          </div>
          <div className="text-xs text-gray-600 mt-1">{summary?.violations.top_rules?.[0]?.count ?? '—'} events</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
            <Link
              to={solutionPath((sector as any) ?? 'agriculture', 'violations' as any)}
              className="text-sm text-primary-200 hover:text-primary-100"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-dashboard-border">
            {(recent || []).length === 0 ? (
              <div className="py-6 text-sm text-gray-400">No recent alerts.</div>
            ) : (
              (recent || []).slice(0, 8).map((v) => (
                <div key={v.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={clsx('px-2 py-0.5 rounded-full text-xs border', severityChip(v.severity))}>
                        {String(v.severity).toUpperCase()}
                      </span>
                      <span className="text-sm text-white font-medium truncate">{v.rule_name}</span>
                      {v.acknowledged && (
                        <span className="px-2 py-0.5 rounded-full text-xs border border-green-500/30 bg-green-500/10 text-green-200">
                          Acknowledged
                        </span>
                      )}
                      {v.is_false_positive && (
                        <span className="px-2 py-0.5 rounded-full text-xs border border-purple-500/30 bg-purple-500/10 text-purple-200">
                          False positive
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {v.site_id} • {v.zone_id} • {v.camera_id} • {v.status}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 shrink-0">{fmtDate(v.detected_at)}</div>
                </div>
              ))
            )}
          </div>

          {industryCfg?.incidentTypes?.length ? (
            <div className="mt-4 pt-4 border-t border-dashboard-border">
              <div className="text-xs text-gray-500">Common incident types</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {industryCfg.incidentTypes.slice(0, 6).map((t: any) => (
                  <span
                    key={t.id}
                    className="px-2 py-1 rounded-full text-xs border border-dashboard-border bg-dashboard-bg/30 text-gray-200"
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {quickLink(solutionPath((sector as any) ?? 'agriculture', 'cameras' as any), 'Live Monitoring', VideoCameraIcon, 'primary')}
              {quickLink(solutionPath((sector as any) ?? 'agriculture', 'forensics' as any), 'Forensics Search', MagnifyingGlassIcon)}
              {quickLink(solutionPath((sector as any) ?? 'agriculture', 'analytics' as any), 'Analytics', ChartBarIcon)}
              {quickLink(solutionPath((sector as any) ?? 'agriculture', 'rules' as any), 'Safety Rules', ShieldCheckIcon)}
              {quickLink(solutionPath((sector as any) ?? 'agriculture', 'ai-model-settings' as any), 'AI Model Settings', CpuChipIcon)}
              {quickLink(solutionPath((sector as any) ?? 'agriculture', 'incidents' as any), 'Incidents', ExclamationTriangleIcon)}
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Evidence Snapshots</h2>
              <Link
                to={solutionPath((sector as any) ?? 'agriculture', 'forensics' as any)}
                className="text-sm text-primary-200 hover:text-primary-100"
              >
                Open forensics
              </Link>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {(recent || []).slice(0, 6).map((v) => {
                const ev = v.evidence?.[0]
                const src = !ev ? null : demoMode ? ev.thumbnail_url : thumbUrls[ev.id]

                return (
                  <Link
                    key={v.id}
                    to={solutionPath((sector as any) ?? 'agriculture', 'forensics' as any)}
                    className="relative rounded-lg overflow-hidden border border-dashboard-border bg-dashboard-bg/30 min-h-[88px] hover:border-primary-500/40"
                    title="Open in forensics"
                  >
                    {src ? (
                      <img src={src} className="absolute inset-0 w-full h-full object-cover" alt="evidence thumbnail" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">Loading…</div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-black/55">
                      <div className="text-[11px] text-gray-200 truncate">{v.rule_name}</div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="mt-3 text-xs text-gray-500">
              For video clips in demo mode, open Forensics Search and click a result (video evidence renders in the modal).
            </div>
          </div>

          {industryCfg?.zones?.length ? (
            <div className="card p-4">
              <div className="text-xs text-gray-500">Key zones</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {industryCfg.zones.slice(0, 8).map((z: string) => (
                  <span
                    key={z}
                    className="px-2 py-1 rounded-full text-xs border border-dashboard-border bg-dashboard-bg/30 text-gray-200"
                  >
                    {z}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
