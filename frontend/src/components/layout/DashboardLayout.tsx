import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HomeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  UserGroupIcon,
  BellAlertIcon,
  ShieldExclamationIcon,
  CubeIcon,
} from '@heroicons/react/24/outline'
import AlertScreen from '../AlertScreen'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Airport Security', href: '/airport-security', icon: ShieldExclamationIcon },
  { name: 'Mining Safety', href: '/mining-safety', icon: CubeIcon },
  { name: 'Incidents', href: '/incidents', icon: ExclamationTriangleIcon },
  { name: 'Forensics', href: '/forensics', icon: MagnifyingGlassIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Cameras', href: '/cameras', icon: VideoCameraIcon },
  { name: 'Sites', href: '/sites', icon: BuildingOfficeIcon },
  { name: 'Media Upload', href: '/media', icon: CloudArrowUpIcon },
  { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
  { name: 'Admin', href: '/admin', icon: UserGroupIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alertScreenOpen, setAlertScreenOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-dashboard-card border-r border-dashboard-border transform transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-dashboard-border">
          <img 
            src="/isoguard-logo.svg" 
            alt="IsoGuard.Ai" 
            className="h-8 w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx(
                  'sidebar-link',
                  isActive && 'sidebar-link-active'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-dashboard-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">Safety Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-dashboard-card/80 backdrop-blur-lg border-b border-dashboard-border lg:px-8">
          <button
            type="button"
            className="p-2 -ml-2 text-gray-400 lg:hidden hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md mx-4">
            <input
              type="text"
              placeholder="Search incidents, cameras, sites..."
              className="input-field"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Alert Screen Button */}
            <button 
              onClick={() => setAlertScreenOpen(true)}
              className="relative p-2 text-red-400 hover:text-red-300 animate-pulse"
              title="Open Alert Monitor"
            >
              <BellAlertIcon className="w-6 h-6" />
              <span className="absolute top-0 right-0 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center">3</span>
              </span>
            </button>
            <button className="relative p-2 text-gray-400 hover:text-white">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white lg:hidden">
              <UserCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Alert Screen */}
      <AlertScreen 
        isOpen={alertScreenOpen} 
        onClose={() => setAlertScreenOpen(false)} 
      />
    </div>
  )
}
