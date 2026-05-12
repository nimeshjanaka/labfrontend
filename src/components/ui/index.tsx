import React from 'react'
import { X, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react'
import { clsx } from 'clsx'

// ── Modal ──────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-white rounded-2xl shadow-panel w-full animate-scaleIn', widths[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-heading text-xl text-brand-navy">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
interface ConfirmProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  danger?: boolean
  loading?: boolean
}
export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger, loading }: ConfirmProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-panel w-full max-w-sm animate-scaleIn p-6">
        <div className={clsx('w-12 h-12 rounded-full flex items-center justify-center mb-4',
          danger ? 'bg-red-100' : 'bg-brand-navy/10'
        )}>
          <AlertTriangle size={22} className={danger ? 'text-brand-red' : 'text-brand-navy'} />
        </div>
        <h3 className="font-heading text-lg text-brand-navy mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={clsx('flex-1 justify-center', danger ? 'btn-danger' : 'btn-primary')}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Spinner ────────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={clsx('animate-spin text-brand-navy', className)} width={size} height={size}
      viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ── Page Loader ────────────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} />
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────────
interface EmptyProps { title: string; description?: string; action?: React.ReactNode; icon?: React.ReactNode }
export function Empty({ title, description, action, icon }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-navy/8 flex items-center justify-center mb-4 text-brand-navy/40">
        {icon ?? <Info size={28} />}
      </div>
      <h4 className="font-heading text-lg text-brand-navy mb-1">{title}</h4>
      {description && <p className="text-sm text-slate-400 mb-5 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

// ── Status Badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    PENDING:     { cls: 'badge-pending',   label: 'Pending' },
    IN_PROGRESS: { cls: 'badge-progress',  label: 'In Progress' },
    COMPLETED:   { cls: 'badge-completed', label: 'Completed' },
    CANCELLED:   { cls: 'badge-cancelled', label: 'Cancelled' },
  }
  const s = map[status] ?? { cls: 'badge-pending', label: status }
  return <span className={s.cls}>{s.label}</span>
}

// ── Gender Badge ──────────────────────────────────────────────────────────────
export function GenderBadge({ gender }: { gender: string }) {
  const map: Record<string, string> = {
    MALE:   'bg-blue-50 text-blue-600',
    FEMALE: 'bg-pink-50 text-pink-600',
    OTHER:  'bg-purple-50 text-purple-600',
  }
  return (
    <span className={clsx('inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold', map[gender] ?? 'bg-slate-100 text-slate-500')}>
      {gender.charAt(0) + gender.slice(1).toLowerCase()}
    </span>
  )
}

// ── Input Field ────────────────────────────────────────────────────────────────
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  required?: boolean
}
export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, required, className, ...props }, ref) => (
    <div>
      <label className="label">{label}{required && <span className="text-brand-red ml-0.5">*</span>}</label>
      <input ref={ref} className={clsx('input', error && 'border-brand-red focus:ring-brand-red/30', className)} {...props} />
      {error && <p className="text-xs text-brand-red mt-1">{error}</p>}
    </div>
  )
)
InputField.displayName = 'InputField'

// ── Select Field ───────────────────────────────────────────────────────────────
interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  required?: boolean
  options: { value: string; label: string }[]
}
export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, required, options, className, ...props }, ref) => (
    <div>
      <label className="label">{label}{required && <span className="text-brand-red ml-0.5">*</span>}</label>
      <select ref={ref} className={clsx('input', error && 'border-brand-red', className)} {...props}>
        <option value="">Select {label}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-brand-red mt-1">{error}</p>}
    </div>
  )
)
SelectField.displayName = 'SelectField'

// ── Alert ──────────────────────────────────────────────────────────────────────
interface AlertProps { type: 'success' | 'error' | 'info'; message: string }
export function Alert({ type, message }: AlertProps) {
  const map = {
    success: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
    error:   { cls: 'bg-red-50 text-brand-red border-red-200',           Icon: XCircle },
    info:    { cls: 'bg-blue-50 text-blue-700 border-blue-200',          Icon: Info },
  }
  const { cls, Icon } = map[type]
  return (
    <div className={clsx('flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium', cls)}>
      <Icon size={16} className="flex-shrink-0" />
      {message}
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
  sub?: string
}
export function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  return (
    <div className="card flex items-start gap-4 animate-fadeIn">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="font-heading text-2xl text-brand-navy mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}