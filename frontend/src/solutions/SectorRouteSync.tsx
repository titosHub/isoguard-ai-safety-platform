import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import type { SolutionId } from './registry'
import { getSolution } from './registry'
import { useSector } from './SectorContext'

export default function SectorRouteSync() {
  const { sector } = useParams()
  const { setActiveSolutionId } = useSector()

  useEffect(() => {
    const solution = getSolution(sector)
    setActiveSolutionId((solution?.id ?? null) as SolutionId | null)
  }, [sector, setActiveSolutionId])

  return null
}
