import { useUsers } from '../hooks/useUsers'

export function UserList() {
  const { data: users, isLoading, error } = useUsers()

  if (isLoading) return <p className="animate-pulse">Loading users...</p>
  if (error) return <p className="text-red-500">Error: {(error as Error).message}</p>

  return (
    <div className="grid gap-4">
      {users?.map(user => (
        <div key={user.id} className="p-4 border border-border-subtle rounded-lg bg-white shadow-sm flex justify-between items-center">
          <div>
            <p className="font-medium text-text-heading">{user.fullName}</p>
            <p className="text-sm text-text-main">{user.email}</p>
          </div>
          <p className="text-xs text-text-main">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
      {users?.length === 0 && <p className="text-text-main italic">No users found.</p>}
    </div>
  )
}
