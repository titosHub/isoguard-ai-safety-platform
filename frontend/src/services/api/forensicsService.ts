import { api } from './apiClient';

export interface Violation {
  id: string;
  detection_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence_score: number;
  site_id: string;
  site_name: string;
  zone_id: string;
  zone_name: string;
  camera_id: string;
  camera_name: string;
  detected_at: string;
  is_false_positive: boolean;
  false_positive_reason?: string;
  evidence: Evidence[];
  comments: Comment[];
  description: string;
  status: 'active' | 'resolved' | 'pending_review';
}

export interface Evidence {
  id: string;
  type: 'image' | 'video';
  original_url: string;
  blurred_url: string;
  thumbnail_url: string;
  duration_seconds?: number;
}

export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface ForensicsSearchFilters {
  date_from?: string;
  date_to?: string;
  site_id?: string;
  zone_id?: string;
  camera_id?: string;
  detection_type?: string;
  severity?: string;
  min_confidence?: number;
  is_false_positive?: boolean;
  status?: string;
  page?: number;
  page_size?: number;
}

export interface ForensicsSearchResponse {
  violations: Violation[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const forensicsService = {
  search: async (filters: ForensicsSearchFilters): Promise<ForensicsSearchResponse> => {
    return api.get<ForensicsSearchResponse>('/api/forensics/search', filters);
  },

  getById: async (id: string): Promise<Violation> => {
    return api.get<Violation>(`/api/forensics/violations/${id}`);
  },

  markFalsePositive: async (id: string, reason: string): Promise<Violation> => {
    return api.post<Violation>(`/api/forensics/violations/${id}/false-positive`, { reason });
  },

  addComment: async (id: string, content: string): Promise<Comment> => {
    return api.post<Comment>(`/api/forensics/violations/${id}/comments`, { content });
  },

  getEvidence: async (id: string): Promise<Evidence[]> => {
    return api.get<Evidence[]>(`/api/forensics/violations/${id}/evidence`);
  },

  downloadEvidence: async (evidenceId: string, blurred: boolean = true): Promise<Blob> => {
    const response = await fetch(
      `/api/forensics/evidence/${evidenceId}/download?blurred=${blurred}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }
    );
    return response.blob();
  },

  exportSearch: async (
    filters: ForensicsSearchFilters,
    format: 'csv' | 'xlsx' | 'pdf'
  ): Promise<Blob> => {
    const response = await fetch(`/api/forensics/export?format=${format}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(filters),
    });
    return response.blob();
  },

  getDetectionTypes: async (): Promise<Array<{ value: string; label: string }>> => {
    return api.get('/api/forensics/detection-types');
  },
};

export default forensicsService;
