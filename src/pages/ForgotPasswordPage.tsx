import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/endpoints'
import Logo from '../components/ui/Logo'
import { Spinner, Alert } from '../components/ui/index'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>()

  const onSubmit = async (data: { email: string }) => {
    setLoading(true)
    try {
      await authApi.forgotPassword(data.email)
      setSent(true)
    } catch {
      toast.error('Something went wrong')
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
            <h2 className="font-heading text-2xl text-brand-navy">Forgot Password?</h2>
            <p className="text-slate-400 text-sm mt-1">Enter your email and we'll send a reset link</p>
          </div>

          {sent ? (
            <div className="space-y-4">
              <Alert type="success" message="Reset link sent! Check your email inbox." />
              <Link to="/login" className="btn-primary w-full justify-center">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email Address <span className="text-brand-red">*</span></label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className={`input pl-10 ${errors.email ? 'border-brand-red' : ''}`}
                    type="email"
                    placeholder="your@email.com"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && <p className="text-xs text-brand-red mt-1">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <Spinner size={16} className="text-white" /> : <Mail size={16} />}
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-brand-navy/60 hover:text-brand-navy font-medium transition-colors">
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
