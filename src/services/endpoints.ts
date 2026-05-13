import api from './api'
import type { ApiResponse, Patient, LabTest, TestSession, DashboardStats } from '../types'

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (email: string, password: string) =>
                    api.post<ApiResponse<{ user: any; token: string }>>('/auth/login', { email, password }),
  register:       (data: { name: string; email: string; password: string; role: string }) =>
                    api.post<ApiResponse<any>>('/auth/register', data),
  forgotPassword: (email: string) =>
                    api.post<ApiResponse<null>>('/auth/forgot-password', { email }),
  resetPassword:  (token: string, newPassword: string) =>
                    api.post<ApiResponse<null>>('/auth/reset-password', { token, newPassword }),
  changePassword: (oldPassword: string, newPassword: string) =>
                    api.put<ApiResponse<null>>('/auth/change-password', { oldPassword, newPassword }),
  getProfile:     () =>
                    api.get<ApiResponse<any>>('/auth/profile'),
}

// ── Patients ──────────────────────────────────────────────────────────────────
export const patientApi = {
  getAll:        (params?: { query?: string; page?: number; limit?: number }) =>
                   api.get<ApiResponse<{ data: Patient[]; total: number; page: number; totalPages: number }>>('/patients', { params }),
  getById:       (id: string) => api.get<ApiResponse<Patient>>(`/patients/${id}`),
  create:        (data: Partial<Patient>) => api.post<ApiResponse<Patient>>('/patients', data),
  update:        (id: string, data: Partial<Patient>) => api.put<ApiResponse<Patient>>(`/patients/${id}`, data),
  delete:        (id: string) => api.delete<ApiResponse<null>>(`/patients/${id}`),
  history:       (id: string) => api.get<ApiResponse<TestSession[]>>(`/patients/${id}/history`),
  searchHistory: (params?: { q?: string; range?: string; from?: string; to?: string; page?: number; limit?: number }) =>
                   api.get<ApiResponse<{ data: Patient[]; total: number; totalPages: number }>>('/patients/history/search', { params }),
}

// ── Lab Tests ─────────────────────────────────────────────────────────────────
export const labTestApi = {
  getAll:        (params?: { search?: string; category?: string }) =>
                   api.get<ApiResponse<LabTest[]>>('/lab-tests', { params }),
  getCategories: () => api.get<ApiResponse<string[]>>('/lab-tests/categories'),
  getById:       (id: string) => api.get<ApiResponse<LabTest>>(`/lab-tests/${id}`),
  create:        (data: Partial<LabTest>) => api.post<ApiResponse<LabTest>>('/lab-tests', data),
  update:        (id: string, data: Partial<LabTest>) => api.put<ApiResponse<LabTest>>(`/lab-tests/${id}`, data),
  deactivate:    (id: string) => api.delete<ApiResponse<null>>(`/lab-tests/${id}`),
  seed:          () => api.post<ApiResponse<null>>('/lab-tests/seed'),
}

// ── Sessions ──────────────────────────────────────────────────────────────────
export const sessionApi = {
  getAll:       (params?: { status?: string; patientId?: string; page?: number; limit?: number }) =>
                  api.get<ApiResponse<{ data: TestSession[]; total: number; page: number; totalPages: number }>>('/sessions', { params }),
  getById:      (id: string) => api.get<ApiResponse<TestSession>>(`/sessions/${id}`),
  create:       (data: any)  => api.post<ApiResponse<TestSession>>('/sessions', data),
  addTests:     (id: string, data: any) => api.post<ApiResponse<TestSession>>(`/sessions/${id}/tests`, data),
  removeTest:   (id: string, testId: string) => api.delete<ApiResponse<TestSession>>(`/sessions/${id}/tests/${testId}`),
  updateTest:   (id: string, testId: string, data: any) => api.put<ApiResponse<TestSession>>(`/sessions/${id}/tests/${testId}`, data),
  addResult:    (id: string, data: any) => api.post<ApiResponse<TestSession>>(`/sessions/${id}/results`, data),
  updateStatus: (id: string, status: string) => api.put<ApiResponse<TestSession>>(`/sessions/${id}/status`, { status }),
  delete:       (id: string) => api.delete<ApiResponse<null>>(`/sessions/${id}`),
  // responseType 'blob' handles both streamed PDF and JSON error responses
  generatePdf:  (id: string) => api.post(`/sessions/${id}/pdf`, {}, { responseType: 'blob' }),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats:          () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
  getRecentSessions: () => api.get<ApiResponse<any[]>>('/dashboard/recent-sessions'),
}