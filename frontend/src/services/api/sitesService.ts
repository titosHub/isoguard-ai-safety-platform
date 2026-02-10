import { api } from './apiClient';

export interface Site {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  is_active: boolean;
  camera_count: number;
  zone_count: number;
  safety_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Zone {
  id: string;
  name: string;
  zone_type: 'exclusion' | 'restricted' | 'mandatory_ppe' | 'hazard';
  site_id: string;
  site_name?: string;
  polygon?: { lat: number; lng: number }[];
  rules?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteCreate {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface SiteUpdate {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  is_active?: boolean;
}

export interface ZoneCreate {
  name: string;
  zone_type: string;
  site_id: string;
  polygon?: { lat: number; lng: number }[];
  rules?: Record<string, unknown>;
}

export interface ZoneUpdate {
  name?: string;
  zone_type?: string;
  polygon?: { lat: number; lng: number }[];
  rules?: Record<string, unknown>;
  is_active?: boolean;
}

export const sitesService = {
  // Sites
  getAll: async (): Promise<Site[]> => {
    return api.get<Site[]>('/api/sites');
  },

  getById: async (id: string): Promise<Site> => {
    return api.get<Site>(`/api/sites/${id}`);
  },

  create: async (data: SiteCreate): Promise<Site> => {
    return api.post<Site>('/api/sites', data);
  },

  update: async (id: string, data: SiteUpdate): Promise<Site> => {
    return api.patch<Site>(`/api/sites/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/api/sites/${id}`);
  },

  getStats: async (id: string): Promise<{
    camera_count: number;
    zone_count: number;
    incident_count: number;
    safety_score: number;
    compliance_rate: number;
  }> => {
    return api.get(`/api/sites/${id}/stats`);
  },

  // Zones
  getZones: async (siteId?: string): Promise<Zone[]> => {
    return api.get<Zone[]>('/api/zones', { site_id: siteId });
  },

  getZoneById: async (id: string): Promise<Zone> => {
    return api.get<Zone>(`/api/zones/${id}`);
  },

  createZone: async (data: ZoneCreate): Promise<Zone> => {
    return api.post<Zone>('/api/zones', data);
  },

  updateZone: async (id: string, data: ZoneUpdate): Promise<Zone> => {
    return api.patch<Zone>(`/api/zones/${id}`, data);
  },

  deleteZone: async (id: string): Promise<void> => {
    return api.delete(`/api/zones/${id}`);
  },
};

export default sitesService;
