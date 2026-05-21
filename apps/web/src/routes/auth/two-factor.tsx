import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '../../lib/auth-client'

export const Route = createFileRoute('/auth/two-factor')({
  component: TwoFactorPage,
})

function TwoFactorPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { error: verifyError } = await authClient.twoFactor.verifyTotp({
        code,
      })

      if (verifyError) {
        throw new Error(verifyError.message || 'Invalid 2FA code')
      }

      void navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-stone-900">Two-Factor Authentication</h1>
          <p className="mt-2 text-stone-600">Enter the 6-digit code from your authenticator app.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium text-stone-700">
              Authentication Code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              className="block w-full rounded-2xl border border-stone-200 px-4 py-3 text-center text-2xl tracking-widest outline-none transition focus:border-stone-900"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            className="w-full rounded-2xl bg-stone-900 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  )
}
