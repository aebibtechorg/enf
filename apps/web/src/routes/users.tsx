import { createFileRoute } from '@tanstack/react-router'
import { requireAuth } from '../features/auth/lib/routeGuards'
import { UserList } from '../features/users/components/UserList'

export const Route = createFileRoute('/users')({
  beforeLoad: async ({ location }) => {
    await requireAuth(location.href)
  },
  component: () => (
    <div className="space-y-6">
      <h1 className="text-3xl">Users</h1>
      <UserList />
    </div>
  ),
})
