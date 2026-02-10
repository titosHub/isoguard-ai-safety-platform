import { api } from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'safety_officer' | 'operator' | 'viewer';
  is_active: boolean;
  site_ids: string[];
  created_at: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    return response;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    return response;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  },

  getCurrentUser: async (): Promise<User> => {
    return api.get<User>('/api/auth/me');
  },

  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    return api.post('/api/auth/change-password', data);
  },

  refreshToken: async (): Promise<{ access_token: string }> => {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await api.post<{ access_token: string }>('/api/auth/refresh', {
      refresh_token: refreshToken,
    });
    localStorage.setItem('access_token', response.access_token);
    return response;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },

  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },
};

export default authService;
