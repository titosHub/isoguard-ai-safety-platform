import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  BellAlertIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  Squares2X2Icon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import AlertScreen from '../AlertScreen'
import { useSector } from '../../solutions/SectorContext'
import { solutionPath } from '../../solutions/registry'

interface SimpleNavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const systemNavigation: SimpleNavItem[] = [
  { name: 'Executive Board', href: '/executive', icon: ShieldCheckIcon },
  { name: 'Admin', href: '/admin', icon: UserGroupIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alertScreenOpen, setAlertScreenOpen] = useState(false)
  const location = useLocation()
  const { activeSolution } = useSector()

  const isActivePath = (href: string) => location.pathname === href

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
        'fixed inset-y-0 left-0 z-50 w-64 bg-dashboard-card border-r border-dashboard-border transform transition-transform duration-300 lg:translate-x-0 flex flex-col',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo - Fixed at top */}
        <div className="flex-shrink-0 flex items-center gap-3 px-6 py-5 border-b border-dashboard-border">
          <img 
            src="/isoguard-logo.svg" 
            alt="IsoGuard.Ai" 
            className="h-8 w-auto"
          />
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* Solution switch (landing page) */}
          <NavLink
            to="/solutions"
            className={clsx(
              'sidebar-link',
              isActivePath('/solutions') && 'sidebar-link-active'
            )}
          >
            <Squares2X2Icon className="w-5 h-5" />
            Change Solution
          </NavLink>

          {activeSolution ? (
            <>
              {/* Module Label */}
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {activeSolution.name} Dashboard
                </p>
              </div>

              {activeSolution.moduleNav.map((item) => {
                const href = solutionPath(activeSolution.id, item.slug)
                const isActive = isActivePath(href)

                return (
                  <NavLink
                    key={href}
                    to={href}
                    className={clsx('sidebar-link', isActive && 'sidebar-link-active')}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                )
              })}

              {/* Tools Label (sector-specific) */}
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</p>
              </div>

              {activeSolution.toolsNav.map((item) => {
                const href = solutionPath(activeSolution.id, item.slug)
                const isActive = isActivePath(href)

                return (
                  <NavLink
                    key={href}
                    to={href}
                    className={clsx('sidebar-link', isActive && 'sidebar-link-active')}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                )
              })}
            </>
          ) : (
            <div className="pt-4">
              <p className="px-3 text-sm text-gray-500">
                Select a solution to load a sector-specific dashboard.
              </p>
            </div>
          )}

          {/* System Label */}
          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">System</p>
          </div>

          {systemNavigation.map((item) => {
            const isActive = isActivePath(item.href)
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx('sidebar-link', isActive && 'sidebar-link-active')}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* User section - Fixed at bottom */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-dashboard-border">
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
