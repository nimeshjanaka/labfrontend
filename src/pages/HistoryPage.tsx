import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, History, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react'
import toast from 'react-hot-toast'
import { patientApi } from '../services/endpoints'
import type { Patient, TestSession } from '../types'
import { PageLoader, Empty, GenderBadge, StatusBadge } from '../components/ui/index'
import PageHeader from '../components/layout/PageHeader'
import { formatDate, formatDateTime, formatCurrency, calcAge } from '../utils/helpers'

const DATE_RANGES = [
  { value: '', label: 'All Time' },
  { value: 'weekly', label: 'Last 7 Days' },
  { value: 'monthly', label: 'Last 30 Days' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '1year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
]

export default function HistoryPage() {
  const [data, setData]           = useState<Patient[]>([])
  const [loading, setLoading]     = useState(true)
  const [query, setQuery]         = useState('')
  const [dateRange, setDateRange] = useState('')
  const [fromDate, setFromDate]   = useState('')
  const [toDate, setToDate]       = useState('')
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]         = useState(0)
  const [expanded, setExpanded]   = useState<Record<string, boolean>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await patientApi.searchHistory({
        q:     query || undefined,
        range: dateRange || undefined,
        from:  dateRange === 'custom' ? fromDate : undefined,
        to:    dateRange === 'custom' ? toDate   : undefined,
        page,
        limit: 10,
      })
      setData(res.data.data.data)
      setTotalPages(res.data.data.totalPages)
      setTotal(res.data.data.total)
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [query, dateRange, fromDate, toDate, page])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [query, dateRange])

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Patient History"
        subtitle={`${total} records found`}
      />

      {/* Filters */}
      <div className="card mb-6 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-10" placeholder="Search patient name, NIC, phone..."
              value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <select className="input w-44" value={dateRange} onChange={e => setDateRange(e.target.value)}>
            {DATE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          {dateRange === 'custom' && (
            <>
              <input type="date" className="input w-40" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              <input type="date" className="input w-40" value={toDate}   onChange={e => setToDate(e.target.value)} />
            </>
          )}
        </div>
      </div>

      {loading ? <PageLoader /> : data.length === 0 ? (
        <div className="card">
          <Empty title="No records found" description="Try adjusting your search or date filter" icon={<History size={28} />} />
        </div>
      ) : (
        <div className="space-y-4">
          {data.map(patient => {
            const sessions = (patient.sessions ?? []) as TestSession[]
            const isOpen = !!expanded[patient._id]
            const grandTotal = sessions.reduce((sum, s) => sum + (s.totalPrice ?? 0), 0)

            return (
              <div key={patient._id} className="card p-0 overflow-hidden animate-fadeIn">
                {/* Patient row */}
                <button
                  onClick={() => toggle(patient._id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-brand-navy/3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{patient.fullName.charAt(0)}</span>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-brand-navy">{patient.fullName}</p>
                        <GenderBadge gender={patient.gender} />
                      </div>
                      <p className="text-xs text-slate-400">
                        {patient.nic && `NIC: ${patient.nic} · `}
                        {patient.phone} · Age: {calcAge(patient.dob)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-400">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
                      <p className="font-semibold text-brand-navy text-sm">{formatCurrency(grandTotal)}</p>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-brand-navy/40" /> : <ChevronDown size={16} className="text-brand-navy/40" />}
                  </div>
                </button>

                {/* Expanded sessions */}
                {isOpen && (
                  <div className="border-t border-brand-navy/8">
                    {sessions.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-5">No sessions in this period</p>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {sessions.map(s => (
                          <Link key={s._id} to={`/sessions/${s._id}`}
                            className="flex items-center gap-4 px-8 py-3.5 hover:bg-brand-navy/3 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-brand-navy/8 flex items-center justify-center flex-shrink-0">
                              <FlaskConical size={14} className="text-brand-navy" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-brand-navy">
                                  {s.tests.length} test{s.tests.length !== 1 ? 's' : ''}
                                </p>
                                <StatusBadge status={s.status} />
                                {s.doctorName && <span className="text-xs text-slate-400">Dr. {s.doctorName}</span>}
                              </div>
                              <p className="text-xs text-slate-400">{formatDateTime(s.createdAt)}</p>
                              {/* Test names */}
                              <div className="flex gap-1 flex-wrap mt-1">
                                {s.tests.slice(0, 5).map(t => (
                                  <span key={t._id} className="text-[10px] bg-brand-navy/8 text-brand-navy px-2 py-0.5 rounded-full">
                                    {t.testName}
                                  </span>
                                ))}
                                {s.tests.length > 5 && (
                                  <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                                    +{s.tests.length - 5} more
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-brand-navy">{formatCurrency(s.totalPrice)}</p>
                              <p className="text-xs text-slate-400">{s.sampleType}</p>
                            </div>
                          </Link>
                        ))}
                        {/* Patient total */}
                        <div className="flex justify-between px-8 py-2.5 bg-brand-navy/3">
                          <span className="text-xs font-semibold text-slate-400">Patient Total</span>
                          <span className="text-sm font-bold text-brand-navy">{formatCurrency(grandTotal)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between card p-4">
              <p className="text-xs text-slate-400">Page {page} of {totalPages} · {total} records</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs py-1.5 px-3">Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-xs py-1.5 px-3">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
