import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useDocument, useUpdateDocument } from '@/hooks/use-documents'
import { useAuthStore } from '@/stores/auth.store'
import { InlineEdit } from '@/components/editor/InlineEdit'
import { CanvasEditor } from '@/components/canvas/CanvasEditor'
import { ShareDialog } from '@/components/ShareDialog'
import { DEFAULT_TEMPLATE_ID } from '@/components/templates/registry'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { exportApi } from '@/lib/api'
import { downloadPDF } from '@/components/export/download-pdf'
import type { Document, CanvasDocument } from '@binh-tran/shared'

export const Route = createFileRoute('/admin/$documentId')({
  component: DocumentEditorPage,
})

function DocumentEditorPage() {
  const { documentId } = Route.useParams()
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const { data: doc, isLoading } = useDocument(documentId)
  const updateDoc = useUpdateDocument(documentId)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading…</div>
  }

  if (!doc) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Document not found.</div>
  }

  const rawContent = typeof doc.content === 'string'
    ? (JSON.parse(doc.content) as Record<string, unknown>)
    : (doc.content as Record<string, unknown>)

  // Detect if content is already a canvas doc (has version:1)
  const isCanvas = rawContent && (rawContent as { version?: number }).version === 1
  const initialCanvas = isCanvas ? (rawContent as unknown as CanvasDocument) : null

  const activeTemplateId = doc.templateId
    ?? DEFAULT_TEMPLATE_ID[doc.type as keyof typeof DEFAULT_TEMPLATE_ID]

  const handleSaveCanvas = async (canvasDoc: CanvasDocument) => {
    setIsSaving(true)
    try {
      await updateDoc.mutateAsync({ content: canvasDoc as unknown as Record<string, unknown> })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportPDF = async () => {
    setPdfLoading(true)
    try {
      await downloadPDF(doc as Document & { content: string })
    } finally {
      setPdfLoading(false)
    }
  }

  const handleExportDocx = () => {
    window.open(exportApi.docxUrl(doc.id), '_blank')
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin">
              <ArrowLeft className="size-4 mr-1" />
              Back
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Badge variant="secondary">{doc.type.replace('_', ' ')}</Badge>
          <InlineEdit
            value={doc.title}
            onSave={(title) => updateDoc.mutate({ title })}
            isAdmin={isAdmin}
            className="text-base font-semibold"
          />
        </div>
        <div className="flex items-center gap-2">
          <ShareDialog documentId={doc.id} />
          <Button variant="outline" size="sm" onClick={() => void handleExportPDF()} disabled={pdfLoading}>
            {pdfLoading ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Download className="size-4 mr-1" />}
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportDocx}>
            <Download className="size-4 mr-1" />
            DOCX
          </Button>
        </div>
      </div>

      {/* Canvas editor — full remaining height */}
      <div className="flex-1 min-h-0">
        <CanvasEditor
          documentId={doc.id}
          documentType={doc.type as 'resume' | 'portfolio' | 'cover_letter'}
          rawContent={rawContent}
          currentTemplateId={activeTemplateId}
          initialCanvas={initialCanvas}
          onSave={handleSaveCanvas}
          isSaving={isSaving}
        />
      </div>
    </div>
  )
}
