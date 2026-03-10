import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useShareLink, useUnlockShare } from '@/hooks/use-share'
import { useDocument } from '@/hooks/use-documents'
import { useAuthStore } from '@/stores/auth.store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Lock } from 'lucide-react'

export const Route = createFileRoute('/view/$shareId')({
  component: ViewPage,
})

function ViewPage() {
  const { shareId } = Route.useParams()
  const [password, setPassword] = useState('')
  const hasShareAccess = useAuthStore((s) => s.hasShareAccess)

  const { data: link, isLoading: linkLoading, error: linkError } = useShareLink(shareId)
  const unlock = useUnlockShare()

  const needsPassword = link?.hasPassword && !hasShareAccess
  const canView = !link?.hasPassword || hasShareAccess

  const documentId = link
    ? (link as { documentId: string }).documentId
    : undefined

  const { data: doc, isLoading: docLoading } = useDocument(documentId ?? '')

  if (linkLoading) {
    return <CenteredMessage>Loading…</CenteredMessage>
  }

  if (linkError) {
    return <CenteredMessage>Share link not found or has expired.</CenteredMessage>
  }

  if (needsPassword) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Lock className="mx-auto mb-2 size-8 text-primary" />
            <CardTitle>Password Protected</CardTitle>
            <CardDescription>Enter the password to view this document.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                unlock.mutate({ id: shareId, password })
              }}
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              {unlock.isError && (
                <p className="text-sm text-destructive">Incorrect password. Try again.</p>
              )}
              <Button type="submit" disabled={unlock.isPending}>
                {unlock.isPending ? 'Unlocking…' : 'Unlock'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!canView) return <CenteredMessage>Access denied.</CenteredMessage>

  if (docLoading) return <CenteredMessage>Loading document…</CenteredMessage>

  if (!doc) return <CenteredMessage>Document not found.</CenteredMessage>

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold mb-2">{doc.title}</h1>
      <pre className="text-xs text-muted-foreground bg-muted/20 rounded p-4 overflow-auto">
        {JSON.stringify(JSON.parse(doc.content as string), null, 2)}
      </pre>
    </div>
  )
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
      {children}
    </div>
  )
}
