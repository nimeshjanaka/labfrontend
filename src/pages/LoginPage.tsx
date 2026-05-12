import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/endpoints'
import { useAuthStore } from '../store/authStore'
import Logo from '../components/ui/Logo'
import { Spinner } from '../components/ui/index'

interface LoginForm { email: string; password: string }

export default function LoginPage() {
  const { isAuthenticated, setAuth } = useAuthStore()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const res = await authApi.login(data.email, data.password)
      setAuth(res.data.data.user, res.data.data.token)
      toast.success(`Welcome back, ${res.data.data.user.name}!`)
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-navy flex-col items-center justify-center relative overflow-hidden p-12">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-brand-navylight/30" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-brand-navydark/50" />
        <div className="absolute top-1/3 right-10 w-40 h-40 rounded-full bg-brand-sky/20" />

        {/* Heartbeat line */}
        <svg className="absolute bottom-32 left-0 right-0 w-full opacity-20" viewBox="0 0 600 80" fill="none">
          <polyline
            points="0,40 80,40 110,10 130,70 150,40 180,40 210,20 230,60 250,40 600,40"
            stroke="#E53935" strokeWidth="2.5" fill="none" strokeLinecap="round"
          />
        </svg>

        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-8">
            <Logo size={80} showText={false} />
          </div>
          <h1 className="font-heading text-5xl text-white mb-3">FamilyCare</h1>
          <p className="text-brand-sky text-lg font-semibold mb-2">Medical Laboratory Services</p>
          <p className="text-white/50 text-sm max-w-xs leading-relaxed">
            We PROTECT and IMPROVE the HEALTH of people around us
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            {[['Accurate', 'Results'], ['Trusted', 'Service'], ['Modern', 'Lab']].map(([l1, l2]) => (
              <div key={l1} className="bg-white/10 rounded-2xl p-4">
                <p className="text-white font-semibold text-sm">{l1}</p>
                <p className="text-white/60 text-xs">{l2}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F4F7FB]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size={52} showText />
          </div>

          <div className="card animate-scaleIn">
            <div className="mb-8">
              <h2 className="font-heading text-3xl text-brand-navy">Welcome back</h2>
              <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email Address <span className="text-brand-red">*</span></label>
                <input
                  className={`input ${errors.email ? 'border-brand-red' : ''}`}
                  type="email"
                  placeholder="admin@medlab.com"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="text-xs text-brand-red mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Password <span className="text-brand-red">*</span></label>
                <div className="relative">
                  <input
                    className={`input pr-11 ${errors.password ? 'border-brand-red' : ''}`}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-navy"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-brand-red mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex justify-end">
                <a href="/forgot-password" className="text-xs text-brand-navy hover:underline font-medium">
                  Forgot password?
                </a>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <Spinner size={18} className="text-white" /> : <LogIn size={18} />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Temple Junction Kirimatiyana Lunuwila · 077-9797476
          </p>
        </div>
      </div>
    </div>
  )
}
