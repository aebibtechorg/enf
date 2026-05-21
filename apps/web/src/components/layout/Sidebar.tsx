import { Link, useNavigate } from '@tanstack/react-router'
import { navItems } from '../../config/navigation'
import { useAuth } from '../../features/auth/hooks/useAuth'

export function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/login' })
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-border-subtle bg-white sticky top-0 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="text-xl font-bold text-text-heading tracking-tight">Example App</span>
        </div>
        
        <nav className="space-y-1">
          {navItems.filter(item => !('enpOnly' in item) || (item.enpOnly && user?.isEnp)).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: 'bg-brand-muted text-brand font-medium' }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-main hover:bg-slate-50 transition-colors"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-border-subtle flex items-center justify-center text-sm font-medium text-text-main">
            {user?.name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'G'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-text-heading truncate">{user?.name || 'Guest'}</span>
            <span className="text-xs text-text-main truncate">{user?.email || 'Sign in to continue'}</span>
          </div>
        </div>

        {isAuthenticated ? (
          <button
            className="mt-4 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-main transition-colors hover:bg-slate-50"
            onClick={() => {
              void handleLogout()
            }}
            type="button"
          >
            Sign out
          </button>
        ) : (
          <Link
            className="mt-4 block w-full rounded-lg border border-border-subtle px-3 py-2 text-center text-sm text-text-main transition-colors hover:bg-slate-50"
            to="/login"
          >
            Sign in
          </Link>
        )}
      </div>
    </aside>
  )
}
