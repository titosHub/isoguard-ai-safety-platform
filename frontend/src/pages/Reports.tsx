import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ArrowDownTrayIcon,
  CalendarIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import { apiClient } from '../services/api'
import { useSector } from '../solutions/SectorContext'

type ReportTemplate = {
  id: string
  name: string
  description: string
  formats: string[]
}

type ReportResponse = {
  id: string
  report_type: string
  status: string
  download_url?: string | null
  created_at: string
  completed_at?: string | null
}

type ReportRequest = {
  report_type: string
  start_date: string
  end_date: string
  sector_id?: string | null
  format: string
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function guessReportType(templateId: string): string {
  const id = templateId.toLowerCase()
  if (id.includes('daily')) return 'daily'
  if (id.includes('weekly')) return 'weekly'
  if (id.includes('monthly')) return 'monthly'
  if (id.includes('compliance')) return 'compliance'
  return 'custom'
}

export default function Reports() {
  const { sector } = useParams()
  const { activeSolution } = useSector()

  const defaults = useMemo(() => {
    const end = new Date()
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return { start: isoDate(start), end: isoDate(end) }
  }, [])

  const [startDate, setStartDate] = useState(defaults.start)
  const [endDate, setEndDate] = useState(defaults.end)
  const [format, setFormat] = useState<'pdf' | 'csv' | 'json' | 'xlsx'>('pdf')

  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templatesError, setTemplatesError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<ReportTemplate[]>([])

  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportsError, setReportsError] = useState<string | null>(null)
  const [reports, setReports] = useState<ReportResponse[]>([])

  const [creatingId, setCreatingId] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const apiBaseUrl = apiClient.defaults.baseURL ?? ''

  useEffect(() => {
    let cancelled = false

    const loadTemplates = async () => {
      setTemplatesLoading(true)
      setTemplatesError(null)
      try {
        const res = await apiClient.get<ReportTemplate[]>('/api/v1/reports/templates/list', {
          params: { sector_id: sector },
        })
        if (!cancelled) setTemplates(res.data)
      } catch (e: any) {
        if (!cancelled) setTemplatesError(e?.message ?? 'Failed to load templates')
      } finally {
        if (!cancelled) setTemplatesLoading(false)
      }
    }

    loadTemplates()
    return () => {
      cancelled = true
    }
  }, [sector])

  useEffect(() => {
    let cancelled = false

    const loadReports = async () => {
      setReportsLoading(true)
      setReportsError(null)
      try {
        const res = await apiClient.get<ReportResponse[]>('/api/v1/reports', { params: { limit: 20 } })
        if (!cancelled) setReports(res.data)
      } catch (e: any) {
        if (!cancelled) setReportsError(e?.message ?? 'Failed to load reports')
      } finally {
        if (!cancelled) setReportsLoading(false)
      }
    }

    loadReports()
    return () => {
      cancelled = true
    }
  }, [])

  const createReport = async (template: ReportTemplate) => {
    if (!sector) return

    setCreatingId(template.id)
    setCreateError(null)

    try {
      const payload: ReportRequest = {
        report_type: guessReportType(template.id),
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        sector_id: sector,
        format,
      }

      await apiClient.post('/api/v1/reports', payload)

      // Refresh list
      const res = await apiClient.get<ReportResponse[]>('/api/v1/reports', { params: { limit: 20 } })
      setReports(res.data)
    } catch (e: any) {
      setCreateError(e?.message ?? 'Failed to generate report')
    } finally {
      setCreatingId(null)
    }
  }

  const sectorName = activeSolution?.name ?? sector ?? 'Sector'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="mt-1 text-sm text-gray-400">
            Generate and download {sectorName}-specific reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start</label>
            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End</label>
            <input
              type="date"
              className="input-field"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Format</label>
            <select className="input-field" value={format} onChange={(e) => setFormat(e.target.value as any)}>
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="xlsx">XLSX</option>
            </select>
          </div>
        </div>
      </div>

      {createError && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          {createError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Reports */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Recent Reports</h3>
          </div>

          {reportsLoading && <div className="p-4 text-sm text-gray-400">Loading…</div>}
          {reportsError && (
            <div className="p-4 text-sm text-red-300">{reportsError}</div>
          )}

          {!reportsLoading && !reportsError && (
            <div className="divide-y divide-dashboard-border">
              {reports.length === 0 ? (
                <div className="p-4 text-sm text-gray-400">No reports yet.</div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="p-4 hover:bg-dashboard-bg/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary-500/10">
                          <DocumentChartBarIcon className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{report.report_type.toUpperCase()} Report</p>
                          <p className="flex items-center gap-1 text-sm text-gray-500">
                            <CalendarIcon className="w-4 h-4" />
                            {new Date(report.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={clsx(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            report.status === 'completed'
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-yellow-500/10 text-yellow-400'
                          )}
                        >
                          {report.status}
                        </span>

                        {report.status === 'completed' && report.download_url && (
                          <a
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            href={
                              report.download_url.startsWith('http')
                                ? report.download_url
                                : `${apiBaseUrl}${report.download_url}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            title="Download"
                          >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Report Templates */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Templates</h3>
          </div>

          {templatesLoading && <div className="p-4 text-sm text-gray-400">Loading…</div>}
          {templatesError && <div className="p-4 text-sm text-red-300">{templatesError}</div>}

          {!templatesLoading && !templatesError && (
            <div className="card-body space-y-3">
              {templates.length === 0 ? (
                <div className="text-sm text-gray-400">No templates configured.</div>
              ) : (
                templates.map((template) => {
                  const disabled = !!creatingId && creatingId !== template.id

                  return (
                    <div
                      key={template.id}
                      className="w-full p-3 rounded-lg border border-dashboard-border"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{template.name}</p>
                          <p className="text-sm text-gray-500">{template.description}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            Formats: {template.formats.join(', ').toUpperCase()}
                          </p>
                        </div>
                        <button
                          className="btn-primary"
                          disabled={disabled || creatingId === template.id}
                          onClick={() => createReport(template)}
                        >
                          {creatingId === template.id ? 'Generating…' : 'Generate'}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Templates are sector-config driven (see `configs/{sector}.yaml`).
      </div>
    </div>
  )
}
