import { useState } from 'react'
import { VideoCameraIcon, SignalIcon, PlusIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import DeviceCamera from '../components/DeviceCamera'

const cameras = [
  { id: 'CAM-01', name: 'Main Entrance', location: 'Building A', status: 'online', fps: 25, detections: 42 },
  { id: 'CAM-02', name: 'Loading Dock', location: 'Warehouse', status: 'online', fps: 30, detections: 28 },
  { id: 'CAM-03', name: 'Assembly Line 1', location: 'Factory Floor', status: 'online', fps: 25, detections: 35 },
  { id: 'CAM-04', name: 'Equipment Area', location: 'Zone A', status: 'offline', fps: 0, detections: 0 },
  { id: 'CAM-05', name: 'Storage Area', location: 'Warehouse B', status: 'online', fps: 25, detections: 15 },
  { id: 'CAM-06', name: 'Parking Lot', location: 'External', status: 'warning', fps: 20, detections: 8 },
]

export default function Cameras() {
  const [showDeviceCamera, setShowDeviceCamera] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cameras</h1>
          <p className="mt-1 text-sm text-gray-400">Monitor and manage connected cameras</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowDeviceCamera(!showDeviceCamera)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showDeviceCamera ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <DevicePhoneMobileIcon className="w-4 h-4" />
            Device Camera
          </button>
          <button className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Camera
          </button>
        </div>
      </div>

      {/* Device Camera Section */}
      {showDeviceCamera && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeviceCamera 
            onCapture={(frame) => console.log('Captured:', frame)}
            onAnalyze={(frame) => console.log('Analyzed:', frame)}
          />
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Analysis</h3>
            <p className="text-gray-400 text-sm mb-4">
              Use your device camera to capture frames for instant safety analysis. 
              Perfect for inspectors or spot checks.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Real-time PPE detection
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Face blur for privacy
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Save to evidence library
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Camera Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cameras.map((camera) => (
          <div key={camera.id} className="card overflow-hidden hover:border-primary-500/50 transition-colors">
            {/* Camera Preview Placeholder */}
            <div className="relative h-40 bg-dashboard-bg flex items-center justify-center">
              <VideoCameraIcon className="w-12 h-12 text-gray-600" />
              <div className={clsx(
                'absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                camera.status === 'online' && 'bg-green-500/20 text-green-400',
                camera.status === 'offline' && 'bg-red-500/20 text-red-400',
                camera.status === 'warning' && 'bg-yellow-500/20 text-yellow-400'
              )}>
                <SignalIcon className="w-3 h-3" />
                {camera.status}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{camera.name}</p>
                  <p className="text-sm text-gray-500">{camera.location}</p>
                </div>
                <span className="text-xs font-mono text-gray-500">{camera.id}</span>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashboard-border">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{camera.fps}</p>
                  <p className="text-xs text-gray-500">FPS</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{camera.detections}</p>
                  <p className="text-xs text-gray-500">Detections Today</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
