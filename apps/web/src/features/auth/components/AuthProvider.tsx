import React from 'react'
import { AuthContext, type AuthContextType } from '../hooks/useAuth'
import { authClient } from '../../../lib/auth-client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = authClient.useSession()

  const login = async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: name?.trim() || email.split('@')[0],
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  const logout = async () => {
    const { error } = await authClient.signOut()

    if (error) {
      throw new Error(error.message)
    }
  }

  const forgetPassword = async (email: string) => {
    const { data, error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }

    console.log("Forgot password result:", data)
  }

  const value: AuthContextType = {
    user: session.data?.user
      ? {
          email: session.data.user.email,
          name: session.data.user.name,
        }
      : null,
    token: null,
    login,
    signUp,
    forgetPassword,
    logout,
    isAuthenticated: Boolean(session.data?.session),
    isPending: session.isPending,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
