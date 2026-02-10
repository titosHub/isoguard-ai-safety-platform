import { api } from './apiClient';

export interface DashboardStats {
  safety_score: number;
  safety_score_trend: 'up' | 'down' | 'stable';
  trir: number;
  ltifr: number;
  open_incidents: number;
  open_incidents_change: number;
  mean_time_to_detect: number;
  mttd_change: number;
  compliance_rate: number;
  compliance_change: number;
  near_misses: number;
  near_misses_change: number;
}

export interface IncidentTrend {
  date: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface ViolationByType {
  type: string;
  label: string;
  count: number;
  percentage: number;
}

export interface SiteComparison {
  site_id: string;
  site_name: string;
  safety_score: number;
  incident_count: number;
  compliance_rate: number;
}

export interface RiskHeatmapData {
  zone_id: string;
  zone_name: string;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  incident_count: number;
  last_incident?: string;
}

export interface PredictiveAlert {
  id: string;
  type: string;
  zone_name: string;
  risk_score: number;
  predicted_incident_type: string;
  recommendation: string;
  created_at: string;
}

export const analyticsService = {
  getDashboardStats: async (filters?: {
    site_id?: string;
    days?: number;
  }): Promise<DashboardStats> => {
    return api.get<DashboardStats>('/api/analytics/dashboard', filters);
  },

  getIncidentTrends: async (filters?: {
    site_id?: string;
    days?: number;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<IncidentTrend[]> => {
    return api.get<IncidentTrend[]>('/api/analytics/incidents/trends', filters);
  },

  getViolationsByType: async (filters?: {
    site_id?: string;
    days?: number;
  }): Promise<ViolationByType[]> => {
    return api.get<ViolationByType[]>('/api/analytics/violations/by-type', filters);
  },

  getSiteComparison: async (): Promise<SiteComparison[]> => {
    return api.get<SiteComparison[]>('/api/analytics/sites/comparison');
  },

  getRiskHeatmap: async (siteId?: string): Promise<RiskHeatmapData[]> => {
    return api.get<RiskHeatmapData[]>('/api/analytics/risk/heatmap', { site_id: siteId });
  },

  getPredictiveAlerts: async (siteId?: string): Promise<PredictiveAlert[]> => {
    return api.get<PredictiveAlert[]>('/api/analytics/predictive-alerts', { site_id: siteId });
  },

  getComplianceReport: async (filters: {
    site_id?: string;
    start_date: string;
    end_date: string;
  }): Promise<{
    overall_compliance: number;
    by_category: Record<string, number>;
    daily_compliance: Array<{ date: string; rate: number }>;
    violations: Array<{ type: string; count: number }>;
  }> => {
    return api.get('/api/analytics/compliance/report', filters);
  },

  exportReport: async (filters: {
    report_type: 'incidents' | 'compliance' | 'safety';
    site_id?: string;
    start_date: string;
    end_date: string;
    format: 'pdf' | 'csv' | 'xlsx';
  }): Promise<Blob> => {
    const response = await fetch(`/api/analytics/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(filters),
    });
    return response.blob();
  },
};

export default analyticsService;
