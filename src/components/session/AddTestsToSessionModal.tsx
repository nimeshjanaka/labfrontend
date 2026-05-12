import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, FlaskConical } from 'lucide-react'
import toast from 'react-hot-toast'
import { sessionApi, labTestApi } from '../../services/endpoints'
import type { LabTest } from '../../types'
import { Modal, Spinner } from '../ui/index'
import { formatCurrency } from '../../utils/helpers'
import { clsx } from 'clsx'

interface SessionTest { testId: string; testName: string; facility: string; price: string }

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  sessionId: string
  existingTestIds: string[]
}

export default function AddTestsToSessionModal({ open, onClose, onSaved, sessionId, existingTestIds }: Props) {
  const [loading, setLoading]         = useState(false)
  const [labTests, setLabTests]       = useState<LabTest[]>([])
  const [categories, setCategories]   = useState<string[]>([])
  const [selectedCat, setSelectedCat] = useState('')
  const [searchTest, setSearchTest]   = useState('')
  const [tests, setTests]             = useState<SessionTest[]>([])

  useEffect(() => {
    if (!open) return
    setTests([])
    setSearchTest('')
    labTestApi.getAll().then(r => setLabTests(r.data.data))
    labTestApi.getCategories().then(r => setCategories(r.data.data))
  }, [open])

  const filteredTests = labTests.filter(t => {
    const matchCat    = !selectedCat || t.category === selectedCat
    const matchName   = !searchTest  || t.name.toLowerCase().includes(searchTest.toLowerCase())
    const notExisting = !existingTestIds.includes(t._id)
    const notAdded    = !tests.find(x => x.testId === t._id)
    return matchCat && matchName && t.isActive && notExisting && notAdded
  })

  const addTest = (test: LabTest) => {
    setTests(prev => [...prev, { testId: test._id, testName: test.name, facility: '', price: '' }])
  }

  const removeTest = (testId: string) => setTests(prev => prev.filter(t => t.testId !== testId))

  const updateTest = (testId: string, field: 'facility' | 'price', value: string) =>
    setTests(prev => prev.map(t => t.testId === testId ? { ...t, [field]: value } : t))

  const totalPrice = tests.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0)

  const handleSave = async () => {
    if (tests.length === 0) { toast.error('Add at least one test'); return }
    for (const t of tests) {
      if (!t.facility.trim()) { toast.error(`Enter facility for ${t.testName}`); return }
      if (!t.price) { toast.error(`Enter price for ${t.testName}`); return }
    }
    setLoading(true)
    try {
      await sessionApi.addTests(sessionId, tests.map(t => ({
        testId: t.testId, facility: t.facility.trim(), price: parseFloat(t.price),
      })))
      toast.success('Tests added to session')
      onSaved()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to add tests')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add More Tests" size="xl">
      {/* Test Picker */}
      <div className="mb-5">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9 text-sm" placeholder="Search test..."
              value={searchTest} onChange={e => setSearchTest(e.target.value)} />
          </div>
          <select className="input w-44 text-sm" value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto border border-brand-navy/10 rounded-xl p-3 bg-slate-50">
          {filteredTests.map(t => (
            <button key={t._id} type="button" onClick={() => addTest(t)}
              className="text-left px-3 py-2 rounded-lg text-xs font-medium bg-white border border-brand-navy/15 text-brand-navy hover:bg-brand-navy hover:text-white hover:border-brand-navy transition-all"
            >
              <p className="font-semibold">{t.name}</p>
              <p className="text-[10px] opacity-60">{t.category}</p>
            </button>
          ))}
          {filteredTests.length === 0 && (
            <p className="col-span-3 text-xs text-slate-400 text-center py-4">No tests available</p>
          )}
        </div>
      </div>

      {/* Added tests */}
      {tests.length > 0 && (
        <div className="border border-brand-navy/12 rounded-xl overflow-hidden mb-5">
          <div className="px-4 py-2.5 bg-brand-navy/5 text-xs font-semibold text-brand-navy/60 uppercase tracking-wide border-b border-brand-navy/8">
            Tests to Add ({tests.length})
          </div>
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
            <div className="col-span-4">Test</div>
            <div className="col-span-4">Facility</div>
            <div className="col-span-3">Price (Rs.)</div>
            <div className="col-span-1" />
          </div>
          {tests.map(t => (
            <div key={t.testId} className="grid grid-cols-12 gap-2 px-4 py-2.5 border-t border-slate-50 items-center">
              <div className="col-span-4">
                <p className="text-sm font-semibold text-brand-navy">{t.testName}</p>
              </div>
              <div className="col-span-4">
                <input className="input text-sm py-1.5" placeholder="e.g. Main Lab"
                  value={t.facility} onChange={e => updateTest(t.testId, 'facility', e.target.value)} />
              </div>
              <div className="col-span-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Rs.</span>
                  <input className="input text-sm py-1.5 pl-9" placeholder="0.00" type="number" min="0" step="0.01"
                    value={t.price} onChange={e => updateTest(t.testId, 'price', e.target.value)} />
                </div>
              </div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => removeTest(t.testId)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-brand-red transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end px-4 py-3 bg-brand-navy/3 border-t border-brand-navy/10">
            <div className="text-right">
              <p className="text-xs text-slate-400">Total to Add</p>
              <p className="font-heading text-xl text-brand-navy">{formatCurrency(totalPrice)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
        <button onClick={handleSave} disabled={loading || tests.length === 0} className="btn-primary flex-1 justify-center">
          {loading && <Spinner size={16} className="text-white" />}
          {loading ? 'Adding...' : `Add ${tests.length} Test${tests.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </Modal>
  )
}
