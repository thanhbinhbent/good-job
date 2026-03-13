import { useCanvasStore } from '@/stores/canvas.store'
import type { CanvasBlock, CanvasColor } from '@binh-tran/shared'
import { FONT_FAMILIES } from '@binh-tran/shared'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Trash2, Copy, ChevronUp, ChevronDown, X } from 'lucide-react'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { Badge } from '@/components/ui/badge'
import { useState, useCallback, memo } from 'react'

// ── Small reusable form controls ──────────────────────────────────────────────

const Row = memo(({ label, children }: { label: string; children: React.ReactNode }) => {
  return (
    <div className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-2.5 py-1 min-w-0">
      <Label className="text-[10.5px] font-medium text-muted-foreground/90 truncate">{label}</Label>
      <div className="min-w-0">{children}</div>
    </div>
  )
})

const Group = memo(({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="rounded-lg border border-border/50 bg-card/50 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors"
      >
        <span className="text-[10.5px] font-semibold uppercase tracking-wide text-foreground/80">{title}</span>
        <ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-3 py-2.5 space-y-1.5 border-t border-border/50">
          {children}
        </div>
      )}
    </div>
  )
})

const NumInput = memo(({ value, onChange, min = 0, max = 999, step = 1, suffix }: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    if (!isNaN(val) && val >= min && val <= max) {
      onChange(val)
    }
  }, [onChange, min, max])

  return (
    <div className="relative">
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        className="h-8 text-xs pr-8"
        onChange={handleChange}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  )
})

function toColorInputHex(hex?: string): string {
  const raw = (hex ?? '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`
  }
  return '#000000'
}

function ColorInput({ value, onChange }: { value: CanvasColor; onChange: (c: CanvasColor) => void }) {
  const handleHexChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, hex: e.target.value })
  }, [value, onChange])

  const handleOpacityChange = useCallback(([v]: number[]) => {
    onChange({ ...value, opacity: (v ?? 100) / 100 })
  }, [value, onChange])

  return (
    <div className="space-y-2 min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <input
          type="color"
          value={toColorInputHex(value.hex)}
          className="w-9 h-8 rounded-md border border-border cursor-pointer"
          onChange={handleHexChange}
        />
        <Input
          value={value.hex}
          className="h-8 text-xs font-mono flex-1 min-w-0"
          onChange={handleHexChange}
        />
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10px] text-muted-foreground w-5 text-center shrink-0">α</span>
        <Slider
          value={[value.opacity * 100]}
          min={0}
          max={100}
          step={1}
          className="flex-1 min-w-0"
          onValueChange={handleOpacityChange}
        />
        <span className="text-[10px] text-muted-foreground w-10 text-right shrink-0 tabular-nums">
          {Math.round(value.opacity * 100)}%
        </span>
      </div>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function BlockPropertiesPanel() {
  const {
    doc, selectedSectionId, selectedColumnId, selectedBlockId,
    updateBlock, removeBlock, duplicateBlock, moveBlock, selectBlock,
  } = useCanvasStore()

  // Memoize update function for performance
  const update = useCallback((patch: Partial<CanvasBlock>) => {
    if (selectedSectionId && selectedColumnId && selectedBlockId) {
      updateBlock(selectedSectionId, selectedColumnId, selectedBlockId, patch)
    }
  }, [updateBlock, selectedSectionId, selectedColumnId, selectedBlockId])

  const handleRemove = useCallback(() => {
    if (selectedSectionId && selectedColumnId && selectedBlockId) {
      removeBlock(selectedSectionId, selectedColumnId, selectedBlockId)
      selectBlock(null, null, null)
    }
  }, [removeBlock, selectBlock, selectedSectionId, selectedColumnId, selectedBlockId])

  const handleDuplicate = useCallback(() => {
    if (selectedSectionId && selectedColumnId && selectedBlockId) {
      duplicateBlock(selectedSectionId, selectedColumnId, selectedBlockId)
    }
  }, [duplicateBlock, selectedSectionId, selectedColumnId, selectedBlockId])

  const handleMoveUp = useCallback(() => {
    if (selectedSectionId && selectedColumnId && selectedBlockId) {
      moveBlock(selectedSectionId, selectedColumnId, selectedBlockId, 'up')
    }
  }, [moveBlock, selectedSectionId, selectedColumnId, selectedBlockId])

  const handleMoveDown = useCallback(() => {
    if (selectedSectionId && selectedColumnId && selectedBlockId) {
      moveBlock(selectedSectionId, selectedColumnId, selectedBlockId, 'down')
    }
  }, [moveBlock, selectedSectionId, selectedColumnId, selectedBlockId])

  const handleClose = useCallback(() => {
    selectBlock(null, null, null)
  }, [selectBlock])

  if (!doc || !selectedSectionId || !selectedColumnId || !selectedBlockId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs p-6 text-center gap-3">
        <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">No Block Selected</p>
          <p className="text-[11px]">Click any element on the canvas to edit its properties</p>
        </div>
      </div>
    )
  }

  const section = doc.sections.find((s) => s.id === selectedSectionId)
  const column = section?.columns.find((c) => c.id === selectedColumnId)
  const block = column?.blocks.find((b) => b.id === selectedBlockId)

  if (!block) return null

  const col = column!
  const blockIndex = col.blocks.findIndex((b) => b.id === selectedBlockId)
  const isFirst = blockIndex === 0
  const isLast = blockIndex === col.blocks.length - 1

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0 bg-muted/30">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[9.5px] uppercase font-semibold px-2 py-0.5">{block.kind}</Badge>
          <span className="text-[11px] text-muted-foreground font-medium">Block Properties</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 hover:bg-muted"
            title="Move up"
            disabled={isFirst}
            onClick={handleMoveUp}
          >
            <ChevronUp className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 hover:bg-muted"
            title="Move down"
            disabled={isLast}
            onClick={handleMoveDown}
          >
            <ChevronDown className="size-3.5" />
          </Button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <Button
            variant="ghost"
            size="icon"
            className="size-7 hover:bg-muted"
            title="Duplicate"
            onClick={handleDuplicate}
          >
            <Copy className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Delete"
            onClick={handleRemove}
          >
            <Trash2 className="size-3.5" />
          </Button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <Button
            variant="ghost"
            size="icon"
            className="size-7 hover:bg-muted"
            onClick={handleClose}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {block.kind === 'text' && (
          <TextBlockEditor block={block} update={update} />
        )}
        {block.kind === 'dualText' && (
          <DualTextBlockEditor block={block} update={update} />
        )}
        {block.kind === 'date' && (
          <DateBlockEditor block={block} update={update} />
        )}
        {block.kind === 'tags' && (
          <TagBlockEditor block={block} update={update} />
        )}
        {block.kind === 'progress' && (
          <ProgressBlockEditor block={block} update={update} />
        )}
        {block.kind === 'divider' && (
          <DividerBlockEditor block={block} update={update} />
        )}
        {block.kind === 'image' && (
          <ImageBlockEditor block={block} update={update} />
        )}
        {block.kind === 'link' && (
          <LinkBlockEditor block={block} update={update} />
        )}
        {block.kind === 'spacer' && (
          <Row label="Height">
            <NumInput value={block.height} min={0} max={200} onChange={(v) => update({ height: v } as Partial<CanvasBlock>)} />
          </Row>
        )}
        {block.kind === 'rating' && (
          <RatingBlockEditor block={block} update={update} />
        )}
        {block.kind === 'timeline' && (
          <TimelineBlockEditor block={block} update={update} />
        )}
        {block.kind === 'badge' && (
          <BadgeBlockEditor block={block} update={update} />
        )}
        {block.kind === 'stat' && (
          <StatBlockEditor block={block} update={update} />
        )}
        {block.kind === 'card' && (
          <CardBlockEditor block={block} update={update} />
        )}
        {block.kind === 'socialLinks' && (
          <SocialLinksBlockEditor block={block} update={update} />
        )}
      </div>
    </div>
  )
}

// ── Block-specific editors ─────────────────────────────────────────────────────

function DualTextBlockEditor({ block, update }: { block: import('@binh-tran/shared').DualTextBlock; update: (p: Partial<CanvasBlock>) => void }) {
  const p = (patch: object) => update(patch as Partial<CanvasBlock>)

  return (
    <div className="space-y-3">
      <Group title="Content">
        <div className="space-y-2">
          <Label className="text-[11px] text-muted-foreground">Left</Label>
          <RichTextEditor
            key={`${block.id}-left`}
            content={block.leftContent}
            onSave={(html) => p({ leftContent: html })}
            isAdmin
            debounceMs={300}
            showToolbar={true}
            compact={true}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] text-muted-foreground">Right</Label>
          <RichTextEditor
            key={`${block.id}-right`}
            content={block.rightContent}
            onSave={(html) => p({ rightContent: html })}
            isAdmin
            debounceMs={300}
            showToolbar={true}
            compact={true}
          />
        </div>
      </Group>

      <Group title="Typography">
        <Row label="Font">
          <Select value={block.fontFamily || 'Inter'} onValueChange={(v) => p({ fontFamily: v })}>
            <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Size"><NumInput value={block.fontSize} min={8} max={72} onChange={(v) => p({ fontSize: v })} /></Row>
        <Row label="Left W.">
          <Select value={block.fontWeight} onValueChange={(v) => p({ fontWeight: v })}>
            <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['300','400','500','600','700','800'] as const).map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Right W.">
          <Select value={block.rightFontWeight} onValueChange={(v) => p({ rightFontWeight: v })}>
            <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['300','400','500','600','700','800'] as const).map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Style">
          <Select value={block.fontStyle} onValueChange={(v) => p({ fontStyle: v })}>
            <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="italic">Italic</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Group>

      <Group title="Layout">
        <Row label="Line H."><NumInput value={block.lineHeight} min={0.8} max={4} step={0.05} onChange={(v) => p({ lineHeight: v })} /></Row>
        <Row label="Spacing"><NumInput value={block.letterSpacing} min={-0.1} max={0.5} step={0.01} onChange={(v) => p({ letterSpacing: v })} /></Row>
        <Row label="Gap"><NumInput value={block.gap} min={0} max={80} onChange={(v) => p({ gap: v })} /></Row>
        <Row label="Margin↓"><NumInput value={block.marginBottom} min={0} max={80} onChange={(v) => p({ marginBottom: v })} /></Row>
      </Group>

      <Group title="Color">
        <Row label="Left"><ColorInput value={block.color} onChange={(c) => p({ color: c })} /></Row>
        <Row label="Right"><ColorInput value={block.rightColor} onChange={(c) => p({ rightColor: c })} /></Row>
      </Group>
    </div>
  )
}

function TextBlockEditor({ block, update }: { block: import('@binh-tran/shared').TextBlock; update: (p: Partial<CanvasBlock>) => void }) {
  const p = (patch: object) => update(patch as Partial<CanvasBlock>)

  return (
    <div className="space-y-3">
      <Group title="Content">
        <RichTextEditor
          key={block.id}
          content={block.content}
          onSave={(html) => p({ content: html })}
          isAdmin
          debounceMs={300}
          showToolbar={true}
          compact={false}
        />
      </Group>

      <Group title="Typography">
        <Row label="Font">
          <Select value={block.fontFamily || 'Inter'} onValueChange={(v) => p({ fontFamily: v })}>
            <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Size"><NumInput value={block.fontSize} min={8} max={72} onChange={(v) => p({ fontSize: v })} /></Row>
        <Row label="Weight">
          <Select value={block.fontWeight} onValueChange={(v) => p({ fontWeight: v })}>
            <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['300','400','500','600','700','800'] as const).map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Style">
          <Select value={block.fontStyle} onValueChange={(v) => p({ fontStyle: v })}>
            <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="italic">Italic</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Transform">
          <Select value={block.textTransform} onValueChange={(v) => p({ textTransform: v })}>
            <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="uppercase">UPPERCASE</SelectItem>
              <SelectItem value="lowercase">lowercase</SelectItem>
              <SelectItem value="capitalize">Capitalize</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Group>

      <Group title="Layout">
        <Row label="Align">
          <Select value={block.align} onValueChange={(v) => p({ align: v })}>
            <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['left','center','right','justify'].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Line H."><NumInput value={block.lineHeight} min={0.8} max={4} step={0.05} onChange={(v) => p({ lineHeight: v })} /></Row>
        <Row label="Spacing"><NumInput value={block.letterSpacing} min={-0.1} max={0.5} step={0.01} onChange={(v) => p({ letterSpacing: v })} /></Row>
        <Row label="Margin↓"><NumInput value={block.marginBottom} min={0} max={80} onChange={(v) => p({ marginBottom: v })} /></Row>
      </Group>

      <Group title="Color">
        <Row label="Text"><ColorInput value={block.color} onChange={(c) => p({ color: c })} /></Row>
      </Group>
    </div>
  )
}

function DateBlockEditor({ block, update }: { block: import('@binh-tran/shared').DateBlock; update: (p: Partial<CanvasBlock>) => void }) {
  const p = (patch: object) => update(patch as Partial<CanvasBlock>)
  return (
    <div className="space-y-3">
      <Group title="Date Range">
        <Row label="Start"><Input type="month" value={block.startDate} className="h-8 text-xs" onChange={(e) => p({ startDate: e.target.value })} /></Row>
        <Row label="End"><Input type="month" value={block.endDate ?? ''} className="h-8 text-xs" disabled={block.current} onChange={(e) => p({ endDate: e.target.value })} /></Row>
        <Row label="Current"><Switch checked={block.current} onCheckedChange={(v) => p({ current: v })} /></Row>
      </Group>

      <Group title="Display">
        <Row label="Format">
          <Select value={block.format} onValueChange={(v) => p({ format: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['MMM YYYY','YYYY','MM/YYYY','YYYY-MM'].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Align">
          <Select value={block.align} onValueChange={(v) => p({ align: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['left','center','right'].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Size"><NumInput value={block.fontSize} min={8} max={24} onChange={(v) => p({ fontSize: v })} /></Row>
        <Row label="Color"><ColorInput value={block.color} onChange={(c) => p({ color: c })} /></Row>
      </Group>
    </div>
  )
}

function TagBlockEditor({ block, update }: { block: import('@binh-tran/shared').TagBlock; update: (p: Partial<CanvasBlock>) => void }) {
  const p = (patch: object) => update(patch as Partial<CanvasBlock>)
  const [newTag, setNewTag] = useState('')
  const addTag = () => {
    if (!newTag.trim()) return
    p({ items: [...block.items, newTag.trim()] })
    setNewTag('')
  }
  return (
    <div className="space-y-3">
      <Group title="Tags">
        <div className="flex min-h-[32px] flex-wrap gap-1.5 rounded border border-border p-2">
          {block.items.map((t, i) => (
            <span key={i} className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs">
              {t}
              <button onClick={() => p({ items: block.items.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive"><X className="size-2.5" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          <Input value={newTag} placeholder="Add tag…" className="h-8 text-xs flex-1"
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
          />
          <Button size="sm" className="h-8 text-xs" onClick={addTag}>Add</Button>
        </div>
      </Group>

      <Group title="Style">
        <Row label="Chip BG"><ColorInput value={block.chipBackground} onChange={(c) => p({ chipBackground: c })} /></Row>
        <Row label="Chip text"><ColorInput value={block.chipColor} onChange={(c) => p({ chipColor: c })} /></Row>
        <Row label="Radius"><NumInput value={block.chipRadius} min={0} max={50} onChange={(v) => p({ chipRadius: v })} /></Row>
        <Row label="Font size"><NumInput value={block.fontSize} min={8} max={20} onChange={(v) => p({ fontSize: v })} /></Row>
        <Row label="Gap"><NumInput value={block.gap} min={2} max={24} onChange={(v) => p({ gap: v })} /></Row>
        <Row label="Margin↓"><NumInput value={block.marginBottom} min={0} max={80} onChange={(v) => p({ marginBottom: v })} /></Row>
      </Group>
    </div>
  )
}

function ProgressBlockEditor({ block, update }: { block: import('@binh-tran/shared').ProgressBlock; update: (p: Partial<CanvasBlock>) => void }) {
  const p = (patch: object) => update(patch as Partial<CanvasBlock>)
  return (
    <div className="space-y-3">
      <Group title="Progress">
        <Row label="Label"><Input value={block.label} className="h-8 text-xs" onChange={(e) => p({ label: e.target.value })} /></Row>
        <Row label="Value">
          <div className="flex items-center gap-2">
            <Slider value={[block.value]} min={0} max={100} className="flex-1"
              onValueChange={([v]) => p({ value: v })} />
            <span className="w-8 text-right text-xs">{block.value}%</span>
          </div>
        </Row>
        <Row label="Height"><NumInput value={block.height} min={2} max={24} onChange={(v) => p({ height: v })} /></Row>
      </Group>

      <Group title="Colors">
        <Row label="Track"><ColorInput value={block.trackColor} onChange={(c) => p({ trackColor: c })} /></Row>
        <Row label="Fill"><ColorInput value={block.fillColor} onChange={(c) => p({ fillColor: c })} /></Row>
      </Group>

      <Group title="Visibility">
        <Row label="Show label"><Switch checked={block.showLabel} onCheckedChange={(v) => p({ showLabel: v })} /></Row>
        <Row label="Show %"><Switch checked={block.showValue} onCheckedChange={(v) => p({ showValue: v })} /></Row>
      </Group>
    </div>
  )
}

function DividerBlockEditor({ block, update }: { block: import('@binh-tran/shared').DividerBlock; update: (p: Partial<CanvasBlock>) => void }) {
  const p = (patch: object) => update(patch as Partial<CanvasBlock>)
  return (
    <div className="space-y-3">
      <Group title="Divider">
        <Row label="Color"><ColorInput value={block.color} onChange={(c) => p({ color: c })} /></Row>
        <Row label="Thickness"><NumInput value={block.thickness} min={1} max={10} onChange={(v) => p({ thickness: v })} /></Row>
        <Row label="Style">
          <Select value={block.style} onValueChange={(v) => p({ style: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="dotted">Dotted</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Margin↑"><NumInput value={block.marginTop} min={0} max={80} onChange={(v) => p({ marginTop: v })} /></Row>
        <Row label="Margin↓"><NumInput value={block.marginBottom} min={0} max={80} onChange={(v) => p({ marginBottom: v })} /></Row>
      </Group>
    </div>
  )
}

function ImageBlockEditor({ block, update }: { block: import('@binh-tran/shared').ImageBlock; update: (p: Partial<CanvasBlock>) => void }) {
  const p = (patch: object) => update(patch as Partial<CanvasBlock>)
  return (
    <div className="space-y-3">
      <Group title="Image">
        <Row label="URL"><Input value={block.url} placeholder="https://…" className="h-8 text-xs" onChange={(e) => p({ url: e.target.value })} /></Row>
        <Row label="Width"><NumInput value={block.width} min={16} max={400} onChange={(v) => p({ width: v })} /></Row>
        <Row label="Height"><NumInput value={block.height} min={16} max={400} onChange={(v) => p({ height: v })} /></Row>
        <Row label="Radius %"><NumInput value={block.radius} min={0} max={50} onChange={(v) => p({ radius: v })} /></Row>
        <Row label="Align">
          <Select value={block.align} onValueChange={(v) => p({ align: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['left','center','right'].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
      </Group>
    </div>
  )
}

function LinkBlockEditor({ block, update }: { block: import('@binh-tran/shared').LinkBlock; update: (p: Partial<CanvasBlock>) => void }) {
  const p = (patch: object) => update(patch as Partial<CanvasBlock>)
  return (
    <div className="space-y-3">
      <Group title="Link">
        <Row label="Label"><Input value={block.label} placeholder="Website" className="h-8 text-xs" onChange={(e) => p({ label: e.target.value })} /></Row>
        <Row label="URL"><Input value={block.url} placeholder="https://…" className="h-8 text-xs" onChange={(e) => p({ url: e.target.value })} /></Row>
        <Row label="Color"><ColorInput value={block.color} onChange={(c) => p({ color: c })} /></Row>
        <Row label="Size"><NumInput value={block.fontSize} min={8} max={24} onChange={(v) => p({ fontSize: v })} /></Row>
      </Group>
    </div>
  )
}

function RatingBlockEditor({ block, update }: { block: import('@binh-tran/shared').RatingBlock; update: (p: Partial<CanvasBlock>) => void }) {
  const p = (patch: object) => update(patch as Partial<CanvasBlock>)
  return (
    <div className="space-y-3">
      <Group title="Rating">
        <Row label="Label"><Input value={block.label} className="h-8 text-xs" onChange={(e) => p({ label: e.target.value })} /></Row>
        <Row label="Value">
          <div className="flex items-center gap-2">
            <Slider value={[block.value]} min={0} max={block.maxValue} className="flex-1"
              onValueChange={([v]) => p({ value: v })} />
            <span className="w-8 text-right text-xs">{block.value}</span>
          </div>
        </Row>
        <Row label="Max"><NumInput value={block.maxValue} min={1} max={10} onChange={(v) => p({ maxValue: v })} /></Row>
        <Row label="Style">
          <Select value={block.style} onValueChange={(v) => p({ style: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="stars">Stars</SelectItem>
              <SelectItem value="dots">Dots</SelectItem>
              <SelectItem value="bars">Bars</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Size"><NumInput value={block.size} min={8} max={32} onChange={(v) => p({ size: v })} /></Row>
      </Group>

      <Group title="Colors">
        <Row label="Fill"><ColorInput value={block.color} onChange={(c) => p({ color: c })} /></Row>
        <Row label="Empty"><ColorInput value={block.emptyColor} onChange={(c) => p({ emptyColor: c })} /></Row>
      </Group>

      <Group title="Layout">
        <Row label="Margin↓"><NumInput value={block.marginBottom} min={0} max={80} onChange={(v) => p({ marginBottom: v })} /></Row>
      </Group>
    </div>
  )
}

function TimelineBlockEditor({ block, update }: { block: import('@binh-tran/shared').TimelineBlock; update: (p: Partial<CanvasBlock>) => void }) {
  const p = (patch: object) => update(patch as Partial<CanvasBlock>)
  const [newEntry, setNewEntry] = useState({ year: '', title: '', subtitle: '', description: '' })
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)

  const addEntry = () => {
    if (!newEntry.year.trim() || !newEntry.title.trim()) return
    p({
      entries: [...block.entries, {
        id: crypto.randomUUID(),
        year: newEntry.year.trim(),
        title: newEntry.title.trim(),
        subtitle: newEntry.subtitle.trim() || undefined,
        description: newEntry.description.trim() || undefined,
      }]
    })
    setNewEntry({ year: '', title: '', subtitle: '', description: '' })
  }

  const updateEntry = (entryId: string, field: string, value: string) => {
    p({
      entries: block.entries.map(e =>
        e.id === entryId ? { ...e, [field]: value } : e
      )
    })
  }

  return (
    <div className="space-y-3">
      <Group title="Timeline Entries">
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {block.entries.length === 0 ? (
            <div className="text-[11px] text-muted-foreground text-center py-4">
              No timeline entries yet. Add your first entry below.
            </div>
          ) : (
            block.entries.map((entry, i) => (
              <div key={entry.id} className="rounded border border-border p-2 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    value={entry.year}
                    className="h-7 text-xs w-20"
                    onChange={(e) => updateEntry(entry.id, 'year', e.target.value)}
                  />
                  <button onClick={() => p({ entries: block.entries.filter((_, j) => j !== i) })}
                    className="text-muted-foreground hover:text-destructive shrink-0">
                    <X className="size-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Title</Label>
                  <RichTextEditor
                    content={entry.title}
                    onSave={(html) => updateEntry(entry.id, 'title', html)}
                    isAdmin
                    debounceMs={300}
                    showToolbar={true}
                    compact={true}
                    className="text-xs [&_.ProseMirror]:!text-xs"
                  />
                </div>
                {editingEntryId === entry.id ? (
                  <>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Subtitle</Label>
                      <RichTextEditor
                        content={entry.subtitle || ''}
                        onSave={(html) => updateEntry(entry.id, 'subtitle', html)}
                        isAdmin
                        debounceMs={300}
                        showToolbar={true}
                        compact={true}
                        className="text-xs [&_.ProseMirror]:!text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Description</Label>
                      <RichTextEditor
                        content={entry.description || ''}
                        onSave={(html) => updateEntry(entry.id, 'description', html)}
                        isAdmin
                        debounceMs={300}
                        showToolbar={true}
                        compact={true}
                        className="text-xs [&_.ProseMirror]:!text-xs"
                      />
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 text-xs w-full" onClick={() => setEditingEntryId(null)}>
                      Collapse
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="ghost" className="h-6 text-xs w-full" onClick={() => setEditingEntryId(entry.id)}>
                    Edit Details
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <Input value={newEntry.year} placeholder="Year (e.g., 2024)" className="h-7 text-xs"
            onChange={(e) => setNewEntry({ ...newEntry, year: e.target.value })} />
          <Input value={newEntry.title} placeholder="Title" className="h-7 text-xs"
            onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })} />
          <Button size="sm" className="h-7 text-xs w-full" onClick={addEntry} disabled={!newEntry.year.trim() || !newEntry.title.trim()}>
            Add Entry
          </Button>
        </div>
      </Group>

      <Group title="Style">
        <Row label="Dot color"><ColorInput value={block.dotColor} onChange={(c) => p({ dotColor: c })} /></Row>
        <Row label="Line color"><ColorInput value={block.lineColor} onChange={(c) => p({ lineColor: c })} /></Row>
        <Row label="Dot size"><NumInput value={block.dotSize} min={4} max={20} onChange={(v) => p({ dotSize: v })} /></Row>
        <Row label="Line width"><NumInput value={block.lineWidth} min={1} max={6} onChange={(v) => p({ lineWidth: v })} /></Row>
        <Row label="Spacing"><NumInput value={block.spacing} min={8} max={40} onChange={(v) => p({ spacing: v })} /></Row>
      </Group>

      <Group title="Typography">
        <Row label="Title size"><NumInput value={block.titleSize} min={10} max={24} onChange={(v) => p({ titleSize: v })} /></Row>
        <Row label="Title weight">
          <Select value={block.titleWeight} onValueChange={(v) => p({ titleWeight: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['300','400','500','600','700','800'] as const).map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Subtitle size"><NumInput value={block.subtitleSize} min={8} max={18} onChange={(v) => p({ subtitleSize: v })} /></Row>
        <Row label="Description size"><NumInput value={block.descriptionSize} min={8} max={18} onChange={(v) => p({ descriptionSize: v })} /></Row>
        <Row label="Font family">
          <Select value={block.fontFamily || 'default'} onValueChange={(v) => p({ fontFamily: v === 'default' ? undefined : v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              {FONT_FAMILIES.map(ff => <SelectItem key={ff} value={ff}>{ff}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
      </Group>

      <Group title="Layout">
        <Row label="Margin↓"><NumInput value={block.marginBottom} min={0} max={80} onChange={(v) => p({ marginBottom: v })} /></Row>
      </Group>
    </div>
  )
}

function BadgeBlockEditor({ block, update }: { block: import('@binh-tran/shared').BadgeBlock; update: (p: Partial<CanvasBlock>) => void }) {
  const p = (patch: object) => update(patch as Partial<CanvasBlock>)
  return (
    <div className="space-y-3">
      <Group title="Badge">
        <Row label="Text"><Input value={block.text} className="h-8 text-xs" onChange={(e) => p({ text: e.target.value })} /></Row>
      </Group>

      <Group title="Style">
        <Row label="BG color"><ColorInput value={block.backgroundColor} onChange={(c) => p({ backgroundColor: c })} /></Row>
        <Row label="Text color"><ColorInput value={block.textColor} onChange={(c) => p({ textColor: c })} /></Row>
        <Row label="Radius"><NumInput value={block.borderRadius} min={0} max={50} onChange={(v) => p({ borderRadius: v })} /></Row>
      </Group>

      <Group title="Typography">
        <Row label="Font size"><NumInput value={block.fontSize} min={8} max={24} onChange={(v) => p({ fontSize: v })} /></Row>
        <Row label="Font weight">
          <Select value={block.fontWeight} onValueChange={(v) => p({ fontWeight: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['300','400','500','600','700','800'] as const).map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Font family">
          <Select value={block.fontFamily || 'default'} onValueChange={(v) => p({ fontFamily: v === 'default' ? undefined : v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              {FONT_FAMILIES.map(ff => <SelectItem key={ff} value={ff}>{ff}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
      </Group>

      <Group title="Padding">
        <Row label="Horizontal"><NumInput value={block.padding.x} min={4} max={40} onChange={(v) => p({ padding: { ...block.padding, x: v } })} /></Row>
        <Row label="Vertical"><NumInput value={block.padding.y} min={2} max={20} onChange={(v) => p({ padding: { ...block.padding, y: v } })} /></Row>
        <Row label="Margin↓"><NumInput value={block.marginBottom} min={0} max={80} onChange={(v) => p({ marginBottom: v })} /></Row>
      </Group>
    </div>
  )
}

function StatBlockEditor({ block, update }: { block: import('@binh-tran/shared').StatBlock; update: (p: Partial<CanvasBlock>) => void }) {
  const p = (patch: object) => update(patch as Partial<CanvasBlock>)
  return (
    <div className="space-y-3">
      <Group title="Stat">
        <Row label="Value"><Input value={block.value} className="h-8 text-xs" onChange={(e) => p({ value: e.target.value })} /></Row>
        <Row label="Label"><Input value={block.label} className="h-8 text-xs" onChange={(e) => p({ label: e.target.value })} /></Row>
      </Group>

      <Group title="Typography">
        <Row label="Value size"><NumInput value={block.valueSize} min={16} max={72} onChange={(v) => p({ valueSize: v })} /></Row>
        <Row label="Label size"><NumInput value={block.labelSize} min={8} max={24} onChange={(v) => p({ labelSize: v })} /></Row>
        <Row label="Value weight">
          <Select value={block.valueWeight} onValueChange={(v) => p({ valueWeight: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['300','400','500','600','700','800'] as const).map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Label weight">
          <Select value={block.labelWeight} onValueChange={(v) => p({ labelWeight: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['300','400','500','600','700','800'] as const).map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Font family">
          <Select value={block.fontFamily || 'default'} onValueChange={(v) => p({ fontFamily: v === 'default' ? undefined : v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              {FONT_FAMILIES.map(ff => <SelectItem key={ff} value={ff}>{ff}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Align">
          <Select value={block.align} onValueChange={(v) => p({ align: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['left','center','right'].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
      </Group>

      <Group title="Colors">
        <Row label="Value"><ColorInput value={block.valueColor} onChange={(c) => p({ valueColor: c })} /></Row>
        <Row label="Label"><ColorInput value={block.labelColor} onChange={(c) => p({ labelColor: c })} /></Row>
      </Group>

      <Group title="Layout">
        <Row label="Margin↓"><NumInput value={block.marginBottom} min={0} max={80} onChange={(v) => p({ marginBottom: v })} /></Row>
      </Group>
    </div>
  )
}

function CardBlockEditor({ block, update }: { block: import('@binh-tran/shared').CardBlock; update: (p: Partial<CanvasBlock>) => void }) {
  const p = (patch: object) => update(patch as Partial<CanvasBlock>)
  const [newTag, setNewTag] = useState('')

  const addTag = () => {
    if (!newTag.trim()) return
    p({ tags: [...block.tags, newTag.trim()] })
    setNewTag('')
  }

  return (
    <div className="space-y-3">
      <Group title="Content">
        <div className="space-y-1">
          <Label className="text-[11px] font-medium text-muted-foreground">Title</Label>
          <RichTextEditor
            content={block.title}
            onSave={(html) => p({ title: html })}
            isAdmin
            debounceMs={300}
            showToolbar={true}
            compact={true}
            className="text-xs [&_.ProseMirror]:!text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-medium text-muted-foreground">Subtitle (optional)</Label>
          <RichTextEditor
            content={block.subtitle || ''}
            onSave={(html) => p({ subtitle: html || undefined })}
            isAdmin
            debounceMs={300}
            showToolbar={true}
            compact={true}
            className="text-xs [&_.ProseMirror]:!text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-medium text-muted-foreground">Description</Label>
          <RichTextEditor
            content={block.description}
            onSave={(html) => p({ description: html })}
            isAdmin
            debounceMs={300}
            showToolbar={true}
            compact={true}
            className="text-xs [&_.ProseMirror]:!text-xs"
          />
        </div>
        <Row label="Image URL"><Input value={block.imageUrl ?? ''} placeholder="https://… (optional)" className="h-8 text-xs" onChange={(e) => p({ imageUrl: e.target.value || undefined })} /></Row>
      </Group>

      <Group title="Tags">
        <div className="flex min-h-[32px] flex-wrap gap-1.5 rounded border border-border p-2">
          {block.tags.length === 0 ? (
            <span className="text-[10px] text-muted-foreground">No tags added</span>
          ) : (
            block.tags.map((t, i) => (
              <span key={i} className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs">
                {t}
                <button onClick={() => p({ tags: block.tags.filter((_, j) => j !== i) })}
                  className="text-muted-foreground hover:text-destructive">
                  <X className="size-2.5" />
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex gap-1">
          <Input value={newTag} placeholder="Add tag…" className="h-7 text-xs flex-1"
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
          />
          <Button size="sm" className="h-7 text-xs" onClick={addTag}>Add</Button>
        </div>
      </Group>

      <Group title="Style">
        <Row label="BG color"><ColorInput value={block.backgroundColor} onChange={(c) => p({ backgroundColor: c })} /></Row>
        <Row label="Border color"><ColorInput value={block.borderColor} onChange={(c) => p({ borderColor: c })} /></Row>
        <Row label="Border width"><NumInput value={block.borderWidth} min={0} max={8} onChange={(v) => p({ borderWidth: v })} /></Row>
        <Row label="Border radius"><NumInput value={block.borderRadius} min={0} max={24} onChange={(v) => p({ borderRadius: v })} /></Row>
        <Row label="Padding"><NumInput value={block.padding} min={8} max={40} onChange={(v) => p({ padding: v })} /></Row>
      </Group>

      <Group title="Typography">
        <Row label="Title size"><NumInput value={block.titleSize} min={12} max={32} onChange={(v) => p({ titleSize: v })} /></Row>
        <Row label="Title weight">
          <Select value={block.titleWeight} onValueChange={(v) => p({ titleWeight: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['300','400','500','600','700','800'] as const).map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row label="Subtitle size"><NumInput value={block.subtitleSize} min={10} max={24} onChange={(v) => p({ subtitleSize: v })} /></Row>
        <Row label="Description size"><NumInput value={block.descriptionSize} min={10} max={24} onChange={(v) => p({ descriptionSize: v })} /></Row>
        <Row label="Font family">
          <Select value={block.fontFamily || 'default'} onValueChange={(v) => p({ fontFamily: v === 'default' ? undefined : v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              {FONT_FAMILIES.map(ff => <SelectItem key={ff} value={ff}>{ff}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
      </Group>

      <Group title="Layout">
        <Row label="Margin↓"><NumInput value={block.marginBottom} min={0} max={80} onChange={(v) => p({ marginBottom: v })} /></Row>
      </Group>
    </div>
  )
}

function SocialLinksBlockEditor({ block, update }: { block: import('@binh-tran/shared').SocialLinksBlock; update: (p: Partial<CanvasBlock>) => void }) {
  const p = (patch: object) => update(patch as Partial<CanvasBlock>)
  const [newLink, setNewLink] = useState<{ platform: string; url: string; label: string }>({
    platform: 'email', url: '', label: ''
  })

  const addLink = () => {
    if (!newLink.url.trim()) return
    p({
      links: [...block.links, {
        id: crypto.randomUUID(),
        platform: newLink.platform as 'email' | 'linkedin' | 'github' | 'twitter' | 'website' | 'phone',
        url: newLink.url.trim(),
        label: newLink.label.trim() || undefined,
      }]
    })
    setNewLink({ platform: 'email', url: '', label: '' })
  }

  return (
    <div className="space-y-3">
      <Group title="Social Links">
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {block.links.length === 0 ? (
            <div className="text-[11px] text-muted-foreground text-center py-4">
              No social links yet. Add your first link below.
            </div>
          ) : (
            block.links.map((link, i) => (
              <div key={link.id} className="flex items-center justify-between rounded border border-border p-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate capitalize">{link.platform}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{link.url}</div>
                </div>
                <button onClick={() => p({ links: block.links.filter((_, j) => j !== i) })}
                  className="text-muted-foreground hover:text-destructive ml-2">
                  <X className="size-3" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <Select value={newLink.platform} onValueChange={(v) => setNewLink({ ...newLink, platform: v })}>
            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['email','linkedin','github','twitter','website','phone'].map((p) =>
                <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Input value={newLink.url} placeholder="URL or handle" className="h-7 text-xs"
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} />
          <Input value={newLink.label} placeholder="Label (optional)" className="h-7 text-xs"
            onChange={(e) => setNewLink({ ...newLink, label: e.target.value })} />
          <Button size="sm" className="h-7 text-xs w-full" onClick={addLink} disabled={!newLink.url.trim()}>
            Add Link
          </Button>
        </div>
      </Group>

      <Group title="Layout">
        <Row label="Style">
          <Select value={block.layout} onValueChange={(v) => p({ layout: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">Horizontal</SelectItem>
              <SelectItem value="vertical">Vertical</SelectItem>
              <SelectItem value="grid">Grid</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row label="Icon size"><NumInput value={block.iconSize} min={12} max={48} onChange={(v) => p({ iconSize: v })} /></Row>
        <Row label="Gap"><NumInput value={block.gap} min={4} max={32} onChange={(v) => p({ gap: v })} /></Row>
        <Row label="Show labels"><Switch checked={block.showLabels} onCheckedChange={(v) => p({ showLabels: v })} /></Row>
      </Group>

      <Group title="Color">
        <Row label="Icon color"><ColorInput value={block.color} onChange={(c) => p({ color: c })} /></Row>
      </Group>

      <Group title="Spacing">
        <Row label="Margin↓"><NumInput value={block.marginBottom} min={0} max={80} onChange={(v) => p({ marginBottom: v })} /></Row>
      </Group>
    </div>
  )
}

