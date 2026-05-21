import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { redirectAuthenticated } from '../features/auth/lib/routeGuards'

type LoginSearch = {
  mode?: 'sign-in' | 'sign-up' | 'forgot-password'
  redirect?: string
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    mode: (search.mode === 'sign-up' || search.mode === 'forgot-password') ? search.mode : 'sign-in',
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: async () => {
    await redirectAuthenticated()
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const { login, signUp, forgetPassword, isAuthenticated, isPending } = useAuth()
  const [mode, setMode] = useState<'sign-in' | 'sign-up' | 'forgot-password'>(search.mode ?? 'sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    setMode(search.mode ?? 'sign-in')
    setMessage(null)
    setIsSuccess(false)
  }, [search.mode])

  useEffect(() => {
    if (!isPending && isAuthenticated) {
      void navigate({ to: search.redirect || '/dashboard' })
    }
  }, [isAuthenticated, isPending, navigate, search.redirect])

  const isBusy = isPending || isSubmitting

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)
    setIsSuccess(false)
    setIsSubmitting(true)

    try {
      if (mode === 'sign-up') {
        await signUp(email, password, name)
      } else if (mode === 'forgot-password') {
        await forgetPassword(email)
        setIsSuccess(true)
        setMessage('Reset link sent to your email.')
      } else {
        await login(email, password)
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed.')
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-6 py-10 lg:flex-row lg:items-center lg:px-10">
        <section className="max-w-xl space-y-6 lg:flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.2em] text-text-main backdrop-blur-sm">
            Example App
          </div>
          <h1 className="text-5xl leading-tight text-text-heading">Ship faster with a real auth flow, not a mock token.</h1>
          <p className="max-w-lg text-base text-text-main">
            Better Auth is now the session source for the React app. Sign in to reach the dashboard and user management routes.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <ValueCard title="Cookie sessions" detail="Backed by Better Auth and the AppHost Postgres database." />
            <ValueCard title="Protected routes" detail="Dashboard and user views now redirect through a dedicated login screen." />
          </div>
          <Link className="inline-block text-sm text-text-main underline-offset-4 hover:underline" to="/">
            Back to home
          </Link>
        </section>

        <section className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur-sm lg:p-8">
          <div className="flex gap-2 rounded-full bg-stone-100 p-1">
            <button
              className={`flex-1 rounded-full px-3 py-2 text-sm transition ${mode === 'sign-in' ? 'bg-stone-900 text-white' : 'text-text-main'}`}
              onClick={() => navigate({ to: '.', search: { ...search, mode: 'sign-in' } })}
              type="button"
            >
              Sign in
            </button>
            <button
              className={`flex-1 rounded-full px-3 py-2 text-sm transition ${mode === 'sign-up' ? 'bg-stone-900 text-white' : 'text-text-main'}`}
              onClick={() => navigate({ to: '.', search: { ...search, mode: 'sign-up' } })}
              type="button"
            >
              Sign up
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            {mode === 'sign-up' ? (
              <label className="block space-y-2">
                <span className="text-sm text-text-main">Name</span>
                <input
                  className="w-full rounded-2xl border border-border-subtle px-4 py-3 outline-none transition focus:border-stone-900"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Abib User"
                  value={name}
                />
              </label>
            ) : null}

            {mode === 'forgot-password' ? (
              <div className="space-y-4">
                <h2 className="text-xl">Reset password</h2>
                <p className="text-sm text-text-main">Enter your email address and we'll send you a link to reset your password.</p>
              </div>
            ) : null}

            <label className="block space-y-2">
              <span className="text-sm text-text-main">Email</span>
              <input
                className="w-full rounded-2xl border border-border-subtle px-4 py-3 outline-none transition focus:border-stone-900"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </label>

            {mode !== 'forgot-password' ? (
              <label className="block space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-main">Password</span>
                  <button
                    className="text-xs text-text-main underline-offset-4 hover:underline"
                    onClick={() => navigate({ to: '.', search: { ...search, mode: 'forgot-password' } })}
                    type="button"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  className="w-full rounded-2xl border border-border-subtle px-4 py-3 outline-none transition focus:border-stone-900"
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  type="password"
                  value={password}
                />
              </label>
            ) : null}

            <button
              className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isBusy}
              type="submit"
            >
              {isBusy ? 'Working...' : mode === 'sign-up' ? 'Create account' : mode === 'forgot-password' ? 'Send reset link' : 'Sign in'}
            </button>

            {mode === 'forgot-password' ? (
              <button
                className="w-full text-center text-sm text-text-main underline-offset-4 hover:underline"
                onClick={() => navigate({ to: '.', search: { ...search, mode: 'sign-in' } })}
                type="button"
              >
                Back to sign in
              </button>
            ) : null}
          </form>

          {message ? (
            <p className={`mt-4 text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          ) : null}
          
          {mode !== 'forgot-password' ? (
            <p className="mt-4 text-xs text-text-main">
              {mode === 'sign-up'
                ? 'Creating an account signs you in immediately.'
                : 'Use the credentials from your Better Auth-backed account.'}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  )
}

function ValueCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
      <p className="text-sm font-medium text-text-heading">{title}</p>
      <p className="mt-2 text-sm text-text-main">{detail}</p>
    </div>
  )
}