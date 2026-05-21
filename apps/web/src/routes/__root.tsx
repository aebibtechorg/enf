import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Sidebar } from '../components/layout/Sidebar'
import { MobileNav } from '../components/layout/MobileNav'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isAuthRoute = pathname === '/login' || pathname === '/reset-password'

  if (isAuthRoute) {
    return (
      <>
        <Outlet />
        <TanStackRouterDevtools />
      </>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50/30">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-14 px-4 border-b border-border-subtle bg-white flex items-center gap-2 sticky top-0 z-10">
          <div className="w-7 h-7 bg-brand rounded flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="font-bold text-text-heading">Example App</span>
        </header>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <MobileNav />
      <TanStackRouterDevtools />
    </div>
  )
}
