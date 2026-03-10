import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useDocument, usePatchSection, useUpdateDocument } from '@/hooks/use-documents'
import { useAuthStore } from '@/stores/auth.store'
import { InlineEdit } from '@/components/editor/InlineEdit'
import { ResumeEditor } from '@/components/editor/ResumeEditor'
import { PortfolioEditor } from '@/components/editor/PortfolioEditor'
import { CoverLetterEditor } from '@/components/editor/CoverLetterEditor'
import { ShareDialog } from '@/components/ShareDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { exportApi } from '@/lib/api'
import { downloadPDF } from '@/components/export/download-pdf'
import type { ResumeContent, PortfolioContent, CoverLetterContent, Document } from '@binh-tran/shared'

export const Route = createFileRoute('/admin/$documentId')({
  component: DocumentEditorPage,
})

function DocumentEditorPage() {
  const { documentId } = Route.useParams()
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const { data: doc, isLoading } = useDocument(documentId)
  const updateDoc = useUpdateDocument(documentId)
  const patchSection = usePatchSection(documentId)
  const [pdfLoading, setPdfLoading] = useState(false)

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

      {/* Document Title */}
      <div className="mb-8">
        <InlineEdit
          value={doc.title}
          onSave={(title) => updateDoc.mutate({ title })}
          isAdmin={isAdmin}
          className="text-2xl font-bold"
        />
      </div>

      {/* Type-specific section editor */}
      {doc.type === 'resume' && (
        <ResumeEditor
          content={content as unknown as ResumeContent}
          isAdmin={isAdmin}
          onSave={saveSection}
        />
      )}

      {doc.type === 'portfolio' && (
        <PortfolioEditor
          content={content as unknown as PortfolioContent}
          isAdmin={isAdmin}
          onSave={saveSection}
        />
      )}

      {doc.type === 'cover_letter' && (
        <CoverLetterEditor
          content={content as unknown as CoverLetterContent}
          isAdmin={isAdmin}
          onSave={saveSection}
        />
      )}
    </div>
  )
}
