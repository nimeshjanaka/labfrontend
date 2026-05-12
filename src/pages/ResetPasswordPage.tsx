import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/endpoints'
import Logo from '../components/ui/Logo'
import { Spinner, Alert } from '../components/ui/index'

interface FormData { newPassword: string; confirm: string }

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    if (!token) { toast.error('Invalid reset link'); return }
    setLoading(true)
    try {
      await authApi.resetPassword(token, data.newPassword)
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FB] p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size={52} showText />
        </div>

        <div className="card animate-scaleIn">
          <div className="mb-6">
            <h2 className="font-heading text-2xl text-brand-navy">Reset Password</h2>
            <p className="text-slate-400 text-sm mt-1">Enter your new password below</p>
          </div>

          {done ? (
            <div className="space-y-4">
              <Alert type="success" message="Password reset! Redirecting to login..." />
            </div>
          ) : !token ? (
            <div className="space-y-4">
              <Alert type="error" message="Invalid or expired reset link." />
              <Link to="/forgot-password" className="btn-primary w-full justify-center">Request New Link</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">New Password <span className="text-brand-red">*</span></label>
                <input
                  className={`input ${errors.newPassword ? 'border-brand-red' : ''}`}
                  type="password" placeholder="Min 6 characters"
                  {...register('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })}
                />
                {errors.newPassword && <p className="text-xs text-brand-red mt-1">{errors.newPassword.message}</p>}
              </div>
              <div>
                <label className="label">Confirm Password <span className="text-brand-red">*</span></label>
                <input
                  className={`input ${errors.confirm ? 'border-brand-red' : ''}`}
                  type="password" placeholder="Repeat password"
                  {...register('confirm', {
                    required: 'Required',
                    validate: v => v === watch('newPassword') || 'Passwords do not match',
                  })}
                />
                {errors.confirm && <p className="text-xs text-brand-red mt-1">{errors.confirm.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <Spinner size={16} className="text-white" /> : <KeyRound size={16} />}
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
