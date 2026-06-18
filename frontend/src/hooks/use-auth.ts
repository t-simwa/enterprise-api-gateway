import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api/auth'
import { setAccessToken, setOnUnauthorized } from '@/api/client'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshTokenAction: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await authApi.login({ email, password })
        setAccessToken(response.access_token)
        set({
          token: response.access_token,
          refreshToken: response.refresh_token,
          isAuthenticated: true,
        })
        try {
          const user = await authApi.getMe()
          set({ user })
        } catch {
          // User fetch is best-effort
        }
      },

      logout: () => {
        setAccessToken(null)
        authApi.logout().catch(() => {})
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
      },

      refreshTokenAction: async () => {
        const rt = get().refreshToken
        if (!rt) return false
        try {
          const response = await authApi.refresh(rt)
          setAccessToken(response.access_token)
          set({ token: response.access_token })
          return true
        } catch {
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
          setAccessToken(null)
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)

setOnUnauthorized(() => {
  useAuthStore.getState().logout()
})

if (useAuthStore.getState().token) {
  setAccessToken(useAuthStore.getState().token)
}
