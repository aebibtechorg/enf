import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '../lib/auth-client'
import { redirectAuthenticated } from '../features/auth/lib/routeGuards'

type ResetPasswordSearch = {
  token?: string
}

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  beforeLoad: async () => {
    await redirectAuthenticated()
  },
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const navigate = useNavigate()
  const { token } = Route.useSearch()
  const [password, setPassword] = useState('')
  const [confirmPassword, setPasswordConfirm] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)

    if (!token) {
      setMessage('Reset token is missing.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      })

      if (error) {
        throw new Error(error.message)
      }

      setIsSuccess(true)
      setMessage('Password has been reset successfully. You can now sign in.')
      
      // Redirect to login after a short delay
      setTimeout(() => {
        void navigate({ to: '/login' })
      }, 3000)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Password reset failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="p-8 bg-white rounded-2xl shadow-sm border border-border-subtle max-w-md w-full text-center">
          <h1 className="text-2xl mb-4">Invalid Reset Link</h1>
          <p className="text-text-main mb-6">The password reset link is invalid or has expired.</p>
          <button
            className="w-full rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white"
            onClick={() => void navigate({ to: '/login', search: { mode: 'forgot-password' } })}
          >
            Request a new link
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur-sm lg:p-8">
        <h1 className="text-2xl text-text-heading mb-2">Create new password</h1>
        <p className="text-sm text-text-main mb-6">Enter your new password below to secure your account.</p>

        <form className="space-y-4" onSubmit={submit}>
          <label className="block space-y-2">
            <span className="text-sm text-text-main">New Password</span>
            <input
              className="w-full rounded-2xl border border-border-subtle px-4 py-3 outline-none transition focus:border-stone-900"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              type="password"
              value={password}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-text-main">Confirm New Password</span>
            <input
              className="w-full rounded-2xl border border-border-subtle px-4 py-3 outline-none transition focus:border-stone-900"
              minLength={8}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              placeholder="Repeat your password"
              type="password"
              value={confirmPassword}
            />
          </label>

          <button
            className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || isSuccess}
            type="submit"
          >
            {isSubmitting ? 'Updating...' : 'Reset Password'}
          </button>
        </form>

        {message ? (
          <p className={`mt-4 text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        ) : null}

        {isSuccess ? (
          <button
            className="mt-4 w-full text-center text-sm text-text-main underline-offset-4 hover:underline"
            onClick={() => void navigate({ to: '/login' })}
          >
            Go to login
          </button>
        ) : (
          <button
            className="mt-4 w-full text-center text-sm text-text-main underline-offset-4 hover:underline"
            onClick={() => void navigate({ to: '/login' })}
          >
            Cancel and return to login
          </button>
        )}
      </section>
    </div>
  )
}
