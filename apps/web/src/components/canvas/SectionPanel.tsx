import { useCanvasStore, makeTextBlock, makeDateBlock, makeTagBlock, makeDividerBlock, makeSpacerBlock, makeProgressBlock, makeImageBlock, makeLinkBlock } from '@/stores/canvas.store'
import type { CanvasBlock, CanvasBlockKind } from '@binh-tran/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff,
  Type, Calendar, Tag, BarChart2, Minus, Image, Link2, Space, GripVertical,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// ── Block kind metadata ────────────────────────────────────────────────────────

const BLOCK_KINDS: { kind: CanvasBlockKind; label: string; icon: React.FC<{ className?: string }> }[] = [
  { kind: 'text', label: 'Text', icon: Type },
  { kind: 'date', label: 'Date Range', icon: Calendar },
  { kind: 'tags', label: 'Tags / Skills', icon: Tag },
  { kind: 'progress', label: 'Skill Bar', icon: BarChart2 },
  { kind: 'divider', label: 'Divider', icon: Minus },
  { kind: 'image', label: 'Image / Avatar', icon: Image },
  { kind: 'link', label: 'Link', icon: Link2 },
  { kind: 'spacer', label: 'Spacer', icon: Space },
]

function makeBlock(kind: CanvasBlockKind): CanvasBlock {
  if (kind === 'text') return makeTextBlock()
  if (kind === 'date') return makeDateBlock()
  if (kind === 'tags') return makeTagBlock()
  if (kind === 'divider') return makeDividerBlock()
  if (kind === 'spacer') return makeSpacerBlock()
  if (kind === 'progress') return makeProgressBlock()
  if (kind === 'image') return makeImageBlock()
  if (kind === 'link') return makeLinkBlock()
  return makeTextBlock()
}

// ── Section panel ─────────────────────────────────────────────────────────────

export function SectionPanel() {
  const {
    doc, addSection, removeSection, moveSection,
    updateSection, toggleSectionHidden, setSectionColumns,
    selectedSectionId, selectSection, selectedBlockId, selectBlock, addBlock,
  } = useCanvasStore()

  if (!doc) return null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sections</span>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => addSection()}>
          <Plus className="size-3" /> Add
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {doc.sections.map((sec, idx) => {
          const isSelected = selectedSectionId === sec.id && !selectedBlockId
          return (
            <div key={sec.id}>
              {/* Section row */}
              <div
                className={cn(
                  'group flex items-center gap-1.5 px-3 py-2 cursor-pointer transition-colors border-b border-border/50',
                  isSelected ? 'bg-primary/10' : 'hover:bg-muted/40',
                  sec.hidden && 'opacity-40',
                )}
                onClick={() => selectSection(isSelected ? null : sec.id)}
              >
                <GripVertical className="size-3 text-muted-foreground/40 shrink-0" />
                <span className="flex-1 text-xs font-medium truncate">{sec.label || 'Untitled'}</span>
                <Badge variant="outline" className="text-[9px] py-0 px-1">{sec.columns.length}col</Badge>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-0.5 rounded hover:bg-muted" onClick={(e) => { e.stopPropagation(); moveSection(sec.id, 'up') }} disabled={idx === 0}>
                    <ChevronUp className="size-3 text-muted-foreground" />
                  </button>
                  <button className="p-0.5 rounded hover:bg-muted" onClick={(e) => { e.stopPropagation(); moveSection(sec.id, 'down') }} disabled={idx === doc.sections.length - 1}>
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </button>
                  <button className="p-0.5 rounded hover:bg-muted" onClick={(e) => { e.stopPropagation(); toggleSectionHidden(sec.id) }}>
                    {sec.hidden ? <EyeOff className="size-3 text-muted-foreground" /> : <Eye className="size-3 text-muted-foreground" />}
                  </button>
                  <button className="p-0.5 rounded hover:bg-muted" onClick={(e) => { e.stopPropagation(); removeSection(sec.id) }}>
                    <Trash2 className="size-3 text-destructive" />
                  </button>
                </div>
              </div>

              {/* Section settings when selected */}
              {isSelected && (
                <div className="bg-muted/20 px-4 py-3 border-b border-border/50 space-y-3">
                  {/* Name */}
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Section Name</Label>
                    <Input value={sec.label} className="h-7 text-xs"
                      onChange={(e) => updateSection(sec.id, { label: e.target.value })} />
                  </div>

                  {/* Columns */}
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Columns</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {([1, 2, 3] as const).map((n) => (
                        <button
                          key={n}
                          className={cn(
                            'py-1 rounded border text-xs font-medium transition-colors',
                            sec.columns.length === n
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-card hover:bg-muted',
                          )}
                          onClick={() => setSectionColumns(sec.id, n)}
                        >
                          {n === 1 ? '│ Full' : n === 2 ? '│ │ Half' : '│││ 3rd'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Padding */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Pad H</Label>
                      <Input type="number" value={sec.paddingX} min={0} max={120} className="h-7 text-xs"
                        onChange={(e) => updateSection(sec.id, { paddingX: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Pad V</Label>
                      <Input type="number" value={sec.paddingY} min={0} max={120} className="h-7 text-xs"
                        onChange={(e) => updateSection(sec.id, { paddingY: Number(e.target.value) })} />
                    </div>
                  </div>

                  {/* Section background */}
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Background</Label>
                    <div className="flex items-center gap-2">
                      <input type="color"
                        value={sec.background?.hex ?? '#ffffff'}
                        className="w-6 h-6 rounded border border-border cursor-pointer p-0"
                        onChange={(e) => updateSection(sec.id, { background: { hex: e.target.value, opacity: sec.background?.opacity ?? 1 } })}
                      />
                      <Input value={sec.background?.hex ?? ''} placeholder="#ffffff" className="h-7 text-xs flex-1 font-mono"
                        onChange={(e) => updateSection(sec.id, { background: { hex: e.target.value, opacity: sec.background?.opacity ?? 1 } })}
                      />
                      {sec.background && (
                        <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => updateSection(sec.id, { background: undefined })}>✕</button>
                      )}
                    </div>
                  </div>

                  {/* Column sections: add blocks per column */}
                  {sec.columns.map((col, colIdx) => (
                    <div key={col.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">
                          {sec.columns.length > 1 ? `Column ${colIdx + 1} blocks` : 'Blocks'}
                          <span className="ml-1 text-[9px] opacity-60">({col.blocks.length})</span>
                        </Label>
                        <AddBlockMenu onAdd={(kind) => { const b = makeBlock(kind); addBlock(sec.id, col.id, b); selectBlock(sec.id, col.id, b.id) }} />
                      </div>
                      <div className="space-y-0.5">
                        {col.blocks.map((block) => (
                          <div
                            key={block.id}
                            className={cn(
                              'flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-xs transition-colors',
                              selectedBlockId === block.id ? 'bg-blue-500/15 text-blue-600' : 'hover:bg-muted/60',
                            )}
                            onClick={() => selectBlock(sec.id, col.id, block.id)}
                          >
                            <BlockKindIcon kind={block.kind} />
                            <span className="flex-1 truncate opacity-80">
                              {blockLabel(block)}
                            </span>
                          </div>
                        ))}
                        {col.blocks.length === 0 && (
                          <div className="text-[10px] text-muted-foreground italic px-2">Empty — add a block above</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {doc.sections.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No sections yet.<br />Click "Add" to create one.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Add Block dropdown ────────────────────────────────────────────────────────

function AddBlockMenu({ onAdd }: { onAdd: (k: CanvasBlockKind) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="h-5 text-[10px] gap-0.5 px-1.5">
          <Plus className="size-3" /> Block
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Add Block</DropdownMenuLabel>
        <DropdownMenuGroup>
          {BLOCK_KINDS.map(({ kind, label, icon: Icon }) => (
            <DropdownMenuItem key={kind} className="text-xs gap-2" onClick={() => onAdd(kind)}>
              <Icon className="size-3.5" /> {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function BlockKindIcon({ kind }: { kind: CanvasBlockKind }) {
  const map: Record<CanvasBlockKind, React.FC<{ className?: string }>> = {
    text: Type, date: Calendar, tags: Tag, progress: BarChart2,
    divider: Minus, image: Image, link: Link2, spacer: Space,
  }
  const Icon = map[kind] ?? Type
  return <Icon className="size-3 text-muted-foreground shrink-0" />
}

function blockLabel(block: CanvasBlock): string {
  if (block.kind === 'text') {
    const stripped = block.content.replace(/<[^>]*>/g, '').slice(0, 32)
    return stripped || '(empty text)'
  }
  if (block.kind === 'date') return block.startDate || 'Date range'
  if (block.kind === 'tags') return block.items.slice(0, 3).join(', ') || 'Tags'
  if (block.kind === 'progress') return block.label || 'Skill bar'
  if (block.kind === 'divider') return '── divider'
  if (block.kind === 'image') return 'Image'
  if (block.kind === 'link') return block.label || block.url || 'Link'
  if (block.kind === 'spacer') return `Spacer (${block.height}px)`
  return (block as { kind: string }).kind
}
