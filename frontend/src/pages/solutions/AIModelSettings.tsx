import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { apiClient } from '../../services/api'
import { useSector } from '../../solutions/SectorContext'

type CurrentUser = {
  user_id: string
  email: string
  role: string
}

type SectorModel = {
  id: string
  name: string
  kind: string
  enabled: boolean
  version: string
  artifact?: string | null
  dataset_ref?: string | null
  settings?: Record<string, any>
  metrics?: Record<string, any>
  limitations?: string[]
  supported_camera_angles?: string[]
}

type ListModelsResponse = {
  items: SectorModel[]
  total: number
}

function safeJsonParse(raw: string): { ok: boolean; value?: any; error?: string } {
  try {
    const v = JSON.parse(raw)
    return { ok: true, value: v }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Invalid JSON' }
  }
}

export default function AIModelSettings() {
  const { sector } = useParams()
  const { activeSolution } = useSector()

  const [user, setUser] = useState<CurrentUser | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ListModelsResponse | null>(null)

  const [drafts, setDrafts] = useState<Record<string, Partial<SectorModel> & { settingsText?: string }>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const sectorName = activeSolution?.name ?? sector ?? 'Sector'

  const isAdmin = (user?.role || '').toLowerCase() === 'admin'

  const items = data?.items ?? []

  const mergeDraft = (id: string, patch: Partial<SectorModel> & { settingsText?: string }) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }))
  }

  const effectiveModel = (m: SectorModel) => {
    const d = drafts[m.id] || {}

    let settings = m.settings || {}
    if (typeof d.settingsText === 'string') {
      const parsed = safeJsonParse(d.settingsText)
      if (parsed.ok) settings = parsed.value
    }

    return {
      ...m,
      ...d,
      settings,
    }
  }

  const load = async () => {
    if (!sector) return

    setLoading(true)
    setError(null)
    try {
      const [me, models] = await Promise.all([
        apiClient.get<CurrentUser>('/api/v1/auth/me'),
        apiClient.get<ListModelsResponse>(`/api/v1/sectors/${sector}/ai-models`),
      ])

      setUser(me.data)
      setData(models.data)

      // initialize drafts settings text for nicer editing
      const initial: Record<string, Partial<SectorModel> & { settingsText?: string }> = {}
      for (const m of models.data.items || []) {
        initial[m.id] = { settingsText: JSON.stringify(m.settings || {}, null, 2) }
      }
      setDrafts(initial)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load AI model settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sector])

  const save = async (modelId: string) => {
    if (!sector) return
    const model = items.find((m) => m.id === modelId)
    if (!model) return

    setBusyId(modelId)
    setError(null)
    setToast(null)

    try {
      const d = drafts[modelId] || {}
      const settingsText = typeof d.settingsText === 'string' ? d.settingsText : JSON.stringify(model.settings || {}, null, 2)
      const parsed = safeJsonParse(settingsText)
      if (!parsed.ok) {
        setError(`Model ${modelId}: settings JSON invalid — ${parsed.error}`)
        return
      }

      const payload = {
        enabled: d.enabled ?? model.enabled,
        version: (d.version ?? model.version) || '1',
        artifact: d.artifact ?? model.artifact,
        dataset_ref: d.dataset_ref ?? model.dataset_ref,
        settings: parsed.value,
      }

      await apiClient.patch(`/api/v1/sectors/${sector}/ai-models/${modelId}`, payload)

      setToast(`Saved ${modelId}`)
      await load()

      setTimeout(() => setToast(null), 2000)
    } catch (e: any) {
      setError(e?.message ?? 'Save failed')
    } finally {
      setBusyId(null)
    }
  }

  const anyModel = items[0]
  const isolationText = useMemo(() => {
    return `You are configuring ${sectorName}-scoped AI models. Other sectors’ models are not visible here.`
  }, [sectorName])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <WrenchScrewdriverIcon className="w-7 h-7 text-primary-300" />
            AI Model Settings
          </h1>
          <p className="mt-1 text-sm text-gray-400">{isolationText}</p>
          <p className="mt-2 text-xs text-gray-500">
            Changes update model versioning/settings for this sector (scaffold override; later DB-backed). These changes are audit-logged.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isAdmin && (
            <div className="px-3 py-2 rounded-lg border border-dashboard-border text-gray-300 inline-flex items-center gap-2">
              <LockClosedIcon className="w-4 h-4" />
              Admin-only
            </div>
          )}

          <button
            className="px-3 py-2 rounded-lg border border-dashboard-border text-gray-200 hover:bg-dashboard-bg inline-flex items-center gap-2"
            onClick={load}
            disabled={loading || !sector}
          >
            <ArrowPathIcon className={clsx('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10 text-green-200 text-sm inline-flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4" />
          {toast}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm inline-flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading && <div className="text-gray-400">Loading…</div>}

      {!loading && items.length === 0 && (
        <div className="card p-6">
          <div className="text-white font-semibold">No models configured for this sector</div>
          <div className="text-sm text-gray-400 mt-1">Add models in the sector config YAML under `ai_models`.</div>
        </div>
      )}

      {anyModel && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {items.map((m) => {
            const eff = effectiveModel(m)
            const d = drafts[m.id] || {}
            const busy = busyId === m.id
            const settingsText = typeof d.settingsText === 'string' ? d.settingsText : JSON.stringify(m.settings || {}, null, 2)
            const settingsValid = safeJsonParse(settingsText).ok

            return (
              <div key={m.id} className="card p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white font-semibold truncate">{m.name}</div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">{m.id} • {m.kind}</div>
                  </div>

                  <button
                    className={clsx(
                      'px-3 py-2 rounded-lg text-sm border',
                      isAdmin
                        ? 'border-dashboard-border text-gray-200 hover:bg-dashboard-bg'
                        : 'border-dashboard-border/40 text-gray-500'
                    )}
                    onClick={() => save(m.id)}
                    disabled={!isAdmin || busy}
                  >
                    {busy ? 'Saving…' : 'Save'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Enabled</label>
                    <select
                      className="input-field"
                      value={String(d.enabled ?? m.enabled)}
                      onChange={(e) => mergeDraft(m.id, { enabled: e.target.value === 'true' })}
                      disabled={!isAdmin}
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Version (sector-scoped)</label>
                    <input
                      className="input-field"
                      value={String(d.version ?? m.version ?? '')}
                      onChange={(e) => mergeDraft(m.id, { version: e.target.value })}
                      placeholder="e.g. 1, 2, 2026.02"
                      disabled={!isAdmin}
                    />
                    <div className="text-[11px] text-gray-500 mt-1">Used when creating new evidence/violations from rules.</div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Artifact (optional)</label>
                    <input
                      className="input-field"
                      value={String(d.artifact ?? m.artifact ?? '')}
                      onChange={(e) => mergeDraft(m.id, { artifact: e.target.value })}
                      placeholder="s3://…, /models/…, registry://…"
                      disabled={!isAdmin}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Settings (JSON)</label>
                    <textarea
                      className={clsx(
                        'w-full h-44 rounded-lg bg-dashboard-bg border text-gray-200 p-3 text-sm font-mono',
                        settingsValid ? 'border-dashboard-border' : 'border-red-500/50'
                      )}
                      value={settingsText}
                      onChange={(e) => mergeDraft(m.id, { settingsText: e.target.value })}
                      disabled={!isAdmin}
                    />
                    {!settingsValid && (
                      <div className="text-xs text-red-300 mt-1">Invalid JSON (fix before saving).</div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Effective version: <span className="text-gray-200 font-mono">{eff.version}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
