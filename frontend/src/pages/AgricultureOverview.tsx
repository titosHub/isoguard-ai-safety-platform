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
import { solutionPath } from '../solutions/registry'
import { useSector } from '../solutions/SectorContext'
import {
  AGRI_DEMO_CAMERAS,
  AGRI_DEMO_SITES,
  buildDemoAgricultureAnalyticsSummary,
  buildDemoAgricultureViolations,
} from '../demo/agricultureDemo'

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

export default function AgricultureOverview() {
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
  const forceDemo = isDev && sector === 'agriculture' && new URLSearchParams(location.search).get('demo') === '1'

  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({})
  const thumbUrlsRef = useRef<Record<string, string>>({})

  useEffect(() => {
    thumbUrlsRef.current = thumbUrls
  }, [thumbUrls])

  const load = async () => {
    if (!sector) return

    setLoading(true)
    setError(null)

    if (forceDemo) {
      setDemoMode(true)
      setSites(AGRI_DEMO_SITES)
      setSummary(buildDemoAgricultureAnalyticsSummary(30) as any)
      setRecent(buildDemoAgricultureViolations(12) as any)
      setLoading(false)
      return
    }

    if (demoMode && sector === 'agriculture') {
      setSites(AGRI_DEMO_SITES)
      setSummary(buildDemoAgricultureAnalyticsSummary(30) as any)
      setRecent(buildDemoAgricultureViolations(12) as any)
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
      if (isDev && sector === 'agriculture') {
        setDemoMode(true)
        setSites(AGRI_DEMO_SITES)
        setSummary(buildDemoAgricultureAnalyticsSummary(30) as any)
        setRecent(buildDemoAgricultureViolations(12) as any)
        setError(`${msg} (showing Agriculture demo overview)`)
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

    const items = recent || []
    const evidence = items.map((v) => v.evidence?.[0]).filter(Boolean) as Evidence[]
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

  const sectorName = activeSolution?.name ?? 'Agriculture'

  const openHigh = useMemo(() => {
    return (recent || []).filter((v) => {
      const sev = String(v.severity).toLowerCase()
      const st = String(v.status).toLowerCase()
      return (sev === 'critical' || sev === 'high') && st !== 'resolved'
    }).length
  }, [recent])

  const camCounts = useMemo(() => {
    // In API mode we only have aggregate counts from summary; in demo mode show a "small but real" set too.
    const demoOnline = AGRI_DEMO_CAMERAS.filter((c) => c.status === 'online').length
    return {
      demo_total: AGRI_DEMO_CAMERAS.length,
      demo_online: demoOnline,
    }
  }, [])

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
          <p className="mt-1 text-sm text-gray-400">Sector overview (scaffold) — sites, alerts, and evidence snapshots.</p>
        </div>

        <button
          onClick={load}
          className="px-3 py-2 rounded-lg border border-dashboard-border text-gray-200 hover:bg-dashboard-bg"
          disabled={loading || !sector}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {demoMode && sector === 'agriculture' && (
        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm">
          Demo Mode: showing Agriculture overview data (pictures + demo videos) until the backend feed is connected.
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-xs text-gray-500">Sites</div>
          <div className="text-2xl font-semibold text-white mt-1">{sites.length || '—'}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Cameras (aggregate)</div>
          <div className="text-2xl font-semibold text-white mt-1">{summary?.cameras.total ?? camCounts.demo_total}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Online (aggregate)</div>
          <div className="text-2xl font-semibold text-white mt-1">{summary?.cameras.online ?? camCounts.demo_online}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Open high/critical (recent)</div>
          <div className="text-2xl font-semibold text-white mt-1">{openHigh}</div>
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
        </div>
      </div>
    </div>
  )
}
