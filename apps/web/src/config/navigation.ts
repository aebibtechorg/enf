import { Home, Users, LayoutDashboard, Book, ShieldCheck } from 'lucide-react'

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
    label: 'Notarial Book',
    to: '/notarization/book',
    icon: Book,
    enpOnly: true,
  },
  {
    label: 'Verify Document',
    to: '/verify',
    icon: ShieldCheck,
  },
  {
    label: 'Users',
    to: '/users',
    icon: Users,
  },
] as const
