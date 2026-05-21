import { createContext, useContext } from 'react'

export interface AuthContextType {
  user: { email: string; name?: string | null } | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  forgetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isPending: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
