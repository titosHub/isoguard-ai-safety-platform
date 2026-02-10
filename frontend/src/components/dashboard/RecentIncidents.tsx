import { clsx } from 'clsx'
import { 
  ExclamationTriangleIcon, 
  ShieldExclamationIcon,
  MapPinIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'

const incidents = [
  {
    id: 'INC-001',
    type: 'PPE Violation',
    description: 'Worker detected without hardhat in Zone A',
    severity: 'high',
    status: 'open',
    location: 'Zone A - Heavy Equipment',
    time: '10 minutes ago',
    camera: 'CAM-01',
  },
  {
    id: 'INC-002',
    type: 'Proximity Alert',
    description: 'Person detected near moving machinery',
    severity: 'critical',
    status: 'investigating',
    location: 'Zone B - Loading Dock',
    time: '25 minutes ago',
    camera: 'CAM-03',
  },
  {
    id: 'INC-003',
    type: 'Zone Violation',
    description: 'Unauthorized entry in restricted area',
    severity: 'medium',
    status: 'resolved',
    location: 'Zone C - Assembly Line',
    time: '1 hour ago',
    camera: 'CAM-05',
  },
  {
    id: 'INC-004',
    type: 'PPE Violation',
    description: 'Missing safety vest detected',
    severity: 'low',
    status: 'resolved',
    location: 'Zone D - Warehouse',
    time: '2 hours ago',
    camera: 'CAM-02',
  },
]

const severityStyles = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/10 text-green-400 border-green-500/30',
}

const statusStyles = {
  open: 'bg-red-500/10 text-red-400',
  investigating: 'bg-yellow-500/10 text-yellow-400',
  resolved: 'bg-green-500/10 text-green-400',
}

export default function RecentIncidents() {
  return (
    <div className="card h-full">
      <div className="card-header flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Recent Incidents</h3>
          <p className="text-sm text-gray-500">Latest safety violations detected</p>
        </div>
        <button className="btn-secondary text-xs">View All</button>
      </div>
      <div className="divide-y divide-dashboard-border">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="p-4 hover:bg-dashboard-bg/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className={clsx(
                'p-2 rounded-lg border',
                severityStyles[incident.severity as keyof typeof severityStyles]
              )}>
                {incident.type.includes('PPE') ? (
                  <ShieldExclamationIcon className="w-5 h-5" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">{incident.id}</span>
                  <span className={clsx(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    statusStyles[incident.status as keyof typeof statusStyles]
                  )}>
                    {incident.status}
                  </span>
                </div>
                <p className="mt-1 font-medium text-white">{incident.type}</p>
                <p className="mt-0.5 text-sm text-gray-400">{incident.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    {incident.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {incident.time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
