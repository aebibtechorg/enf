import React, { useEffect } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isPending } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isPending && !isAuthenticated) {
      navigate({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  }, [isAuthenticated, isPending, location.href, navigate])

  if (isPending) {
    return null
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
