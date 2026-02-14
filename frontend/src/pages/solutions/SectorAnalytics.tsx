import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  ArrowPathIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import {
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import { apiClient } from '../../services/api'
import { useSector } from '../../solutions/SectorContext'
import { getSectorDemo } from '../../demo/sectorDemo'

type SummaryResponse = {
  sector_id: string
  days: number
  violations: {
    total: number
    by_severity: Record<string, number>
    by_status: Record<string, number>
    top_rules: Array<{ rule_name: string; count: number }>
  }
  cameras: {
    total: number
    online: number
    offline: number
    warning: number
  }
}

type TrendResponse = {
  sector_id: string
  days: number
  items: Array<{ date: string; count: number }>
}

const PERIODS: Array<{ id: '7d' | '30d' | '90d' | '1y'; days: number; label: string }> = [
  { id: '7d', days: 7, label: '7d' },
  { id: '30d', days: 30, label: '30d' },
  { id: '90d', days: 90, label: '90d' },
  { id: '1y', days: 365, label: '1y' },
]

const COLORS = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#eab308',
  low: '#22c55e',
  other: '#64748b',
}

export default function SectorAnalytics() {
  const { sector } = useParams()
  const location = useLocation()
  const { activeSolution } = useSector()

  const [period, setPeriod] = useState<(typeof PERIODS)[number]['id']>('30d')
  const days = useMemo(() => PERIODS.find((p) => p.id === period)?.days ?? 30, [period])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [trend, setTrend] = useState<TrendResponse | null>(null)
  const [demoMode, setDemoMode] = useState(false)

  const sectorName = activeSolution?.name ?? sector ?? 'Sector'
  const demo = useMemo(() => getSectorDemo(sector), [sector])
  const isDev = import.meta.env.DEV
  const canDemo = isDev && !!demo
  const forceDemo = canDemo && new URLSearchParams(location.search).get('demo') === '1'

  const load = async () => {
    if (!sector) return

    setLoading(true)
    setError(null)

    if (forceDemo && demo) {
      setDemoMode(true)
      setSummary(demo.buildAnalyticsSummary(days) as any)
      setTrend(demo.buildAnalyticsTrend(days) as any)
      setLoading(false)
      return
    }

    if (demoMode && demo) {
      setSummary(demo.buildAnalyticsSummary(days) as any)
      setTrend(demo.buildAnalyticsTrend(days) as any)
      setLoading(false)
      return
    }

    try {
      const [s, t] = await Promise.all([
        apiClient.get<SummaryResponse>(`/api/v1/sectors/${sector}/analytics/summary`, { params: { days } }),
        apiClient.get<TrendResponse>(`/api/v1/sectors/${sector}/analytics/trend`, { params: { days } }),
      ])
      setSummary(s.data)
      setTrend(t.data)
      setDemoMode(false)
    } catch (e: any) {
      const msg = e?.message ?? 'Failed to load analytics'
      if (canDemo && demo) {
        setDemoMode(true)
        setSummary(demo.buildAnalyticsSummary(days) as any)
        setTrend(demo.buildAnalyticsTrend(days) as any)
        setError(`${msg} (showing ${demo.label} demo analytics)`)
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
  }, [sector, days, forceDemo])

  const severityPie = useMemo(() => {
    const by = summary?.violations.by_severity || {}
    const keys = Object.keys(by)
    if (keys.length === 0) return []

    return keys.map((k) => ({ name: k, value: by[k] || 0, color: (COLORS as any)[k] ?? COLORS.other }))
  }, [summary])

  const topRules = summary?.violations.top_rules ?? []
  const byStatus = summary?.violations.by_status ?? {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-400">{sectorName}-scoped safety trends (demo)</p>
          <p className="mt-2 text-xs text-gray-500">
            This is scaffold analytics aggregated from the demo violations store (and will become DB-backed later).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={
                  `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ` +
                  (period === p.id ? 'bg-primary-600 text-white' : 'bg-dashboard-card text-gray-400 hover:text-white')
                }
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            className="px-3 py-2 rounded-lg border border-dashboard-border text-gray-200 hover:bg-dashboard-bg inline-flex items-center gap-2"
            onClick={load}
            disabled={loading || !sector}
          >
            <ArrowPathIcon className={"w-4 h-4 " + (loading ? 'animate-spin' : '')} />
            Refresh
          </button>
        </div>
      </div>

      {demoMode && demo && (
        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm">
          Demo Mode: showing {demo.label} sample analytics until the backend feed is connected.
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-xs text-gray-500">Violations (last {days}d)</div>
          <div className="text-2xl font-semibold text-white mt-1">{summary?.violations.total ?? '—'}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Open</div>
          <div className="text-2xl font-semibold text-white mt-1">{byStatus.open ?? 0}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Investigating</div>
          <div className="text-2xl font-semibold text-white mt-1">{byStatus.investigating ?? 0}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">Resolved</div>
          <div className="text-2xl font-semibold text-white mt-1">{byStatus.resolved ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white inline-flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-primary-300" />
              Violations Trend
            </h3>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend?.items ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickFormatter={(v) => String(v).slice(5)} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white inline-flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-primary-300" />
              Severity Breakdown
            </h3>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {(severityPie || []).map((entry, idx) => (
                      <Cell key={idx} fill={(entry as any).color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {severityPie.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: (s as any).color }} />
                  <span className="text-sm text-gray-400">
                    {s.name}: {(s as any).value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Top Rules</h3>
          </div>
          <div className="divide-y divide-dashboard-border">
            {topRules.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">No data yet.</div>
            ) : (
              topRules.map((r) => (
                <div key={r.rule_name} className="p-4 flex items-center justify-between gap-3">
                  <div className="text-sm text-gray-200 truncate">{r.rule_name}</div>
                  <div className="text-sm text-white font-mono">{r.count}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="text-xs text-gray-500">Cameras (demo dataset)</div>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <div className="text-sm text-gray-400">Total</div>
            <div className="text-xl text-white font-semibold">{summary?.cameras.total ?? '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Online</div>
            <div className="text-xl text-white font-semibold">{summary?.cameras.online ?? '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Offline</div>
            <div className="text-xl text-white font-semibold">{summary?.cameras.offline ?? '—'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Warning</div>
            <div className="text-xl text-white font-semibold">{summary?.cameras.warning ?? '—'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
