import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CubeIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { apiClient } from '../../services/api'
import { useSector } from '../../solutions/SectorContext'

type SectorModelConfig = {
  id: string
  name: string
  kind: string
  enabled: boolean
  artifact?: string | null
  settings?: Record<string, any>
}

type SectorConfig = {
  sector_id: string
  name: string
  ai_models: SectorModelConfig[]
}

export default function TrainingModels() {
  const { sector } = useParams()
  const { activeSolution } = useSector()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SectorConfig | null>(null)

  const sectorName = activeSolution?.name ?? sector ?? 'Sector'

  useEffect(() => {
    if (!sector) return

    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await apiClient.get<SectorConfig>(`/api/v1/sectors/${sector}/config`)
        if (!cancelled) setData(res.data)
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load sector models')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [sector])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <CubeIcon className="w-8 h-8 text-primary-400" />
          Training Models
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          View {sectorName}-specific model inventory and training entrypoints.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          This is a scaffold page. Next step is wiring dataset uploads and training jobs per model.
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
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Models</h3>
            <button
              className="px-4 py-2 rounded-lg border border-dashboard-border text-gray-200 hover:bg-dashboard-bg"
              disabled
              title="Coming soon"
            >
              <CloudArrowUpIcon className="w-4 h-4 inline-block mr-2" />
              Upload Training Data
            </button>
          </div>

          <div className="divide-y divide-dashboard-border">
            {data.ai_models.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">No models configured for this sector.</div>
            ) : (
              data.ai_models.map((m) => (
                <div key={m.id} className="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{m.name}</p>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-300 border border-dashboard-border">
                          {m.kind}
                        </span>
                        <span
                          className={
                            'px-2 py-0.5 text-xs rounded-full border ' +
                            (m.enabled
                              ? 'bg-green-500/10 text-green-300 border-green-500/20'
                              : 'bg-gray-800 text-gray-300 border-dashboard-border')
                          }
                        >
                          {m.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">id: {m.id}</p>
                      {m.artifact && <p className="mt-1 text-xs text-gray-500">artifact: {m.artifact}</p>}
                      {m.settings && Object.keys(m.settings).length > 0 && (
                        <div className="mt-2 rounded-lg border border-dashboard-border bg-dashboard-bg p-3">
                          <pre className="text-xs text-gray-200 whitespace-pre-wrap">{JSON.stringify(m.settings, null, 2)}</pre>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="btn-primary" disabled title="Coming soon">
                        Start training
                      </button>
                      <button className="px-4 py-2 rounded-lg border border-dashboard-border text-gray-200 hover:bg-dashboard-bg" disabled title="Coming soon">
                        Evaluate
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
