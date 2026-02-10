import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface SafetyScoreCardProps {
  score: number
  trend: 'improving' | 'stable' | 'declining'
  trir: number
  ltifr: number
}

export default function SafetyScoreCard({ score, trend, trir, ltifr }: SafetyScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-blue-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 75) return 'Good'
    if (score >= 60) return 'Fair'
    if (score >= 40) return 'Needs Improvement'
    return 'Critical'
  }

  const getTrendIcon = () => {
    if (trend === 'improving') return <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
    if (trend === 'declining') return <ArrowTrendingDownIcon className="w-5 h-5 text-red-400" />
    return null
  }

  const circumference = 2 * Math.PI * 58
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="card p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Overall Safety Score</h3>
        <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-dashboard-bg">
          {getTrendIcon()}
          <span className={clsx(
            trend === 'improving' && 'text-green-400',
            trend === 'declining' && 'text-red-400',
            trend === 'stable' && 'text-gray-400'
          )}>
            {trend.charAt(0).toUpperCase() + trend.slice(1)}
          </span>
        </div>
      </div>

      {/* Score Circle */}
      <div className="flex items-center justify-center my-6">
        <div className="relative">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="58"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-dashboard-bg"
            />
            <circle
              cx="72"
              cy="72"
              r="58"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={getScoreColor(score)}
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={clsx('text-4xl font-bold', getScoreColor(score))}>{score}</span>
            <span className="text-xs text-gray-500">{getScoreLabel(score)}</span>
          </div>
        </div>
      </div>

      {/* TRIR & LTIFR */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashboard-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{trir}</p>
          <p className="text-xs text-gray-500">TRIR</p>
          <p className="text-xs text-gray-600">vs 3.0 industry avg</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{ltifr}</p>
          <p className="text-xs text-gray-500">LTIFR</p>
          <p className="text-xs text-gray-600">vs 1.5 industry avg</p>
        </div>
      </div>
    </div>
  )
}
