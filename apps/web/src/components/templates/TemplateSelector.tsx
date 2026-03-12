import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Layout } from 'lucide-react'
import type { DocumentType } from '@binh-tran/shared'
import { getTemplatesForType, DEFAULT_TEMPLATE_ID, type TemplateDefinition } from './registry'

interface Props {
  documentType: DocumentType
  currentTemplateId: string
  content: unknown
  title: string
  onApply: (templateId: string) => void
}

export function TemplateSelector({ documentType, currentTemplateId, content, title, onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(currentTemplateId || DEFAULT_TEMPLATE_ID[documentType])
  const templates = getTemplatesForType(documentType)
  const previewTemplate = templates.find((t) => t.id === selected) ?? templates[0]

  const handleApply = () => {
    onApply(selected)
    setOpen(false)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Layout className="size-4 mr-1.5" />
        Template
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
            <DialogTitle>Choose Template</DialogTitle>
            <DialogDescription className="sr-only">
              Select a template and preview it before applying.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-1 min-h-0">
            {/* Template list */}
            <div className="w-64 shrink-0 border-r border-border overflow-y-auto p-3 space-y-2">
              {templates.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  template={tpl}
                  isSelected={selected === tpl.id}
                  isCurrent={currentTemplateId === tpl.id}
                  content={content}
                  title={title}
                  onClick={() => setSelected(tpl.id)}
                />
              ))}
            </div>

            {/* Live preview */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
                <div>
                  <span className="font-medium text-sm">{previewTemplate?.name}</span>
                  {previewTemplate && (
                    <p className="text-xs text-muted-foreground mt-0.5">{previewTemplate.description}</p>
                  )}
                </div>
                <Button onClick={handleApply} size="sm" disabled={selected === currentTemplateId}>
                  <Check className="size-4 mr-1" />
                  Apply
                </Button>
              </div>
              <div className="flex-1 overflow-auto bg-muted/20 p-6">
                {previewTemplate && (
                  <div className="origin-top-left" style={{ transform: 'scale(0.85)', width: '117%' }}>
                    {previewTemplate.render({ content, title })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function TemplateCard({
  template,
  isSelected,
  isCurrent,
  content,
  title,
  onClick,
}: {
  template: TemplateDefinition
  isSelected: boolean
  isCurrent: boolean
  content: unknown
  title: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border transition-all overflow-hidden ${
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40'
      }`}
    >
      {/* Mini thumbnail */}
      <div className="h-28 overflow-hidden bg-white relative">
        <div
          style={{ transform: 'scale(0.18)', transformOrigin: 'top left', width: '556%', height: '556%' }}
          className="pointer-events-none select-none"
        >
          {template.render({ content, title })}
        </div>
      </div>

      {/* Card footer */}
      <div className="px-3 py-2 bg-card flex items-center justify-between">
        <div>
          <p className="text-xs font-medium">{template.name}</p>
        </div>
        <div className="flex gap-1">
          {isCurrent && <Badge variant="secondary" className="text-[10px] py-0">active</Badge>}
          {isSelected && <Check className="size-3 text-primary" />}
        </div>
      </div>
    </button>
  )
}
