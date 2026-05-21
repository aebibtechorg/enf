import { Link, useNavigate } from '@tanstack/react-router'
import { LogIn, LogOut } from 'lucide-react'
import { navItems } from '../../config/navigation'
import { useAuth } from '../../features/auth/hooks/useAuth'

export function MobileNav() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/login' })
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-t border-border-subtle flex items-center justify-around px-2 z-50">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeProps={{ className: 'text-brand' }}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-text-main transition-colors"
        >
          <item.icon size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
        </Link>
      ))}

      {isAuthenticated ? (
        <button
          className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-text-main transition-colors"
          onClick={() => {
            void handleLogout()
          }}
          type="button"
        >
          <LogOut size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Sign out</span>
        </button>
      ) : (
        <Link
          className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-text-main transition-colors"
          to="/login"
        >
          <LogIn size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Sign in</span>
        </Link>
      )}
    </nav>
  )
}
