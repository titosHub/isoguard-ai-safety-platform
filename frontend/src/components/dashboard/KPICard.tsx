import { clsx } from 'clsx'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'

interface KPICardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ComponentType<{ className?: string }>
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple'
}

const colorClasses = {
  red: {
    bg: 'bg-red-500/10',
    icon: 'text-red-400',
    border: 'hover:border-red-500/50',
  },
  blue: {
    bg: 'bg-blue-500/10',
    icon: 'text-blue-400',
    border: 'hover:border-blue-500/50',
  },
  green: {
    bg: 'bg-green-500/10',
    icon: 'text-green-400',
    border: 'hover:border-green-500/50',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    icon: 'text-yellow-400',
    border: 'hover:border-yellow-500/50',
  },
  purple: {
    bg: 'bg-purple-500/10',
    icon: 'text-purple-400',
    border: 'hover:border-purple-500/50',
  },
}

export default function KPICard({ title, value, change, trend, icon: Icon, color }: KPICardProps) {
  const colors = colorClasses[color]
  
  // For safety metrics, down is usually good (fewer incidents)
  const isPositive = (trend === 'down' && color === 'red') || 
                     (trend === 'down' && color === 'yellow') ||
                     (trend === 'up' && color === 'green')

  return (
    <div className={clsx('stat-card', colors.border)}>
      <div className="flex items-start justify-between">
        <div className={clsx('p-2 rounded-lg', colors.bg)}>
          <Icon className={clsx('w-5 h-5', colors.icon)} />
        </div>
        <div className={clsx(
          'flex items-center gap-1 text-xs font-medium',
          isPositive ? 'text-green-400' : 'text-red-400'
        )}>
          {trend === 'up' ? (
            <ArrowUpIcon className="w-3 h-3" />
          ) : (
            <ArrowDownIcon className="w-3 h-3" />
          )}
          {change}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="mt-1 text-sm text-gray-500">{title}</p>
      </div>
    </div>
  )
}
