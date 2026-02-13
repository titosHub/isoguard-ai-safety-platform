import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PaperAirplaneIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { apiClient } from '../../services/api'
import { useSector } from '../../solutions/SectorContext'

type Format = 'pdf' | 'csv' | 'json' | 'xlsx'

type GovernmentSubmissionCreateRequest = {
  sector_id: string
  start_date: string
  end_date: string
  formats: Format[]
  framework?: string | null
  submit: boolean
}

type GovernmentSubmissionResponse = {
  id: string
  sector_id: string
  status: string
  created_at: string
  submitted_at?: string | null
  download_url?: string | null
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function GovernmentSubmit() {
  const { sector } = useParams()
  const { activeSolution } = useSector()

  const defaults = useMemo(() => {
    const end = new Date()
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return { start: isoDate(start), end: isoDate(end) }
  }, [])

  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)
  const [framework, setFramework] = useState<string>('')
  const [formats, setFormats] = useState<Record<Format, boolean>>({
    pdf: true,
    csv: true,
    json: true,
    xlsx: true,
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GovernmentSubmissionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sectorName = activeSolution?.name ?? sector ?? 'Sector'
  const apiBaseUrl = apiClient.defaults.baseURL ?? ''

  const selectedFormats = (Object.keys(formats) as Format[]).filter((f) => formats[f])

  const create = async (submit: boolean) => {
    if (!sector) {
      setError('No sector selected. Please return to Solutions and choose a sector.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const payload: GovernmentSubmissionCreateRequest = {
        sector_id: sector,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        formats: selectedFormats,
        framework: framework.trim() || null,
        submit,
      }

      const res = await apiClient.post<GovernmentSubmissionResponse>(
        '/api/v1/government/submissions',
        payload
      )

      setResult(res.data)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create submission bundle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <PaperAirplaneIcon className="w-8 h-8 text-primary-400" />
            Government Submission
          </h1>
          <p className="text-gray-400 mt-1">
            Generate a sector-specific submission bundle for {sectorName}.
          </p>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Start date</label>
            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">End date</label>
            <input
              type="date"
              className="input-field"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Framework (optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="OSHA, ISO45001, SECTION_54..."
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Bundle formats</label>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(formats) as Format[]).map((f) => (
              <label
                key={f}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashboard-border bg-dashboard-bg"
              >
                <input
                  type="checkbox"
                  checked={formats[f]}
                  onChange={(e) => setFormats((prev) => ({ ...prev, [f]: e.target.checked }))}
                />
                <span className="text-sm text-gray-200 uppercase">{f}</span>
              </label>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Output bundle is a ZIP containing the selected formats.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="btn-primary"
            disabled={loading || selectedFormats.length === 0}
            onClick={() => create(true)}
          >
            <PaperAirplaneIcon className="w-4 h-4 mr-2" />
            {loading ? 'Submitting…' : 'Submit to Government'}
          </button>
          <button
            className="px-4 py-2 rounded-lg border border-dashboard-border text-gray-200 hover:bg-dashboard-bg transition-colors"
            disabled={loading || selectedFormats.length === 0}
            onClick={() => create(false)}
          >
            Generate Draft Bundle
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-green-300 font-medium">Bundle created</p>
                <p className="text-xs text-gray-400 mt-1">ID: {result.id} • Status: {result.status}</p>
              </div>
              {result.download_url && (
                <a
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white"
                  href={result.download_url.startsWith('http') ? result.download_url : `${apiBaseUrl}${result.download_url}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download ZIP
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
