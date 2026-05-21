import { createFileRoute, Link } from '@tanstack/react-router'
import { requireAuth } from '../features/auth/lib/routeGuards'
import { DocumentList } from '../features/notarization/components/DocumentList'
import { useAuth } from '../features/auth/hooks/useAuth'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.href)
  },
  component: Dashboard,
})

function Dashboard() {
  const { user } = useAuth()
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
          <p className="mt-1 text-stone-500">Welcome back, {user?.name || user?.email}.</p>
        </div>
        <Link 
          to="/onboarding" 
          className="rounded-2xl bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          New Notarization
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Documents Notarized" value="12" delta="+2 this month" />
        <StatCard title="Pending Sessions" value="3" delta="Next: 2:00 PM" />
        <StatCard title="E-KYC Status" value={user?.ekycStatus?.toUpperCase() || 'NONE'} delta="Verified via PhilSys" />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-stone-900">Recent Documents</h2>
        <DocumentList />
      </div>
    </div>
  )
}

function StatCard({ title, value, delta }: { title: string, value: string, delta: string }) {
  return (
    <div className="p-6 border border-stone-200 rounded-3xl bg-white shadow-sm">
      <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <h2 className="text-3xl font-bold text-stone-900">{value}</h2>
        <span className="text-xs text-stone-500 font-medium">{delta}</span>
      </div>
    </div>
  )
}
