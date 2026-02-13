import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { SolutionId } from './registry'
import { getSolution } from './registry'

const STORAGE_KEY = 'isoguard.activeSolution'

export interface SectorContextValue {
  activeSolutionId: SolutionId | null
  setActiveSolutionId: (solutionId: SolutionId | null) => void
}

const SectorContext = createContext<SectorContextValue | null>(null)

export function SectorProvider({ children }: { children: React.ReactNode }) {
  const [activeSolutionId, setActiveSolutionIdState] = useState<SolutionId | null>(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return getSolution(raw)?.id ?? null
  })

  const setActiveSolutionId = (solutionId: SolutionId | null) => {
    setActiveSolutionIdState(solutionId)
  }

  useEffect(() => {
    if (activeSolutionId) {
      sessionStorage.setItem(STORAGE_KEY, activeSolutionId)
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [activeSolutionId])

  const value = useMemo(() => ({ activeSolutionId, setActiveSolutionId }), [activeSolutionId])

  return <SectorContext.Provider value={value}>{children}</SectorContext.Provider>
}

export function useSector() {
  const ctx = useContext(SectorContext)
  if (!ctx) {
    throw new Error('useSector must be used inside <SectorProvider />')
  }

  const solution = getSolution(ctx.activeSolutionId)

  return {
    ...ctx,
    activeSolution: solution,
  }
}
