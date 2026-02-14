import { Navigate, useParams } from 'react-router-dom'
import { getSolution, solutionPath, type SolutionId, type SolutionSlug } from '../../solutions/registry'
import MiningSafety from '../MiningSafety'
import AirportSecurity from '../AirportSecurity'
import SectorOverview from '../SectorOverview'
import Cameras from '../Cameras'
import Violations from '../Violations'
import Reports from '../Reports'
import ForensicsSearch from '../ForensicsSearch'
import MediaUpload from '../MediaUpload'
import SectorAnalytics from './SectorAnalytics'
import SectorIncidents from './SectorIncidents'
import GovernmentSubmit from './GovernmentSubmit'
import SectorRules from './SectorRules'
import TrainingModels from './TrainingModels'
import AIModelSettings from './AIModelSettings'

function useSolutionFromRoute() {
  const { sector } = useParams()
  const solution = getSolution(sector)
  return { sector, solution }
}

export function SectorIndexRedirect() {
  const { solution } = useSolutionFromRoute()
  if (!solution) return <Navigate to="/solutions" replace />
  return <Navigate to={solutionPath(solution.id, solution.defaultSlug)} replace />
}

export function SectorModulePage({ slug }: { slug: 'overview' | 'incidents' | 'analytics' }) {
  const { solution } = useSolutionFromRoute()
  if (!solution) return <Navigate to="/solutions" replace />

  if (slug === 'overview') {
    if (solution.id === 'mining') return <MiningSafety defaultTab="myday" />
    if (solution.id === 'airport') return <AirportSecurity />
    return <SectorOverview />
  }

  if (slug === 'incidents') {
    return <SectorIncidents />
  }

  // analytics
  return <SectorAnalytics />
}

export function SectorToolRouter({ slug }: { slug: SolutionSlug }) {
  const { solution } = useSolutionFromRoute()
  if (!solution) return <Navigate to="/solutions" replace />

  switch (slug) {
    case 'cameras':
      return <Cameras />
    case 'violations':
      return <Violations />
    case 'reports':
      return <Reports />
    case 'rules':
      return <SectorRules />
    case 'models':
      return <TrainingModels />
    case 'ai-model-settings':
      return <AIModelSettings />
    case 'forensics':
      return <ForensicsSearch />
    case 'media':
      return <MediaUpload />

    case 'government-submit':
      return <GovernmentSubmit />

    case 'shift-reports':
      return solution.id === 'mining'
        ? <MiningSafety defaultTab="dailylog" />
        : <ToolPlaceholder title="Shift Reports" />

    case 'ppe-compliance':
      return solution.id === 'mining'
        ? <MiningSafety defaultTab="equipment" />
        : <ToolPlaceholder title="PPE Compliance" />

    case 'tailing-dam':
      return <ToolPlaceholder title="Tailing Dam Analytics" />

    case 'perimeter-security':
      return <ToolPlaceholder title="Perimeter Security" />

    case 'passenger-flow':
      return <ToolPlaceholder title="Passenger Flow" />

    case 'queue-management':
      return <ToolPlaceholder title="Queue Management" />

    case 'baggage-tracking':
      return <ToolPlaceholder title="Baggage Tracking" />

    // Module slugs should not reach here
    case 'overview':
    case 'incidents':
    case 'analytics':
      return <Navigate to={solutionPath(solution.id, 'overview')} replace />

    default:
      return <ToolPlaceholder title="Tool" />
  }
}

function ToolPlaceholder({ title }: { title: string }) {
  const { solution } = useSolutionFromRoute()
  const solutionName = solution?.name ?? 'Solution'

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <p className="mt-2 text-sm text-gray-400">
        {solutionName}-specific {title.toLowerCase()} will appear here.
      </p>
      <div className="mt-4 text-xs text-gray-500">
        This is a placeholder route so the sidebar can remain sector-specific while features are implemented.
      </div>
    </div>
  )
}

export function SectorLegacyRedirect({ legacyTo }: { legacyTo: { sector: SolutionId; slug: SolutionSlug } }) {
  return <Navigate to={solutionPath(legacyTo.sector, legacyTo.slug)} replace />
}
