import { createFileRoute, Link } from '@tanstack/react-router'
import { useDocuments } from '@/hooks/use-documents'
import { useAuthStore } from '@/stores/auth.store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Globe, Mail } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const TYPE_ICONS = {
  resume: FileText,
  portfolio: Globe,
  cover_letter: Mail,
} as const

const TYPE_LABELS = {
  resume: 'Resume',
  portfolio: 'Portfolio',
  cover_letter: 'Cover Letter',
} as const

function HomePage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const { data: documents, isLoading } = useDocuments()

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Binh Tran
        </h1>
        <p className="text-muted-foreground text-lg">
          Software Engineer · Resume · Portfolio · Cover Letters
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && documents && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => {
            const Icon = TYPE_ICONS[doc.type as keyof typeof TYPE_ICONS] ?? FileText
            const label = TYPE_LABELS[doc.type as keyof typeof TYPE_LABELS] ?? doc.type
            return (
              <Card key={doc.id} className="group transition-shadow hover:shadow-md">
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
                <CardContent className="flex gap-2">
                  {isAdmin && (
                    <Button size="sm" variant="default" asChild>
                      <Link to="/admin/$documentId" params={{ documentId: doc.id }}>
                        Edit
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!isLoading && !documents?.length && !isAdmin && (
        <div className="text-center text-muted-foreground py-24">
          <p>Nothing here yet.</p>
        </div>
      )}

      {isAdmin && (
        <div className="mt-8 text-center">
          <Button asChild>
            <Link to="/admin">Go to Admin Dashboard</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
