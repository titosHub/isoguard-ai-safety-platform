import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import SafetyScoreCard from '../components/dashboard/SafetyScoreCard'
import KPICard from '../components/dashboard/KPICard'
import IncidentTrendChart from '../components/dashboard/IncidentTrendChart'
import RiskHeatmap from '../components/dashboard/RiskHeatmap'
import RecentIncidents from '../components/dashboard/RecentIncidents'
import PredictiveAlerts from '../components/dashboard/PredictiveAlerts'

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('30d')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Safety Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">
            Real-time safety monitoring and analytics
          </p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-dashboard-card text-gray-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Score + Executive KPIs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Safety Score */}
        <motion.div 
          className="lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SafetyScoreCard
            score={78.5}
            trend="improving"
            trir={2.1}
            ltifr={0.8}
          />
        </motion.div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-8 lg:grid-cols-4">
          <KPICard
            title="Open Incidents"
            value="12"
            change="-23%"
            trend="down"
            icon={ExclamationTriangleIcon}
            color="red"
          />
          <KPICard
            title="Mean Time to Detect"
            value="2.5 min"
            change="-15%"
            trend="down"
            icon={ClockIcon}
            color="blue"
          />
          <KPICard
            title="Compliance Rate"
            value="94.2%"
            change="+3.2%"
            trend="up"
            icon={CheckCircleIcon}
            color="green"
          />
          <KPICard
            title="Near Misses"
            value="8"
            change="-12%"
            trend="down"
            icon={EyeIcon}
            color="yellow"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <IncidentTrendChart />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <RiskHeatmap />
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <RecentIncidents />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <PredictiveAlerts />
        </motion.div>
      </div>
    </div>
  )
}
