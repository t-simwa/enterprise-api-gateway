import ky from 'ky'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

let onUnauthorized: (() => void) | null = null

export function setOnUnauthorized(cb: (() => void) | null) {
  onUnauthorized = cb
}

export const apiClient = ky.create({
  baseUrl: API_BASE_URL,
  hooks: {
    beforeRequest: [
      (state: { request: Request }) => {
        if (accessToken) {
          state.request.headers.set('Authorization', `Bearer ${accessToken}`)
        }
      },
    ],
    afterResponse: [
      (state: { response: Response }) => {
        if (state.response.status === 401 && onUnauthorized) {
          onUnauthorized()
        }
      },
    ],
  },
})
