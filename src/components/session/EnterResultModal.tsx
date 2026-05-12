import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Calculator, Info } from 'lucide-react'
import { sessionApi } from '../../services/endpoints'
import type { SessionTest } from '../../types'
import { Modal, Spinner } from '../ui/index'

interface SubField {
  key:          string
  label:        string
  unit:         string
  range:        string
  low?:         number
  high?:        number
  readOnly?:    boolean
  placeholder?: string
  isHDL?:       boolean
}

interface CalcField {
  key:  string
  calc: (v: Record<string, number>) => number | null
}

interface TestSchema {
  title:       string
  fields:      SubField[]
  calcFields?: CalcField[]
  infoText?:   string
}

// ─────────────────────────────────────────────────────────────────────────────
// ALL SCHEMAS — keys must match TEST_CONFIGS keys in backend pdf.service.ts
// ─────────────────────────────────────────────────────────────────────────────
const SCHEMAS: Record<string, TestSchema> = {

  // ── Lipid Profile ─────────────────────────────────────────────────────────
  // NOTE: Total Cholesterol MUST be entered manually — it cannot be derived.
  // LDL = TC - HDL - TG/5  (Friedewald)
  // VLDL = TG / 5
  // Ratio = TC / HDL
  LIPID: {
    title: 'Lipid Profile',
    infoText: 'Enter Total Cholesterol, HDL & Triglycerides. LDL, VLDL & Ratio will auto-calculate.',
    fields: [
      { key: 'TOTAL_CHOLESTEROL', label: 'Total Cholesterol',  unit: 'mg/dl', range: '< 200',   low: 0,  high: 200,  placeholder: 'e.g. 180.0' },
      { key: 'HDL_CHOLESTEROL',   label: 'HDL Cholesterol',    unit: 'mg/dl', range: '>= 45',   low: 45, high: 9999, placeholder: 'e.g. 41.8', isHDL: true },
      { key: 'TRIGLYCERIDES',     label: 'Triglycerides',      unit: 'mg/dl', range: '< 150',   low: 0,  high: 150,  placeholder: 'e.g. 80.0' },
      { key: 'LDL_CHOLESTEROL',   label: 'LDL Cholesterol',    unit: 'mg/dl', range: '< 160',   low: 0,  high: 160,  readOnly: true },
      { key: 'VLDL_CHOLESTEROL',  label: 'VLDL Cholesterol',   unit: 'mg/dl', range: '< 40',    low: 0,  high: 40,   readOnly: true },
      { key: 'TOTAL_HDL_RATIO',   label: 'Total / HDL Ratio',  unit: '',      range: '2.0-5.0', low: 2,  high: 5,    readOnly: true },
    ],
    calcFields: [
      {
        key: 'LDL_CHOLESTEROL',
        calc: (v) => {
          const tc  = v['TOTAL_CHOLESTEROL']
          const hdl = v['HDL_CHOLESTEROL']
          const tg  = v['TRIGLYCERIDES']
          if (tc != null && hdl != null && tg != null)
            return +(tc - hdl - tg / 5).toFixed(1)
          return null
        },
      },
      {
        key: 'VLDL_CHOLESTEROL',
        calc: (v) => v['TRIGLYCERIDES'] != null ? +(v['TRIGLYCERIDES'] / 5).toFixed(1) : null,
      },
      {
        key: 'TOTAL_HDL_RATIO',
        calc: (v) => {
          const tc  = v['TOTAL_CHOLESTEROL']
          const hdl = v['HDL_CHOLESTEROL']
          if (tc != null && hdl != null && hdl > 0)
            return +(tc / hdl).toFixed(1)
          return null
        },
      },
    ],
  },

  // ── Sugar Tests ───────────────────────────────────────────────────────────
  FBS: {
    title: 'Fasting Blood Sugar (FBS)',
    infoText: 'Normal: 70-99 mg/dl  |  Pre-diabetes: 100-125 mg/dl  |  Diabetes: >= 126 mg/dl',
    fields: [
      { key: 'FBS', label: 'Fasting Blood Sugar', unit: 'mg/dl', range: '70-99 mg/dl', low: 70, high: 99, placeholder: 'e.g. 95' },
    ],
  },

  RBS: {
    title: 'Random Blood Sugar (RBS)',
    fields: [
      { key: 'RBS', label: 'Random Blood Sugar', unit: 'mg/dl', range: '< 200 mg/dl', low: 0, high: 200, placeholder: 'e.g. 145' },
    ],
  },

  PPBS: {
    title: 'Post Prandial Blood Sugar (PPBS)',
    fields: [
      { key: 'PPBS', label: 'Post Prandial Blood Sugar', unit: 'mg/dl', range: '< 140 mg/dl', low: 0, high: 140, placeholder: 'e.g. 130' },
    ],
  },

  HBA1C: {
    title: 'Glycated Haemoglobin (HbA1c)',
    infoText: 'Normal: < 5.7%  |  Pre-diabetes: 5.7-6.4%  |  Diabetes: >= 6.5%',
    fields: [
      { key: 'HBA1C', label: 'HbA1c', unit: '%', range: '< 5.7%', low: 0, high: 5.7, placeholder: 'e.g. 5.4' },
    ],
  },

  // ── OGTT ─────────────────────────────────────────────────────────────────
  OGTT: {
    title: 'OGTT (Oral Glucose Tolerance Test)',
    fields: [
      { key: 'FASTING', label: 'Fasting Glucose', unit: 'mg/dl', range: '70-99 mg/dl',  low: 70, high: 99,  placeholder: 'e.g. 90' },
      { key: '1HR',     label: '1 Hour Glucose',  unit: 'mg/dl', range: '< 180 mg/dl',  low: 0,  high: 180, placeholder: 'e.g. 150' },
      { key: '2HR',     label: '2 Hour Glucose',  unit: 'mg/dl', range: '< 140 mg/dl',  low: 0,  high: 140, placeholder: 'e.g. 120' },
    ],
  },

  // ── Liver Profile ─────────────────────────────────────────────────────────
  'LIVER PROFILE': {
    title: 'Liver Function Tests',
    fields: [
      { key: 'TOTAL_BILIRUBIN',    label: 'Total Bilirubin',      unit: 'mg/dl', range: '0.2-1.2',  low: 0.2, high: 1.2  },
      { key: 'DIRECT_BILIRUBIN',   label: 'Direct Bilirubin',     unit: 'mg/dl', range: '0.0-0.3',  low: 0,   high: 0.3  },
      { key: 'INDIRECT_BILIRUBIN', label: 'Indirect Bilirubin',   unit: 'mg/dl', range: '0.2-0.9',  low: 0.2, high: 0.9  },
      { key: 'SGOT',               label: 'SGOT (AST)',           unit: 'U/L',   range: '10-40',    low: 10,  high: 40   },
      { key: 'SGPT',               label: 'SGPT (ALT)',           unit: 'U/L',   range: '7-56',     low: 7,   high: 56   },
      { key: 'ALP',                label: 'Alkaline Phosphatase', unit: 'U/L',   range: '44-147',   low: 44,  high: 147  },
      { key: 'TOTAL_PROTEIN',      label: 'Total Protein',        unit: 'g/dl',  range: '6.0-8.3',  low: 6.0, high: 8.3  },
      { key: 'ALBUMIN',            label: 'Albumin',              unit: 'g/dl',  range: '3.5-5.0',  low: 3.5, high: 5.0  },
      { key: 'GLOBULIN',           label: 'Globulin',             unit: 'g/dl',  range: '2.3-3.5',  low: 2.3, high: 3.5  },
    ],
  },

  // ── Urine Full Report ─────────────────────────────────────────────────────
  UFR: {
    title: 'Urine Full Report',
    fields: [
      { key: 'COLOUR',           label: 'Colour',           unit: '',     range: 'Pale Yellow',  placeholder: 'e.g. Yellow' },
      { key: 'TURBIDITY',        label: 'Turbidity',        unit: '',     range: 'Clear',        placeholder: 'e.g. Clear' },
      { key: 'PH',               label: 'pH',               unit: '',     range: '4.6-8.0',      low: 4.6, high: 8.0, placeholder: 'e.g. 6.5' },
      { key: 'SPECIFIC_GRAVITY', label: 'Specific Gravity', unit: '',     range: '1.005-1.030',  placeholder: 'e.g. 1.015' },
      { key: 'PROTEIN',          label: 'Protein',          unit: '',     range: 'Nil',          placeholder: 'Nil / +1 / +2' },
      { key: 'GLUCOSE',          label: 'Glucose',          unit: '',     range: 'Nil',          placeholder: 'Nil / Present' },
      { key: 'BLOOD',            label: 'Blood',            unit: '',     range: 'Nil',          placeholder: 'Nil / Present' },
      { key: 'KETONE',           label: 'Ketone',           unit: '',     range: 'Nil',          placeholder: 'Nil / Present' },
      { key: 'BILIRUBIN',        label: 'Bilirubin',        unit: '',     range: 'Nil',          placeholder: 'Nil / Present' },
      { key: 'WBC',              label: 'WBC',              unit: '/HPF', range: '0-5',          low: 0, high: 5,  placeholder: 'e.g. 2' },
      { key: 'RBC',              label: 'RBC',              unit: '/HPF', range: '0-3',          low: 0, high: 3,  placeholder: 'e.g. 0' },
      { key: 'EPITHELIAL',       label: 'Epithelial Cells', unit: '/HPF', range: 'Occasional',   placeholder: 'Nil / Occasional' },
      { key: 'CASTS',            label: 'Casts',            unit: '',     range: 'Nil',          placeholder: 'Nil' },
      { key: 'CRYSTALS',         label: 'Crystals',         unit: '',     range: 'Nil',          placeholder: 'Nil' },
      { key: 'BACTERIA',         label: 'Bacteria',         unit: '',     range: 'Nil',          placeholder: 'Nil / Present' },
    ],
  },

  // ── Electrolytes ──────────────────────────────────────────────────────────
  ELECTROLYTES: {
    title: 'Serum Electrolytes',
    fields: [
      { key: 'SODIUM',      label: 'Sodium (Na+)',        unit: 'mEq/L', range: '136-145', low: 136, high: 145 },
      { key: 'POTASSIUM',   label: 'Potassium (K+)',      unit: 'mEq/L', range: '3.5-5.0', low: 3.5, high: 5.0 },
      { key: 'CHLORIDE',    label: 'Chloride (Cl-)',      unit: 'mEq/L', range: '98-107',  low: 98,  high: 107 },
      { key: 'BICARBONATE', label: 'Bicarbonate (HCO3-)', unit: 'mEq/L', range: '22-29',   low: 22,  high: 29  },
    ],
  },

  // ── Renal / Kidney ────────────────────────────────────────────────────────
  'RENAL PROFILE': {
    title: 'Renal Function Tests',
    fields: [
      { key: 'CREATININE', label: 'Creatinine',  unit: 'mg/dl',  range: '0.7-1.3', low: 0.7, high: 1.3, placeholder: 'e.g. 0.9' },
      { key: 'UREA',       label: 'Blood Urea',  unit: 'mg/dl',  range: '15-45',   low: 15,  high: 45,  placeholder: 'e.g. 30' },
      { key: 'BUN',        label: 'BUN',         unit: 'mg/dl',  range: '7-20',    low: 7,   high: 20,  placeholder: 'e.g. 14' },
      { key: 'URIC_ACID',  label: 'Uric Acid',   unit: 'mg/dl',  range: '3.5-7.2', low: 3.5, high: 7.2, placeholder: 'e.g. 5.0' },
    ],
  },

  // ── Thyroid ───────────────────────────────────────────────────────────────
  TSH: {
    title: 'Thyroid Stimulating Hormone (TSH)',
    infoText: 'Normal: 0.4-4.0 mIU/L  |  High TSH = Hypothyroidism  |  Low TSH = Hyperthyroidism',
    fields: [
      { key: 'TSH', label: 'TSH', unit: 'mIU/L', range: '0.4-4.0 mIU/L', low: 0.4, high: 4.0, placeholder: 'e.g. 2.1' },
    ],
  },

  'THYROID PROFILE': {
    title: 'Thyroid Function Tests',
    fields: [
      { key: 'TSH', label: 'TSH', unit: 'mIU/L', range: '0.4-4.0', low: 0.4, high: 4.0, placeholder: 'e.g. 2.1' },
      { key: 'T3',  label: 'T3',  unit: 'ng/dl',  range: '80-200',  low: 80,  high: 200, placeholder: 'e.g. 120' },
      { key: 'T4',  label: 'T4',  unit: 'ug/dl',  range: '4.5-12',  low: 4.5, high: 12,  placeholder: 'e.g. 8.0' },
    ],
  },

  // ── CBC ──────────────────────────────────────────────────────────────────
  CBC: {
    title: 'Complete Blood Count (CBC)',
    fields: [
      { key: 'WBC',         label: 'WBC',         unit: 'x10/uL', range: '4.0-11.0',  low: 4.0,  high: 11.0 },
      { key: 'RBC',         label: 'RBC',         unit: 'x10/uL', range: '4.5-5.5',   low: 4.5,  high: 5.5  },
      { key: 'HAEMOGLOBIN', label: 'Haemoglobin', unit: 'g/dl',   range: '13.5-17.5', low: 13.5, high: 17.5 },
      { key: 'HAEMATOCRIT', label: 'Haematocrit', unit: '%',       range: '41-53',     low: 41,   high: 53   },
      { key: 'MCV',         label: 'MCV',         unit: 'fL',      range: '80-100',    low: 80,   high: 100  },
      { key: 'MCH',         label: 'MCH',         unit: 'pg',      range: '27-33',     low: 27,   high: 33   },
      { key: 'MCHC',        label: 'MCHC',        unit: 'g/dl',    range: '32-36',     low: 32,   high: 36   },
      { key: 'PLATELETS',   label: 'Platelets',   unit: 'x10/uL', range: '150-400',   low: 150,  high: 400  },
      { key: 'NEUTROPHILS', label: 'Neutrophils', unit: '%',       range: '40-70',     low: 40,   high: 70   },
      { key: 'LYMPHOCYTES', label: 'Lymphocytes', unit: '%',       range: '20-40',     low: 20,   high: 40   },
      { key: 'MONOCYTES',   label: 'Monocytes',   unit: '%',       range: '2-8',       low: 2,    high: 8    },
      { key: 'EOSINOPHILS', label: 'Eosinophils', unit: '%',       range: '1-4',       low: 1,    high: 4    },
      { key: 'BASOPHILS',   label: 'Basophils',   unit: '%',       range: '0.5-1',     low: 0.5,  high: 1    },
    ],
  },

  // ── Single-value tests ────────────────────────────────────────────────────
  CRE: {
    title: 'Serum Creatinine',
    fields: [
      { key: 'CREATININE', label: 'Serum Creatinine', unit: 'mg/dl', range: '0.7-1.3 (M) / 0.5-1.1 (F)', low: 0.7, high: 1.3, placeholder: 'e.g. 0.9' },
    ],
  },

  UREA: {
    title: 'Blood Urea',
    fields: [
      { key: 'UREA', label: 'Blood Urea', unit: 'mg/dl', range: '15-45 mg/dl', low: 15, high: 45, placeholder: 'e.g. 30' },
    ],
  },

  ESR: {
    title: 'Erythrocyte Sedimentation Rate (ESR)',
    fields: [
      { key: 'ESR', label: 'ESR', unit: 'mm/hr', range: 'M: 0-15 / F: 0-20', low: 0, high: 15, placeholder: 'e.g. 10' },
    ],
  },
}

// ── Schema lookup ─────────────────────────────────────────────────────────────
function getSchema(testName: string): TestSchema | null {
  const name = testName.toUpperCase().trim()
  if (SCHEMAS[name]) return SCHEMAS[name]
  for (const k of Object.keys(SCHEMAS)) {
    if (name.includes(k) || k.includes(name)) return SCHEMAS[k]
  }
  return null
}

// ── Flag helper ───────────────────────────────────────────────────────────────
function flagValue(val: string, field: SubField): 'normal' | 'high' | 'low' | null {
  if (!val || field.low == null || field.high == null) return null
  const n = parseFloat(val)
  if (isNaN(n)) return null
  if (field.isHDL) return n >= field.low ? 'normal' : 'low'
  if (n < field.low)  return 'low'
  if (n > field.high) return 'high'
  return 'normal'
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  open:        boolean
  onClose:     () => void
  onSaved:     () => void
  sessionId:   string
  sessionTest: SessionTest
}

export default function EnterResultModal({ open, onClose, onSaved, sessionId, sessionTest }: Props) {
  const schema  = getSchema(sessionTest.testName)
  const [loading, setLoading] = useState(false)

  // Structured state
  const [subVals, setSubVals] = useState<Record<string, string>>({})
  const [remarks, setRemarks] = useState('')

  // Simple state (no matching schema)
  const [simpleVal,     setSimpleVal]     = useState('')
  const [simpleUnit,    setSimpleUnit]    = useState('')
  const [simpleRange,   setSimpleRange]   = useState('')
  const [simpleRemarks, setSimpleRemarks] = useState('')

  // ── Load existing result into form ────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    setRemarks(sessionTest.remarks ?? '')
    setSimpleRemarks(sessionTest.remarks ?? '')

    if (schema) {
      let existing: Record<string, string> = {}
      if (sessionTest.result) {
        // Always try JSON first (all schema results are stored as JSON)
        try {
          const p = JSON.parse(sessionTest.result)
          if (typeof p === 'object' && !Array.isArray(p)) {
            for (const [k, v] of Object.entries(p)) existing[k] = String(v)
          }
        } catch {
          // Fallback: pipe-separated KEY:VALUE
          for (const part of sessionTest.result.split('|')) {
            const idx = part.indexOf(':')
            if (idx >= 0) existing[part.slice(0, idx).trim()] = part.slice(idx + 1).trim()
          }
          // Fallback: plain value for single-field (legacy)
          if (!Object.keys(existing).length && schema.fields.length === 1) {
            existing[schema.fields[0].key] = sessionTest.result
          }
        }
      }
      // Re-run auto-calc so derived fields show correctly on load
      setSubVals(runCalc(schema, existing))
    } else {
      setSimpleVal(sessionTest.result ?? '')
      setSimpleUnit(sessionTest.unit ?? '')
      setSimpleRange(sessionTest.normalRange ?? '')
    }
  }, [open, sessionTest._id])

  // ── Auto-calculation ──────────────────────────────────────────────────────
  const runCalc = useCallback((s: TestSchema, vals: Record<string, string>): Record<string, string> => {
    if (!s.calcFields) return vals
    const num: Record<string, number> = {}
    for (const [k, v] of Object.entries(vals)) {
      const n = parseFloat(v); if (!isNaN(n)) num[k] = n
    }
    const out = { ...vals }
    for (const cf of s.calcFields) {
      const r = cf.calc(num)
      if (r !== null) { out[cf.key] = String(r); num[cf.key] = r }
    }
    return out
  }, [])

  const handleSubChange = (key: string, val: string) => {
    if (!schema) return
    const next = { ...subVals, [key]: val }
    // Re-run calc so derived fields update instantly
    const withCalc = runCalc(schema, next)
    setSubVals(withCalc)
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  // IMPORTANT: ALL schema tests are saved as JSON {"KEY":"VALUE",...}
  // This ensures the backend PDF parseSubResults() can always find values by key.
  const handleSave = async () => {
    if (schema) {
      const mainKey = schema.fields.find(f => !f.readOnly)?.key
      if (mainKey && (!subVals[mainKey] || subVals[mainKey].trim() === '')) {
        toast.error('Please enter a result value')
        return
      }
    } else {
      if (!simpleVal.trim()) {
        toast.error('Please enter a result value')
        return
      }
    }

    setLoading(true)
    try {
      if (schema) {
        // Always JSON — single OR multi field
        // For single-field also store as JSON so PDF can parse by key
        const resultJson = JSON.stringify(subVals)

        await sessionApi.addResult(sessionId, {
          sessionTestId: sessionTest._id,
          value:         resultJson,
          unit:          schema.fields.length === 1 ? schema.fields[0].unit : '',
          normalRange:   schema.fields.length === 1 ? schema.fields[0].range : '',
          remarks,
        })
      } else {
        await sessionApi.addResult(sessionId, {
          sessionTestId: sessionTest._id,
          value:         simpleVal,
          unit:          simpleUnit,
          normalRange:   simpleRange,
          remarks:       simpleRemarks,
        })
      }
      toast.success(sessionTest.result ? 'Result updated!' : 'Result saved!')
      onSaved()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to save result')
    } finally {
      setLoading(false)
    }
  }

  const isMultiField = schema && schema.fields.length > 1

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${sessionTest.result ? 'Edit' : 'Enter'} Result — ${sessionTest.testName}`}
      size={isMultiField ? 'lg' : 'sm'}
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">

        {/* Facility + last saved */}
        <div className="px-3 py-2 bg-brand-navy/5 rounded-xl text-sm text-brand-navy flex items-center justify-between">
          <span><span className="font-semibold">Facility:</span> {sessionTest.facility}</span>
          {sessionTest.resultEnteredAt && (
            <span className="text-[10px] text-slate-400">
              Saved: {new Date(sessionTest.resultEnteredAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {schema ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{schema.title}</p>

            {isMultiField ? (
              <>
                {/* Column headers */}
                <div className="grid grid-cols-12 gap-1 px-2 pb-1 border-b border-slate-100">
                  <span className="col-span-4 text-[10px] font-bold text-slate-400 uppercase">Test</span>
                  <span className="col-span-3 text-[10px] font-bold text-slate-400 uppercase">Value</span>
                  <span className="col-span-2 text-[10px] font-bold text-slate-400 uppercase">Unit</span>
                  <span className="col-span-3 text-[10px] font-bold text-slate-400 uppercase">Ref Range</span>
                </div>

                {schema.fields.map((field) => {
                  const val  = subVals[field.key] ?? ''
                  const flag = flagValue(val, field)
                  return (
                    <div key={field.key} className="grid grid-cols-12 gap-1 items-center px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="col-span-4 flex items-center gap-1">
                        <p className="text-xs font-medium text-brand-navy">{field.label}</p>
                        {field.readOnly && <Calculator size={10} className="text-brand-sky flex-shrink-0" />}
                      </div>

                      <div className="col-span-3 relative">
                        <input
                          type="text"
                          value={val}
                          readOnly={field.readOnly}
                          placeholder={field.readOnly ? 'auto' : (field.placeholder ?? '')}
                          onChange={(e) => !field.readOnly && handleSubChange(field.key, e.target.value)}
                          className={`w-full text-xs px-2 py-1.5 rounded-lg border font-semibold text-center transition-all ${
                            field.readOnly
                              ? 'bg-slate-50 border-slate-100 text-slate-500 cursor-default italic'
                              : flag === 'high'
                                ? 'border-red-300 bg-red-50 text-red-700 focus:ring-red-200 focus:border-red-400'
                                : flag === 'low'
                                  ? 'border-orange-300 bg-orange-50 text-orange-700 focus:ring-orange-200 focus:border-orange-400'
                                  : flag === 'normal'
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 focus:ring-emerald-200 focus:border-emerald-400'
                                    : 'border-brand-navy/20 bg-white focus:ring-brand-sky/20 focus:border-brand-sky'
                          } focus:outline-none focus:ring-2`}
                        />
                        {field.readOnly && val && (
                          <span className="absolute -top-1.5 -right-1 text-[8px] bg-brand-sky text-white px-1 rounded">auto</span>
                        )}
                      </div>

                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400">{field.unit}</span>
                      </div>

                      <div className="col-span-3 flex items-center gap-1">
                        <span className="text-[9px] text-slate-400 leading-tight">{field.range}</span>
                        {flag === 'high'   && <span className="text-[8px] font-bold text-red-600    bg-red-100    px-1 py-0.5 rounded ml-auto">H</span>}
                        {flag === 'low'    && <span className="text-[8px] font-bold text-orange-600 bg-orange-100 px-1 py-0.5 rounded ml-auto">L</span>}
                        {flag === 'normal' && <span className="text-[8px] font-bold text-green-600  bg-green-100  px-1 py-0.5 rounded ml-auto">N</span>}
                      </div>
                    </div>
                  )
                })}
              </>
            ) : (
              /* ── Single-field (FBS, RBS, PPBS, HbA1c, TSH, ESR, etc.) ─── */
              (() => {
                const field = schema.fields[0]
                const val   = subVals[field.key] ?? ''
                const flag  = flagValue(val, field)
                return (
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={val}
                        placeholder={field.placeholder ?? 'Enter value'}
                        onChange={(e) => handleSubChange(field.key, e.target.value)}
                        className={`input text-center text-2xl font-bold tracking-wide border-2 focus:outline-none focus:ring-2 ${
                          flag === 'high'   ? 'border-red-300    bg-red-50    text-red-700    focus:ring-red-200'    :
                          flag === 'low'    ? 'border-orange-300 bg-orange-50 text-orange-700 focus:ring-orange-200' :
                          flag === 'normal' ? 'border-emerald-300 bg-emerald-50 text-emerald-700 focus:ring-emerald-200' :
                          'border-brand-navy/20 bg-white text-brand-navy'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium pointer-events-none">
                        {field.unit}
                      </span>
                    </div>

                    {flag && (
                      <div className={`px-3 py-2 rounded-lg text-xs font-semibold text-center ${
                        flag === 'high'   ? 'bg-red-50    text-red-700    border border-red-200'    :
                        flag === 'low'    ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {flag === 'high'   ? `High — above normal range (${field.range})` :
                         flag === 'low'    ? `Low — below normal range (${field.range})`  :
                         `Normal — within reference range (${field.range})`}
                      </div>
                    )}

                    <p className="text-[10px] text-slate-400 text-center">Reference Range: {field.range}</p>
                  </div>
                )
              })()
            )}

            {schema.infoText && (
              <div className="mt-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-2">
                <Info size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-700 font-medium leading-relaxed">{schema.infoText}</p>
              </div>
            )}
          </div>
        ) : (
          /* ── No matching schema — free-form entry ────────────────────────── */
          <div className="space-y-3">
            <div>
              <label className="label">Result Value <span className="text-red-400">*</span></label>
              <input className="input" value={simpleVal} onChange={(e) => setSimpleVal(e.target.value)} placeholder="e.g. 5.4" />
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input" value={simpleUnit} onChange={(e) => setSimpleUnit(e.target.value)} placeholder="e.g. mmol/L, mg/dL" />
            </div>
            <div>
              <label className="label">Normal Range</label>
              <input className="input" value={simpleRange} onChange={(e) => setSimpleRange(e.target.value)} placeholder="e.g. 70 - 99" />
            </div>
          </div>
        )}

        {/* Remarks */}
        <div>
          <label className="label">Remarks / Notes</label>
          <textarea
            className="input resize-none h-16"
            value={schema ? remarks : simpleRemarks}
            onChange={(e) => schema ? setRemarks(e.target.value) : setSimpleRemarks(e.target.value)}
            placeholder="e.g. Normal, borderline, repeat advised..."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-3 border-t border-slate-100 mt-4">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
        <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 justify-center">
          {loading && <Spinner size={16} className="text-white" />}
          {loading ? 'Saving...' : sessionTest.result ? 'Update Result' : 'Save Result'}
        </button>
      </div>
    </Modal>
  )
}