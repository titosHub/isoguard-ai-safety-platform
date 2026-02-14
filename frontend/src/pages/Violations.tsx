import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  ArrowDownTrayIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FlagIcon,
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

  severity: 'low' | 'medium' | 'high' | 'critical' | string
  status: 'open' | 'investigating' | 'resolved' | string
  detected_at: string

  ai_confidence: number
  model_version: string

  acknowledged: boolean
  acknowledged_by?: string | null

  assigned_to?: string | null
  is_false_positive: boolean

  comment_count: number
  comments: Array<{
    id: string
    user_id?: string | null
    user_name?: string | null
    content: string
    created_at: string
  }>

  evidence: Evidence[]
}

type ViolationsResponse = {
  items: Violation[]
  total: number
  skip: number
  limit: number
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

function severityColor(sev: string) {
  const s = (sev || '').toLowerCase()
  if (s === 'critical') return 'bg-red-500/15 text-red-300 border-red-500/30'
  if (s === 'high') return 'bg-orange-500/15 text-orange-300 border-orange-500/30'
  if (s === 'medium') return 'bg-yellow-500/15 text-yellow-200 border-yellow-500/30'
  if (s === 'low') return 'bg-green-500/15 text-green-300 border-green-500/30'
  return 'bg-gray-800 text-gray-300 border-dashboard-border'
}

type ViolationsProps = {
  title?: string
  subtitle?: string
  fixedSeverities?: string[]
  hideSeverityFilter?: boolean
  defaultStatus?: string
}

export default function Violations({
  title = 'Violations',
  subtitle,
  fixedSeverities,
  hideSeverityFilter = false,
  defaultStatus = '',
}: ViolationsProps) {
  const { sector } = useParams()
  const location = useLocation()
  const { activeSolution } = useSector()

  const [sites, setSites] = useState<Site[]>([])
  const [zones, setZones] = useState<Zone[]>([])

  const [siteId, setSiteId] = useState<string>('')
  const [zoneId, setZoneId] = useState<string>('')
  const [severity, setSeverity] = useState<string>('')
  const [status, setStatus] = useState<string>(defaultStatus)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [data, setData] = useState<ViolationsResponse | null>(null)
  const [demoMode, setDemoMode] = useState(false)
  const [skip, setSkip] = useState(0)
  const limit = 25

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

  const [selected, setSelected] = useState<Violation | null>(null)
  const [previewVariant, setPreviewVariant] = useState<'blurred' | 'original'>('blurred')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [actionBusy, setActionBusy] = useState(false)

  const sectorName = activeSolution?.name ?? sector ?? 'Sector'
  const apiBaseUrl = apiClient.defaults.baseURL ?? ''
  const demo = useMemo(() => getSectorDemo(sector), [sector])
  const isDev = import.meta.env.DEV
  const canDemo = isDev && !!demo
  const forceDemo = canDemo && new URLSearchParams(location.search).get('demo') === '1'

  const buildDemoResponse = (skipIn: number, limitIn: number): ViolationsResponse => {
    const all = demo?.buildViolations(80) ?? []

    const filtered = all.filter((v) => {
      if (siteId && v.site_id !== siteId) return false
      if (zoneId && v.zone_id !== zoneId) return false

      if (fixedSeverities && fixedSeverities.length > 0) {
        if (!fixedSeverities.includes(String(v.severity).toLowerCase())) return false
      } else if (severity && String(v.severity).toLowerCase() !== String(severity).toLowerCase()) {
        return false
      }

      if (status && String(v.status).toLowerCase() !== String(status).toLowerCase()) return false

      return true
    })

    const total = filtered.length
    const items = filtered.slice(skipIn, skipIn + limitIn)

    return { items, total, skip: skipIn, limit: limitIn }
  }

  const subtitleText = subtitle ?? `Review ${sectorName}-scoped AI detections and evidence.`

  const canPrev = skip > 0
  const canNext = !!data && skip + limit < data.total

  const filters = useMemo(
    () => ({
      site_id: siteId || undefined,
      zone_id: zoneId || undefined,
      severity: fixedSeverities ? undefined : (severity || undefined),
      severities: fixedSeverities && fixedSeverities.length > 0 ? fixedSeverities.join(',') : undefined,
      status: status || undefined,
    }),
    [siteId, zoneId, severity, status, fixedSeverities]
  )

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

  // Load violations list
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
        setData(buildDemoResponse(skip, limit))
        setLoading(false)
        return
      }

      try {
        const res = await apiClient.get<ViolationsResponse>(`/api/v1/sectors/${sector}/violations`, {
          params: { ...filters, skip, limit },
        })
        if (!cancelled) {
          setData(res.data)
          setDemoMode(false)
        }
      } catch (e: any) {
        if (!cancelled) {
          const msg = e?.message ?? 'Failed to load violations'
          if (canDemo && demo) {
            setDemoMode(true)
            setData(buildDemoResponse(skip, limit))
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
  }, [sector, filters, skip, demoMode, canDemo, demo, forceDemo])

  // Thumbnail blob loading (so we can attach auth headers)
  useEffect(() => {
    if (demoMode) return

    const items = data?.items || []
    const evidenceIds = items
      .map((v) => v.evidence?.[0]?.id)
      .filter(Boolean) as string[]

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
        if (thumbUrls[ev.id]) continue

        try {
          const res = await apiClient.get(joinBaseUrl(apiBaseUrl, ev.thumbnail_url), { responseType: 'blob' })
          const url = URL.createObjectURL(res.data)
          if (!cancelled) {
            setThumbUrls((prev) => ({ ...prev, [ev.id]: url }))
          } else {
            URL.revokeObjectURL(url)
          }
        } catch {
          // ignore
        }
      }
    }

    run()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.items, apiBaseUrl])

  // Revoke thumbnails on unmount
  useEffect(() => {
    return () => {
      for (const url of Object.values(thumbUrlsRef.current)) {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      }
    }
  }, [])

  // Preview evidence when modal opens / variant changes
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

  const acknowledge = async () => {
    if (!sector || !selected) return
    setActionBusy(true)
    try {
      const res = await apiClient.post<Violation>(`/api/v1/sectors/${sector}/violations/${selected.id}/acknowledge`)
      setSelected(res.data)
      setData((prev) => {
        if (!prev) return prev
        return { ...prev, items: prev.items.map((v) => (v.id === res.data.id ? res.data : v)) }
      })
    } catch (e: any) {
      setPreviewError(e?.message ?? 'Failed to acknowledge')
    } finally {
      setActionBusy(false)
    }
  }

  const markFalsePositive = async () => {
    if (!sector || !selected) return
    const reason = (prompt('Reason for false positive?') || '').trim()
    if (!reason) return

    setActionBusy(true)
    try {
      const res = await apiClient.post<Violation>(`/api/v1/sectors/${sector}/violations/${selected.id}/false-positive`, {
        reason,
      })
      setSelected(res.data)
      setData((prev) => {
        if (!prev) return prev
        return { ...prev, items: prev.items.map((v) => (v.id === res.data.id ? res.data : v)) }
      })
    } catch (e: any) {
      setPreviewError(e?.message ?? 'Failed to mark false positive')
    } finally {
      setActionBusy(false)
    }
  }

  const addComment = async () => {
    if (!sector || !selected) return
    const content = commentText.trim()
    if (!content) return

    setActionBusy(true)
    try {
      const res = await apiClient.post(`/api/v1/sectors/${sector}/violations/${selected.id}/comments`, {
        content,
      })

      setSelected((prev) => {
        if (!prev) return prev
        return { ...prev, comments: [...(prev.comments || []), res.data], comment_count: (prev.comment_count || 0) + 1 }
      })
      setCommentText('')
    } catch (e: any) {
      setPreviewError(e?.message ?? 'Failed to add comment')
    } finally {
      setActionBusy(false)
    }
  }

  const downloadEvidence = async (variant: 'blurred' | 'original') => {
    const ev = selected?.evidence?.[0]
    if (!ev) return

    const urlToFetch = variant === 'original' ? ev.download_original_url : ev.download_blurred_url
    // Demo mode: download/open the URL directly.
    if (demoMode) {
      const a = document.createElement('a')
      a.href = urlToFetch
      const ext = ev.media_type === 'video' ? 'mp4' : 'jpg'
      a.download = `${selected?.id ?? 'evidence'}_${variant}.${ext}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      return
    }

    try {
      const res = await apiClient.get(joinBaseUrl(apiBaseUrl, urlToFetch), { responseType: 'blob' })
      const blobUrl = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${selected?.id ?? 'evidence'}_${variant}.jpg`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000)
    } catch (e: any) {
      setPreviewError(e?.message ?? 'Download failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm text-gray-400">{subtitleText}</p>
          <p className="mt-2 text-xs text-gray-500">
            Evidence thumbnails and downloads are fetched with auth headers; original (unblurred) access is restricted.
          </p>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
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
              <option value="">All sites</option>
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
              onChange={(e) => {
                setZoneId(e.target.value)
                setSkip(0)
              }}
              disabled={!siteId}
            >
              <option value="">All zones</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>
          {!hideSeverityFilter ? (
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
          ) : (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Severity</label>
              <div className="input-field flex items-center justify-between gap-2">
                <span className="text-sm text-gray-200">{(fixedSeverities || []).join(', ') || '—'}</span>
                <span className="text-xs text-gray-500">Fixed</span>
              </div>
            </div>
          )}
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
        </div>
      </div>

      {demoMode && demo && (
        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm">
          Demo Mode: showing {demo.label} sample violations (pictures + demo videos) until the backend feed is connected.
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-dashboard-border">
          <div className="text-sm text-gray-400">
            {loading ? 'Loading…' : `${data?.total ?? 0} total`}
          </div>
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

        <div className="divide-y divide-dashboard-border">
          {(data?.items || []).length === 0 && !loading ? (
            <div className="p-6 text-sm text-gray-400">No violations found.</div>
          ) : (
            (data?.items || []).map((v) => {
              const ev = v.evidence?.[0]
              const thumb = ev ? (demoMode ? ev.thumbnail_url : thumbUrls[ev.id]) : undefined
              return (
                <button
                  key={v.id}
                  className="w-full text-left p-4 hover:bg-dashboard-bg/40 transition-colors"
                  onClick={() => {
                    setSelected(v)
                    setPreviewVariant('blurred')
                    setCommentText('')
                    setPreviewError(null)
                  }}
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-14 rounded-lg bg-dashboard-bg border border-dashboard-border overflow-hidden flex items-center justify-center shrink-0">
                      {thumb ? (
                        <img src={thumb} className="w-full h-full object-cover" alt="evidence thumbnail" />
                      ) : (
                        <EyeIcon className="w-6 h-6 text-gray-600" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={clsx('px-2 py-0.5 rounded-full text-xs border', severityColor(v.severity))}>
                              {String(v.severity).toUpperCase()}
                            </span>
                            {v.is_false_positive && (
                              <span className="px-2 py-0.5 rounded-full text-xs border border-purple-500/30 bg-purple-500/10 text-purple-200">
                                False positive
                              </span>
                            )}
                            {v.acknowledged && (
                              <span className="px-2 py-0.5 rounded-full text-xs border border-green-500/30 bg-green-500/10 text-green-200">
                                Acknowledged
                              </span>
                            )}
                            <span className="text-sm font-semibold text-white truncate">{v.rule_name}</span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {v.site_id} • {v.zone_id} • {v.camera_id}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 shrink-0">{fmtDate(v.detected_at)}</div>
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          {v.status}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          {v.comment_count}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FlagIcon className="w-4 h-4" />
                          {(v.ai_confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-5xl bg-gray-900 border border-dashboard-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-dashboard-border">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={clsx('px-2 py-0.5 rounded-full text-xs border', severityColor(selected.severity))}>
                    {String(selected.severity).toUpperCase()}
                  </span>
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

                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 rounded-lg border border-dashboard-border text-sm text-gray-200 hover:bg-dashboard-bg inline-flex items-center gap-2"
                      onClick={() => downloadEvidence(previewVariant)}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>

                {previewError && (
                  <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm mb-3">
                    {previewError}
                  </div>
                )}

                <div className="rounded-xl border border-dashboard-border bg-black/20 overflow-hidden min-h-[320px] flex items-center justify-center">
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

                <div className="flex gap-2">
                  <button
                    className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                    onClick={acknowledge}
                    disabled={actionBusy || selected.acknowledged}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    {selected.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg border border-dashboard-border text-gray-200 hover:bg-dashboard-bg flex-1 inline-flex items-center justify-center gap-2"
                    onClick={markFalsePositive}
                    disabled={actionBusy}
                  >
                    <FlagIcon className="w-4 h-4" />
                    False +
                  </button>
                </div>

                <div className="card p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">Comments</h4>
                    <span className="text-xs text-gray-500">{selected.comment_count}</span>
                  </div>

                  <div className="mt-3 space-y-2 max-h-56 overflow-auto">
                    {(selected.comments || []).length === 0 ? (
                      <div className="text-sm text-gray-500">No comments yet.</div>
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

                  <div className="mt-3 flex gap-2">
                    <input
                      className="input-field flex-1"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment…"
                    />
                    <button
                      className="px-3 py-2 rounded-lg border border-dashboard-border text-gray-200 hover:bg-dashboard-bg"
                      onClick={addComment}
                      disabled={actionBusy || !commentText.trim()}
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Original evidence access is audited; denied attempts are also logged.
                  </div>
                </div>

                <div className="text-xs text-gray-600">
                  This is scaffold/demo data served from disk-based evidence under the backend storage directory.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
