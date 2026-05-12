import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  isAuthenticated: boolean
}

const storedUser  = localStorage.getItem('medlab_user')
const storedToken = localStorage.getItem('medlab_token')

export const useAuthStore = create<AuthState>((set) => ({
  user:  storedUser  ? JSON.parse(storedUser)  : null,
  token: storedToken ?? null,
  isAuthenticated: !!storedToken,

  setAuth: (user, token) => {
    localStorage.setItem('medlab_user',  JSON.stringify(user))
    localStorage.setItem('medlab_token', token)
    set({ user, token, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem('medlab_user')
    localStorage.removeItem('medlab_token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
