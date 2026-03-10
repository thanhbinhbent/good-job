import { createFileRoute, Link } from '@tanstack/react-router'
import { useDocument, usePatchSection, useUpdateDocument } from '@/hooks/use-documents'
import { useAuthStore } from '@/stores/auth.store'
import { InlineEdit } from '@/components/editor/InlineEdit'
import { RichTextSection } from '@/components/editor/RichTextSection'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Share2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/admin/$documentId')({
  component: DocumentEditorPage,
})

function DocumentEditorPage() {
  const { documentId } = Route.useParams()
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const { data: doc, isLoading } = useDocument(documentId)
  const updateDoc = useUpdateDocument(documentId)
  const patchSection = usePatchSection(documentId)

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading…</div>
  }

  if (!doc) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Document not found.</div>
  }

  const content = JSON.parse(doc.content as string) as Record<string, unknown>

  const saveSection = (key: string, data: unknown) => {
    patchSection.mutate({ sectionKey: key, data })
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin">
              <ArrowLeft className="size-4 mr-1" />
              Back
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Badge variant="secondary">{doc.type.replace('_', ' ')}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="size-4 mr-1" />
            Share
          </Button>
          <Button variant="outline" size="sm">Export PDF</Button>
          <Button variant="outline" size="sm">Export DOCX</Button>
        </div>
      </div>

      {/* Document Title */}
      <div className="mb-8">
        <InlineEdit
          value={doc.title}
          onSave={(title) => updateDoc.mutate({ title })}
          isAdmin={isAdmin}
          className="text-2xl font-bold"
        />
      </div>

      {/* Content editor — rendered per section key */}
      <div className="flex flex-col gap-8">
        {Object.entries(content).map(([key, value]) => (
          <section key={key}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              {key.replace(/_/g, ' ')}
            </h2>
            {typeof value === 'string' ? (
              <RichTextSection
                content={value}
                onSave={(html) => saveSection(key, html)}
                isAdmin={isAdmin}
              />
            ) : (
              <pre className="text-sm bg-muted/20 rounded-md p-4 overflow-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            )}
          </section>
        ))}

        {Object.keys(content).length === 0 && (
          <div className="text-center text-muted-foreground py-16 border border-dashed border-border rounded-xl">
            <p className="mb-2">This document has no content yet.</p>
            <p className="text-sm">Content sections will appear here once added via the API.</p>
          </div>
        )}
      </div>
    </div>
  )
}
