import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { queryKeys } from '@/lib/query'
import { useAuthStore } from '@/stores/auth.store'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const setAdmin = useAuthStore((s) => s.setAdmin)

  const { data } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authApi.me(),
    retry: false,
    staleTime: Infinity,
  })

  useEffect(() => {
    setAdmin(data?.role === 'admin')
  }, [data, setAdmin])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight text-primary">
          binh-tran
        </Link>
        <nav className="flex items-center gap-4">
          {data?.role === 'admin' ? (
            <>
              <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Button variant="ghost" size="sm" asChild>
                <a href={authApi.logout()}>Logout</a>
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <a href={authApi.loginUrl()}>Admin Login</a>
            </Button>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
