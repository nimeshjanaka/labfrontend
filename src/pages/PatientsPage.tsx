import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Eye, Pencil, Trash2, Phone, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { patientApi } from '../services/endpoints'
import type { Patient } from '../types'
import { PageLoader, Empty, GenderBadge, ConfirmDialog } from '../components/ui/index'
import PageHeader from '../components/layout/PageHeader'
import { formatDate, calcAge } from '../utils/helpers'
import AddPatientModal from '../components/patient/AddPatientModal'

export default function PatientsPage() {
  const [patients, setPatients]   = useState<Patient[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]         = useState(0)
  const [showAdd, setShowAdd]     = useState(false)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)
  const [deleteId, setDeleteId]   = useState<string | null>(null)
  const [deleting, setDeleting]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await patientApi.getAll({ query: search || undefined, page, limit: 15 })
      setPatients(res.data.data.data)
      setTotalPages(res.data.data.totalPages)
      setTotal(res.data.data.total)
    } catch {
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { load() }, [load])

  // Debounced search
  useEffect(() => { setPage(1) }, [search])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await patientApi.delete(deleteId)
      toast.success('Patient deleted')
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
        title="Patients"
        subtitle={`${total} total patients registered`}
        action={
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus size={16} /> Add Patient
          </button>
        }
      />

      {/* Search */}
      <div className="card mb-6 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search by name, NIC, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? <PageLoader /> : patients.length === 0 ? (
        <div className="card">
          <Empty
            title="No patients found"
            description={search ? 'Try a different search term' : 'Add your first patient to get started'}
            icon={<Users size={28} />}
            action={!search ? (
              <button onClick={() => setShowAdd(true)} className="btn-primary">
                <Plus size={16} /> Add Patient
              </button>
            ) : undefined}
          />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-navy/5 border-b border-brand-navy/8">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-brand-navy/60 uppercase tracking-wide">Patient</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-brand-navy/60 uppercase tracking-wide">NIC</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-brand-navy/60 uppercase tracking-wide">Gender</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-brand-navy/60 uppercase tracking-wide">Age</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-brand-navy/60 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-brand-navy/60 uppercase tracking-wide">Registered</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-brand-navy/60 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patients.map((p, i) => (
                  <tr key={p._id} className="hover:bg-brand-navy/3 transition-colors"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{p.fullName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-brand-navy">{p.fullName}</p>
                          <p className="text-xs text-slate-400">{formatDate(p.dob)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">{p.nic ?? '—'}</td>
                    <td className="px-5 py-3.5"><GenderBadge gender={p.gender} /></td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{calcAge(p.dob)} yrs</td>
                    <td className="px-5 py-3.5">
                      <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-sm text-brand-navy hover:underline">
                        <Phone size={12} />{p.phone}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{formatDate(p.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link to={`/patients/${p._id}`}
                          className="p-1.5 rounded-lg hover:bg-brand-navy/10 text-brand-navy/50 hover:text-brand-navy transition-colors"
                          title="View"
                        >
                          <Eye size={15} />
                        </Link>
                        <button
                          onClick={() => setEditPatient(p)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(p._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-brand-red transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

      {/* Add/Edit Modal */}
      <AddPatientModal
        open={showAdd || !!editPatient}
        onClose={() => { setShowAdd(false); setEditPatient(null) }}
        onSaved={load}
        patient={editPatient}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Patient"
        message="This will permanently delete the patient and cannot be undone."
        danger
        loading={deleting}
      />
    </div>
  )
}
