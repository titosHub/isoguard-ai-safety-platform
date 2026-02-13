import { api } from './apiClient'

export type SectorAccess = {
  sector_id: string
  entitled: boolean
  access: 'active' | 'locked'
}

export type EntitlementsMeResponse = {
  tier: string
  entitled_sectors: string[]
  locked_sectors: string[]
  sectors: SectorAccess[]
}

export type AccessRequestCreate = {
  sector_id: string
  message?: string | null
}

export type AccessRequestResponse = {
  id: string
  user_id?: string | null
  email?: string | null
  sector_id: string
  message?: string | null
  created_at: string
  status: string
}

export const entitlementsService = {
  getMine: async (): Promise<EntitlementsMeResponse> => {
    return api.get<EntitlementsMeResponse>('/api/v1/entitlements/me')
  },

  requestAccess: async (req: AccessRequestCreate): Promise<AccessRequestResponse> => {
    return api.post<AccessRequestResponse>('/api/v1/entitlements/requests', req)
  },

  listMyRequests: async (): Promise<AccessRequestResponse[]> => {
    return api.get<AccessRequestResponse[]>('/api/v1/entitlements/requests')
  },
}

export default entitlementsService
