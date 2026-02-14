import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { apiClient } from '../services/api'
import { useSector } from '../solutions/SectorContext'
import { getSectorDemo } from '../demo/sectorDemo'

type Site = {
  id: string
  name: string
}

type Zone = {
  id: string
  name: string
  zone_type: string
  site_id: string
}

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
  sector_id: string
  organization_id: string
  site_id: string
  zone_id: string
  camera_id: string
  rule_id: string
  rule_name: string
  severity: string
  status: string
  detected_at: string
  ai_confidence: number
  model_version: string
  acknowledged: boolean
  acknowledged_by?: string | null
  is_false_positive: boolean
  comment_count: number
  comments: Array<{ id: string; user_name?: string | null; content: string; created_at: string }>
  evidence: Evidence[]
}

type ViolationsResponse = {
  items: Violation[]
  total: number
  skip: number
  limit: number
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
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

function severityBadge(sev: string) {
  const s = (sev || '').toLowerCase()
  const klass =
    s === 'critical'
      ? 'bg-red-500/15 text-red-300 border-red-500/30'
      : s === 'high'
        ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
        : s === 'medium'
          ? 'bg-yellow-500/15 text-yellow-200 border-yellow-500/30'
          : s === 'low'
            ? 'bg-green-500/15 text-green-300 border-green-500/30'
            : 'bg-gray-800 text-gray-300 border-dashboard-border'

  return <span className={clsx('px-2 py-0.5 rounded-full text-xs border', klass)}>{s.toUpperCase() || '—'}</span>
}

function downloadText(filename: string, text: string, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

function csvEscape(v: any) {
  const s = String(v ?? '')
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export default function ForensicsSearch() {
  const { sector } = useParams()
  const location = useLocation()
  const { activeSolution } = useSector()

  const [showFilters, setShowFilters] = useState(true)

  const [sites, setSites] = useState<Site[]>([])
  const [zones, setZones] = useState<Zone[]>([])

  const [siteId, setSiteId] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [cameraId, setCameraId] = useState('')

  const [q, setQ] = useState('')
  const [severity, setSeverity] = useState('')
  const [status, setStatus] = useState('')
  const [isFalsePositive, setIsFalsePositive] = useState('')
  const [acknowledged, setAcknowledged] = useState('')

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [skip, setSkip] = useState(0)
  const limit = 24

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ViolationsResponse | null>(null)
  const [demoMode, setDemoMode] = useState(false)

  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({})
  const thumbUrlsRef = useRef<Record<string, string>>({})

  const [selected, setSelected] = useState<Violation | null>(null)
  const [previewVariant, setPreviewVariant] = useState<'blurred' | 'original'>('blurred')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const sectorName = activeSolution?.name ?? sector ?? 'Sector'
  const apiBaseUrl = apiClient.defaults.baseURL ?? ''
  const demo = useMemo(() => getSectorDemo(sector), [sector])

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

  const filters = useMemo(() => {
    const fp = isFalsePositive === '' ? undefined : isFalsePositive === 'true'
    const ack = acknowledged === '' ? undefined : acknowledged === 'true'

    return {
      site_id: siteId || undefined,
      zone_id: zoneId || undefined,
      camera_id: cameraId || undefined,
      q: q || undefined,
      severity: severity || undefined,
      status: status || undefined,
      is_false_positive: fp,
      acknowledged: ack,
      date_from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
      date_to: dateTo ? new Date(dateTo).toISOString() : undefined,
      skip,
      limit,
    }
  }, [siteId, zoneId, cameraId, q, severity, status, isFalsePositive, acknowledged, dateFrom, dateTo, skip])

  const canPrev = skip > 0
  const canNext = !!data && skip + limit < data.total

  const isDev = import.meta.env.DEV
  const canDemo = isDev && !!demo
  const forceDemo = canDemo && new URLSearchParams(location.search).get('demo') === '1'

  const buildDemoResponse = (skipIn: number, limitIn: number): ViolationsResponse => {
    const all = demo?.buildViolations(80) ?? []

    const qn = (q || '').trim().toLowerCase()

    const fp = isFalsePositive === '' ? undefined : isFalsePositive === 'true'
    const ack = acknowledged === '' ? undefined : acknowledged === 'true'

    const df = dateFrom ? new Date(dateFrom).getTime() : undefined
    const dt = dateTo ? new Date(dateTo).getTime() : undefined

    const filtered = all.filter((v) => {
      if (siteId && v.site_id !== siteId) return false
      if (zoneId && v.zone_id !== zoneId) return false
      if (cameraId && v.camera_id !== cameraId) return false
      if (severity && v.severity !== severity) return false
      if (status && v.status !== status) return false
      if (fp !== undefined && v.is_false_positive !== fp) return false
      if (ack !== undefined && v.acknowledged !== ack) return false

      if (df !== undefined || dt !== undefined) {
        const t = new Date(v.detected_at).getTime()
        if (df !== undefined && t < df) return false
        if (dt !== undefined && t > dt) return false
      }

      if (qn) {
        const hay = `${v.id} ${v.rule_name} ${v.site_id} ${v.zone_id} ${v.camera_id} ${v.severity} ${v.status}`.toLowerCase()
        if (!hay.includes(qn)) return false
      }

      return true
    })

    const total = filtered.length
    const items = filtered.slice(skipIn, skipIn + limitIn)

    return { items, total, skip: skipIn, limit: limitIn }
  }

  // Load sites
  useEffect(() => {
    if (!sector) return
    let cancelled = false

    const run = async () => {
      if (forceDemo && demo) {
        setDemoMode(true)
        setSites(demo.sites)
        return
      }

      try {
        const res = await apiClient.get<{ items: Site[] }>(`/api/v1/sectors/${sector}/sites`)
        if (!cancelled) {
          setSites(res.data.items || [])
          setDemoMode(false)
        }
      } catch {
        if (!cancelled) {
          if (canDemo && demo) {
            setDemoMode(true)
            setSites(demo.sites)
          } else {
            setSites([])
          }
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [sector, canDemo, demo, forceDemo])

  // Load zones when site changes
  useEffect(() => {
    if (!sector || !siteId) {
      setZones([])
      setZoneId('')
      return
    }

    // Demo fallback
    if (demoMode && demo) {
      setZones(demo.zones.filter((z) => z.site_id === siteId))
      return
    }

    let cancelled = false
    const run = async () => {
      try {
        const res = await apiClient.get<{ items: Zone[] }>(`/api/v1/sectors/${sector}/sites/${siteId}/zones`)
        if (!cancelled) setZones(res.data.items || [])
      } catch {
        if (!cancelled) setZones([])
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [sector, siteId, demoMode])

  // Load violations
  useEffect(() => {
    if (!sector) return
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      if (forceDemo && demo) {
        setDemoMode(true)
        setData(buildDemoResponse(skip, limit))
        setLoading(false)
        return
      }

      // If we're already in demo mode, keep it fast.
      if (demoMode && demo) {
        const demoRes = buildDemoResponse(skip, limit)
        setData(demoRes)
        setLoading(false)
        return
      }

      try {
        const res = await apiClient.get<ViolationsResponse>(`/api/v1/sectors/${sector}/violations`, { params: filters })
        if (!cancelled) {
          setData(res.data)
          setDemoMode(false)
        }
      } catch (e: any) {
        if (!cancelled) {
          const msg = e?.message ?? 'Failed to load forensics results'

          if (canDemo && demo) {
            setDemoMode(true)
            setData(buildDemoResponse(skip, limit))
            // Keep the error around as a hint, but still show demo content.
            setError(`${msg} (showing ${demo.label} demo data)`)
          } else {
            setError(msg)
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [sector, filters, demoMode, skip, canDemo, demo, forceDemo])

  // Thumbnail blob loading (so we can attach auth headers)
  useEffect(() => {
    if (demoMode) return

    const items = data?.items || []
    const evidenceIds = items.map((v) => v.evidence?.[0]?.id).filter(Boolean) as string[]

    // Reuse existing URLs; revoke any no longer needed
    setThumbUrls((prev) => {
      const next: Record<string, string> = {}
      for (const id of evidenceIds) {
        if (prev[id]) next[id] = prev[id]
      }
      for (const [id, url] of Object.entries(prev)) {
        if (!next[id]) URL.revokeObjectURL(url)
      }
      return next
    })

    let cancelled = false

    const run = async () => {
      for (const v of items) {
        const ev = v.evidence?.[0]
        if (!ev) continue
        if (thumbUrlsRef.current[ev.id]) continue

        try {
          const res = await apiClient.get(joinBaseUrl(apiBaseUrl, ev.thumbnail_url), { responseType: 'blob' })
          const url = URL.createObjectURL(res.data)
          if (!cancelled) setThumbUrls((prev) => ({ ...prev, [ev.id]: url }))
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
  }, [data?.items, apiBaseUrl])

  // Revoke thumbnails on unmount
  useEffect(() => {
    return () => {
      for (const url of Object.values(thumbUrlsRef.current)) {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      }
    }
  }, [])

  // Preview evidence in modal
  useEffect(() => {
    const ev = selected?.evidence?.[0]
    if (!selected || !sector || !ev) {
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setPreviewError(null)
      return
    }

    let cancelled = false

    const run = async () => {
      setPreviewError(null)

      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }

      const urlToFetch = previewVariant === 'original' ? ev.download_original_url : ev.download_blurred_url

      // Demo mode: use URLs directly (data URIs or public MP4).
      if (demoMode) {
        setPreviewError(null)
        setPreviewUrl(urlToFetch)
        return
      }

      try {
        const res = await apiClient.get(joinBaseUrl(apiBaseUrl, urlToFetch), { responseType: 'blob' })
        const obj = URL.createObjectURL(res.data)
        if (!cancelled) setPreviewUrl(obj)
        else URL.revokeObjectURL(obj)
      } catch (e: any) {
        if (!cancelled) setPreviewError(e?.message ?? 'Failed to load evidence')
      }
    }

    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, previewVariant, apiBaseUrl])

  const clearFilters = () => {
    setSiteId('')
    setZoneId('')
    setCameraId('')
    setQ('')
    setSeverity('')
    setStatus('')
    setIsFalsePositive('')
    setAcknowledged('')
    setDateFrom('')
    setDateTo('')
    setSkip(0)
  }

  const exportCsv = async () => {
    if (!sector) return

    // Demo export
    if (demoMode && demo) {
      const demoRes = buildDemoResponse(0, 200)
      const header = [
        'id',
        'detected_at',
        'severity',
        'status',
        'rule_name',
        'site_id',
        'zone_id',
        'camera_id',
        'ai_confidence',
        'model_version',
        'acknowledged',
        'is_false_positive',
      ]

      const rows = (demoRes.items || []).map((v) => [
        v.id,
        v.detected_at,
        v.severity,
        v.status,
        v.rule_name,
        v.site_id,
        v.zone_id,
        v.camera_id,
        v.ai_confidence,
        v.model_version,
        v.acknowledged,
        v.is_false_positive,
      ])

      const csv = [header, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n')
      downloadText(`${sector}_forensics_export_demo.csv`, csv, 'text/csv')
      return
    }

    try {
      const res = await apiClient.get<ViolationsResponse>(`/api/v1/sectors/${sector}/violations`, {
        params: { ...filters, skip: 0, limit: 200 },
      })

      const header = [
        'id',
        'detected_at',
        'severity',
        'status',
        'rule_name',
        'site_id',
        'zone_id',
        'camera_id',
        'ai_confidence',
        'model_version',
        'acknowledged',
        'is_false_positive',
      ]

      const rows = (res.data.items || []).map((v) => [
        v.id,
        v.detected_at,
        v.severity,
        v.status,
        v.rule_name,
        v.site_id,
        v.zone_id,
        v.camera_id,
        v.ai_confidence,
        v.model_version,
        v.acknowledged,
        v.is_false_positive,
      ])

      const csv = [header, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n')
      downloadText(`${sector}_forensics_export.csv`, csv, 'text/csv')
    } catch (e: any) {
      setError(e?.message ?? 'Export failed')
    }
  }

  const items = data?.items || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Forensics Search</h1>
          <p className="mt-1 text-sm text-gray-400">Search {sectorName}-scoped violations with evidence replay.</p>
          <p className="mt-2 text-xs text-gray-500">
            Blurred evidence is shown by default. Original access requires privileged roles and is audited.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="px-3 py-2 rounded-lg border border-dashboard-border text-gray-200 hover:bg-dashboard-bg inline-flex items-center gap-2"
            onClick={() => setShowFilters((s) => !s)}
          >
            <FunnelIcon className="w-4 h-4" />
            {showFilters ? 'Hide filters' : 'Show filters'}
          </button>

          <button
            className="px-3 py-2 rounded-lg border border-dashboard-border text-gray-200 hover:bg-dashboard-bg inline-flex items-center gap-2"
            onClick={clearFilters}
          >
            <XMarkIcon className="w-4 h-4" />
            Clear
          </button>

          <button className="btn-primary inline-flex items-center gap-2" onClick={exportCsv}>
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  className="input-field pl-9"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value)
                    setSkip(0)
                  }}
                  placeholder="id, rule, camera…"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Site</label>
              <select
                className="input-field"
                value={siteId}
                onChange={(e) => {
                  setSiteId(e.target.value)
                  setSkip(0)
                }}
              >
                <option value="">All</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Zone</label>
              <select
                className="input-field"
                value={zoneId}
                disabled={!siteId}
                onChange={(e) => {
                  setZoneId(e.target.value)
                  setSkip(0)
                }}
              >
                <option value="">All</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Camera</label>
              <input
                className="input-field"
                value={cameraId}
                onChange={(e) => {
                  setCameraId(e.target.value)
                  setSkip(0)
                }}
                placeholder="camera id"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Severity</label>
              <select
                className="input-field"
                value={severity}
                onChange={(e) => {
                  setSeverity(e.target.value)
                  setSkip(0)
                }}
              >
                <option value="">All</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                className="input-field"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setSkip(0)
                }}
              >
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">False positive</label>
              <select
                className="input-field"
                value={isFalsePositive}
                onChange={(e) => {
                  setIsFalsePositive(e.target.value)
                  setSkip(0)
                }}
              >
                <option value="">Any</option>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Acknowledged</label>
              <select
                className="input-field"
                value={acknowledged}
                onChange={(e) => {
                  setAcknowledged(e.target.value)
                  setSkip(0)
                }}
              >
                <option value="">Any</option>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <div className="relative">
                <CalendarIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  className="input-field pl-9"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value)
                    setSkip(0)
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <div className="relative">
                <CalendarIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  className="input-field pl-9"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value)
                    setSkip(0)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {demoMode && demo && (
        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm">
          Demo Mode: showing {demo.label} sample data (pictures + demo videos) until the backend feed is connected.
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-dashboard-border">
          <div className="text-sm text-gray-400">{loading ? 'Loading…' : `${data?.total ?? 0} matches`}</div>
          <div className="flex items-center gap-2">
            <button
              className={clsx(
                'px-3 py-1.5 rounded-lg border text-sm',
                canPrev ? 'border-dashboard-border text-gray-200 hover:bg-dashboard-bg' : 'border-dashboard-border/40 text-gray-500'
              )}
              disabled={!canPrev}
              onClick={() => setSkip((s) => Math.max(0, s - limit))}
            >
              Prev
            </button>
            <button
              className={clsx(
                'px-3 py-1.5 rounded-lg border text-sm',
                canNext ? 'border-dashboard-border text-gray-200 hover:bg-dashboard-bg' : 'border-dashboard-border/40 text-gray-500'
              )}
              disabled={!canNext}
              onClick={() => setSkip((s) => s + limit)}
            >
              Next
            </button>
          </div>
        </div>

        {items.length === 0 && !loading ? (
          <div className="p-6 text-sm text-gray-400">No results.</div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((v) => {
              const ev = v.evidence?.[0]
              const thumb = ev ? (demoMode ? ev.thumbnail_url : thumbUrls[ev.id]) : undefined
              return (
                <button
                  key={v.id}
                  className="card overflow-hidden hover:border-primary-500/40 transition-colors text-left"
                  onClick={() => {
                    setSelected(v)
                    setPreviewVariant('blurred')
                    setPreviewError(null)
                  }}
                >
                  <div className="h-32 bg-dashboard-bg border-b border-dashboard-border flex items-center justify-center overflow-hidden">
                    {thumb ? (
                      <img src={thumb} className="w-full h-full object-cover" alt="thumbnail" />
                    ) : (
                      <div className="text-xs text-gray-500">thumbnail</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      {severityBadge(v.severity)}
                      <span className="text-xs text-gray-500">{fmtDate(v.detected_at)}</span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white line-clamp-1">{v.rule_name}</div>
                    <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                      {v.site_id} • {v.zone_id} • {v.camera_id}
                    </div>
                    <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                      <span>{v.status}</span>
                      <span className="font-mono">{(v.ai_confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="w-full max-w-5xl bg-gray-900 border border-dashboard-border rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-dashboard-border">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {severityBadge(selected.severity)}
                  <h3 className="text-white font-semibold truncate">{selected.rule_name}</h3>
                  <span className="text-xs text-gray-500">{selected.id}</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {selected.site_id} • {selected.zone_id} • {selected.camera_id} • {fmtDate(selected.detected_at)}
                </div>
              </div>

              <button
                className="p-2 rounded-lg hover:bg-dashboard-bg text-gray-300"
                onClick={() => {
                  setSelected(null)
                  setPreviewError(null)
                  if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
                  setPreviewUrl(null)
                }}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              <div className="lg:col-span-2 p-4 border-b lg:border-b-0 lg:border-r border-dashboard-border">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      className={clsx(
                        'px-3 py-1.5 rounded-lg border text-sm',
                        previewVariant === 'blurred'
                          ? 'border-primary-500/30 bg-primary-500/10 text-primary-200'
                          : 'border-dashboard-border text-gray-200 hover:bg-dashboard-bg'
                      )}
                      onClick={() => setPreviewVariant('blurred')}
                    >
                      Blurred
                    </button>
                    <button
                      className={clsx(
                        'px-3 py-1.5 rounded-lg border text-sm',
                        previewVariant === 'original'
                          ? 'border-primary-500/30 bg-primary-500/10 text-primary-200'
                          : 'border-dashboard-border text-gray-200 hover:bg-dashboard-bg'
                      )}
                      onClick={() => setPreviewVariant('original')}
                    >
                      Original
                    </button>
                  </div>
                </div>

                {previewError && (
                  <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm mb-3">
                    {previewError}
                  </div>
                )}

                <div className="rounded-xl border border-dashboard-border bg-black/20 overflow-hidden min-h-[220px] sm:min-h-[320px] flex items-center justify-center">
                  {previewUrl ? (
                    selected?.evidence?.[0]?.media_type === 'video' || previewUrl.includes('.mp4') ? (
                      <video className="w-full h-full" controls src={previewUrl} />
                    ) : (
                      <img src={previewUrl} className="w-full h-full object-contain" alt="evidence" />
                    )
                  ) : (
                    <div className="text-sm text-gray-500">Loading evidence…</div>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="card p-4">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="text-sm text-gray-200 mt-1">{selected.status}</div>
                  <div className="text-xs text-gray-500 mt-3">Model</div>
                  <div className="text-sm text-gray-200 mt-1">{selected.model_version}</div>
                  <div className="text-xs text-gray-500 mt-3">AI confidence</div>
                  <div className="text-sm text-gray-200 mt-1">{(selected.ai_confidence * 100).toFixed(1)}%</div>
                </div>

                <div className="card p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">Comments</h4>
                    <span className="text-xs text-gray-500">{selected.comment_count}</span>
                  </div>
                  <div className="mt-3 space-y-2 max-h-56 overflow-auto">
                    {(selected.comments || []).length === 0 ? (
                      <div className="text-sm text-gray-500">No comments.</div>
                    ) : (
                      selected.comments.map((c) => (
                        <div key={c.id} className="rounded-lg border border-dashboard-border bg-dashboard-bg/40 p-2">
                          <div className="text-xs text-gray-500 flex items-center justify-between">
                            <span>{c.user_name || 'User'}</span>
                            <span>{fmtDate(c.created_at)}</span>
                          </div>
                          <div className="text-sm text-gray-200 mt-1">{c.content}</div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">This view is read-only; triage actions live in the Violations tool.</div>
                </div>

                <div className="text-xs text-gray-600">
                  Tip: use the Violations page to acknowledge, mark false positives, and add new comments.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
