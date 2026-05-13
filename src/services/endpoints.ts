import api from './api'
import type { ApiResponse, Patient, LabTest, TestSession, DashboardStats } from '../types'

// ── Patients ──────────────────────────────────────────────────────────────────
export const patientApi = {
  getAll:   (params?: { search?: string; page?: number; limit?: number }) =>
              api.get<ApiResponse<{ patients: Patient[]; total: number; page: number; pages: number }>>('/patients', { params }),
  getById:  (id: string) => api.get<ApiResponse<Patient>>(`/patients/${id}`),
  create:   (data: Partial<Patient>) => api.post<ApiResponse<Patient>>('/patients', data),
  update:   (id: string, data: Partial<Patient>) => api.put<ApiResponse<Patient>>(`/patients/${id}`, data),
  delete:   (id: string) => api.delete<ApiResponse<null>>(`/patients/${id}`),
  history:  (id: string) => api.get<ApiResponse<TestSession[]>>(`/patients/${id}/history`),
}

// ── Lab Tests ─────────────────────────────────────────────────────────────────
export const labTestApi = {
  getAll:  (params?: { search?: string; category?: string }) =>
             api.get<ApiResponse<LabTest[]>>('/lab-tests', { params }),
  create:  (data: Partial<LabTest>) => api.post<ApiResponse<LabTest>>('/lab-tests', data),
  update:  (id: string, data: Partial<LabTest>) => api.put<ApiResponse<LabTest>>(`/lab-tests/${id}`, data),
  delete:  (id: string) => api.delete<ApiResponse<null>>(`/lab-tests/${id}`),
  seed:    () => api.post<ApiResponse<null>>('/lab-tests/seed'),
}

// ── Sessions ──────────────────────────────────────────────────────────────────
export const sessionApi = {
  getAll:       (params?: { status?: string; patientId?: string; page?: number; limit?: number }) =>
                  api.get<ApiResponse<{ sessions: TestSession[]; total: number; page: number; pages: number }>>('/sessions', { params }),
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
  getStats: () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
}