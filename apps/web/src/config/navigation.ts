import { Home, Users, LayoutDashboard } from 'lucide-react'

export const navItems = [
  {
    label: 'Home',
    to: '/',
    icon: Home,
  },
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Users',
    to: '/users',
    icon: Users,
  },
] as const
