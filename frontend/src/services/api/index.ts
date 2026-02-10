// API Client
export { default as apiClient, api } from './apiClient';

// Services
export { default as authService } from './authService';
export { default as incidentsService } from './incidentsService';
export { default as camerasService } from './camerasService';
export { default as sitesService } from './sitesService';
export { default as analyticsService } from './analyticsService';
export { default as forensicsService } from './forensicsService';
export { default as mediaService } from './mediaService';
export { default as alertsService } from './alertsService';

// Types
export type { LoginRequest, RegisterRequest, AuthResponse, User } from './authService';
export type { Incident, IncidentFilters, IncidentCreate, IncidentUpdate } from './incidentsService';
export type { Camera, CameraCreate, CameraUpdate, CameraStats } from './camerasService';
export type { Site, Zone, SiteCreate, SiteUpdate, ZoneCreate, ZoneUpdate } from './sitesService';
export type {
  DashboardStats,
  IncidentTrend,
  ViolationByType,
  SiteComparison,
  RiskHeatmapData,
  PredictiveAlert,
} from './analyticsService';
export type {
  Violation,
  Evidence,
  ForensicsSearchFilters,
  ForensicsSearchResponse,
} from './forensicsService';
export type {
  UploadProgress,
  UploadResult,
  AnalysisResult,
  Detection,
  TrainingDataset,
} from './mediaService';
export type { Alert, AlertFilters, AlertStats } from './alertsService';
