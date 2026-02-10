import { useState } from 'react'
import { clsx } from 'clsx'
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

const incidents = [
  { id: 'INC-001', type: 'PPE Violation', severity: 'high', status: 'open', site: 'Main Site', camera: 'CAM-01', time: '10 min ago' },
  { id: 'INC-002', type: 'Proximity Alert', severity: 'critical', status: 'investigating', site: 'Warehouse B', camera: 'CAM-03', time: '25 min ago' },
  { id: 'INC-003', type: 'Zone Violation', severity: 'medium', status: 'resolved', site: 'Main Site', camera: 'CAM-05', time: '1 hour ago' },
  { id: 'INC-004', type: 'PPE Violation', severity: 'low', status: 'resolved', site: 'Site C', camera: 'CAM-02', time: '2 hours ago' },
  { id: 'INC-005', type: 'Equipment Hazard', severity: 'high', status: 'open', site: 'Main Site', camera: 'CAM-04', time: '3 hours ago' },
]

const severityColors = {
  critical: 'bg-red-500/10 text-red-400',
  high: 'bg-orange-500/10 text-orange-400',
  medium: 'bg-yellow-500/10 text-yellow-400',
  low: 'bg-green-500/10 text-green-400',
}

const statusColors = {
  open: 'bg-red-500/10 text-red-400',
  investigating: 'bg-yellow-500/10 text-yellow-400',
  resolved: 'bg-green-500/10 text-green-400',
  closed: 'bg-gray-500/10 text-gray-400',
}

export default function Incidents() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Incidents</h1>
          <p className="mt-1 text-sm text-gray-400">Manage and track safety incidents</p>
        </div>
        <button className="btn-primary">
          <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
          Report Incident
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search incidents..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'open', 'investigating', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={clsx(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors capitalize',
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-dashboard-bg text-gray-400 hover:text-white'
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-dashboard-bg">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Camera</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dashboard-border">
            {incidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-dashboard-bg/50 cursor-pointer">
                <td className="px-6 py-4 text-sm font-mono text-gray-300">{incident.id}</td>
                <td className="px-6 py-4 text-sm text-white">{incident.type}</td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    'px-2 py-1 text-xs font-medium rounded-full capitalize',
                    severityColors[incident.severity as keyof typeof severityColors]
                  )}>
                    {incident.severity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    'px-2 py-1 text-xs font-medium rounded-full capitalize',
                    statusColors[incident.status as keyof typeof statusColors]
                  )}>
                    {incident.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">{incident.site}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{incident.camera}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{incident.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
