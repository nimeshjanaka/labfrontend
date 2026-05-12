import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, TestTube2, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { labTestApi } from '../services/endpoints'
import type { LabTest } from '../types'
import { PageLoader, Empty, Modal, InputField, SelectField, Spinner, ConfirmDialog } from '../components/ui/index'
import PageHeader from '../components/layout/PageHeader'
import { useAuthStore } from '../store/authStore'

const CATEGORIES = [
  'Blood Sugar', 'Lipid Profile', 'Kidney', 'Liver', 'Blood', 'Urine', 'Stool',
  'Thyroid', 'Hormone', 'Serology', 'Tumor Marker', 'Electrolytes', 'Microbiology',
  'Cardiac', 'Blood Group', 'Other',
]

interface AddTestModalProps { open: boolean; onClose: () => void; onSaved: () => void }

function AddTestModal({ open, onClose, onSaved }: AddTestModalProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    name: string; category: string; description: string
  }>()

  useEffect(() => { if (open) reset() }, [open, reset])

  const onSubmit = async (data: { name: string; category: string; description: string }) => {
    setLoading(true)
    try {
      await labTestApi.create(data)
      toast.success('Test created')
      onSaved()
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to create test')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Lab Test" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          label="Test Name" required placeholder="e.g. HBA1C"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <SelectField
          label="Category" required
          error={errors.category?.message}
          options={CATEGORIES.map(c => ({ value: c, label: c }))}
          {...register('category', { required: 'Category is required' })}
        />
        <div>
          <label className="label">Description</label>
          <input className="input" placeholder="Optional description" {...register('description')} />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading && <Spinner size={16} className="text-white" />}
            {loading ? 'Saving...' : 'Save Test'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function LabTestsPage() {
  const [tests, setTests]           = useState<LabTest[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [showAdd, setShowAdd]       = useState(false)
  const [seeding, setSeeding]       = useState(false)
  const [deactivateId, setDeactivateId] = useState<string | null>(null)
  const [deactivating, setDeactivating] = useState(false)
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [t, c] = await Promise.all([
        labTestApi.getAll({ search: search || undefined, category: catFilter || undefined }),
        labTestApi.getCategories(),
      ])
      setTests(t.data.data)
      setCategories(c.data.data)
    } catch {
      toast.error('Failed to load tests')
    } finally {
      setLoading(false)
    }
  }, [search, catFilter])

  useEffect(() => { load() }, [load])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await labTestApi.seed()
      toast.success('Predefined tests seeded!')
      load()
    } catch {
      toast.error('Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivateId) return
    setDeactivating(true)
    try {
      await labTestApi.deactivate(deactivateId)
      toast.success('Test deactivated')
      setDeactivateId(null)
      load()
    } catch {
      toast.error('Failed to deactivate')
    } finally {
      setDeactivating(false)
    }
  }

  const grouped = tests.reduce<Record<string, LabTest[]>>((acc, t) => {
    const cat = t.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat]!.push(t)
    return acc
  }, {})

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Lab Tests"
        subtitle={`${tests.length} active tests`}
        action={
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <button onClick={handleSeed} disabled={seeding} className="btn-secondary">
                  {seeding ? <Spinner size={15} /> : <RefreshCw size={15} />}
                  Seed Defaults
                </button>
                <button onClick={() => setShowAdd(true)} className="btn-primary">
                  <Plus size={16} /> Add Test
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="card mb-6 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search tests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-48" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <PageLoader /> : tests.length === 0 ? (
        <div className="card">
          <Empty
            title="No lab tests found"
            description="Seed the predefined tests or add your own"
            icon={<TestTube2 size={28} />}
            action={isAdmin ? (
              <button onClick={handleSeed} className="btn-primary">
                <RefreshCw size={15} /> Seed Predefined Tests
              </button>
            ) : undefined}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, catTests]) => (
            <div key={cat} className="card p-0 overflow-hidden">
              <div className="px-5 py-3 bg-brand-navy/5 border-b border-brand-navy/8">
                <h3 className="font-semibold text-sm text-brand-navy">{cat}</h3>
                <p className="text-xs text-slate-400">{catTests.length} test{catTests.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 divide-x divide-y divide-slate-50">
                {catTests.map(t => (
                  <div key={t._id} className="p-4 hover:bg-brand-navy/3 transition-colors group">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-brand-navy text-sm">{t.name}</p>
                        {t.description && <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => setDeactivateId(t._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-300 hover:text-brand-red transition-all text-[10px]"
                          title="Deactivate"
                        >✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTestModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={load} />

      <ConfirmDialog
        open={!!deactivateId}
        onClose={() => setDeactivateId(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Test"
        message="This test will no longer appear in the test picker. Existing session data is not affected."
        danger
        loading={deactivating}
      />
    </div>
  )
}
