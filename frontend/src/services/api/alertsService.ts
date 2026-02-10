import { api } from './apiClient';

export interface Alert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  site_id: string;
  site_name: string;
  zone_id?: string;
  zone_name?: string;
  camera_id: string;
  camera_name: string;
  detection_id?: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
  evidence_url?: string;
}

export interface AlertFilters {
  site_id?: string;
  severity?: string;
  acknowledged?: boolean;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

export interface AlertStats {
  total: number;
  unacknowledged: number;
  by_severity: Record<string, number>;
  by_type: Record<string, number>;
}

export const alertsService = {
  getAll: async (filters?: AlertFilters): Promise<{
    alerts: Alert[];
    total: number;
    page: number;
    page_size: number;
  }> => {
    return api.get('/api/alerts', filters);
  },

  getById: async (id: string): Promise<Alert> => {
    return api.get<Alert>(`/api/alerts/${id}`);
  },

  acknowledge: async (id: string, notes?: string): Promise<Alert> => {
    return api.post<Alert>(`/api/alerts/${id}/acknowledge`, { notes });
  },

  acknowledgeMultiple: async (ids: string[], notes?: string): Promise<void> => {
    return api.post('/api/alerts/acknowledge-multiple', { ids, notes });
  },

  getStats: async (siteId?: string): Promise<AlertStats> => {
    return api.get<AlertStats>('/api/alerts/stats', { site_id: siteId });
  },

  getUnacknowledged: async (siteId?: string): Promise<Alert[]> => {
    return api.get<Alert[]>('/api/alerts/unacknowledged', { site_id: siteId });
  },

  // WebSocket connection for real-time alerts
  subscribeToAlerts: (
    onAlert: (alert: Alert) => void,
    onError?: (error: Event) => void
  ): WebSocket => {
    const token = localStorage.getItem('access_token');
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    const ws = new WebSocket(`${wsUrl}/ws/alerts?token=${token}`);

    ws.onmessage = (event) => {
      try {
        const alert = JSON.parse(event.data) as Alert;
        onAlert(alert);
      } catch (e) {
        console.error('Failed to parse alert:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };

    return ws;
  },
};

export default alertsService;
