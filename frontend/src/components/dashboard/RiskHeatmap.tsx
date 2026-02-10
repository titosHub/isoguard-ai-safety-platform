import { clsx } from 'clsx'

const zones = [
  { id: 1, name: 'Zone A - Heavy Equipment', risk: 85, incidents: 8 },
  { id: 2, name: 'Zone B - Loading Dock', risk: 62, incidents: 4 },
  { id: 3, name: 'Zone C - Assembly Line', risk: 45, incidents: 2 },
  { id: 4, name: 'Zone D - Warehouse', risk: 30, incidents: 1 },
  { id: 5, name: 'Zone E - Office Area', risk: 15, incidents: 0 },
]

const getRiskColor = (risk: number) => {
  if (risk >= 75) return 'bg-red-500/20 border-red-500/50 text-red-400'
  if (risk >= 50) return 'bg-orange-500/20 border-orange-500/50 text-orange-400'
  if (risk >= 25) return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
  return 'bg-green-500/20 border-green-500/50 text-green-400'
}

const getRiskLabel = (risk: number) => {
  if (risk >= 75) return 'Critical'
  if (risk >= 50) return 'High'
  if (risk >= 25) return 'Medium'
  return 'Low'
}

export default function RiskHeatmap() {
  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-white">Location Risk Analysis</h3>
        <p className="text-sm text-gray-500">Risk scores by zone</p>
      </div>
      <div className="card-body">
        <div className="space-y-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={clsx(
                'p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02]',
                getRiskColor(zone.risk)
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{zone.name}</p>
                  <p className="text-sm text-gray-500">{zone.incidents} incidents this month</p>
                </div>
                <div className="text-right">
                  <p className={clsx('text-2xl font-bold', getRiskColor(zone.risk).split(' ').pop())}>
                    {zone.risk}
                  </p>
                  <p className="text-xs text-gray-500">{getRiskLabel(zone.risk)} Risk</p>
                </div>
              </div>
              {/* Risk bar */}
              <div className="mt-3 h-1.5 bg-dashboard-bg rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-500',
                    zone.risk >= 75 ? 'bg-red-500' :
                    zone.risk >= 50 ? 'bg-orange-500' :
                    zone.risk >= 25 ? 'bg-yellow-500' : 'bg-green-500'
                  )}
                  style={{ width: `${zone.risk}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
