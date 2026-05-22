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

  const user = data.user as any
  const role = user.role
  const isOnboarded = user.isOnboarded

  // ENA (Admin) bypasses onboarding and has full access
  if (role === 'admin' || role === 'ena') {
    return data
  }

  // Force onboarding for users who haven't completed it
  if (!isOnboarded && !redirectTarget.includes('/onboarding')) {
    throw redirect({
      to: '/onboarding',
    })
  }

  // If onboarded but not yet an ENP, they might be pending
  // We can add a "Pending" screen or just let them see a limited dashboard
  // For now, let's assume if they are onboarded they can see the dashboard
  // but specific actions (like signing) will check for the 'enp' role on the server.

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