import api from './api'
import type { Patient, TestSession, LabTest, DashboardStats, PaginatedResult, ApiResponse } from '../types'

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (email: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', { email, password }),
  register:       (data: any) => api.post('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token: string, newPassword: string) => api.post('/auth/reset-password', { token, newPassword }),
  getProfile:     () => api.get('/auth/profile'),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { oldPassword, newPassword }),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats:          () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
  getRecentSessions: () => api.get<ApiResponse<TestSession[]>>('/dashboard/recent-sessions'),
}

// ── Patients ──────────────────────────────────────────────────────────────────
export const patientApi = {
  getAll:        (params?: any) => api.get<ApiResponse<PaginatedResult<Patient>>>('/patients', { params }),
  getById:       (id: string)   => api.get<ApiResponse<Patient>>(`/patients/${id}`),
  create:        (data: any)    => api.post<ApiResponse<Patient>>('/patients', data),
  update:        (id: string, data: any) => api.put<ApiResponse<Patient>>(`/patients/${id}`, data),
  delete:        (id: string)   => api.delete(`/patients/${id}`),
  searchHistory: (params?: any) => api.get<ApiResponse<PaginatedResult<Patient>>>('/patients/history/search', { params }),
}

// ── Lab Tests ─────────────────────────────────────────────────────────────────
export const labTestApi = {
  getAll:       (params?: any) => api.get<ApiResponse<LabTest[]>>('/lab-tests', { params }),
  getCategories:()             => api.get<ApiResponse<string[]>>('/lab-tests/categories'),
  create:       (data: any)    => api.post<ApiResponse<LabTest>>('/lab-tests', data),
  update:       (id: string, data: any) => api.put<ApiResponse<LabTest>>(`/lab-tests/${id}`, data),
  deactivate:   (id: string)   => api.delete(`/lab-tests/${id}`),
  seed:         ()             => api.post('/lab-tests/seed'),
}

// ── Test Sessions ─────────────────────────────────────────────────────────────
export const sessionApi = {
  getAll:       (params?: any) => api.get<ApiResponse<PaginatedResult<TestSession>>>('/sessions', { params }),
  getById:      (id: string)   => api.get<ApiResponse<TestSession>>(`/sessions/${id}`),
  getByPatient: (patientId: string) => api.get<ApiResponse<TestSession[]>>(`/sessions/patient/${patientId}`),
  create:       (data: any)    => api.post<ApiResponse<TestSession>>('/sessions', data),
  delete:       (id: string)   => api.delete(`/sessions/${id}`),
  addTests:     (id: string, tests: any[]) => api.post<ApiResponse<TestSession>>(`/sessions/${id}/tests`, { tests }),
  removeTest:   (id: string, testId: string) => api.delete<ApiResponse<TestSession>>(`/sessions/${id}/tests/${testId}`),
  updateTest:   (id: string, testId: string, data: any) => api.put<ApiResponse<TestSession>>(`/sessions/${id}/tests/${testId}`, data),
  addResult:    (id: string, data: any) => api.post<ApiResponse<TestSession>>(`/sessions/${id}/results`, data),
  updateStatus: (id: string, status: string) => api.put<ApiResponse<TestSession>>(`/sessions/${id}/status`, { status }),
  generatePdf:  (id: string)   => api.post(`/sessions/${id}/pdf`, {}, { responseType: 'blob' }),
}
