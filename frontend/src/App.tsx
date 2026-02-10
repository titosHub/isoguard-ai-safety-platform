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

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="airport-security" element={<AirportSecurity />} />
        <Route path="mining-safety" element={<MiningSafety />} />
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
