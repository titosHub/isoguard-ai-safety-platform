import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PlayIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline'
import { apiClient } from '../../services/api'
import { useSector } from '../../solutions/SectorContext'

type SectorRule = {
  id: string
  name: string
  description: string
  detection_types: string[]
  severity: string
  regulatory_tags: string[]
  enabled: boolean
}

type RulesListResponse = {
  sector_id: string
  rules: SectorRule[]
}

type DetectionEvent = {
  event_id: string
  detected_at: string
  sector_id?: string | null
  site_id?: string | null
  zone_id?: string | null
  camera_id?: string | null
  detection_types: string[]
  metadata?: Record<string, any>
}

type EvaluationItem = {
  event_id: string
  results: Array<{
    rule_id: string
    rule_name: string
    triggered: boolean
    matched_detection_types: string[]
    severity: string
    regulatory_tags: string[]
    details: Record<string, any>
  }>
}

type EvaluationResponse = {
  sector_id: string
  items: EvaluationItem[]
}

export default function SectorRules() {
  const { sector } = useParams()
  const { activeSolution } = useSector()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RulesListResponse | null>(null)

  const [eventsJson, setEventsJson] = useState<string>('')
  const [evalLoading, setEvalLoading] = useState(false)
  const [evalError, setEvalError] = useState<string | null>(null)
  const [evalResult, setEvalResult] = useState<EvaluationResponse | null>(null)

  const sectorName = activeSolution?.name ?? sector ?? 'Sector'

  const sampleEvents = useMemo(() => {
    const now = new Date().toISOString()
    return [
      {
        event_id: 'evt-001',
        detected_at: now,
        sector_id: sector,
        detection_types: ['ppe_hardhat'],
        metadata: { confidence: 0.91 },
      },
    ] satisfies DetectionEvent[]
  }, [sector])

  useEffect(() => {
    if (!sector) return

    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiClient.get<RulesListResponse>(`/api/v1/sectors/${sector}/rules`)
        if (!cancelled) setData(res.data)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load sector rules')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
  }, [sector])

  const loadSample = () => {
    setEventsJson(JSON.stringify(sampleEvents, null, 2))
    setEvalResult(null)
    setEvalError(null)
  }

  const evaluate = async () => {
    if (!sector) return

    setEvalLoading(true)
    setEvalError(null)
    setEvalResult(null)

    try {
      const events = JSON.parse(eventsJson || '[]') as DetectionEvent[]
      const res = await apiClient.post<EvaluationResponse>(`/api/v1/sectors/${sector}/rules/evaluate`, events)
      setEvalResult(res.data)
    } catch (e: any) {
      setEvalError(e?.message ?? 'Failed to evaluate rules')
    } finally {
      setEvalLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <ShieldExclamationIcon className="w-8 h-8 text-primary-400" />
          Safety Rules Engine
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          View and test {sectorName}-specific safety rules.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Rules are currently configured via sector config files (e.g. `configs/{sector}.yaml`).
        </p>
      </div>

      {loading && <div className="text-gray-400">Loading…</div>}
      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      {data && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Rules</h3>
          </div>
          <div className="divide-y divide-dashboard-border">
            {data.rules.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">No rules configured.</div>
            ) : (
              data.rules.map((r) => (
                <div key={r.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{r.name}</p>
                        {!r.enabled && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-300 border border-dashboard-border">
                            Disabled
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary-600/15 text-primary-300 border border-primary-500/20">
                          {r.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-400">{r.description}</p>
                      <p className="mt-2 text-xs text-gray-500">
                        detection_types: {r.detection_types.join(', ') || '—'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        regulatory_tags: {r.regulatory_tags.join(', ') || '—'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">{r.id}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Test rule evaluation</h3>
            <p className="text-sm text-gray-400 mt-1">
              Paste events JSON (list of DetectionEvent objects) and evaluate against current rules.
            </p>
          </div>
          <button
            className="px-4 py-2 rounded-lg border border-dashboard-border text-gray-200 hover:bg-dashboard-bg"
            onClick={loadSample}
          >
            Load sample
          </button>
        </div>

        <textarea
          className="w-full h-40 rounded-lg bg-dashboard-bg border border-dashboard-border text-gray-200 p-3 text-sm font-mono"
          value={eventsJson}
          onChange={(e) => setEventsJson(e.target.value)}
          placeholder='[ { "event_id": "evt-001", "detected_at": "...", "detection_types": ["ppe_hardhat"] } ]'
        />

        {evalError && (
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
            {evalError}
          </div>
        )}

        <div className="flex items-center justify-end">
          <button className="btn-primary" onClick={evaluate} disabled={evalLoading || !sector}>
            <PlayIcon className="w-4 h-4 mr-2" />
            {evalLoading ? 'Evaluating…' : 'Evaluate'}
          </button>
        </div>

        {evalResult && (
          <div className="mt-2 rounded-lg border border-dashboard-border bg-dashboard-bg p-4">
            <pre className="text-xs text-gray-200 whitespace-pre-wrap">{JSON.stringify(evalResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
