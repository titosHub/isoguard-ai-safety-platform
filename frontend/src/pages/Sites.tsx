import { BuildingOfficeIcon, MapPinIcon, PlusIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

const sites = [
  { id: 'site-001', name: 'Main Construction Site', address: '123 Industrial Ave', cameras: 5, zones: 4, score: 85 },
  { id: 'site-002', name: 'Warehouse Complex B', address: '456 Storage Rd', cameras: 3, zones: 2, score: 78 },
  { id: 'site-003', name: 'Manufacturing Plant', address: '789 Factory Blvd', cameras: 8, zones: 6, score: 92 },
  { id: 'site-004', name: 'Distribution Center', address: '321 Logistics Way', cameras: 4, zones: 3, score: 71 },
]

export default function Sites() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sites</h1>
          <p className="mt-1 text-sm text-gray-400">Manage monitored locations</p>
        </div>
        <button className="btn-primary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Site
        </button>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {sites.map((site) => (
          <div key={site.id} className="card p-6 hover:border-primary-500/50 transition-colors cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary-500/10">
                  <BuildingOfficeIcon className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{site.name}</h3>
                  <p className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPinIcon className="w-4 h-4" />
                    {site.address}
                  </p>
                </div>
              </div>
              <div className={clsx(
                'text-2xl font-bold',
                site.score >= 80 ? 'text-green-400' : site.score >= 60 ? 'text-yellow-400' : 'text-red-400'
              )}>
                {site.score}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-dashboard-border">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{site.cameras}</p>
                <p className="text-xs text-gray-500">Cameras</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{site.zones}</p>
                <p className="text-xs text-gray-500">Zones</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{site.score}</p>
                <p className="text-xs text-gray-500">Safety Score</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
