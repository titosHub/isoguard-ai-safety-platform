import Violations from '../Violations'

export default function SectorIncidents() {
  return (
    <Violations
      title="Incidents"
      subtitle="High/critical safety events requiring investigation (sector-scoped)."
      fixedSeverities={['high', 'critical']}
      hideSeverityFilter
      defaultStatus="open"
    />
  )
}
