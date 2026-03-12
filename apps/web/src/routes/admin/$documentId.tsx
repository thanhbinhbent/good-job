import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useDocument, useUpdateDocument } from '@/hooks/use-documents'
import { useTemplates } from '@/hooks/use-templates'
import { useAuthStore } from '@/stores/auth.store'
import { InlineEdit } from '@/components/editor/InlineEdit'
import { CanvasEditor } from '@/components/canvas/CanvasEditor'
import { TemplateGallery } from '@/components/canvas/TemplateGallery'
import { contentToCanvas, defaultStructuredContent } from '@/components/canvas/presets'
import { ShareDialog } from '@/components/ShareDialog'
import { DEFAULT_TEMPLATE_ID } from '@/components/templates/registry'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Download, Loader2, WandSparkles } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { exportApi } from '@/lib/api'
import { downloadPDF } from '@/components/export/download-pdf'
import type { Document, CanvasDocument, DocumentType } from '@binh-tran/shared'

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
  const [canvasResetToken, setCanvasResetToken] = useState(0)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [templateMode, setTemplateMode] = useState<'keep' | 'clear'>('clear')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  const documentType = (doc?.type as DocumentType | undefined) ?? 'resume'
  const { data: templateOptions = [] } = useTemplates(documentType)

  const activeTemplateId = doc?.templateId
    ?? DEFAULT_TEMPLATE_ID[documentType as keyof typeof DEFAULT_TEMPLATE_ID]

  const defaultTemplateId = useMemo(() => {
    return templateOptions.find((tpl) => tpl.isDefault)?.id ?? templateOptions[0]?.id ?? activeTemplateId
  }, [templateOptions, activeTemplateId])

  const effectiveTemplateId = selectedTemplateId || defaultTemplateId

  useEffect(() => {
    setSelectedTemplateId(activeTemplateId)
  }, [activeTemplateId])

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

  const actualDocumentType = doc.type as DocumentType

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

  const handleApplyTemplate = async () => {
    const templateId = effectiveTemplateId
    if (!templateId) return

    const baseDefault = defaultStructuredContent(actualDocumentType)
    const templateCanvas = contentToCanvas(actualDocumentType, baseDefault, templateId)

    let nextCanvas: CanvasDocument
    if (templateMode === 'clear') {
      nextCanvas = templateCanvas
    } else if (isCanvas) {
      nextCanvas = {
        ...(rawContent as CanvasDocument),
        style: templateCanvas.style,
      }
    } else {
      nextCanvas = contentToCanvas(actualDocumentType, rawContent, templateId)
    }

    setIsSaving(true)
    try {
      await updateDoc.mutateAsync({
        templateId,
        content: nextCanvas as unknown as Record<string, unknown>,
      })
      setCanvasResetToken((n) => n + 1)
      setTemplateOpen(false)
    } finally {
      setIsSaving(false)
    }
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
          <Button variant="outline" size="sm" onClick={() => {
            setSelectedTemplateId(activeTemplateId)
            setTemplateMode('clear')
            setTemplateOpen(true)
          }}>
            <WandSparkles className="size-4 mr-1" />
            Template
          </Button>
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

      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply template</DialogTitle>
            <DialogDescription className="sr-only">
              Choose a template and apply mode for this document.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <TemplateGallery
                type={actualDocumentType}
                templates={templateOptions}
                selectedTemplateId={effectiveTemplateId}
                onSelect={setSelectedTemplateId}
              />
            </div>

            <div className="space-y-2">
              <Label>Apply mode</Label>
              <Select value={templateMode} onValueChange={(v) => setTemplateMode(v as 'keep' | 'clear')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">Apply template only (keep content)</SelectItem>
                  <SelectItem value="clear">Clear current data and apply template</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {templateMode === 'clear'
                  ? 'Clear mode applies full sample content and style from the selected template.'
                  : 'Keep mode preserves your current content and applies template style only.'}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTemplateOpen(false)}>Cancel</Button>
              <Button disabled={isSaving || !effectiveTemplateId} onClick={() => void handleApplyTemplate()}>
                {isSaving ? 'Applying…' : 'Apply'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Canvas editor — full remaining height */}
      <div className="flex-1 min-h-0">
        <CanvasEditor
          key={`${doc.id}-${canvasResetToken}`}
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
