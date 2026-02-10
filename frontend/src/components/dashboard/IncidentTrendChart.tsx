import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const data = [
  { date: 'Jan 1', incidents: 4, nearMisses: 8, resolved: 3 },
  { date: 'Jan 8', incidents: 3, nearMisses: 6, resolved: 4 },
  { date: 'Jan 15', incidents: 5, nearMisses: 9, resolved: 5 },
  { date: 'Jan 22', incidents: 2, nearMisses: 5, resolved: 4 },
  { date: 'Jan 29', incidents: 4, nearMisses: 7, resolved: 3 },
  { date: 'Feb 5', incidents: 3, nearMisses: 4, resolved: 5 },
  { date: 'Feb 12', incidents: 2, nearMisses: 3, resolved: 4 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-lg bg-dashboard-card border border-dashboard-border shadow-xl">
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs text-gray-400">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function IncidentTrendChart() {
  return (
    <div className="card h-full">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-white">Incident Trends</h3>
        <p className="text-sm text-gray-500">Weekly incident and near-miss tracking</p>
      </div>
      <div className="card-body">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="incidentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="nearMissGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="incidents"
                name="Incidents"
                stroke="#ef4444"
                fill="url(#incidentGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="nearMisses"
                name="Near Misses"
                stroke="#f59e0b"
                fill="url(#nearMissGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="#10b981"
                fill="url(#resolvedGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
