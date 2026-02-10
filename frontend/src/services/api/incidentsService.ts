import { api } from './apiClient';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  detection_type: string;
  site_id: string;
  site_name?: string;
  zone_id?: string;
  zone_name?: string;
  camera_id: string;
  camera_name?: string;
  detected_at: string;
  resolved_at?: string;
  assigned_to?: string;
  evidence_urls: string[];
  confidence_score: number;
  is_false_positive: boolean;
  created_at: string;
  updated_at: string;
}

export interface IncidentFilters {
  site_id?: string;
  zone_id?: string;
  camera_id?: string;
  severity?: string;
  status?: string;
  detection_type?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface IncidentCreate {
  title: string;
  description: string;
  severity: string;
  detection_type: string;
  site_id: string;
  zone_id?: string;
  camera_id: string;
}

export interface IncidentUpdate {
  title?: string;
  description?: string;
  severity?: string;
  status?: string;
  assigned_to?: string;
  is_false_positive?: boolean;
}

export const incidentsService = {
  getAll: async (filters?: IncidentFilters): Promise<PaginatedResponse<Incident>> => {
    return api.get<PaginatedResponse<Incident>>('/api/incidents', filters);
  },

  getById: async (id: string): Promise<Incident> => {
    return api.get<Incident>(`/api/incidents/${id}`);
  },

  create: async (data: IncidentCreate): Promise<Incident> => {
    return api.post<Incident>('/api/incidents', data);
  },

  update: async (id: string, data: IncidentUpdate): Promise<Incident> => {
    return api.patch<Incident>(`/api/incidents/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/api/incidents/${id}`);
  },

  resolve: async (id: string, notes?: string): Promise<Incident> => {
    return api.post<Incident>(`/api/incidents/${id}/resolve`, { notes });
  },

  markFalsePositive: async (id: string, reason: string): Promise<Incident> => {
    return api.post<Incident>(`/api/incidents/${id}/false-positive`, { reason });
  },

  addComment: async (id: string, content: string): Promise<void> => {
    return api.post(`/api/incidents/${id}/comments`, { content });
  },

  getComments: async (id: string): Promise<Array<{
    id: string;
    user_id: string;
    user_name: string;
    content: string;
    created_at: string;
  }>> => {
    return api.get(`/api/incidents/${id}/comments`);
  },

  getStats: async (filters?: { site_id?: string; days?: number }): Promise<{
    total: number;
    open: number;
    resolved: number;
    by_severity: Record<string, number>;
    by_type: Record<string, number>;
  }> => {
    return api.get('/api/incidents/stats', filters);
  },
};

export default incidentsService;
