import { authService } from "./auth.service"

const API_BASE = '/api'

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

let isRefreshing = false
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  // Prevent multiple simultaneous refresh attempts
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true

  refreshPromise = (async() => {
    try {
      const refreshToken = authService.getRefreshToken()

      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authService.refresh(refreshToken)

      // Store new tokens
      authService.setToken(response.token.accessToken)
      authService.setRefreshToken(response.refreshToken)

      return response.token.accessToken
    } catch (error) {
      authService.removeToken()
      authService.removeRefreshToken()
      localStorage.removeItem('user')
      window.location.href = '/login'
      throw error
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()
  return refreshPromise
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (options.headers) {
    Object.assign(headers, options.headers)
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  // Handle 401 - try to refresh token
  if (response.status === 401 && !endpoint.includes('/auth/')) {
    try {
      const newToken = await refreshAccessToken()

      // Retry request with new token
      headers['Authorization'] = `Bearer ${newToken}`
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      })
    } catch (refreshError) {
      // Refresh failed, let the error propagate
      throw new ApiError(401, 'Authentication failed')
    }
  }

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Request failed')
  }

  return data
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}

export { ApiError }
