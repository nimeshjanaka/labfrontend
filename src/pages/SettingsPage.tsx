import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Shield, Key, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/endpoints'
import PageHeader from '../components/layout/PageHeader'
import { InputField, SelectField, Spinner, Alert } from '../components/ui/index'

interface PasswordForm { oldPassword: string; newPassword: string; confirm: string }
interface RegisterForm { name: string; email: string; password: string; role: string }

export default function SettingsPage() {
  const [tab, setTab] = useState<'password' | 'register'>('password')
  const [loadingPw, setLoadingPw]   = useState(false)
  const [loadingReg, setLoadingReg] = useState(false)
  const [successPw, setSuccessPw]   = useState(false)
  const [successReg, setSuccessReg] = useState(false)

  const pwForm  = useForm<PasswordForm>()
  const regForm = useForm<RegisterForm>()

  const onChangePw = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirm) {
      pwForm.setError('confirm', { message: 'Passwords do not match' })
      return
    }
    setLoadingPw(true)
    setSuccessPw(false)
    try {
      await authApi.changePassword(data.oldPassword, data.newPassword)
      toast.success('Password changed!')
      setSuccessPw(true)
      pwForm.reset()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed')
    } finally {
      setLoadingPw(false)
    }
  }

  const onRegister = async (data: RegisterForm) => {
    setLoadingReg(true)
    setSuccessReg(false)
    try {
      await authApi.register(data)
      toast.success(`User ${data.name} created!`)
      setSuccessReg(true)
      regForm.reset()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed')
    } finally {
      setLoadingReg(false)
    }
  }

  const tabs = [
    { id: 'password', label: 'Change Password', icon: Key },
    { id: 'register', label: 'Add Staff User',  icon: UserPlus },
  ]

  return (
    <div className="animate-fadeIn max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account and staff users" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === id ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy/60 hover:text-brand-navy hover:bg-brand-navy/8'
            }`}
          >
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {tab === 'password' && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center">
              <Key size={18} className="text-brand-navy" />
            </div>
            <div>
              <h3 className="font-heading text-lg text-brand-navy">Change Password</h3>
              <p className="text-xs text-slate-400">Update your account password</p>
            </div>
          </div>

          {successPw && <div className="mb-4"><Alert type="success" message="Password changed successfully!" /></div>}

          <form onSubmit={pwForm.handleSubmit(onChangePw)} className="space-y-4">
            <InputField label="Current Password" type="password" required
              error={pwForm.formState.errors.oldPassword?.message}
              {...pwForm.register('oldPassword', { required: 'Required' })} />
            <InputField label="New Password" type="password" required
              error={pwForm.formState.errors.newPassword?.message}
              {...pwForm.register('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} />
            <InputField label="Confirm New Password" type="password" required
              error={pwForm.formState.errors.confirm?.message}
              {...pwForm.register('confirm', { required: 'Required' })} />
            <button type="submit" disabled={loadingPw} className="btn-primary">
              {loadingPw && <Spinner size={16} className="text-white" />}
              {loadingPw ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {tab === 'register' && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center">
              <UserPlus size={18} className="text-brand-navy" />
            </div>
            <div>
              <h3 className="font-heading text-lg text-brand-navy">Add Staff User</h3>
              <p className="text-xs text-slate-400">Create a new admin or lab assistant account</p>
            </div>
          </div>

          {successReg && <div className="mb-4"><Alert type="success" message="User created successfully!" /></div>}

          <form onSubmit={regForm.handleSubmit(onRegister)} className="space-y-4">
            <InputField label="Full Name" required placeholder="John Perera"
              error={regForm.formState.errors.name?.message}
              {...regForm.register('name', { required: 'Required' })} />
            <InputField label="Email Address" type="email" required placeholder="staff@medlab.com"
              error={regForm.formState.errors.email?.message}
              {...regForm.register('email', { required: 'Required' })} />
            <InputField label="Password" type="password" required placeholder="Min 6 characters"
              error={regForm.formState.errors.password?.message}
              {...regForm.register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} />
            <SelectField label="Role" required
              error={regForm.formState.errors.role?.message}
              options={[
                { value: 'LAB_ASSISTANT', label: 'Lab Assistant' },
                { value: 'ADMIN',         label: 'Admin' },
              ]}
              {...regForm.register('role', { required: 'Required' })} />
            <button type="submit" disabled={loadingReg} className="btn-primary">
              {loadingReg && <Spinner size={16} className="text-white" />}
              {loadingReg ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
