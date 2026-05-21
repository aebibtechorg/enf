import { redirect } from '@tanstack/react-router'
import { authClient } from '../../../lib/auth-client'

export async function requireAuth(redirectTarget: string) {
  const { data, error } = await authClient.getSession()

  if (error || !data?.session) {
    throw redirect({
      to: '/login',
      search: {
        redirect: redirectTarget,
      },
    })
  }

  return data
}

export async function redirectAuthenticated(defaultTarget = '/dashboard') {
  const { data, error } = await authClient.getSession()

  if (!error && data?.session) {
    throw redirect({
      to: defaultTarget,
    })
  }
}