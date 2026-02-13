import { useEffect, useState } from 'react'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import { apiClient } from '../../services/api'

type RiskSite = {
  site_id: string
  site_name: string
  risk_score: number
}

type ExecutiveBoardView = {
  global_safety_score: number
  trir: number
  ltifr: number
  severity_index: number
  compliance_coverage_percent: number
  predictive_risk_probability: number
  days_since_fatality: number
  top_5_risk_sites: RiskSite[]
  regulatory_exposure_index: number
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

export default function ExecutiveBoard() {
  const [data, setData] = useState<ExecutiveBoardView | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiClient.get<ExecutiveBoardView>('/api/v1/executive/overview')
        if (!cancelled) setData(res.data)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load executive overview')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <ShieldCheckIcon className="w-8 h-8 text-primary-400" />
          Executive Board View
        </h1>
        <p className="text-gray-400 mt-1">
          Strategic governance metrics for leadership and regulators.
        </p>
      </div>

      {loading && <div className="text-gray-400">Loading…</div>}
      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Global Safety Score" value={data.global_safety_score.toFixed(1)} />
            <StatCard label="TRIR" value={data.trir.toFixed(3)} />
            <StatCard label="LTIFR" value={data.ltifr.toFixed(3)} />
            <StatCard label="Severity Index" value={data.severity_index.toFixed(2)} />
            <StatCard label="Compliance Coverage %" value={data.compliance_coverage_percent.toFixed(1)} />
            <StatCard label="Predictive Risk Probability" value={data.predictive_risk_probability.toFixed(2)} />
            <StatCard label="Days Since Fatality" value={String(data.days_since_fatality)} />
            <StatCard label="Regulatory Exposure Index" value={data.regulatory_exposure_index.toFixed(1)} />
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white">Top 5 Risk Sites</h2>
            <div className="mt-4 divide-y divide-dashboard-border">
              {data.top_5_risk_sites.length === 0 ? (
                <p className="text-sm text-gray-500">No data</p>
              ) : (
                data.top_5_risk_sites.map((s) => (
                  <div key={s.site_id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">{s.site_name}</p>
                      <p className="text-xs text-gray-500">{s.site_id}</p>
                    </div>
                    <div className="text-sm text-gray-300">Risk: {s.risk_score.toFixed(1)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
