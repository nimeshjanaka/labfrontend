import { useEffect, useState } from 'react'
import { Users, FlaskConical, Clock, CheckCircle2, TrendingUp, Calendar, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'
import { dashboardApi } from '../services/endpoints'
import type { DashboardStats, TestSession } from '../types'
import { StatCard, PageLoader, StatusBadge, GenderBadge } from '../components/ui/index'
import PageHeader from '../components/layout/PageHeader'
import { formatDateTime, formatCurrency } from '../utils/helpers'
import { useAuthStore } from '../store/authStore'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [sessions, setSessions] = useState<TestSession[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentSessions(),
        ])
        setStats(s.data.data)
        setSessions(r.data.data)
      } catch {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <PageLoader />

  const chartData = [
    { name: 'Pending',     value: stats?.pendingSessions   ?? 0, fill: '#F59E0B' },
    { name: 'Completed',   value: stats?.completedSessions ?? 0, fill: '#10B981' },
    { name: 'This Month',  value: stats?.monthSessions     ?? 0, fill: '#1B4F9B' },
    { name: 'Today',       value: stats?.todaySessions     ?? 0, fill: '#4FC3F7' },
  ]

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title={`Good day, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's what's happening at FamilyCare Medical Laboratory today"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Patients"
          value={stats?.totalPatients ?? 0}
          icon={<Users size={22} className="text-white" />}
          color="bg-brand-navy"
          sub="All time"
        />
        <StatCard
          label="Today's Patients"
          value={stats?.todayPatients ?? 0}
          icon={<Calendar size={22} className="text-white" />}
          color="bg-brand-sky"
          sub="Registered today"
        />
        <StatCard
          label="Pending Tests"
          value={stats?.pendingSessions ?? 0}
          icon={<Clock size={22} className="text-white" />}
          color="bg-amber-500"
          sub="Awaiting results"
        />
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(stats?.monthlyRevenue ?? 0)}
          icon={<TrendingUp size={22} className="text-white" />}
          color="bg-emerald-500"
          sub="This month"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Sessions"
          value={stats?.totalSessions ?? 0}
          icon={<FlaskConical size={22} className="text-white" />}
          color="bg-violet-500"
          sub="All time"
        />
        <StatCard
          label="Completed"
          value={stats?.completedSessions ?? 0}
          icon={<CheckCircle2 size={22} className="text-white" />}
          color="bg-emerald-600"
          sub="All time"
        />
        <StatCard
          label="Today's Sessions"
          value={stats?.todaySessions ?? 0}
          icon={<FlaskConical size={22} className="text-white" />}
          color="bg-brand-red"
          sub="Created today"
        />
        <StatCard
          label="This Month"
          value={stats?.monthSessions ?? 0}
          icon={<Calendar size={22} className="text-white" />}
          color="bg-indigo-500"
          sub="Sessions"
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Chart */}
        <div className="card lg:col-span-2">
          <h3 className="font-heading text-lg text-brand-navy mb-4">Session Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                formatter={(v) => [v, 'Sessions']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Sessions */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg text-brand-navy">Recent Sessions</h3>
            <Link to="/sessions" className="text-xs text-brand-navy font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2 overflow-y-auto max-h-64">
            {sessions.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No sessions yet</p>
            )}
            {sessions.map(s => {
              const patient = s.patientId as any
              return (
                <Link key={s._id} to={`/sessions/${s._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-navy/5 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-brand-navy/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-navy font-bold text-sm">
                      {patient?.fullName?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-navy truncate">{patient?.fullName}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(s.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <GenderBadge gender={patient?.gender ?? 'OTHER'} />
                    <StatusBadge status={s.status} />
                    <span className="text-xs font-semibold text-brand-navy">{formatCurrency(s.totalPrice)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
