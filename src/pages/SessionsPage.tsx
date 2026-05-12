import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, Trash2, FlaskConical, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { sessionApi, patientApi } from '../services/endpoints'
import type { TestSession, Patient } from '../types'
import { PageLoader, Empty, StatusBadge, GenderBadge, ConfirmDialog } from '../components/ui/index'
import PageHeader from '../components/layout/PageHeader'
import { formatDateTime, formatCurrency } from '../utils/helpers'
import CreateSessionModal from '../components/session/CreateSessionModal'

const STATUS_OPTIONS = ['', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function SessionsPage() {
  const [sessions, setSessions]     = useState<TestSession[]>([])
  const [loading, setLoading]       = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]           = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId]     = useState<string | null>(null)
  const [deleting, setDeleting]     = useState(false)
  // Quick patient select for new session
  const [patients, setPatients]     = useState<Patient[]>([])
  const [selPatient, setSelPatient] = useState<Patient | null>(null)
  const [showPatientPick, setShowPatientPick] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await sessionApi.getAll({
        status: statusFilter || undefined,
        page,
        limit: 15,
      })
      setSessions(res.data.data.data)
      setTotalPages(res.data.data.totalPages)
      setTotal(res.data.data.total)
    } catch {
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [statusFilter])

  const openCreate = async () => {
    const res = await patientApi.getAll({ limit: 100 })
    setPatients(res.data.data.data)
    setShowPatientPick(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await sessionApi.delete(deleteId)
      toast.success('Session deleted')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Test Sessions"
        subtitle={`${total} total sessions`}
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> New Session
          </button>
        }
      />

      {/* Filters */}
      <div className="card mb-6 p-4 flex items-center gap-3">
        <Filter size={15} className="text-brand-navy/40" />
        <span className="text-xs font-semibold text-slate-400 uppercase">Status:</span>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                statusFilter === s
                  ? 'bg-brand-navy text-white'
                  : 'bg-brand-navy/8 text-brand-navy/60 hover:bg-brand-navy/15'
              }`}
            >
              {s === '' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? <PageLoader /> : sessions.length === 0 ? (
        <div className="card">
          <Empty
            title="No sessions found"
            description="Create a new test session for a patient"
            icon={<FlaskConical size={28} />}
            action={
              <button onClick={openCreate} className="btn-primary">
                <Plus size={16} /> New Session
              </button>
            }
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-navy/5 border-b border-brand-navy/8">
                  {['Patient', 'Tests', 'Sample', 'Status', 'Total Price', 'Doctor', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-brand-navy/60 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sessions.map(s => {
                  const patient = s.patientId as any
                  return (
                    <tr key={s._id} className="hover:bg-brand-navy/3 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-navy/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-brand-navy font-bold text-sm">{patient?.fullName?.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-brand-navy">{patient?.fullName}</p>
                            <GenderBadge gender={patient?.gender ?? 'OTHER'} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-brand-navy/8 text-brand-navy px-2.5 py-1 rounded-full">
                          <FlaskConical size={11} /> {s.tests.length}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-medium text-slate-500">{s.sampleType}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                      <td className="px-5 py-3.5 text-sm font-bold text-brand-navy">{formatCurrency(s.totalPrice)}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-400">{s.doctorName ?? '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-400">{formatDateTime(s.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          <Link to={`/sessions/${s._id}`}
                            className="p-1.5 rounded-lg hover:bg-brand-navy/10 text-brand-navy/50 hover:text-brand-navy transition-colors"
                          >
                            <Eye size={15} />
                          </Link>
                          <button onClick={() => setDeleteId(s._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-brand-red transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-50">
              <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs py-1.5 px-3">Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-xs py-1.5 px-3">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Patient Picker Modal */}
      {showPatientPick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm" onClick={() => setShowPatientPick(false)} />
          <div className="relative bg-white rounded-2xl shadow-panel w-full max-w-sm animate-scaleIn p-6">
            <h3 className="font-heading text-xl text-brand-navy mb-4">Select Patient</h3>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {patients.map(p => (
                <button key={p._id} onClick={() => { setSelPatient(p); setShowPatientPick(false); setShowCreate(true) }}
                  className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-navy/8 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{p.fullName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">{p.fullName}</p>
                    <p className="text-xs text-slate-400">{p.phone}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowPatientPick(false)} className="btn-secondary w-full justify-center mt-4">Cancel</button>
          </div>
        </div>
      )}

      {selPatient && (
        <CreateSessionModal
          open={showCreate}
          onClose={() => { setShowCreate(false); setSelPatient(null) }}
          onSaved={() => { setShowCreate(false); setSelPatient(null); load() }}
          patientId={selPatient._id}
          patientName={selPatient.fullName}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Session"
        message="This will permanently delete the session and all test results."
        danger
        loading={deleting}
      />
    </div>
  )
}
