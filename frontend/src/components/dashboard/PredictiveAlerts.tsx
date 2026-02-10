import { clsx } from 'clsx'
import { 
  BoltIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

const alerts = [
  {
    id: 1,
    type: 'prediction',
    title: 'High Risk Period Ahead',
    description: 'Monday morning shift shows 35% higher incident probability',
    action: 'Increase supervision',
    priority: 'high',
    icon: BoltIcon,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Zone A Pattern Detected',
    description: 'PPE violations increasing in heavy equipment area',
    action: 'Schedule training',
    priority: 'medium',
    icon: ExclamationTriangleIcon,
  },
  {
    id: 3,
    type: 'recommendation',
    title: 'Safety Briefing Recommended',
    description: 'Pre-shift briefing can reduce Friday incidents by 23%',
    action: 'Set reminder',
    priority: 'low',
    icon: LightBulbIcon,
  },
]

const priorityStyles = {
  high: 'border-red-500/30 bg-red-500/5',
  medium: 'border-yellow-500/30 bg-yellow-500/5',
  low: 'border-blue-500/30 bg-blue-500/5',
}

const iconStyles = {
  high: 'text-red-400 bg-red-500/10',
  medium: 'text-yellow-400 bg-yellow-500/10',
  low: 'text-blue-400 bg-blue-500/10',
}

export default function PredictiveAlerts() {
  return (
    <div className="card h-full">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <BoltIcon className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
        </div>
        <p className="text-sm text-gray-500">Predictive alerts and recommendations</p>
      </div>
      <div className="card-body space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={clsx(
              'p-4 rounded-lg border transition-all duration-200 hover:scale-[1.01]',
              priorityStyles[alert.priority as keyof typeof priorityStyles]
            )}
          >
            <div className="flex items-start gap-3">
              <div className={clsx(
                'p-2 rounded-lg',
                iconStyles[alert.priority as keyof typeof iconStyles]
              )}>
                <alert.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{alert.title}</p>
                <p className="mt-1 text-xs text-gray-400">{alert.description}</p>
                <button className="mt-2 flex items-center gap-1 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors">
                  {alert.action}
                  <ArrowRightIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Confidence indicator */}
        <div className="pt-4 border-t border-dashboard-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">AI Confidence Level</span>
            <span className="text-green-400 font-medium">82%</span>
          </div>
          <div className="mt-2 h-1.5 bg-dashboard-bg rounded-full overflow-hidden">
            <div className="h-full w-[82%] bg-green-500 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
