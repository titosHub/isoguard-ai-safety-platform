import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  ShieldExclamationIcon,
  CubeIcon,
  BriefcaseIcon,
  UserGroupIcon,
  FireIcon,
  ArrowTrendingDownIcon,
  ArrowRightIcon,
  BellAlertIcon,
  SpeakerWaveIcon,
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

      {/* Project Modules Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Airport Security Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="bg-gradient-to-br from-blue-900/50 to-gray-800 rounded-xl border border-blue-500/30 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <ShieldExclamationIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Airport Security</h3>
                <p className="text-xs text-gray-400">Terminal A Monitoring</p>
              </div>
            </div>
            <Link to="/airport-security" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
              View Details <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <BriefcaseIcon className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">Unattended Bags</span>
              </div>
              <p className="text-xl font-bold text-orange-400">3</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <BellAlertIcon className="w-4 h-4 text-red-400" />
                <span className="text-xs text-gray-400">Active Alerts</span>
              </div>
              <p className="text-xl font-bold text-red-400">5</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <UserGroupIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400">Loitering</span>
              </div>
              <p className="text-xl font-bold text-yellow-400">2</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">6 cameras online</span>
            <span className="flex items-center gap-1 text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live Monitoring
            </span>
          </div>
        </motion.div>

        {/* Mining Safety Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-gradient-to-br from-amber-900/50 to-gray-800 rounded-xl border border-amber-500/30 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <CubeIcon className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Mining Safety</h3>
                <p className="text-xs text-gray-400">All Sites Overview</p>
              </div>
            </div>
            <Link to="/mining-safety" className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300">
              View Details <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <ArrowTrendingDownIcon className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Fatality ↓</span>
              </div>
              <p className="text-xl font-bold text-green-400">34%</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <CubeIcon className="w-4 h-4 text-red-400" />
                <span className="text-xs text-gray-400">FOG</span>
              </div>
              <p className="text-xl font-bold text-red-400">2</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <FireIcon className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">TMM</span>
              </div>
              <p className="text-xl font-bold text-orange-400">4</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <SpeakerWaveIcon className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">NIHL</span>
              </div>
              <p className="text-xl font-bold text-blue-400">776</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Gold: 15</span>
              <span className="text-gray-400">Platinum: 18</span>
              <span className="text-gray-400">Coal: 5</span>
            </div>
            <span className="flex items-center gap-1 text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Active
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
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
