import { DocumentChartBarIcon, ArrowDownTrayIcon, CalendarIcon, PlusIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

const reports = [
  { id: 'RPT-001', name: 'Weekly Safety Report', type: 'weekly', date: 'Feb 10, 2026', status: 'completed' },
  { id: 'RPT-002', name: 'Monthly Executive Summary', type: 'monthly', date: 'Feb 1, 2026', status: 'completed' },
  { id: 'RPT-003', name: 'Compliance Audit Report', type: 'compliance', date: 'Jan 28, 2026', status: 'completed' },
  { id: 'RPT-004', name: 'Incident Analysis Q4', type: 'quarterly', date: 'Jan 15, 2026', status: 'completed' },
  { id: 'RPT-005', name: 'Daily Safety Report', type: 'daily', date: 'Feb 10, 2026', status: 'processing' },
]

const templates = [
  { name: 'Daily Safety Report', description: 'Daily summary of incidents and KPIs' },
  { name: 'Weekly Analysis', description: 'Weekly trends and recommendations' },
  { name: 'Monthly Executive', description: 'Executive summary for leadership' },
  { name: 'Compliance Report', description: 'ISO 45001 & OSHA documentation' },
]

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="mt-1 text-sm text-gray-400">Generate and download safety reports</p>
        </div>
        <button className="btn-primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Reports */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Recent Reports</h3>
          </div>
          <div className="divide-y divide-dashboard-border">
            {reports.map((report) => (
              <div key={report.id} className="p-4 hover:bg-dashboard-bg/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary-500/10">
                      <DocumentChartBarIcon className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{report.name}</p>
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        {report.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={clsx(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      report.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                    )}>
                      {report.status}
                    </span>
                    {report.status === 'completed' && (
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Templates */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Templates</h3>
          </div>
          <div className="card-body space-y-3">
            {templates.map((template) => (
              <button
                key={template.name}
                className="w-full p-3 text-left rounded-lg border border-dashboard-border hover:border-primary-500/50 transition-colors"
              >
                <p className="font-medium text-white">{template.name}</p>
                <p className="text-sm text-gray-500">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
