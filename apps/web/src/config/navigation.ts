import { Home, Users, LayoutDashboard, Book, ShieldCheck, ClipboardCheck, ScrollText } from 'lucide-react'

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
    label: 'Admin',
    to: '/admin',
    icon: ShieldCheck,
    enaOnly: true,
  },
  {
    label: 'ENA Apps',
    to: '/admin/applications',
    icon: ClipboardCheck,
    enaOnly: true,
  },
  {
    label: 'Compliance',
    to: '/admin/compliance',
    icon: ScrollText,
    enaOnly: true,
  },
  {
    label: 'Users',
    to: '/users',
    icon: Users,
    enaOnly: true,
  },
] as const
