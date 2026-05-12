import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import './index.css'

import AppLayout          from './components/layout/AppLayout'
import LoginPage          from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage  from './pages/ResetPasswordPage'
import DashboardPage      from './pages/DashboardPage'
import PatientsPage       from './pages/PatientsPage'
import PatientDetailPage  from './pages/PatientDetailPage'
import SessionsPage       from './pages/SessionsPage'
import SessionDetailPage  from './pages/SessionDetailPage'
import LabTestsPage       from './pages/LabTestsPage'
import HistoryPage        from './pages/HistoryPage'
import ReportsPage        from './pages/ReportsPage'
import SettingsPage       from './pages/SettingsPage'
import NotFoundPage       from './pages/NotFoundPage'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />

        {/* Root: redirect to login if not authenticated, dashboard if authenticated */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected (inside sidebar layout) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/patients"   element={<PatientsPage />} />
          <Route path="/patients/:id" element={<PatientDetailPage />} />
          <Route path="/sessions"   element={<SessionsPage />} />
          <Route path="/sessions/:id" element={<SessionDetailPage />} />
          <Route path="/lab-tests"  element={<LabTestsPage />} />
          <Route path="/history"    element={<HistoryPage />} />
          <Route path="/reports"    element={<ReportsPage />} />
          <Route path="/settings"   element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>

    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#fff',
          color: '#1a2340',
          borderRadius: '12px',
          border: '1px solid rgba(27,79,155,0.1)',
          boxShadow: '0 4px 20px rgba(27,79,155,0.12)',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#10B981', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#E53935', secondary: '#fff' },
        },
      }}
    />
  </React.StrictMode>
)