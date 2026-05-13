import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, FileText, CheckCircle2, FlaskConical, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import { sessionApi } from '../services/endpoints'
import type { TestSession, SessionTest } from '../types'
import { PageLoader, StatusBadge, GenderBadge, ConfirmDialog, Modal, Spinner } from '../components/ui/index'
import PageHeader from '../components/layout/PageHeader'
import { formatDate, formatCurrency, formatDateTime } from '../utils/helpers'
import AddTestsToSessionModal from '../components/session/AddTestsToSessionModal'

// Helper: render a structured JSON result as readable key-value pairs
function ResultDisplay({ result, unit }: { result: string; unit?: string }) {
  let parsed: Record<string, string> | null = null
  try {
    const p = JSON.parse(result)
    if (typeof p === 'object' && !Array.isArray(p)) parsed = p
  } catch {}

  if (parsed) {
    const entries = Object.entries(parsed).filter(([, v]) => v !== '' && v != null)
    return (
      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3">
        {entries.map(([k, v]) => (
          <div key={k}>
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">{k.replace(/_/g, ' ')}</p>
            <p className="text-xs font-bold text-brand-navy">{String(v)}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-2 bg-slate-50 rounded-xl p-3 flex items-center gap-2">
      <p className="text-sm font-bold text-brand-navy">{result}</p>
      {unit && <span className="text-xs text-slate-400">{unit}</span>}
    </div>
  )
}
import EnterResultModal from '../components/session/EnterResultModal'

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [session, setSession]         = useState<TestSession | null>(null)
  const [loading, setLoading]         = useState(true)
  const [showAddTests, setShowAddTests] = useState(false)
  const [resultTest, setResultTest]   = useState<SessionTest | null>(null)
  const [removeTestId, setRemoveTestId] = useState<string | null>(null)
  const [removing, setRemoving]       = useState(false)
  const [genPdf, setGenPdf]           = useState(false)

  const load = async () => {
    try {
      const res = await sessionApi.getById(id!)
      setSession(res.data.data)
    } catch {
      toast.error('Session not found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleRemoveTest = async () => {
    if (!removeTestId || !session) return
    setRemoving(true)
    try {
      await sessionApi.removeTest(session._id, removeTestId)
      toast.success('Test removed')
      setRemoveTestId(null)
      load()
    } catch {
      toast.error('Failed to remove test')
    } finally {
      setRemoving(false)
    }
  }

  const handleGeneratePdf = async () => {
    if (!session) return
    setGenPdf(true)
    try {
      const res = await sessionApi.generatePdf(session._id)

      // If backend returned an error (not a PDF), read and show it
      const contentType = (res.headers?.['content-type'] as string) ?? ''
      if (!contentType.includes('application/pdf')) {
        const text = await new Blob([res.data as BlobPart]).text()
        console.error('PDF generation error from backend:', text)
        toast.error('Failed to generate PDF')
        return
      }

      // Stream PDF bytes → blob URL → open in new tab
      const blob = new Blob([res.data as BlobPart], { type: 'application/pdf' })
      const url  = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
      toast.success('PDF generated!')
      load()
    } catch (err) {
      console.error('generatePdf error:', err)
      toast.error('Failed to generate PDF')
    } finally {
      setGenPdf(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!session) return
    try {
      await sessionApi.updateStatus(session._id, status)
      toast.success('Status updated')
      load()
    } catch {
      toast.error('Failed to update status')
    }
  }

  if (loading) return <PageLoader />
  if (!session) return null

  const patient = session.patientId as any

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Test Session"
        subtitle={`Session details & results`}
        back={
          <Link to="/sessions" className="flex items-center gap-1.5 text-sm text-brand-navy/60 hover:text-brand-navy font-medium">
            <ArrowLeft size={14} /> Back to Sessions
          </Link>
        }
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowAddTests(true)} className="btn-secondary">
              <Plus size={15} /> Add Tests
            </button>
            <button onClick={handleGeneratePdf} disabled={genPdf} className="btn-primary">
              {genPdf ? <Spinner size={15} className="text-white" /> : <FileText size={15} />}
              {genPdf ? 'Generating...' : 'Generate PDF'}
            </button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Session Info */}
        <div className="space-y-4">
          {/* Patient card */}
          <div className="card">
            <h3 className="font-heading text-base text-brand-navy mb-3">Patient</h3>
            <Link to={`/patients/${patient?._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">{patient?.fullName?.charAt(0)}</span>
              </div>
              <div>
                <p className="font-semibold text-brand-navy">{patient?.fullName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <GenderBadge gender={patient?.gender ?? 'OTHER'} />
                  <span className="text-xs text-slate-400">{patient?.phone}</span>
                </div>
              </div>
            </Link>
            {patient?.nic && <p className="text-xs text-slate-400 mt-2">NIC: {patient.nic}</p>}
            {patient?.dob && <p className="text-xs text-slate-400">DOB: {formatDate(patient.dob)}</p>}
          </div>

          {/* Session details */}
          <div className="card">
            <h3 className="font-heading text-base text-brand-navy mb-3">Session Info</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Status',       value: <StatusBadge status={session.status} /> },
                { label: 'Sample Type',  value: session.sampleType },
                { label: 'Doctor',       value: session.doctorName ?? '—' },
                { label: 'Notes',        value: session.notes ?? '—' },
                { label: 'Created',      value: formatDateTime(session.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <span className="text-xs text-slate-400 font-medium">{label}</span>
                  <span className="text-xs font-semibold text-brand-navy text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status changer */}
          <div className="card">
            <h3 className="font-heading text-base text-brand-navy mb-3">Update Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
                    session.status === s
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-white text-brand-navy/60 border-brand-navy/20 hover:border-brand-navy hover:text-brand-navy'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="card bg-brand-navy text-white">
            <p className="text-brand-sky text-xs font-semibold uppercase tracking-wide mb-1">Total Amount</p>
            <p className="font-heading text-3xl">{formatCurrency(session.totalPrice)}</p>
            <p className="text-white/50 text-xs mt-1">{session.tests.length} test(s)</p>
          </div>
        </div>

        {/* Right: Tests */}
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
              <h3 className="font-heading text-lg text-brand-navy flex items-center gap-2">
                <FlaskConical size={18} /> Tests & Results
              </h3>
            </div>

            {session.tests.length === 0 ? (
              <div className="p-8 text-center">
                <FlaskConical size={28} className="text-brand-navy/20 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No tests added yet</p>
                <button onClick={() => setShowAddTests(true)} className="btn-primary mt-4 mx-auto">
                  <Plus size={14} /> Add Tests
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {session.tests.map((t, i) => (
                  <div key={t._id} className="p-5 hover:bg-brand-navy/2 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          t.result ? 'bg-emerald-100' : 'bg-amber-100'
                        }`}>
                          {t.result
                            ? <CheckCircle2 size={16} className="text-emerald-600" />
                            : <FlaskConical size={14} className="text-amber-600" />
                          }
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-brand-navy">{t.testName}</p>
                            <span className="text-[10px] bg-brand-navy/8 text-brand-navy px-2 py-0.5 rounded-full font-medium">
                              {t.facility}
                            </span>
                            {t.result && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                                Result entered
                              </span>
                            )}
                          </div>

                          {t.result && (
                            <div>
                              <ResultDisplay result={t.result} unit={t.unit} />
                              <div className="mt-1 flex gap-4 px-1">
                              {t.normalRange && (
                                <div>
                                  <p className="text-[9px] text-slate-400 font-semibold uppercase">Normal Range</p>
                                  <p className="text-xs text-slate-600">{t.normalRange}</p>
                                </div>
                              )}
                              {t.remarks && (
                                <div>
                                  <p className="text-[9px] text-slate-400 font-semibold uppercase">Remarks</p>
                                  <p className="text-xs text-slate-600">{t.remarks}</p>
                                </div>
                              )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-bold text-brand-navy text-sm">{formatCurrency(t.price)}</span>
                        <button onClick={() => setResultTest(t)}
                          className="p-1.5 rounded-lg hover:bg-brand-navy/10 text-brand-navy/50 hover:text-brand-navy transition-colors"
                          title="Enter Result"
                        >
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setRemoveTestId(t._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-brand-red transition-colors"
                          title="Remove Test"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total row */}
                <div className="flex justify-end px-5 py-3 bg-brand-navy/3 border-t border-brand-navy/10">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="font-heading text-xl text-brand-navy">{formatCurrency(session.totalPrice)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddTestsToSessionModal
        open={showAddTests}
        onClose={() => setShowAddTests(false)}
        onSaved={() => { setShowAddTests(false); load() }}
        sessionId={session._id}
        existingTestIds={session.tests.map(t => (t.testId as any)?._id ?? t.testId)}
      />

      {resultTest && (
        <EnterResultModal
          open={!!resultTest}
          onClose={() => setResultTest(null)}
          onSaved={() => { setResultTest(null); load() }}
          sessionId={session._id}
          sessionTest={resultTest}
        />
      )}

      <ConfirmDialog
        open={!!removeTestId}
        onClose={() => setRemoveTestId(null)}
        onConfirm={handleRemoveTest}
        title="Remove Test"
        message="Are you sure you want to remove this test from the session?"
        danger
        loading={removing}
      />
    </div>
  )
}