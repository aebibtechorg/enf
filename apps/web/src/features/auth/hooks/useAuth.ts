import { createContext, useContext } from 'react'
import type { authClient } from '../../../lib/auth-client'

export type User = typeof authClient.$Infer.Session.user & {
  role?: string
  isEnp?: boolean
  isOnboarded?: boolean
  ekycStatus?: string
}
export type Session = typeof authClient.$Infer.Session.session

export interface AuthContextType {
  user: User | null
  session: Session | null
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
