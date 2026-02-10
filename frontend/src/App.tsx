import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Incidents from './pages/Incidents'
import Analytics from './pages/Analytics'
import Cameras from './pages/Cameras'
import Sites from './pages/Sites'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Forensics from './pages/Forensics'
import MediaUpload from './pages/MediaUpload'
import Admin from './pages/Admin'
import ReportBuilder from './pages/ReportBuilder'
import AirportSecurity from './pages/AirportSecurity'
import MiningSafety from './pages/MiningSafety'
import IndustrySafety from './pages/IndustrySafety'

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Airport */}
        <Route path="airport-security" element={<AirportSecurity />} />
        <Route path="airport/incidents" element={<IndustrySafety key="airport-incidents" industry="airport" defaultTab="incidents" />} />
        <Route path="airport/analytics" element={<IndustrySafety key="airport-analytics" industry="airport" defaultTab="analytics" />} />
        
        {/* Mining */}
        <Route path="mining-safety" element={<MiningSafety key="mining-main" />} />
        <Route path="mining/incidents" element={<MiningSafety key="mining-incidents" defaultTab="incidents" />} />
        <Route path="mining/analytics" element={<MiningSafety key="mining-analytics" defaultTab="analytics" />} />
        
        {/* Manufacturing */}
        <Route path="manufacturing/safety" element={<IndustrySafety key="manufacturing-main" industry="manufacturing" />} />
        <Route path="manufacturing/incidents" element={<IndustrySafety key="manufacturing-incidents" industry="manufacturing" defaultTab="incidents" />} />
        <Route path="manufacturing/analytics" element={<IndustrySafety key="manufacturing-analytics" industry="manufacturing" defaultTab="analytics" />} />
        
        {/* Warehousing */}
        <Route path="warehouse/safety" element={<IndustrySafety key="warehouse-main" industry="warehouse" />} />
        <Route path="warehouse/incidents" element={<IndustrySafety key="warehouse-incidents" industry="warehouse" defaultTab="incidents" />} />
        <Route path="warehouse/analytics" element={<IndustrySafety key="warehouse-analytics" industry="warehouse" defaultTab="analytics" />} />
        
        {/* Healthcare */}
        <Route path="health/safety" element={<IndustrySafety key="health-main" industry="health" />} />
        <Route path="health/incidents" element={<IndustrySafety key="health-incidents" industry="health" defaultTab="incidents" />} />
        <Route path="health/analytics" element={<IndustrySafety key="health-analytics" industry="health" defaultTab="analytics" />} />
        
        {/* Construction */}
        <Route path="construction/safety" element={<IndustrySafety key="construction-main" industry="construction" />} />
        <Route path="construction/incidents" element={<IndustrySafety key="construction-incidents" industry="construction" defaultTab="incidents" />} />
        <Route path="construction/analytics" element={<IndustrySafety key="construction-analytics" industry="construction" defaultTab="analytics" />} />
        
        {/* Agriculture */}
        <Route path="agriculture/safety" element={<IndustrySafety key="agriculture-main" industry="agriculture" />} />
        <Route path="agriculture/incidents" element={<IndustrySafety key="agriculture-incidents" industry="agriculture" defaultTab="incidents" />} />
        <Route path="agriculture/analytics" element={<IndustrySafety key="agriculture-analytics" industry="agriculture" defaultTab="analytics" />} />
        
        {/* General */}
        <Route path="incidents" element={<Incidents />} />
        <Route path="forensics" element={<Forensics />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="cameras" element={<Cameras />} />
        <Route path="sites" element={<Sites />} />
        <Route path="media" element={<MediaUpload />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reports/builder" element={<ReportBuilder />} />
        <Route path="admin" element={<Admin />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
