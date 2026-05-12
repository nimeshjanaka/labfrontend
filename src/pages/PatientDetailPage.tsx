import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Phone, MapPin, Hash, Calendar, FlaskConical, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import { patientApi } from '../services/endpoints'
import type { Patient, TestSession } from '../types'
import { PageLoader, StatusBadge, GenderBadge } from '../components/ui/index'
import PageHeader from '../components/layout/PageHeader'
import { formatDate, calcAge, formatDateTime, formatCurrency } from '../utils/helpers'
import AddPatientModal from '../components/patient/AddPatientModal'
import CreateSessionModal from '../components/session/CreateSessionModal'

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [showSession, setShowSession] = useState(false)

  const load = async () => {
    try {
      const res = await patientApi.getById(id!)
      setPatient(res.data.data)
    } catch {
      toast.error('Patient not found')
      navigate('/patients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  if (loading) return <PageLoader />
  if (!patient) return null

  const sessions = (patient.sessions ?? []) as TestSession[]

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title={patient.fullName}
        subtitle="Patient profile & test history"
        back={
          <Link to="/patients" className="flex items-center gap-1.5 text-sm text-brand-navy/60 hover:text-brand-navy font-medium transition-colors">
            <ArrowLeft size={14} /> Back to Patients
          </Link>
        }
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowEdit(true)} className="btn-secondary">
              <Pencil size={15} /> Edit
            </button>
            <button onClick={() => setShowSession(true)} className="btn-primary">
              <Plus size={15} /> New Test Session
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient Info Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center pb-5 border-b border-slate-50 mb-5">
              <div className="w-20 h-20 rounded-full bg-brand-navy flex items-center justify-center mb-3">
                <span className="text-white text-3xl font-bold">{patient.fullName.charAt(0)}</span>
              </div>
              <h2 className="font-heading text-xl text-brand-navy">{patient.fullName}</h2>
              <div className="mt-2 flex gap-2 justify-center flex-wrap">
                <GenderBadge gender={patient.gender} />
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-navy/8 text-brand-navy">
                  {calcAge(patient.dob)} years
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { icon: Hash,     label: 'NIC',       value: patient.nic ?? '—' },
                { icon: Calendar, label: 'DOB',       value: formatDate(patient.dob) },
                { icon: Phone,    label: 'Phone',     value: patient.phone },
                { icon: MapPin,   label: 'Address',   value: patient.address ?? '—' },
                { icon: Calendar, label: 'Registered',value: formatDate(patient.createdAt) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-navy/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={13} className="text-brand-navy" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                    <p className="text-sm text-brand-navy font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="card">
            <h3 className="font-heading text-base text-brand-navy mb-3">Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-brand-navy/5 rounded-xl p-3 text-center">
                <p className="font-heading text-2xl text-brand-navy">{sessions.length}</p>
                <p className="text-xs text-slate-400">Total Sessions</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="font-heading text-2xl text-emerald-600">
                  {sessions.filter(s => s.status === 'COMPLETED').length}
                </p>
                <p className="text-xs text-slate-400">Completed</p>
              </div>
              <div className="col-span-2 bg-amber-50 rounded-xl p-3 text-center">
                <p className="font-heading text-xl text-amber-700">
                  {formatCurrency(sessions.reduce((sum, s) => sum + (s.totalPrice ?? 0), 0))}
                </p>
                <p className="text-xs text-slate-400">Total Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <h3 className="font-heading text-lg text-brand-navy flex items-center gap-2">
                <FlaskConical size={18} /> Test Sessions
              </h3>
              <button onClick={() => setShowSession(true)} className="btn-primary text-sm py-1.5 px-4">
                <Plus size={14} /> New Session
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="p-8 text-center">
                <FlaskConical size={32} className="text-brand-navy/20 mx-auto mb-3" />
                <p className="font-heading text-brand-navy/50">No test sessions yet</p>
                <button onClick={() => setShowSession(true)} className="btn-primary mt-4 mx-auto">
                  <Plus size={14} /> Create First Session
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {sessions.map(s => (
                  <Link key={s._id} to={`/sessions/${s._id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-brand-navy/3 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-navy/8 flex items-center justify-center flex-shrink-0">
                      <FlaskConical size={18} className="text-brand-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-brand-navy">
                          {s.tests.length} test{s.tests.length !== 1 ? 's' : ''}
                        </p>
                        <StatusBadge status={s.status} />
                      </div>
                      <p className="text-xs text-slate-400">{formatDateTime(s.createdAt)}</p>
                      {s.doctorName && <p className="text-xs text-slate-400">Dr. {s.doctorName}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-navy">{formatCurrency(s.totalPrice)}</p>
                      <p className="text-xs text-slate-400">{s.sampleType}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddPatientModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSaved={load}
        patient={patient}
      />

      <CreateSessionModal
        open={showSession}
        onClose={() => setShowSession(false)}
        onSaved={() => { setShowSession(false); load() }}
        patientId={patient._id}
        patientName={patient.fullName}
      />
    </div>
  )
}
