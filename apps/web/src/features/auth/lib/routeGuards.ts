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

  // Check for onboarding status
  const ekycStatus = (data.user as any).ekycStatus
  if (ekycStatus === 'none' && !redirectTarget.includes('/onboarding')) {
    throw redirect({
      to: '/onboarding',
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