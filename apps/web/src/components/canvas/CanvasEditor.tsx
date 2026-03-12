import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useCanvasStore } from '@/stores/canvas.store'
import { contentToCanvas } from './presets'
import { CanvasPreview } from './CanvasPreview'
import { SectionPanel } from './SectionPanel'
import { BlockPropertiesPanel } from './BlockPropertiesPanel'
import { GlobalStylePanel } from './GlobalStylePanel'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Loader2, Save, Eye, Columns, Palette,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
} from 'lucide-react'
import type { CanvasDocument } from '@binh-tran/shared'
import { cn } from '@/lib/utils'

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
  documentId,
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
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastIncomingSnapshotRef = useRef<string | null>(null)

  const incomingCanvas = useMemo<CanvasDocument>(() => {
    if (initialCanvas && initialCanvas.version === 1) {
      return initialCanvas
    }
    return contentToCanvas(documentType, rawContent, currentTemplateId)
  }, [initialCanvas, documentType, rawContent, currentTemplateId])

  const incomingSnapshot = useMemo(() => {
    return JSON.stringify(incomingCanvas)
  }, [incomingCanvas])

  // Sync incoming server/doc data into local canvas store safely.
  // Critical: do not reload while local edits are dirty, otherwise focused inputs lose focus.
  useEffect(() => {
    if (isDirty) return
    if (lastIncomingSnapshotRef.current === incomingSnapshot) return
    load(incomingCanvas)
    lastIncomingSnapshotRef.current = incomingSnapshot
  }, [isDirty, incomingSnapshot, incomingCanvas, load])

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
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card shrink-0">
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
              <span className="size-1.5 rounded-full bg-[var(--color-canvas-focus-ring)] inline-block" />
              Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
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
        <div className={cn(
          'shrink-0 border-r border-border overflow-hidden flex flex-col bg-card transition-all duration-200',
          leftCollapsed ? 'w-10' : 'w-[17rem]',
        )}>
          {leftCollapsed ? (
            // Collapsed: show only the expand button pinned at bottom
            <div className="flex flex-col items-center h-full py-3 gap-2">
              <div className="flex-1" />
              <button
                className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors py-2"
                title="Expand panel"
                onClick={() => setLeftCollapsed(false)}
              >
                <PanelLeftOpen className="size-4" />
                <span className="text-[8px] uppercase tracking-widest font-medium" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Structure</span>
              </button>
              <div className="flex-1" />
            </div>
          ) : (
            <>
              {leftTab === 'sections' ? <SectionPanel /> : <GlobalStylePanel />}
              {/* Collapse button pinned at bottom of panel */}
              <div className="shrink-0 border-t border-border px-3 py-2 flex items-center justify-between bg-card">
                <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
                  {leftTab === 'sections' ? 'Structure' : 'Style'}
                </span>
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Collapse panel"
                  onClick={() => setLeftCollapsed(true)}
                >
                  <PanelLeftClose className="size-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Canvas stage */}
        <div className="flex-1 overflow-auto bg-[var(--color-canvas-workspace)] p-8">
          <div className="mx-auto" style={{ width: doc.style.pageWidth }}>
            <CanvasPreview doc={doc} />
          </div>
        </div>

        {/* Right panel — block properties */}
        <div className={cn(
          'shrink-0 border-l border-border overflow-hidden flex flex-col bg-card transition-all duration-200',
          rightCollapsed ? 'w-10' : 'w-72',
        )}>
          {rightCollapsed ? (
            <div className="flex flex-col items-center h-full py-3">
              <div className="flex-1" />
              <button
                className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors py-2"
                title="Expand panel"
                onClick={() => setRightCollapsed(false)}
              >
                <PanelRightOpen className="size-4" />
                <span className="text-[8px] uppercase tracking-widest font-medium" style={{ writingMode: 'vertical-rl' }}>Properties</span>
              </button>
              <div className="flex-1" />
            </div>
          ) : (
            <>
              <BlockPropertiesPanel />
              <div className="shrink-0 border-t border-border px-3 py-2 flex items-center justify-between bg-card">
                <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">Properties</span>
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Collapse panel"
                  onClick={() => setRightCollapsed(true)}
                >
                  <PanelRightClose className="size-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Full preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="!w-[96vw] !max-w-[1400px] h-[94vh] max-h-[94vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
            <DialogTitle>Document Preview</DialogTitle>
            <DialogDescription className="sr-only">
              Preview the current document layout before exporting.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-[var(--color-canvas-workspace)] p-8">
            <div className="mx-auto" style={{ width: doc.style.pageWidth }}>
              <CanvasPreview doc={doc} isPreview />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
