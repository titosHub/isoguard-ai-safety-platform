import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const incidentsByType = [
  { name: 'PPE Violation', value: 45, color: '#ef4444' },
  { name: 'Proximity Alert', value: 28, color: '#f59e0b' },
  { name: 'Zone Violation', value: 18, color: '#3b82f6' },
  { name: 'Equipment Hazard', value: 9, color: '#8b5cf6' },
]

const shiftData = [
  { shift: 'Morning', incidents: 12, nearMisses: 8 },
  { shift: 'Afternoon', incidents: 8, nearMisses: 5 },
  { shift: 'Night', incidents: 5, nearMisses: 3 },
]

const monthlyTrend = [
  { month: 'Aug', incidents: 28, score: 72 },
  { month: 'Sep', incidents: 24, score: 75 },
  { month: 'Oct', incidents: 22, score: 77 },
  { month: 'Nov', incidents: 18, score: 80 },
  { month: 'Dec', incidents: 15, score: 82 },
  { month: 'Jan', incidents: 12, score: 85 },
]

export default function Analytics() {
  const [period, setPeriod] = useState('30d')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-400">Deep dive into safety performance metrics</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-dashboard-card text-gray-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Incidents by Type */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Incidents by Type</h3>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incidentsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {incidentsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {incidentsByType.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shift Analysis */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Shift Analysis</h3>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shiftData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="shift" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="incidents" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="nearMisses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-white">Safety Performance Trend</h3>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                  <Line yAxisId="right" type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
