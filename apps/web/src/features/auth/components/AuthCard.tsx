import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

type Mode = 'sign-in' | 'sign-up'

export function AuthCard() {
  const { user, isAuthenticated, isPending, login, signUp, logout } = useAuth()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isBusy = isPending || isSubmitting

  const resetMessage = () => setMessage(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetMessage()
    setIsSubmitting(true)

    try {
      if (mode === 'sign-up') {
        await signUp(email, password, name)
        setMessage('Account created. You are signed in.')
      } else {
        await login(email, password)
        setMessage('Signed in successfully.')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    resetMessage()
    setIsSubmitting(true)

    try {
      await logout()
      setMessage('Signed out successfully.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sign out failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-text-main">Authentication</p>
          <h2 className="mt-2 text-2xl">Better Auth</h2>
          <p className="mt-2 max-w-xl text-sm text-text-main">
            Email and password auth now runs through a dedicated Better Auth server with cookie-backed sessions.
          </p>
        </div>

        <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-text-main">
          {isAuthenticated ? 'Active session' : 'No session'}
        </div>
      </div>

      <div className="mt-6">
        {isAuthenticated && user ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border-subtle bg-stone-50 p-4">
              <p className="text-sm text-text-main">Signed in as</p>
              <p className="mt-1 text-lg">{user.name || user.email}</p>
              <p className="text-sm text-text-main">{user.email}</p>
            </div>

            <button
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isBusy}
              onClick={handleLogout}
              type="button"
            >
              {isBusy ? 'Working...' : 'Sign out'}
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <button
                className={`rounded-full px-3 py-1 text-sm ${mode === 'sign-in' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-text-main'}`}
                onClick={() => {
                  resetMessage()
                  setMode('sign-in')
                }}
                type="button"
              >
                Sign in
              </button>
              <button
                className={`rounded-full px-3 py-1 text-sm ${mode === 'sign-up' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-text-main'}`}
                onClick={() => {
                  resetMessage()
                  setMode('sign-up')
                }}
                type="button"
              >
                Sign up
              </button>
            </div>

            {mode === 'sign-up' ? (
              <label className="block space-y-2">
                <span className="text-sm text-text-main">Name</span>
                <input
                  className="w-full rounded-xl border border-border-subtle px-4 py-3 outline-none transition focus:border-stone-900"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Abib User"
                  value={name}
                />
              </label>
            ) : null}

            <label className="block space-y-2">
              <span className="text-sm text-text-main">Email</span>
              <input
                className="w-full rounded-xl border border-border-subtle px-4 py-3 outline-none transition focus:border-stone-900"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-text-main">Password</span>
              <input
                className="w-full rounded-xl border border-border-subtle px-4 py-3 outline-none transition focus:border-stone-900"
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                type="password"
                value={password}
              />
            </label>

            <button
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isBusy}
              type="submit"
            >
              {isBusy ? 'Working...' : mode === 'sign-up' ? 'Create account' : 'Sign in'}
            </button>
          </form>
        )}

        {message ? <p className="mt-4 text-sm text-text-main">{message}</p> : null}
      </div>
    </section>
  )
}