import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, Search, FlaskConical } from 'lucide-react'
import toast from 'react-hot-toast'
import { sessionApi, labTestApi } from '../../services/endpoints'
import type { LabTest } from '../../types'
import { Modal, Spinner, InputField, SelectField } from '../ui/index'
import { formatCurrency, sampleTypes } from '../../utils/helpers'
import { clsx } from 'clsx'

interface SessionTest {
  testId: string
  testName: string
  facility: string
  price: string
}

interface FormData {
  doctorName: string
  sampleType: string
  notes: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  patientId: string
  patientName: string
}

export default function CreateSessionModal({ open, onClose, onSaved, patientId, patientName }: Props) {
  const [loading, setLoading]         = useState(false)
  const [labTests, setLabTests]       = useState<LabTest[]>([])
  const [categories, setCategories]   = useState<string[]>([])
  const [selectedCat, setSelectedCat] = useState('')
  const [searchTest, setSearchTest]   = useState('')
  const [tests, setTests]             = useState<SessionTest[]>([])
  const [showTestPicker, setShowTestPicker] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { sampleType: 'BLOOD' }
  })

  useEffect(() => {
    if (!open) return
    reset({ doctorName: '', sampleType: 'BLOOD', notes: '' })
    setTests([])
    setShowTestPicker(false)
    labTestApi.getAll().then(r => setLabTests(r.data.data))
    labTestApi.getCategories().then(r => setCategories(r.data.data))
  }, [open, reset])

  const filteredTests = labTests.filter(t => {
    const matchCat  = !selectedCat || t.category === selectedCat
    const matchName = !searchTest  || t.name.toLowerCase().includes(searchTest.toLowerCase())
    return matchCat && matchName && t.isActive
  })

  const addTest = (test: LabTest) => {
    if (tests.find(t => t.testId === test._id)) {
      toast.error('Test already added')
      return
    }
    setTests(prev => [...prev, {
      testId:   test._id,
      testName: test.name,
      facility: '',
      price:    '',
    }])
    setShowTestPicker(false)
    setSearchTest('')
  }

  const removeTest = (testId: string) => setTests(prev => prev.filter(t => t.testId !== testId))

  const updateTest = (testId: string, field: 'facility' | 'price', value: string) => {
    setTests(prev => prev.map(t => t.testId === testId ? { ...t, [field]: value } : t))
  }

  const totalPrice = tests.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0)

  const onSubmit = async (data: FormData) => {
    if (tests.length === 0) {
      toast.error('Please add at least one test')
      return
    }
    for (const t of tests) {
      if (!t.facility.trim()) { toast.error(`Please enter facility for ${t.testName}`); return }
      if (!t.price || parseFloat(t.price) < 0) { toast.error(`Please enter price for ${t.testName}`); return }
    }

    setLoading(true)
    try {
      await sessionApi.create({
        patientId,
        ...data,
        tests: tests.map(t => ({
          testId:   t.testId,
          facility: t.facility.trim(),
          price:    parseFloat(t.price),
        })),
      })
      toast.success('Test session created!')
      onSaved()
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0]?.msg
             ?? err?.response?.data?.message
             ?? err?.message
             ?? 'Failed to create session'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Test Session" size="xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Patient banner */}
        <div className="flex items-center gap-3 px-4 py-3 bg-brand-navy/5 rounded-xl mb-5">
          <div className="w-9 h-9 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">{patientName.charAt(0)}</span>
          </div>
          <div>
            <p className="text-xs text-slate-400">Creating session for</p>
            <p className="font-semibold text-brand-navy">{patientName}</p>
          </div>
        </div>

        {/* Session details */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <InputField
            label="Doctor Name"
            placeholder="Dr. Silva (optional)"
            {...register('doctorName')}
          />
          <SelectField
            label="Sample Type"
            options={sampleTypes.map(s => ({ value: s, label: s }))}
            {...register('sampleType')}
          />
          <div>
            <label className="label">Notes</label>
            <input className="input" placeholder="e.g. Fasting sample" {...register('notes')} />
          </div>
        </div>

        {/* Tests section */}
        <div className="border border-brand-navy/12 rounded-xl overflow-hidden mb-5">
          <div className="flex items-center justify-between px-4 py-3 bg-brand-navy/5 border-b border-brand-navy/10">
            <h4 className="font-semibold text-brand-navy text-sm flex items-center gap-2">
              <FlaskConical size={15} /> Tests ({tests.length})
            </h4>
            <button type="button" onClick={() => setShowTestPicker(true)}
              className="btn-primary text-xs py-1.5 px-3"
            >
              <Plus size={13} /> Add Test
            </button>
          </div>

          {/* Test Picker Dropdown */}
          {showTestPicker && (
            <div className="p-4 border-b border-brand-navy/8 bg-slate-50">
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="input pl-9 text-sm"
                    placeholder="Search test name..."
                    value={searchTest}
                    onChange={e => setSearchTest(e.target.value)}
                    autoFocus
                  />
                </div>
                <select className="input w-40 text-sm"
                  value={selectedCat} onChange={e => setSelectedCat(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="button" onClick={() => setShowTestPicker(false)}
                  className="btn-secondary text-xs py-2 px-3"
                >Cancel</button>
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                {filteredTests.map(t => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => addTest(t)}
                    className={clsx(
                      'text-left px-3 py-2 rounded-lg text-xs font-medium transition-all hover:shadow-sm',
                      tests.find(x => x.testId === t._id)
                        ? 'bg-brand-navy/10 text-brand-navy/40 cursor-default'
                        : 'bg-white border border-brand-navy/15 text-brand-navy hover:bg-brand-navy hover:text-white hover:border-brand-navy'
                    )}
                  >
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-[10px] opacity-60">{t.category}</p>
                  </button>
                ))}
                {filteredTests.length === 0 && (
                  <p className="col-span-3 text-xs text-slate-400 text-center py-4">No tests found</p>
                )}
              </div>
            </div>
          )}

          {/* Test list */}
          {tests.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No tests added yet. Click "+ Add Test" to begin.
            </div>
          ) : (
            <div>
              {/* Header row */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-brand-navy/3 text-[10px] font-semibold text-brand-navy/50 uppercase tracking-wide">
                <div className="col-span-4">Test Name</div>
                <div className="col-span-4">Facility</div>
                <div className="col-span-3">Price (Rs.)</div>
                <div className="col-span-1" />
              </div>
              {tests.map((t, i) => (
                <div key={t.testId}
                  className="grid grid-cols-12 gap-2 px-4 py-2.5 border-t border-slate-50 items-center"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="col-span-4">
                    <p className="text-sm font-semibold text-brand-navy">{t.testName}</p>
                  </div>
                  <div className="col-span-4">
                    <input
                      className="input text-sm py-1.5"
                      placeholder="e.g. Main Lab"
                      value={t.facility}
                      onChange={e => updateTest(t.testId, 'facility', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Rs.</span>
                      <input
                        className="input text-sm py-1.5 pl-9"
                        placeholder="0.00"
                        type="number"
                        min="0"
                        step="0.01"
                        value={t.price}
                        onChange={e => updateTest(t.testId, 'price', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeTest(t.testId)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-brand-red transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-end px-4 py-3 border-t border-brand-navy/10 bg-brand-navy/3">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Total Amount</p>
                  <p className="font-heading text-xl text-brand-navy">{formatCurrency(totalPrice)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading && <Spinner size={16} className="text-white" />}
            {loading ? 'Creating...' : 'Create Session'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
