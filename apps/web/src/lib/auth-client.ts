import { createAuthClient } from 'better-auth/react'

const baseURL = import.meta.env.VITE_AUTH_URL?.trim()

export const AUTH_URL = baseURL || 'http://localhost:3005'

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  fetchOptions: {
    credentials: 'include',
  },
  sessionOptions: {
    refetchOnWindowFocus: true,
  },
})