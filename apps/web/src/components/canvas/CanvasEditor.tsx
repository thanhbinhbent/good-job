import { useEffect, useRef, useState, useCallback } from 'react'
import { useCanvasStore } from '@/stores/canvas.store'
import { contentToCanvas } from './presets'
import { CanvasPreview } from './CanvasPreview'
import { SectionPanel } from './SectionPanel'
import { BlockPropertiesPanel } from './BlockPropertiesPanel'
import { GlobalStylePanel } from './GlobalStylePanel'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Save, Eye, Columns, Palette } from 'lucide-react'
import type { CanvasDocument } from '@binh-tran/shared'

interface Props {
  documentId: string
  documentType: 'resume' | 'portfolio' | 'cover_letter'
  rawContent: unknown        // parsed JSON content from backend
  currentTemplateId: string
  initialCanvas?: CanvasDocument | null  // if already a canvas doc
  onSave: (canvasDoc: CanvasDocument) => void | Promise<void>
  isSaving?: boolean
}

type LeftTab = 'sections' | 'style'

export function CanvasEditor({
  documentType,
  rawContent,
  currentTemplateId,
  initialCanvas,
  onSave,
  isSaving,
}: Props) {
  const { doc, load, isDirty, markSaved } = useCanvasStore()
  const [leftTab, setLeftTab] = useState<LeftTab>('sections')
  const [previewOpen, setPreviewOpen] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Init canvas from existing canvas doc or convert from legacy content
  useEffect(() => {
    if (initialCanvas && initialCanvas.version === 1) {
      load(initialCanvas)
    } else {
      const canvas = contentToCanvas(documentType, rawContent, currentTemplateId)
      load(canvas)
    }
    // only re-init if doc id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentType])

  // Auto-save 1.5s after last change
  const handleSave = useCallback(async () => {
    if (!doc) return
    await onSave(doc)
    markSaved()
  }, [doc, onSave, markSaved])

  useEffect(() => {
    if (!isDirty) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => { void handleSave() }, 1500)
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current) }
  }, [isDirty, handleSave])

  if (!doc) {
    return (
      <div className="flex h-[600px] items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="size-4 animate-spin" /> Loading canvas…
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[600px]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Tabs value={leftTab} onValueChange={(v) => setLeftTab(v as LeftTab)}>
            <TabsList className="h-7">
              <TabsTrigger value="sections" className="text-xs h-6 gap-1.5">
                <Columns className="size-3" /> Structure
              </TabsTrigger>
              <TabsTrigger value="style" className="text-xs h-6 gap-1.5">
                <Palette className="size-3" /> Style
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {isDirty && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-amber-400 inline-block" />
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={() => setPreviewOpen(true)}>
            <Eye className="size-3" /> Preview
          </Button>
          <Button size="sm" className="h-7 text-xs gap-1.5" onClick={() => void handleSave()} disabled={isSaving || !isDirty}>
            {isSaving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
            Save
          </Button>
        </div>
      </div>

      {/* 3-pane editor */}
      <div className="flex flex-1 min-h-0">
        {/* Left panel */}
        <div className="w-60 shrink-0 border-r border-border overflow-hidden flex flex-col bg-card">
          {leftTab === 'sections' ? <SectionPanel /> : <GlobalStylePanel />}
        </div>

        {/* Canvas stage */}
        <div className="flex-1 overflow-auto bg-[hsl(220,14%,10%)] p-8">
          <div className="mx-auto" style={{ width: doc.style.pageWidth }}>
            <CanvasPreview doc={doc} />
          </div>
        </div>

        {/* Right panel — block properties */}
        <div className="w-64 shrink-0 border-l border-border overflow-hidden flex flex-col bg-card">
          <BlockPropertiesPanel />
        </div>
      </div>

      {/* Full preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-[hsl(220,14%,10%)] p-8">
            <div className="mx-auto" style={{ width: doc.style.pageWidth }}>
              <CanvasPreview doc={doc} isPreview />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
