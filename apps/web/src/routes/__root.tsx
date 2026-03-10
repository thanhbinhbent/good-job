import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api'
import { queryKeys } from '@/lib/query'
import { useAuthStore } from '@/stores/auth.store'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const setAdmin = useAuthStore((s) => s.setAdmin)

  const { data: meData, isSuccess: meSuccess } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => authApi.me().catch(() => ({ role: 'guest' as const })),
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const { data: loginUrlData, isSuccess: loginUrlSuccess } = useQuery({
    queryKey: queryKeys.auth.loginUrl,
    queryFn: () => authApi.loginUrl(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  // When ADMIN_BYPASS=true: auto-authenticate without any user interaction.
  // Use sessionStorage so the flag survives the full-page redirect and prevents
  // an infinite loop (useRef resets on every remount after window.location.href).
  useEffect(() => {
    if (!meSuccess || !loginUrlSuccess) return
    if (meData?.role === 'admin') return
    if (!loginUrlData?.url?.includes('dev-login')) return
    if (sessionStorage.getItem('bypass_redirected')) return
    sessionStorage.setItem('bypass_redirected', '1')
    window.location.href = loginUrlData.url
  }, [meData, loginUrlData, meSuccess, loginUrlSuccess])

  useEffect(() => {
    setAdmin(meData?.role === 'admin')
    // Clear the bypass flag once we're confirmed admin so logout + re-login works
    if (meData?.role === 'admin') {
      sessionStorage.removeItem('bypass_redirected')
    }
  }, [meData, setAdmin])

  const isBypassMode = loginUrlSuccess && loginUrlData?.url?.includes('dev-login')
  const isAdmin = meData?.role === 'admin'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold tracking-tight text-primary">
          binh-tran
        </Link>
        <nav className="flex items-center gap-4">
          {isAdmin ? (
            <>
              <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Button variant="ghost" size="sm" asChild>
                <a href={authApi.logout()}>Logout</a>
              </Button>
            </>
          ) : (
            // Show button only after URL is loaded and not in bypass mode
            loginUrlSuccess && !isBypassMode && (
              <Button variant="ghost" size="sm" asChild>
                <a href={loginUrlData!.url}>Admin Login</a>
              </Button>
            )
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <Toaster richColors position="bottom-right" />
    </div>
  )
}
