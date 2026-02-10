import { api } from './apiClient';

export interface Camera {
  id: string;
  name: string;
  stream_url: string;
  location_description: string;
  site_id: string;
  site_name?: string;
  zone_id?: string;
  zone_name?: string;
  is_active: boolean;
  status: 'online' | 'offline' | 'connecting' | 'error';
  last_seen?: string;
  fps?: number;
  resolution?: string;
  edge_device_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CameraCreate {
  name: string;
  stream_url: string;
  location_description: string;
  site_id: string;
  zone_id?: string;
  fps?: number;
  resolution?: string;
}

export interface CameraUpdate {
  name?: string;
  stream_url?: string;
  location_description?: string;
  zone_id?: string;
  is_active?: boolean;
  fps?: number;
  resolution?: string;
}

export interface CameraStats {
  total: number;
  online: number;
  offline: number;
  error: number;
}

export const camerasService = {
  getAll: async (filters?: { site_id?: string; status?: string }): Promise<Camera[]> => {
    return api.get<Camera[]>('/api/cameras', filters);
  },

  getById: async (id: string): Promise<Camera> => {
    return api.get<Camera>(`/api/cameras/${id}`);
  },

  create: async (data: CameraCreate): Promise<Camera> => {
    return api.post<Camera>('/api/cameras', data);
  },

  update: async (id: string, data: CameraUpdate): Promise<Camera> => {
    return api.patch<Camera>(`/api/cameras/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/api/cameras/${id}`);
  },

  getStats: async (siteId?: string): Promise<CameraStats> => {
    return api.get<CameraStats>('/api/cameras/stats', { site_id: siteId });
  },

  getStreamUrl: async (id: string): Promise<{ url: string; expires_at: string }> => {
    return api.get(`/api/cameras/${id}/stream-url`);
  },

  testConnection: async (streamUrl: string): Promise<{ success: boolean; message: string }> => {
    return api.post('/api/cameras/test-connection', { stream_url: streamUrl });
  },

  restart: async (id: string): Promise<{ success: boolean }> => {
    return api.post(`/api/cameras/${id}/restart`);
  },

  getSnapshot: async (id: string): Promise<Blob> => {
    const response = await fetch(`/api/cameras/${id}/snapshot`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.blob();
  },
};

export default camerasService;
