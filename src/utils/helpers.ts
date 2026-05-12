import { format, parseISO, differenceInYears } from 'date-fns'

export const formatDate = (date: string | Date) => {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'dd MMM yyyy')
  } catch { return '-' }
}

export const formatDateTime = (date: string | Date) => {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'dd MMM yyyy, hh:mm a')
  } catch { return '-' }
}

export const calcAge = (dob: string) => {
  try { return differenceInYears(new Date(), parseISO(dob)) }
  catch { return '-' }
}

export const formatCurrency = (amount: number) =>
  `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`

export const genderLabel = (g: string) =>
  g === 'MALE' ? 'Male' : g === 'FEMALE' ? 'Female' : 'Other'

export const genderColor = (g: string) =>
  g === 'MALE' ? 'text-blue-600 bg-blue-50' :
  g === 'FEMALE' ? 'text-pink-600 bg-pink-50' : 'text-purple-600 bg-purple-50'

export const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    PENDING:     'badge-pending',
    IN_PROGRESS: 'badge-progress',
    COMPLETED:   'badge-completed',
    CANCELLED:   'badge-cancelled',
  }
  return map[s] ?? 'badge-pending'
}

export const sampleTypes = ['BLOOD', 'URINE', 'STOOL', 'SPUTUM', 'SWAB', 'OTHER']
