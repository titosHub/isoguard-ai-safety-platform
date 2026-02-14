import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  DevicePhoneMobileIcon,
  PlusIcon,
  SignalIcon,
  VideoCameraIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { apiClient } from '../services/api'
import { useSector } from '../solutions/SectorContext'
import DeviceCamera from '../components/DeviceCamera'
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

type Camera = {
  id: string
  name: string
  stream_url: string
  site_id: string
  zone_id: string
  organization_id: string
  sector_id: string

  is_active: boolean
  status: 'online' | 'offline' | 'warning' | string
  fps: number
  latency_ms: number

  ai_enabled: boolean
  rules_enabled: boolean
  last_seen_at?: string | null
}

type CamerasResponse = {
  items: Camera[]
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

export default function Cameras() {
  const { sector } = useParams()
  const location = useLocation()
  const { activeSolution } = useSector()

  const [showDeviceCamera, setShowDeviceCamera] = useState(false)

  const [sites, setSites] = useState<Site[]>([])
  const [zones, setZones] = useState<Zone[]>([])

  const [siteId, setSiteId] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const [skip, setSkip] = useState(0)
  const limit = 60

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CamerasResponse | null>(null)
  const [demoMode, setDemoMode] = useState(false)
  const [patchBusyId, setPatchBusyId] = useState<string | null>(null)

  const sectorName = activeSolution?.name ?? sector ?? 'Sector'
  const demo = useMemo(() => getSectorDemo(sector), [sector])
  const isDev = import.meta.env.DEV
  const canDemo = isDev && !!demo
  const forceDemo = canDemo && new URLSearchParams(location.search).get('demo') === '1'

  const buildDemoResponse = (skipIn: number, limitIn: number): CamerasResponse => {
    const all: Camera[] = (demo?.cameras ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      stream_url: '',
      site_id: c.site_id,
      zone_id: c.zone_id,
      organization_id: 'org-001',
      sector_id: demo?.sector_id ?? (sector as any),
      is_active: true,
      status: c.status,
      fps: c.fps,
      latency_ms: c.latency_ms,
      ai_enabled: c.ai_enabled,
      rules_enabled: c.rules_enabled,
      last_seen_at: c.last_seen_at,
    }))

    const q = (search || '').trim().toLowerCase()

    const filtered = all.filter((cam) => {
      if (siteId && cam.site_id !== siteId) return false
      if (zoneId && cam.zone_id !== zoneId) return false
      if (status && String(cam.status).toLowerCase() !== String(status).toLowerCase()) return false

      if (q) {
        const hay = `${cam.id} ${cam.name}`.toLowerCase()
        if (!hay.includes(q)) return false
      }

      return true
    })

    const total = filtered.length
    const items = filtered.slice(skipIn, skipIn + limitIn)

    return { items, total, skip: skipIn, limit: limitIn }
  }

  const filters = useMemo(
    () => ({
      site_id: siteId || undefined,
      zone_id: zoneId || undefined,
      status: status || undefined,
      search: search || undefined,
      skip,
      limit,
    }),
    [siteId, zoneId, status, search, skip]
  )

  const sitesById = useMemo(() => Object.fromEntries(sites.map((s) => [s.id, s])), [sites])
  const zonesById = useMemo(() => Object.fromEntries(zones.map((z) => [z.id, z])), [zones])

  const items = data?.items || []
  const pageCounts = useMemo(() => {
    const c = { online: 0, offline: 0, warning: 0 }
    for (const cam of items) {
      const st = (cam.status || '').toLowerCase()
      if (st === 'online') c.online++
      else if (st === 'offline') c.offline++
      else if (st === 'warning') c.warning++
    }
    return c
  }, [items])

  const canPrev = skip > 0
  const canNext = !!data && skip + limit < data.total

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

  // Load cameras
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

      if (demoMode && demo) {
        setData(buildDemoResponse(skip, limit))
        setLoading(false)
        return
      }

      try {
        const res = await apiClient.get<CamerasResponse>(`/api/v1/sectors/${sector}/cameras`, { params: filters })
        if (!cancelled) {
          setData(res.data)
          setDemoMode(false)
        }
      } catch (e: any) {
        if (!cancelled) {
          const msg = e?.message ?? 'Failed to load cameras'
          if (canDemo && demo) {
            setDemoMode(true)
            setData(buildDemoResponse(skip, limit))
            setError(`${msg} (showing ${demo.label} demo cameras)`)
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
  }, [sector, filters, demoMode, canDemo, demo, skip, forceDemo])

  const patchCamera = async (cameraId: string, patch: Partial<Camera>) => {
    if (!sector) return

    // Demo mode: allow toggling locally (no persistence).
    if (demoMode) {
      setData((prev) => {
        if (!prev) return prev
        return { ...prev, items: prev.items.map((c) => (c.id === cameraId ? ({ ...c, ...patch } as Camera) : c)) }
      })
      return
    }

    setPatchBusyId(cameraId)
    setError(null)

    // optimistic update
    setData((prev) => {
      if (!prev) return prev
      return { ...prev, items: prev.items.map((c) => (c.id === cameraId ? ({ ...c, ...patch } as Camera) : c)) }
    })

    try {
      await apiClient.patch(`/api/v1/sectors/${sector}/cameras/${cameraId}`, patch)
    } catch (e: any) {
      // revert by refetching
      setError(e?.message ?? 'Failed to update camera')
      try {
        const res = await apiClient.get<CamerasResponse>(`/api/v1/sectors/${sector}/cameras`, { params: filters })
        setData(res.data)
      } catch {
        // ignore
      }
    } finally {
      setPatchBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Monitoring</h1>
          <p className="mt-1 text-sm text-gray-400">Browse {sectorName}-scoped sites, zones, and cameras.</p>
          <p className="mt-2 text-xs text-gray-500">
            Cameras are demo-generated (1,000+ scale) and support pagination + basic filtering.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeviceCamera((s) => !s)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border',
              showDeviceCamera
                ? 'bg-green-600/80 text-white border-green-500/40'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-dashboard-border'
            )}
          >
            <DevicePhoneMobileIcon className="w-4 h-4" />
            Device Camera
          </button>
          <button className="btn-primary" onClick={() => alert('Scaffold: Add Camera flow will be added later.')}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Camera
          </button>
        </div>
      </div>

      {showDeviceCamera && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeviceCamera onCapture={(frame) => console.log('Captured:', frame)} onAnalyze={(frame) => console.log('Analyzed:', frame)} />
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Analysis</h3>
            <p className="text-gray-400 text-sm mb-4">
              Use your device camera to capture frames for instant safety analysis. Perfect for inspectors or spot checks.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Real-time PPE detection
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Face blur for privacy
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Save to evidence library
              </li>
            </ul>
          </div>
        </div>
      )}

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
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Search</label>
            <input
              className="input-field"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSkip(0)
              }}
              placeholder="camera id or name"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-xs text-gray-500">Total (dataset)</div>
          <div className="text-2xl font-semibold text-white mt-1">{data?.total ?? '—'}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Online (page)</div>
          <div className="text-2xl font-semibold text-white mt-1">{pageCounts.online}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Offline (page)</div>
          <div className="text-2xl font-semibold text-white mt-1">{pageCounts.offline}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Warning (page)</div>
          <div className="text-2xl font-semibold text-white mt-1">{pageCounts.warning}</div>
        </div>
      </div>

      {demoMode && demo && (
        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm">
          Demo Mode: showing {demo.label} sample sites/zones/cameras until the backend feed is connected.
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-dashboard-border">
          <div className="text-sm text-gray-400">{loading ? 'Loading…' : `${items.length} items (page)`}</div>
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

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs text-gray-500 bg-dashboard-bg border-b border-dashboard-border">
              <tr>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Camera</th>
                <th className="text-left font-medium px-4 py-3">Site / Zone</th>
                <th className="text-left font-medium px-4 py-3">FPS</th>
                <th className="text-left font-medium px-4 py-3">Latency</th>
                <th className="text-left font-medium px-4 py-3">AI</th>
                <th className="text-left font-medium px-4 py-3">Rules</th>
                <th className="text-left font-medium px-4 py-3">Active</th>
                <th className="text-left font-medium px-4 py-3">Last seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashboard-border">
              {items.map((cam) => {
                const st = (cam.status || '').toLowerCase()
                const badge = clsx(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border',
                  st === 'online' && 'bg-green-500/10 border-green-500/30 text-green-300',
                  st === 'offline' && 'bg-red-500/10 border-red-500/30 text-red-300',
                  st === 'warning' && 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200',
                  st !== 'online' && st !== 'offline' && st !== 'warning' && 'bg-gray-800 border-dashboard-border text-gray-300'
                )

                const siteName = sitesById[cam.site_id]?.name || cam.site_id
                const zoneName = zonesById[cam.zone_id]?.name || cam.zone_id

                const busy = patchBusyId === cam.id

                return (
                  <tr key={cam.id} className="text-gray-200">
                    <td className="px-4 py-3">
                      <span className={badge}>
                        <SignalIcon className="w-3 h-3" />
                        {cam.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <VideoCameraIcon className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="font-medium text-white">{cam.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{cam.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white">{siteName}</div>
                      <div className="text-xs text-gray-500">{zoneName}</div>
                    </td>
                    <td className="px-4 py-3 text-white">{cam.fps}</td>
                    <td className="px-4 py-3 text-white">{cam.latency_ms} ms</td>

                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!cam.ai_enabled}
                          disabled={busy}
                          onChange={(e) => patchCamera(cam.id, { ai_enabled: e.target.checked })}
                        />
                        <span className="text-xs text-gray-300">{cam.ai_enabled ? 'On' : 'Off'}</span>
                      </label>
                    </td>

                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!cam.rules_enabled}
                          disabled={busy}
                          onChange={(e) => patchCamera(cam.id, { rules_enabled: e.target.checked })}
                        />
                        <span className="text-xs text-gray-300">{cam.rules_enabled ? 'On' : 'Off'}</span>
                      </label>
                    </td>

                    <td className="px-4 py-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!cam.is_active}
                          disabled={busy}
                          onChange={(e) => patchCamera(cam.id, { is_active: e.target.checked })}
                        />
                        <span className="text-xs text-gray-300">{cam.is_active ? 'Yes' : 'No'}</span>
                      </label>
                    </td>

                    <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(cam.last_seen_at)}</td>
                  </tr>
                )
              })}

              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No cameras found for these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-dashboard-border text-xs text-gray-500 flex items-center gap-2">
          <WrenchScrewdriverIcon className="w-4 h-4" />
          Camera toggles (AI/Rules/Active) are scaffolded and require an admin role.
        </div>
      </div>
    </div>
  )
}
