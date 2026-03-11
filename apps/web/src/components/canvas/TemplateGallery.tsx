import { useMemo } from 'react'
import type { DocumentType, Template } from '@binh-tran/shared'
import { contentToCanvas, defaultStructuredContent } from './presets'
import { CanvasPreview } from './CanvasPreview'
import { cn } from '@/lib/utils'

interface TemplateGalleryProps {
  type: DocumentType
  templates: Template[]
  selectedTemplateId?: string
  onSelect: (templateId: string) => void
}

export function TemplateGallery({ type, templates, selectedTemplateId, onSelect }: TemplateGalleryProps) {
  const sampleContent = useMemo(() => defaultStructuredContent(type), [type])

  const previews = useMemo(
    () => templates.map((tpl) => ({
      template: tpl,
      canvas: contentToCanvas(type, sampleContent, tpl.id),
    })),
    [templates, type, sampleContent],
  )

  if (!templates.length) {
    return <div className="text-xs text-muted-foreground">No templates available.</div>
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {previews.map(({ template, canvas }) => {
        const selected = selectedTemplateId === template.id
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={cn(
              'rounded-md border bg-card text-left transition-colors overflow-hidden',
              selected ? 'border-primary ring-1 ring-primary/50' : 'border-border hover:border-primary/50',
            )}
          >
            <div className="h-36 overflow-hidden bg-[var(--color-canvas-workspace)]">
              <div
                className="origin-top-left pointer-events-none"
                style={{
                  width: canvas.style.pageWidth,
                  transform: 'scale(0.19)',
                }}
              >
                <CanvasPreview doc={canvas} isPreview />
              </div>
            </div>
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-medium">{template.name}</span>
              {template.isDefault && (
                <span className="text-[10px] text-muted-foreground">Default</span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
