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
  ChevronDownIcon,
  ChevronRightIcon,
  WrenchScrewdriverIcon,
  BuildingStorefrontIcon,
  HeartIcon,
  HomeModernIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline'
import AlertScreen from '../AlertScreen'

// Navigation categories with expandable sections
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavCategory {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  items: NavItem[];
}

const mainNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
]

const categories: NavCategory[] = [
  {
    name: 'Mining',
    icon: CubeIcon,
    color: 'text-amber-400',
    items: [
      { name: 'Safety Monitor', href: '/mining-safety', icon: ShieldExclamationIcon },
      { name: 'Incidents', href: '/mining/incidents', icon: ExclamationTriangleIcon },
      { name: 'Analytics', href: '/mining/analytics', icon: ChartBarIcon },
    ],
  },
  {
    name: 'Manufacturing',
    icon: WrenchScrewdriverIcon,
    color: 'text-blue-400',
    items: [
      { name: 'Safety Monitor', href: '/manufacturing/safety', icon: ShieldExclamationIcon },
      { name: 'Incidents', href: '/manufacturing/incidents', icon: ExclamationTriangleIcon },
      { name: 'Analytics', href: '/manufacturing/analytics', icon: ChartBarIcon },
    ],
  },
  {
    name: 'Warehouses',
    icon: BuildingStorefrontIcon,
    color: 'text-purple-400',
    items: [
      { name: 'Safety Monitor', href: '/warehouse/safety', icon: ShieldExclamationIcon },
      { name: 'Incidents', href: '/warehouse/incidents', icon: ExclamationTriangleIcon },
      { name: 'Analytics', href: '/warehouse/analytics', icon: ChartBarIcon },
    ],
  },
  {
    name: 'Health',
    icon: HeartIcon,
    color: 'text-red-400',
    items: [
      { name: 'Safety Monitor', href: '/health/safety', icon: ShieldExclamationIcon },
      { name: 'Incidents', href: '/health/incidents', icon: ExclamationTriangleIcon },
      { name: 'Analytics', href: '/health/analytics', icon: ChartBarIcon },
    ],
  },
  {
    name: 'Construction',
    icon: HomeModernIcon,
    color: 'text-orange-400',
    items: [
      { name: 'Safety Monitor', href: '/construction/safety', icon: ShieldExclamationIcon },
      { name: 'Incidents', href: '/incidents', icon: ExclamationTriangleIcon },
      { name: 'Sites', href: '/sites', icon: BuildingOfficeIcon },
      { name: 'Analytics', href: '/construction/analytics', icon: ChartBarIcon },
    ],
  },
  {
    name: 'Airport',
    icon: PaperAirplaneIcon,
    color: 'text-cyan-400',
    items: [
      { name: 'Security Monitor', href: '/airport-security', icon: ShieldExclamationIcon },
      { name: 'Incidents', href: '/airport/incidents', icon: ExclamationTriangleIcon },
      { name: 'Analytics', href: '/airport/analytics', icon: ChartBarIcon },
    ],
  },
]

const toolsNavigation: NavItem[] = [
  { name: 'Forensics', href: '/forensics', icon: MagnifyingGlassIcon },
  { name: 'Cameras', href: '/cameras', icon: VideoCameraIcon },
  { name: 'Media Upload', href: '/media', icon: CloudArrowUpIcon },
  { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
]

const adminNavigation: NavItem[] = [
  { name: 'Admin', href: '/admin', icon: UserGroupIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alertScreenOpen, setAlertScreenOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Mining', 'Airport'])
  const location = useLocation()

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    )
  }

  const isCategoryActive = (category: NavCategory) => {
    return category.items.some(item => location.pathname === item.href)
  }

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
          {/* Main Navigation */}
          {mainNavigation.map((item) => {
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

          {/* Category Label */}
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Industries</p>
          </div>

          {/* Categories */}
          {categories.map((category) => {
            const isExpanded = expandedCategories.includes(category.name)
            const isActive = isCategoryActive(category)
            
            return (
              <div key={category.name} className="space-y-1">
                <button
                  onClick={() => toggleCategory(category.name)}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <category.icon className={clsx('w-5 h-5', category.color)} />
                    <span>{category.name}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDownIcon className="w-4 h-4" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="ml-4 pl-4 border-l border-gray-700 space-y-1">
                    {category.items.map((item) => {
                      const isItemActive = location.pathname === item.href
                      return (
                        <NavLink
                          key={item.href}
                          to={item.href}
                          className={clsx(
                            'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                            isItemActive
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.name}
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {/* Tools Label */}
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</p>
          </div>

          {/* Tools Navigation */}
          {toolsNavigation.map((item) => {
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

          {/* Admin Label */}
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">System</p>
          </div>

          {/* Admin Navigation */}
          {adminNavigation.map((item) => {
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
