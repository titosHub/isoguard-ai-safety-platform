import { useState } from 'react'
import { clsx } from 'clsx'

const tabs = ['General', 'Notifications', 'Security', 'Integrations', 'AI Model']

export default function Settings() {
  const [activeTab, setActiveTab] = useState('General')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">Configure platform settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-dashboard-border">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-1 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="card p-6">
        {activeTab === 'General' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Organization Name</label>
              <input type="text" className="input-field" defaultValue="Acme Industries" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time Zone</label>
              <select className="input-field">
                <option>America/New_York (EST)</option>
                <option>America/Los_Angeles (PST)</option>
                <option>Europe/London (GMT)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Default Dashboard View</label>
              <select className="input-field">
                <option>Executive KPIs</option>
                <option>Operations View</option>
                <option>Safety Officer View</option>
              </select>
            </div>
            <button className="btn-primary">Save Changes</button>
          </div>
        )}

        {activeTab === 'Notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Critical Incident Alerts</p>
                <p className="text-sm text-gray-500">Receive immediate alerts for critical incidents</p>
              </div>
              <button className="relative w-12 h-6 bg-primary-600 rounded-full">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Daily Summary</p>
                <p className="text-sm text-gray-500">Receive daily safety summary email</p>
              </div>
              <button className="relative w-12 h-6 bg-primary-600 rounded-full">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Predictive Alerts</p>
                <p className="text-sm text-gray-500">Get AI-powered risk predictions</p>
              </div>
              <button className="relative w-12 h-6 bg-gray-600 rounded-full">
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'AI Model' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Detection Confidence Threshold</label>
              <input type="range" className="w-full" min="0" max="100" defaultValue="75" />
              <p className="text-sm text-gray-500 mt-1">75%</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Detection Types</label>
              <div className="space-y-2">
                {['PPE Detection', 'Proximity Detection', 'Zone Monitoring', 'Behavior Analysis'].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-gray-300">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="btn-primary">Update Model Settings</button>
          </div>
        )}
      </div>
    </div>
  )
}
