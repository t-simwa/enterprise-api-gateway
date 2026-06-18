import { apiClient } from './client'
import type { LoginRequest, LoginResponse, User } from '@/types'

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post('auth/login', { json: data }).json<LoginResponse>(),
  register: (data: { email: string; password: string; full_name: string }) =>
    apiClient.post('auth/register', { json: data }).json<User>(),
  refresh: (refreshToken: string) =>
    apiClient.post('auth/refresh', { json: { refresh_token: refreshToken } }).json<{ access_token: string }>(),
  logout: () =>
    apiClient.post('auth/logout').json(),
  getMe: () =>
    apiClient.get('auth/me').json<User>(),
}
