import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '../features/auth/lib/routeGuards'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.href)
  },
  component: Dashboard,
})

function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Dashboard</h1>
      <p className="text-text-main">
        Welcome to your operational dashboard. This is where you can monitor system health and key metrics.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value="1,234" delta="+12%" />
        <StatCard title="Active Subs" value="856" delta="+5%" />
        <StatCard title="Storage Used" value="45.2 GB" delta="+2.4 GB" />
      </div>
    </div>
  )
}

function StatCard({ title, value, delta }: { title: string, value: string, delta: string }) {
  return (
    <div className="p-6 border border-border-subtle rounded-xl bg-white shadow-sm">
      <p className="text-sm text-text-main font-medium uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <h2 className="text-3xl">{value}</h2>
        <span className="text-sm text-green-600 font-medium">{delta}</span>
      </div>
    </div>
  )
}
