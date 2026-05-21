import { AUTH_URL } from './auth-client'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function getAccessToken() {
  const response = await fetch(`${AUTH_URL}/api/auth/token`, {
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 401) {
      return null
    }

    throw new Error(`Auth token error: ${response.statusText}`)
  }

  const data = await response.json() as { token?: string }
  return data.token ?? null
}

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getAccessToken()
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}
