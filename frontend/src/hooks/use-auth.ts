import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api/auth'
import { setAccessToken, setOnUnauthorized } from '@/api/client'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
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
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        let response: Awaited<ReturnType<typeof authApi.login>>
        try {
          response = await authApi.login({ email, password })
        } catch (err: unknown) {
          if (err instanceof Error && 'response' in err) {
            const httpErr = err as { response: Response }
            try {
              const body = await httpErr.response.json() as { detail?: string }
              throw new Error(body.detail || 'Invalid email or password')
            } catch {
              throw new Error('Invalid email or password')
            }
          }
          throw err
        }
        setAccessToken(response.access_token)
        set({
          accessToken: response.access_token,
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
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },

      refreshTokenAction: async () => {
        const rt = get().refreshToken
        if (!rt) return false
        try {
          const response = await authApi.refresh(rt)
          setAccessToken(response.access_token)
          set({ accessToken: response.access_token })
          return true
        } catch {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
          setAccessToken(null)
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)

setOnUnauthorized(() => {
  const { refreshTokenAction, logout } = useAuthStore.getState()
  if (useAuthStore.getState().refreshToken) {
    refreshTokenAction()
  } else {
    logout()
  }
})

if (useAuthStore.getState().accessToken) {
  setAccessToken(useAuthStore.getState().accessToken)
}
