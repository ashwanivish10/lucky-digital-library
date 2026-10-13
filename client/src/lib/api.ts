import axios from 'axios';

const getBaseURL = () => {
  const raw = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
  const cleaned = raw.replace(/\/+$/, '');
  return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token from localStorage if cookie not available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect here — let AuthContext handle it
    }
    return Promise.reject(error);
  }
);

export default api;

// ---- Typed API helpers ----

export const authApi = {
  login: (identifier: string, password: string) =>
    api.post('/auth/login', { identifier, email: identifier, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  setFirstPassword: (newPassword: string) =>
    api.post('/auth/set-first-password', { newPassword }),
};

export const studentsApi = {
  list: (params?: Record<string, unknown>) => api.get('/students', { params }),
  get: (id: string) => api.get(`/students/${id}`),
  create: (data: Record<string, unknown>) => api.post('/students', data),
  customEnroll: (data: Record<string, unknown>) => api.post('/students/custom-enroll', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/students/${id}`, data),
  updateStatus: (id: string, status: string, reason?: string) =>
    api.patch(`/students/${id}/status`, { status, reason }),
  approve: (id: string, data: Record<string, unknown>) =>
    api.post(`/students/${id}/approve`, data),
  register: (data: Record<string, unknown>) => api.post('/students/register', data),
  getSeatMap: (params?: Record<string, unknown>) => api.get('/students/seats/map', { params }),
};

export const membershipsApi = {
  list: (params?: Record<string, unknown>) => api.get('/memberships', { params }),
  create: (data: Record<string, unknown>) => api.post('/memberships', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/memberships/${id}`, data),
  renew: (id: string, data: Record<string, unknown>) =>
    api.post(`/memberships/${id}/renew`, data),
  refreshStatuses: () => api.post('/memberships/refresh-statuses'),
};

export const paymentsApi = {
  list: (params?: Record<string, unknown>) => api.get('/payments', { params }),
  record: (data: Record<string, unknown>) => api.post('/payments', data),
  receipt: (id: string) =>
    api.get(`/payments/${id}/receipt`, { responseType: 'blob' }),
  adjust: (id: string, data: Record<string, unknown>) =>
    api.post(`/payments/${id}/adjustments`, data),
  report: (params?: Record<string, unknown>) =>
    api.get('/payments/report', { params }),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: Record<string, unknown>) => api.patch('/settings', data),
  getPublic: () => api.get('/settings/public'),
  upload: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/settings/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  submitContact: (data: Record<string, unknown>) => api.post('/settings/contact', data),
  syncGoogleReviews: () => api.post('/settings/sync-google-reviews'),
  submitReview: (data: Record<string, unknown>) => api.post('/settings/submit-review', data),
};

export const plansApi = {
  list: () => api.get('/settings/plans'),
  create: (data: Record<string, unknown>) => api.post('/settings/plans', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/settings/plans/${id}`, data),
  delete: (id: string) => api.delete(`/settings/plans/${id}`),
};

export const dashboardApi = {
  summary: () => api.get('/settings/dashboard/summary'),
  analytics: () => api.get('/settings/dashboard/analytics'),
};

export const messagesApi = {
  list: (params?: Record<string, unknown>) => api.get('/messages', { params }),
  getUnreadCount: () => api.get('/messages/unread-count'),
  getById: (id: string) => api.get(`/messages/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/messages/${id}`, data),
  delete: (id: string) => api.delete(`/messages/${id}`),
};

