import axios from 'axios';
import type { User, VacationRequest, PaginatedResponse, RequestStatus, RequestStats, EmployeeMetric, MyMetric } from '../types/index.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/api/auth/login', { email, password }),
  me: () => api.get<{ user: User }>('/api/auth/me'),
};

export const requestsApi = {
  create: (data: { start_date: string; end_date: string; reason?: string }) =>
    api.post<VacationRequest>('/api/vacation-requests', data),

  getMine: () => api.get<VacationRequest[]>('/api/vacation-requests/mine'),

  getAll: (params: { status?: RequestStatus; page?: number; pageSize?: number; sort?: string }) =>
    api.get<PaginatedResponse<VacationRequest>>('/api/vacation-requests', { params }),

  approve: (id: string, comments?: string) =>
    api.patch<VacationRequest>(`/api/vacation-requests/${id}/approve`, { comments }),

  reject: (id: string, comments: string) =>
    api.patch<VacationRequest>(`/api/vacation-requests/${id}/reject`, { comments }),

  getStats: () => api.get<RequestStats>('/api/vacation-requests/stats'),

  getActivity: () => api.get<VacationRequest[]>('/api/vacation-requests/activity'),
};

export const metricsApi = {
  getAll: () => api.get<EmployeeMetric[]>('/api/metrics'),
  getMine: () => api.get<MyMetric>('/api/metrics/me'),
};
