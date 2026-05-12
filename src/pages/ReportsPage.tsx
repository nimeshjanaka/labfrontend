import { useEffect, useState } from 'react'
import { FileBarChart, TrendingUp, Users, FlaskConical } from 'lucide-react'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { dashboardApi, sessionApi } from '../services/endpoints'
import type { DashboardStats, TestSession } from '../types'
import { PageLoader, StatusBadge, StatCard } from '../components/ui/index'
import PageHeader from '../components/layout/PageHeader'
import { formatCurrency, formatDateTime } from '../utils/helpers'

const STATUS_COLORS: Record<string, string> = {
  PENDING:     '#F59E0B',
  IN_PROGRESS: '#3B82F6',
  COMPLETED:   '#10B981',
  CANCELLED:   '#94A3B8',
}

export default function ReportsPage() {
  const [stats, setStats]     = useState<DashboardStats | null>(null)
  const [sessions, setSessions] = useState<TestSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r] = await Promise.all([
          dashboardApi.getStats(),
          sessionApi.getAll({ limit: 100 }),
        ])
        setStats(s.data.data)
        setSessions(r.data.data.data)
      } catch { toast.error('Failed to load') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <PageLoader />

  const pieData = [
    { name: 'Pending',     value: stats?.pendingSessions   ?? 0 },
    { name: 'In Progress', value: 0 },
    { name: 'Completed',   value: stats?.completedSessions ?? 0 },
  ].filter(d => d.value > 0)

  const pieColors = ['#F59E0B', '#3B82F6', '#10B981']

  const barData = [
    { name: 'Today',      sessions: stats?.todaySessions  ?? 0 },
    { name: 'This Month', sessions: stats?.monthSessions  ?? 0 },
    { name: 'All Time',   sessions: stats?.totalSessions  ?? 0 },
  ]

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Reports" subtitle="Overview of lab activity and revenue" />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Patients"   value={stats?.totalPatients   ?? 0} icon={<Users size={22} className="text-white" />} color="bg-brand-navy" />
        <StatCard label="Total Sessions"   value={stats?.totalSessions   ?? 0} icon={<FlaskConical size={22} className="text-white" />} color="bg-violet-500" />
        <StatCard label="Monthly Revenue"  value={formatCurrency(stats?.monthlyRevenue ?? 0)} icon={<TrendingUp size={22} className="text-white" />} color="bg-emerald-500" />
        <StatCard label="Pending Sessions" value={stats?.pendingSessions  ?? 0} icon={<FlaskConical size={22} className="text-white" />} color="bg-amber-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Bar chart */}
        <div className="card">
          <h3 className="font-heading text-lg text-brand-navy mb-4">Session Volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="sessions" fill="#1B4F9B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <h3 className="font-heading text-lg text-brand-navy mb-4">Status Breakdown</h3>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent sessions table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h3 className="font-heading text-lg text-brand-navy flex items-center gap-2">
            <FileBarChart size={18} /> Recent Sessions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-brand-navy/5 border-b border-brand-navy/8">
                {['Patient', 'Tests', 'Status', 'Total', 'Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-brand-navy/60 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sessions.slice(0, 20).map(s => {
                const patient = s.patientId as any
                return (
                  <tr key={s._id} className="hover:bg-brand-navy/3 transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold text-brand-navy">{patient?.fullName}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{s.tests.length}</td>
                    <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3 text-sm font-bold text-brand-navy">{formatCurrency(s.totalPrice)}</td>
                    <td className="px-5 py-3 text-xs text-slate-400">{formatDateTime(s.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
