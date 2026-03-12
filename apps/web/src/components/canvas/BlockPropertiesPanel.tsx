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
import { RichTextSection } from '@/components/editor/RichTextSection'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { toRgba } from './canvas-utils'

// ── Small reusable form controls ──────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[82px_minmax(0,1fr)] items-start gap-2 py-0.5 min-w-0">
      <Label className="text-[11px] font-medium text-muted-foreground truncate leading-8">{label}</Label>
      {children}
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-2.5">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</div>
      {children}
    </div>
  )
}

function NumInput({ value, onChange, min = 0, max = 999, step = 1 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number
}) {
  return (
    <Input
      type="number" value={value} min={min} max={max} step={step}
      className="h-8 text-xs"
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}

function toColorInputHex(hex?: string): string {
  const raw = (hex ?? '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`
  }
  return '#000000'
}

function ColorInput({ value, onChange }: { value: CanvasColor; onChange: (c: CanvasColor) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 min-w-0">
      <div className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-2 min-w-0">
        <input
          type="color" value={toColorInputHex(value.hex)} className="w-7 h-7 rounded border border-border cursor-pointer p-0"
          onChange={(e) => onChange({ ...value, hex: e.target.value })}
        />
        <Input value={value.hex} className="h-8 text-xs font-mono w-full min-w-0"
          onChange={(e) => onChange({ ...value, hex: e.target.value })} />
      </div>
      <div className="grid grid-cols-[14px_minmax(0,1fr)_32px] items-center gap-2 min-w-0">
        <span className="text-[10px] text-muted-foreground text-center">α</span>
        <Slider
          value={[value.opacity * 100]}
          min={0}
          max={100}
          step={1}
          className="w-full min-w-0"
          onValueChange={([v]) => onChange({ ...value, opacity: (v ?? 100) / 100 })}
        />
        <span className="text-[10px] text-muted-foreground text-right">{Math.round(value.opacity * 100)}</span>
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

  if (!doc || !selectedSectionId || !selectedColumnId || !selectedBlockId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs p-6 text-center gap-2">
        <span className="text-2xl">☝️</span>
        <p>Click any element in the canvas to edit its properties</p>
      </div>
    )
  }

  const section = doc.sections.find((s) => s.id === selectedSectionId)
  const column = section?.columns.find((c) => c.id === selectedColumnId)
  const block = column?.blocks.find((b) => b.id === selectedBlockId)

  if (!block) return null

  const update = (patch: Partial<CanvasBlock>) =>
    updateBlock(selectedSectionId, selectedColumnId, selectedBlockId, patch)

  const col = column!
  const blockIndex = col.blocks.findIndex((b) => b.id === selectedBlockId)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] uppercase">{block.kind}</Badge>
          <span className="text-xs text-muted-foreground">Properties</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-6" title="Move up" disabled={blockIndex === 0}
            onClick={() => moveBlock(selectedSectionId, selectedColumnId, selectedBlockId, 'up')}>
            <ChevronUp className="size-3" />
          </Button>
          <Button variant="ghost" size="icon" className="size-6" title="Move down" disabled={blockIndex === col.blocks.length - 1}
            onClick={() => moveBlock(selectedSectionId, selectedColumnId, selectedBlockId, 'down')}>
            <ChevronDown className="size-3" />
          </Button>
          <Button variant="ghost" size="icon" className="size-6" title="Duplicate"
            onClick={() => duplicateBlock(selectedSectionId, selectedColumnId, selectedBlockId)}>
            <Copy className="size-3" />
          </Button>
          <Button variant="ghost" size="icon" className="size-6 text-destructive hover:text-destructive" title="Delete"
            onClick={() => { removeBlock(selectedSectionId, selectedColumnId, selectedBlockId); selectBlock(null, null, null) }}>
            <Trash2 className="size-3" />
          </Button>
          <Button variant="ghost" size="icon" className="size-6" onClick={() => selectBlock(null, null, null)}>
            <X className="size-3" />
          </Button>
        </div>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
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

  const leftStyle: React.CSSProperties = {
    fontFamily: block.fontFamily || 'Inter',
    fontSize: block.fontSize,
    fontWeight: block.fontWeight,
    fontStyle: block.fontStyle,
    color: toRgba(block.color),
    lineHeight: block.lineHeight,
    letterSpacing: block.letterSpacing ? `${block.letterSpacing}em` : undefined,
  }

  const rightStyle: React.CSSProperties = {
    fontFamily: block.fontFamily || 'Inter',
    fontSize: block.fontSize,
    fontWeight: block.rightFontWeight,
    color: toRgba(block.rightColor),
    lineHeight: block.lineHeight,
    letterSpacing: block.letterSpacing ? `${block.letterSpacing}em` : undefined,
    textAlign: 'right',
  }

  return (
    <div className="space-y-3">
      <Group title="Content">
        <div className="space-y-2">
          <Label className="text-[11px] text-muted-foreground">Left</Label>
          <div
            className="min-h-[64px] overflow-hidden rounded border border-border bg-background transition-colors focus-within:border-ring/70 [&_.ProseMirror]:!m-0 [&_.ProseMirror]:!p-0 [&_.ProseMirror]:!outline-none"
            style={leftStyle}
          >
            <RichTextSection
              key={`${block.id}-left`}
              content={block.leftContent}
              onSave={(html) => p({ leftContent: html })}
              isAdmin
              debounceMs={220}
              className="!border-0 !rounded-none hover:!border-0 focus:!border-0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] text-muted-foreground">Right</Label>
          <div
            className="min-h-[52px] overflow-hidden rounded border border-border bg-background transition-colors focus-within:border-ring/70 [&_.ProseMirror]:!m-0 [&_.ProseMirror]:!p-0 [&_.ProseMirror]:!outline-none"
            style={rightStyle}
          >
            <RichTextSection
              key={`${block.id}-right`}
              content={block.rightContent}
              onSave={(html) => p({ rightContent: html })}
              isAdmin
              debounceMs={220}
              className="!border-0 !rounded-none hover:!border-0 focus:!border-0"
            />
          </div>
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
  const contentStyle: React.CSSProperties = {
    fontFamily: block.fontFamily || 'Inter',
    fontSize: block.fontSize,
    fontWeight: block.fontWeight,
    fontStyle: block.fontStyle,
    color: toRgba(block.color),
    textAlign: block.align,
    lineHeight: block.lineHeight,
    letterSpacing: block.letterSpacing ? `${block.letterSpacing}em` : undefined,
    textTransform: block.textTransform === 'none' ? undefined : block.textTransform,
  }

  return (
    <div className="space-y-3">
      <Group title="Content">
        <div
          className="min-h-[80px] overflow-hidden rounded border border-border bg-background transition-colors focus-within:border-ring/70 [&_.ProseMirror]:!m-0 [&_.ProseMirror]:!p-0 [&_.ProseMirror]:!outline-none"
          style={contentStyle}
        >
          <RichTextSection
            key={block.id}
            content={block.content}
            onSave={(html) => p({ content: html })}
            isAdmin
            debounceMs={0}
            className="!border-0 !rounded-none hover:!border-0 focus:!border-0"
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

  return (
    <div className="space-y-3">
      <Group title="Timeline Entries">
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {block.entries.map((entry, i) => (
            <div key={entry.id} className="rounded border border-border p-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{entry.year} - {entry.title}</span>
                <button onClick={() => p({ entries: block.entries.filter((_, j) => j !== i) })}
                  className="text-muted-foreground hover:text-destructive">
                  <X className="size-3" />
                </button>
              </div>
              {entry.subtitle && <p className="text-[10px] text-muted-foreground">{entry.subtitle}</p>}
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <Input value={newEntry.year} placeholder="Year" className="h-7 text-xs"
            onChange={(e) => setNewEntry({ ...newEntry, year: e.target.value })} />
          <Input value={newEntry.title} placeholder="Title" className="h-7 text-xs"
            onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })} />
          <Input value={newEntry.subtitle} placeholder="Subtitle (optional)" className="h-7 text-xs"
            onChange={(e) => setNewEntry({ ...newEntry, subtitle: e.target.value })} />
          <Button size="sm" className="h-7 text-xs w-full" onClick={addEntry}>Add Entry</Button>
        </div>
      </Group>

      <Group title="Style">
        <Row label="Dot color"><ColorInput value={block.dotColor} onChange={(c) => p({ dotColor: c })} /></Row>
        <Row label="Line color"><ColorInput value={block.lineColor} onChange={(c) => p({ lineColor: c })} /></Row>
        <Row label="Dot size"><NumInput value={block.dotSize} min={4} max={20} onChange={(v) => p({ dotSize: v })} /></Row>
        <Row label="Line width"><NumInput value={block.lineWidth} min={1} max={6} onChange={(v) => p({ lineWidth: v })} /></Row>
        <Row label="Spacing"><NumInput value={block.spacing} min={8} max={40} onChange={(v) => p({ spacing: v })} /></Row>
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
        <Row label="Font size"><NumInput value={block.fontSize} min={8} max={24} onChange={(v) => p({ fontSize: v })} /></Row>
        <Row label="Font weight">
          <Select value={block.fontWeight} onValueChange={(v) => p({ fontWeight: v })}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(['300','400','500','600','700','800'] as const).map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
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
        <Row label="Title"><Input value={block.title} className="h-8 text-xs" onChange={(e) => p({ title: e.target.value })} /></Row>
        <Row label="Subtitle"><Input value={block.subtitle ?? ''} className="h-8 text-xs" onChange={(e) => p({ subtitle: e.target.value })} /></Row>
        <Row label="Description"><Input value={block.description} className="h-8 text-xs" onChange={(e) => p({ description: e.target.value })} /></Row>
        <Row label="Image URL"><Input value={block.imageUrl ?? ''} placeholder="https://…" className="h-8 text-xs" onChange={(e) => p({ imageUrl: e.target.value })} /></Row>
      </Group>

      <Group title="Tags">
        <div className="flex min-h-[32px] flex-wrap gap-1.5 rounded border border-border p-2">
          {block.tags.map((t, i) => (
            <span key={i} className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs">
              {t}
              <button onClick={() => p({ tags: block.tags.filter((_, j) => j !== i) })}
                className="text-muted-foreground hover:text-destructive">
                <X className="size-2.5" />
              </button>
            </span>
          ))}
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
          {block.links.map((link, i) => (
            <div key={link.id} className="flex items-center justify-between rounded border border-border p-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{link.platform}</div>
                <div className="text-[10px] text-muted-foreground truncate">{link.url}</div>
              </div>
              <button onClick={() => p({ links: block.links.filter((_, j) => j !== i) })}
                className="text-muted-foreground hover:text-destructive ml-2">
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <Select value={newLink.platform} onValueChange={(v) => setNewLink({ ...newLink, platform: v })}>
            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['email','linkedin','github','twitter','website','phone'].map((p) =>
                <SelectItem key={p} value={p}>{p}</SelectItem>
              )}
            </SelectContent>
          </Select>
          <Input value={newLink.url} placeholder="URL or handle" className="h-7 text-xs"
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} />
          <Input value={newLink.label} placeholder="Label (optional)" className="h-7 text-xs"
            onChange={(e) => setNewLink({ ...newLink, label: e.target.value })} />
          <Button size="sm" className="h-7 text-xs w-full" onClick={addLink}>Add Link</Button>
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

