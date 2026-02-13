import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import ReportBuilder from './pages/ReportBuilder'
import SolutionsLanding from './pages/solutions/SolutionsLanding'
import SectorRouteSync from './solutions/SectorRouteSync'
import { useSector } from './solutions/SectorContext'
import { solutionPath } from './solutions/registry'
import { SectorIndexRedirect, SectorModulePage, SectorToolRouter, SectorLegacyRedirect } from './pages/solutions/SectorRoutes'

function SectorShell() {
  return (
    <>
      <SectorRouteSync />
      <Outlet />
    </>
  )
}

function DashboardHomeRedirect() {
  const { activeSolution } = useSector()

  if (!activeSolution) return <Navigate to="/solutions" replace />
  return <Navigate to={solutionPath(activeSolution.id, activeSolution.defaultSlug)} replace />
}

function App() {
  return (
    <Routes>
      {/* New default home */}
      <Route path="/" element={<Navigate to="/solutions" replace />} />
      <Route path="/solutions" element={<SolutionsLanding />} />

      {/* App shell (sidebar + header) */}
      <Route element={<DashboardLayout />}>
        {/* Legacy dashboard entrypoint */}
        <Route path="dashboard" element={<DashboardHomeRedirect />} />

        {/* Sector module: hub-and-spoke routes */}
        <Route path="s/:sector" element={<SectorShell />}>
          <Route index element={<SectorIndexRedirect />} />

          {/* module pages */}
          <Route path="overview" element={<SectorModulePage slug="overview" />} />
          <Route path="incidents" element={<SectorModulePage slug="incidents" />} />
          <Route path="analytics" element={<SectorModulePage slug="analytics" />} />

          {/* tool pages (sector-specific sidebar drives these) */}
          <Route path="cameras" element={<SectorToolRouter slug="cameras" />} />
          <Route path="reports" element={<SectorToolRouter slug="reports" />} />
          <Route path="forensics" element={<SectorToolRouter slug="forensics" />} />
          <Route path="media" element={<SectorToolRouter slug="media" />} />

          {/* mining-specific tools */}
          <Route path="ppe-compliance" element={<SectorToolRouter slug="ppe-compliance" />} />
          <Route path="tailing-dam" element={<SectorToolRouter slug="tailing-dam" />} />
          <Route path="shift-reports" element={<SectorToolRouter slug="shift-reports" />} />

          {/* airport-specific tools */}
          <Route path="perimeter-security" element={<SectorToolRouter slug="perimeter-security" />} />
          <Route path="passenger-flow" element={<SectorToolRouter slug="passenger-flow" />} />
          <Route path="queue-management" element={<SectorToolRouter slug="queue-management" />} />
          <Route path="baggage-tracking" element={<SectorToolRouter slug="baggage-tracking" />} />

          {/* unknown */}
          <Route path="*" element={<SectorIndexRedirect />} />
        </Route>

        {/* System (global) */}
        <Route path="reports/builder" element={<ReportBuilder />} />
        <Route path="admin" element={<Admin />} />
        <Route path="settings" element={<Settings />} />

        {/* Legacy route redirects */}
        <Route path="mining-safety" element={<SectorLegacyRedirect legacyTo={{ sector: 'mining', slug: 'overview' }} />} />
        <Route path="mining/incidents" element={<SectorLegacyRedirect legacyTo={{ sector: 'mining', slug: 'incidents' }} />} />
        <Route path="mining/analytics" element={<SectorLegacyRedirect legacyTo={{ sector: 'mining', slug: 'analytics' }} />} />

        <Route path="airport-security" element={<SectorLegacyRedirect legacyTo={{ sector: 'airport', slug: 'overview' }} />} />
        <Route path="airport/incidents" element={<SectorLegacyRedirect legacyTo={{ sector: 'airport', slug: 'incidents' }} />} />
        <Route path="airport/analytics" element={<SectorLegacyRedirect legacyTo={{ sector: 'airport', slug: 'analytics' }} />} />

        <Route path="border/overview" element={<SectorLegacyRedirect legacyTo={{ sector: 'border', slug: 'overview' }} />} />
        <Route path="border/incidents" element={<SectorLegacyRedirect legacyTo={{ sector: 'border', slug: 'incidents' }} />} />
        <Route path="border/analytics" element={<SectorLegacyRedirect legacyTo={{ sector: 'border', slug: 'analytics' }} />} />

        <Route path="smart-city/overview" element={<SectorLegacyRedirect legacyTo={{ sector: 'smart_city', slug: 'overview' }} />} />
        <Route path="smart-city/incidents" element={<SectorLegacyRedirect legacyTo={{ sector: 'smart_city', slug: 'incidents' }} />} />
        <Route path="smart-city/analytics" element={<SectorLegacyRedirect legacyTo={{ sector: 'smart_city', slug: 'analytics' }} />} />

        <Route path="manufacturing/safety" element={<SectorLegacyRedirect legacyTo={{ sector: 'manufacturing', slug: 'overview' }} />} />
        <Route path="manufacturing/incidents" element={<SectorLegacyRedirect legacyTo={{ sector: 'manufacturing', slug: 'incidents' }} />} />
        <Route path="manufacturing/analytics" element={<SectorLegacyRedirect legacyTo={{ sector: 'manufacturing', slug: 'analytics' }} />} />

        <Route path="warehouse/safety" element={<SectorLegacyRedirect legacyTo={{ sector: 'warehouse', slug: 'overview' }} />} />
        <Route path="warehouse/incidents" element={<SectorLegacyRedirect legacyTo={{ sector: 'warehouse', slug: 'incidents' }} />} />
        <Route path="warehouse/analytics" element={<SectorLegacyRedirect legacyTo={{ sector: 'warehouse', slug: 'analytics' }} />} />

        <Route path="health/safety" element={<SectorLegacyRedirect legacyTo={{ sector: 'health', slug: 'overview' }} />} />
        <Route path="health/incidents" element={<SectorLegacyRedirect legacyTo={{ sector: 'health', slug: 'incidents' }} />} />
        <Route path="health/analytics" element={<SectorLegacyRedirect legacyTo={{ sector: 'health', slug: 'analytics' }} />} />

        <Route path="construction/safety" element={<SectorLegacyRedirect legacyTo={{ sector: 'construction', slug: 'overview' }} />} />
        <Route path="construction/incidents" element={<SectorLegacyRedirect legacyTo={{ sector: 'construction', slug: 'incidents' }} />} />
        <Route path="construction/analytics" element={<SectorLegacyRedirect legacyTo={{ sector: 'construction', slug: 'analytics' }} />} />

        <Route path="agriculture/safety" element={<SectorLegacyRedirect legacyTo={{ sector: 'agriculture', slug: 'overview' }} />} />
        <Route path="agriculture/incidents" element={<SectorLegacyRedirect legacyTo={{ sector: 'agriculture', slug: 'incidents' }} />} />
        <Route path="agriculture/analytics" element={<SectorLegacyRedirect legacyTo={{ sector: 'agriculture', slug: 'analytics' }} />} />

        {/* Catch-all: send users to /solutions */}
        <Route path="*" element={<Navigate to="/solutions" replace />} />
      </Route>
    </Routes>
  )
}

export default App
