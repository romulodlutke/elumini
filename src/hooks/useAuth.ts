'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'TERAPEUTA' | 'PACIENTE'
  avatarUrl: string | null
}

interface AuthStore {
  user: AuthUser | null
  accessToken: string | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setAccessToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'holosconnect-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)

// Hook para verificar se o usuário tem uma role específica
export function useHasRole(...roles: string[]) {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  return roles.includes(user.role)
}
