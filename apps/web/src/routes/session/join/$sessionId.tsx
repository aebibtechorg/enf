import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { fetchApi } from '../../../lib/api'

type JoinSessionSearch = {
  token?: string
}

export const Route = createFileRoute('/session/join/$sessionId')({
  validateSearch: (search: Record<string, unknown>): JoinSessionSearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: JoinSessionPage,
})

function JoinSessionPage() {
  const { sessionId } = Route.useParams()
  const { token } = Route.useSearch()
  const navigate = useNavigate()
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setError(null)

    try {
      if (!token) throw new Error('Magic Link token is missing.')

      await fetchApi(`/api/notarization/sessions/${sessionId}/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({ token, otp }),
      })

      // On success, navigate to the actual video room
      // We'll pass the token or sessionId. 
      // In a real app, this might set a temporary guest cookie or session.
      void navigate({ 
        to: '/notarization/session/$id', 
        params: { id: sessionId },
        search: { guestToken: token } // Example of passing authorization
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired OTP')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-stone-900">Session Authorization</h1>
          <p className="text-sm text-stone-600">
            For your security, please enter the 6-digit code sent to your registered contact method.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">One-Time Password (OTP)</label>
            <input 
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-4 text-center text-3xl font-bold tracking-[0.5em] outline-none transition focus:border-stone-900 focus:bg-white"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isVerifying || otp.length !== 6}
            className="w-full rounded-2xl bg-stone-900 py-4 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Join Session'}
          </button>
        </form>

        <p className="text-[10px] text-stone-400 uppercase tracking-widest">
          Secured by Supreme Court ENF Facility
        </p>
      </div>
    </div>
  )
}
