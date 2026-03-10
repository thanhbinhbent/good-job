import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useDocuments, useCreateDocument, useDeleteDocument } from '@/hooks/use-documents'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/lib/api'
import { queryKeys } from '@/lib/query'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Globe, Mail, Plus, Trash2 } from 'lucide-react'
import type { DocumentType } from '@binh-tran/shared'

export const Route = createFileRoute('/admin/')({
  beforeLoad: () => {
    // Guard handled in component — auth check via cookie/query
  },
  component: AdminDashboard,
})

const TYPE_ICONS = { resume: FileText, portfolio: Globe, cover_letter: Mail } as const
const TYPE_LABELS: Record<DocumentType, string> = { resume: 'Resume', portfolio: 'Portfolio', cover_letter: 'Cover Letter' }
const TYPES: DocumentType[] = ['resume', 'portfolio', 'cover_letter']

function AdminDashboard() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const { data: documents, isLoading } = useDocuments()
  const createDoc = useCreateDocument()
  const deleteDoc = useDeleteDocument()
  const { data: loginUrlData } = useQuery({
    queryKey: queryKeys.auth.loginUrl,
    queryFn: () => authApi.loginUrl(),
    staleTime: Infinity,
  })

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Admin access required.</p>
        <Button asChild>
          <a href={loginUrlData?.url ?? '#'}>Login</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          {TYPES.map((type) => (
            <Button
              key={type}
              size="sm"
              variant="outline"
              disabled={createDoc.isPending}
              onClick={() => createDoc.mutate({ type, title: `My ${TYPE_LABELS[type]}` })}
            >
              <Plus className="size-4 mr-1" />
              {TYPE_LABELS[type]}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && documents && documents.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => {
            const Icon = TYPE_ICONS[doc.type as keyof typeof TYPE_ICONS] ?? FileText
            const label = TYPE_LABELS[doc.type as keyof typeof TYPE_LABELS] ?? doc.type
            return (
              <Card key={doc.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-primary" />
                    <Badge variant="secondary">{label}</Badge>
                  </div>
                  <CardTitle className="text-base">{doc.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Updated {new Date(doc.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1" />
                <CardFooter className="flex gap-2 pt-2">
                  <Button size="sm" asChild className="flex-1">
                    <Link to="/admin/$documentId" params={{ documentId: doc.id }}>
                      Edit
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    disabled={deleteDoc.isPending}
                    onClick={() => {
                      if (confirm('Delete this document?')) deleteDoc.mutate(doc.id)
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {!isLoading && (!documents || documents.length === 0) && (
        <div className="text-center text-muted-foreground py-24">
          <p className="mb-4">No documents yet. Create your first one above.</p>
        </div>
      )}
    </div>
  )
}
