import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { SolutionId } from '../solutions/registry'
import { getSolution, SOLUTIONS } from '../solutions/registry'
import { useSector } from '../solutions/SectorContext'
import entitlementsService, {
  type AccessRequestResponse,
  type EntitlementsMeResponse,
} from '../services/api/entitlementsService'

export type EntitlementsContextValue = {
  loading: boolean
  error: string | null
  entitlements: EntitlementsMeResponse | null
  refresh: () => Promise<void>
  isEntitled: (sectorId: string) => boolean
  requestAccess: (sectorId: string, message?: string | null) => Promise<AccessRequestResponse>
}

const EntitlementsContext = createContext<EntitlementsContextValue | null>(null)

export function EntitlementsProvider({ children }: { children: React.ReactNode }) {
  const { activeSolutionId, setActiveSolutionId } = useSector()

  const devStrict = String((import.meta as any)?.env?.VITE_ENTITLEMENTS_STRICT ?? '').trim().toLowerCase()
  const devUnlockAll = (import.meta as any)?.env?.DEV && !['1', 'true', 'yes'].includes(devStrict)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entitlements, setEntitlements] = useState<EntitlementsMeResponse | null>(null)

  const refresh = useCallback(async () => {
    // Dev convenience: unlock everything even if user is not authenticated.
    if (devUnlockAll) {
      const all = SOLUTIONS.map((s) => s.id)
      setEntitlements({
        tier: 'dev',
        entitled_sectors: all,
        locked_sectors: [],
        sectors: all.map((sector_id) => ({ sector_id, entitled: true, access: 'active' as const })),
      })
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await entitlementsService.getMine()
      setEntitlements(data)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load entitlements')
      setEntitlements(null)
    } finally {
      setLoading(false)
    }
  }, [devUnlockAll])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Keep the active solution consistent with entitlements:
  // - If user has exactly one entitled sector, auto-select it.
  // - If the active solution is no longer entitled, clear it.
  useEffect(() => {
    if (!entitlements) return

    const entitled = new Set(entitlements.entitled_sectors)

    if (activeSolutionId && !entitled.has(activeSolutionId)) {
      setActiveSolutionId(null)
      return
    }

    if (!activeSolutionId && entitlements.entitled_sectors.length === 1) {
      const only = entitlements.entitled_sectors[0]
      const solution = getSolution(only)
      if (solution) setActiveSolutionId(solution.id as SolutionId)
    }
  }, [entitlements, activeSolutionId, setActiveSolutionId])

  const isEntitled = useCallback(
    (sectorId: string) => {
      if (!entitlements) return false
      return entitlements.entitled_sectors.includes(sectorId)
    },
    [entitlements]
  )

  const requestAccess = useCallback(async (sectorId: string, message?: string | null) => {
    const res = await entitlementsService.requestAccess({ sector_id: sectorId, message: message ?? null })
    return res
  }, [])

  const value = useMemo<EntitlementsContextValue>(
    () => ({
      loading,
      error,
      entitlements,
      refresh,
      isEntitled,
      requestAccess,
    }),
    [loading, error, entitlements, refresh, isEntitled, requestAccess]
  )

  return <EntitlementsContext.Provider value={value}>{children}</EntitlementsContext.Provider>
}

export function useEntitlements() {
  const ctx = useContext(EntitlementsContext)
  if (!ctx) throw new Error('useEntitlements must be used inside <EntitlementsProvider />')
  return ctx
}
