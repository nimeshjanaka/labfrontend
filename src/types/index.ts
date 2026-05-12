export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type SessionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type UserRole = 'ADMIN' | 'LAB_ASSISTANT'

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

export interface Patient {
  _id: string
  fullName: string
  nic?: string
  dob: string
  gender: Gender
  phone: string
  address?: string
  createdBy: User | string
  createdAt: string
  updatedAt: string
  sessions?: TestSession[]
}

export interface LabTest {
  _id: string
  name: string
  category: string
  description?: string
  isActive: boolean
}

export interface SessionTest {
  _id: string
  testId: LabTest | string
  testName: string
  facility: string
  price: number
  result?: string
  unit?: string
  normalRange?: string
  remarks?: string
  resultEnteredBy?: User | string
  resultEnteredAt?: string
}

export interface TestSession {
  _id: string
  patientId: Patient | string
  doctorName?: string
  notes?: string
  sampleType: string
  status: SessionStatus
  tests: SessionTest[]
  totalPrice: number
  createdBy: User | string
  pdfUrl?: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

export interface DashboardStats {
  totalPatients: number
  totalSessions: number
  todayPatients: number
  todaySessions: number
  monthSessions: number
  pendingSessions: number
  completedSessions: number
  monthlyRevenue: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
