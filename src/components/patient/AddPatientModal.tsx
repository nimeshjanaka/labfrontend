import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { patientApi } from '../../services/endpoints'
import type { Patient } from '../../types'
import { Modal, Spinner } from '../ui/index'

interface FormData {
  fullName: string
  nic: string
  dob: string
  gender: string
  phone: string
  address: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  patient?: Patient | null
}

export default function AddPatientModal({ open, onClose, onSaved, patient }: Props) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!patient

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>()

  useEffect(() => {
    if (open) {
      reset({
        fullName: patient?.fullName ?? '',
        nic:      patient?.nic ?? '',
        dob:      patient?.dob?.split('T')[0] ?? '',
        gender:   patient?.gender ?? '',
        phone:    patient?.phone ?? '',
        address:  patient?.address ?? '',
      })
    }
  }, [open, patient, reset])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      if (isEdit && patient) {
        await patientApi.update(patient._id, data)
        toast.success('Patient updated successfully')
      } else {
        await patientApi.create(data)
        toast.success('Patient added successfully')
      }
      onSaved()
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to save patient')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Patient' : 'Add New Patient'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Full Name */}
        <div>
          <label className="label">Full Name <span className="text-brand-red">*</span></label>
          <input
            className={`input ${errors.fullName ? 'border-brand-red' : ''}`}
            placeholder="Enter full name"
            {...register('fullName', { required: 'Full name is required' })}
          />
          {errors.fullName && <p className="text-xs text-brand-red mt-1">{errors.fullName.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* NIC */}
          <div>
            <label className="label">NIC Number</label>
            <input
              className="input"
              placeholder="e.g. 199503602235"
              {...register('nic')}
            />
          </div>

          {/* DOB */}
          <div>
            <label className="label">Date of Birth <span className="text-brand-red">*</span></label>
            <input
              type="date"
              className={`input ${errors.dob ? 'border-brand-red' : ''}`}
              {...register('dob', { required: 'Date of birth is required' })}
            />
            {errors.dob && <p className="text-xs text-brand-red mt-1">{errors.dob.message}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="label">Gender <span className="text-brand-red">*</span></label>
            <select
              className={`input ${errors.gender ? 'border-brand-red' : ''}`}
              {...register('gender', { required: 'Gender is required' })}
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.gender && <p className="text-xs text-brand-red mt-1">{errors.gender.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="label">Phone Number <span className="text-brand-red">*</span></label>
            <input
              className={`input ${errors.phone ? 'border-brand-red' : ''}`}
              placeholder="e.g. 0774190312"
              {...register('phone', { required: 'Phone number is required' })}
            />
            {errors.phone && <p className="text-xs text-brand-red mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="label">Address</label>
          <textarea
            className="input resize-none h-20"
            placeholder="Enter address (optional)"
            {...register('address')}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading && <Spinner size={16} className="text-white" />}
            {loading ? 'Saving...' : isEdit ? 'Update Patient' : 'Save Patient'}
          </button>
        </div>
      </form>
    </Modal>
  )
}