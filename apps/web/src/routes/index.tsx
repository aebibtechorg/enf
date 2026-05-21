import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '../features/auth/hooks/useAuth'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const navigate = useNavigate()
  const { isAuthenticated, isPending, user } = useAuth()

  useEffect(() => {
    if (!isPending && !isAuthenticated) {
      void navigate({
        to: '/login',
        search: {
          redirect: '/',
        },
      })
    }
  }, [isAuthenticated, isPending, navigate])

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-text-main">Checking session...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Welcome to Example App</h1>
      <p className="text-lg text-text-main max-w-2xl">
        A reusable AI-native platform blueprint built with .NET 10, React (TanStack Start), and Flutter.
        Experience the 'Calm UI' philosophy.
      </p>

      <div className="flex flex-wrap gap-3">
        {isAuthenticated ? (
          <>
            <Link
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white"
              to="/dashboard"
            >
              Continue to dashboard
            </Link>
            <p className="self-center text-sm text-text-main">
              Signed in as {user?.name || user?.email}
            </p>
          </>
        ) : (
          <>
            <Link
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white"
              to="/login"
            >
              Sign in
            </Link>
            <Link
              className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-text-main"
              search={{ mode: 'sign-up' }}
              to="/login"
            >
              Create account
            </Link>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <FeatureCard 
          title="Feature-First" 
          description="Modular organization for both frontend and backend." 
        />
        <FeatureCard 
          title="Type-Safe" 
          description="Shared contracts between .NET and React." 
        />
        <FeatureCard 
          title="Aspire Orchestrated" 
          description="Seamless local development with .NET Aspire." 
        />
        <FeatureCard 
          title="Calm UI" 
          description="Productivity-focused design with low cognitive load." 
        />
      </div>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string, description: string }) {
  return (
    <div className="p-6 border border-border-subtle rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl mb-2">{title}</h3>
      <p className="text-text-main">{description}</p>
    </div>
  )
}
