import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCanvasStore, makeTextBlock, makeDateBlock, makeTagBlock, makeDividerBlock, makeSpacerBlock, makeProgressBlock, makeImageBlock, makeLinkBlock, makeDualTextBlock } from '@/stores/canvas.store'
import type { CanvasBlock, CanvasBlockKind, CanvasSection, CanvasColumn } from '@binh-tran/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff,
  Type, Calendar, Tag, BarChart2, Minus, Image, Link2, Space, GripVertical,
  Rows3, Star, Clock, Award, TrendingUp, SquareStack, Share2,
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
  { kind: 'dualText', label: 'Title + Date Row', icon: Rows3 },
  { kind: 'date', label: 'Date Range', icon: Calendar },
  { kind: 'tags', label: 'Tags / Skills', icon: Tag },
  { kind: 'progress', label: 'Skill Bar', icon: BarChart2 },
  { kind: 'divider', label: 'Divider', icon: Minus },
  { kind: 'image', label: 'Image / Avatar', icon: Image },
  { kind: 'link', label: 'Link', icon: Link2 },
  { kind: 'spacer', label: 'Spacer', icon: Space },
]

function toColorInputHex(hex?: string): string {
  const raw = (hex ?? '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`
  }
  return '#ffffff'
}

function makeBlock(kind: CanvasBlockKind): CanvasBlock {
  if (kind === 'text') return makeTextBlock()
  if (kind === 'dualText') return makeDualTextBlock()
  if (kind === 'date') return makeDateBlock()
  if (kind === 'tags') return makeTagBlock()
  if (kind === 'divider') return makeDividerBlock()
  if (kind === 'spacer') return makeSpacerBlock()
  if (kind === 'progress') return makeProgressBlock()
  if (kind === 'image') return makeImageBlock()
  if (kind === 'link') return makeLinkBlock()
  return makeTextBlock()
}

// ── Sortable Block Row ────────────────────────────────────────────────────────

function SortableBlockRow({ block, sec, col }: { block: CanvasBlock; sec: CanvasSection; col: CanvasColumn }) {
  const { selectedBlockId, selectBlock, removeBlock, duplicateBlock } = useCanvasStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-1.5 px-2.5 py-1.5 rounded cursor-pointer text-xs transition-colors',
        selectedBlockId === block.id ? 'bg-primary/15 text-primary' : 'hover:bg-muted/60',
      )}
      onClick={() => selectBlock(sec.id, col.id, block.id)}
    >
      {/* Drag handle */}
      <button
        className="shrink-0 opacity-20 group-hover:opacity-60 hover:opacity-100 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="size-3 text-muted-foreground" />
      </button>
      <BlockKindIcon kind={block.kind} />
      <span className="flex-1 truncate opacity-80">{blockLabel(block)}</span>
      {/* Duplicate / Delete on hover */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-0.5 rounded hover:bg-muted"
          title="Duplicate"
          onClick={(e) => { e.stopPropagation(); duplicateBlock(sec.id, col.id, block.id) }}
        >
          <Plus className="size-3 text-muted-foreground" />
        </button>
        <button
          className="p-0.5 rounded hover:bg-muted"
          title="Delete"
          onClick={(e) => { e.stopPropagation(); removeBlock(sec.id, col.id, block.id); selectBlock(null, null, null) }}
        >
          <Trash2 className="size-3 text-destructive" />
        </button>
      </div>
    </div>
  )
}

// ── Sortable Block List (per column) ─────────────────────────────────────────

function SortableBlockList({ sec, col }: { sec: CanvasSection; col: CanvasColumn }) {
  const { reorderBlocks } = useCanvasStore()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = col.blocks.findIndex((b) => b.id === active.id)
      const newIdx = col.blocks.findIndex((b) => b.id === over.id)
      const newOrder = arrayMove(col.blocks, oldIdx, newIdx).map((b) => b.id)
      reorderBlocks(sec.id, col.id, newOrder)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={col.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {col.blocks.map((block) => (
            <SortableBlockRow key={block.id} block={block} sec={sec} col={col} />
          ))}
          {col.blocks.length === 0 && (
            <div className="text-[11px] text-muted-foreground italic px-6 py-1.5">Empty — add a block</div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}

// ── Sortable Section Row ──────────────────────────────────────────────────────

function SortableSectionRow({ sec, idx, total }: { sec: CanvasSection; idx: number; total: number }) {
  const {
    removeSection, moveSection, updateSection, toggleSectionHidden,
    setSectionColumns, addBlock, selectBlock, selectedSectionId, selectSection,
  } = useCanvasStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sec.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const isExpanded = selectedSectionId === sec.id

  return (
    <div ref={setNodeRef} style={style}>
      {/* Section header row */}
      <div
        className={cn(
          'group flex items-center gap-1.5 px-3 py-2 cursor-pointer transition-colors border-b border-border/50',
          isExpanded ? 'bg-primary/10' : 'hover:bg-muted/40',
          sec.hidden && 'opacity-40',
        )}
        onClick={() => selectSection(isExpanded ? null : sec.id)}
      >
        {/* Drag handle */}
        <button
          className="shrink-0 opacity-0 group-hover:opacity-50 hover:opacity-100! cursor-grab active:cursor-grabbing touch-none -ml-1"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-3.5 text-muted-foreground" />
        </button>
        <span className="flex-1 text-xs font-medium truncate">{sec.label || 'Untitled'}</span>
          <Badge variant="outline" className="text-[10px] py-0 px-1.5">{sec.columns.length}col</Badge>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-0.5 rounded hover:bg-muted" onClick={(e) => { e.stopPropagation(); moveSection(sec.id, 'up') }} disabled={idx === 0}>
            <ChevronUp className="size-3 text-muted-foreground" />
          </button>
          <button className="p-0.5 rounded hover:bg-muted" onClick={(e) => { e.stopPropagation(); moveSection(sec.id, 'down') }} disabled={idx === total - 1}>
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

      {/* Expanded section settings */}
      {isExpanded && (
        <div className="bg-muted/20 px-4 py-3 border-b border-border/50 space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground uppercase tracking-widest">Section Name</Label>
            <Input value={sec.label} className="h-8 text-xs"
              onChange={(e) => updateSection(sec.id, { label: e.target.value })} />
          </div>

          {/* Columns */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground uppercase tracking-widest">Columns</Label>
            <div className="grid grid-cols-3 gap-1">
              {([1, 2, 3] as const).map((n) => (
                <button
                  key={n}
                  className={cn(
                    'h-8 rounded border text-xs font-medium transition-colors',
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
              <Label className="text-[11px] text-muted-foreground uppercase tracking-widest">Pad H</Label>
              <Input type="number" value={sec.paddingX} min={0} max={120} className="h-8 text-xs"
                onChange={(e) => updateSection(sec.id, { paddingX: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground uppercase tracking-widest">Pad V</Label>
              <Input type="number" value={sec.paddingY} min={0} max={120} className="h-8 text-xs"
                onChange={(e) => updateSection(sec.id, { paddingY: Number(e.target.value) })} />
            </div>
          </div>

          {/* Section background */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground uppercase tracking-widest">Background</Label>
            <div className="flex items-center gap-2">
              <input type="color"
                value={toColorInputHex(sec.background?.hex ?? '#ffffff')}
                className="w-7 h-7 rounded border border-border cursor-pointer p-0"
                onChange={(e) => updateSection(sec.id, { background: { hex: e.target.value, opacity: sec.background?.opacity ?? 1 } })}
              />
              <Input value={sec.background?.hex ?? ''} placeholder="#ffffff" className="h-8 text-xs flex-1 font-mono"
                onChange={(e) => updateSection(sec.id, { background: { hex: e.target.value, opacity: sec.background?.opacity ?? 1 } })}
              />
              {sec.background && (
                <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => updateSection(sec.id, { background: undefined })}>✕</button>
              )}
            </div>
          </div>

          {/* Blocks per column — sortable */}
          {sec.columns.map((col, colIdx) => (
            <div key={col.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] text-muted-foreground uppercase tracking-widest">
                  {sec.columns.length > 1 ? `Col ${colIdx + 1} blocks` : 'Blocks'}
                  <span className="ml-1 text-[10px] opacity-60">({col.blocks.length})</span>
                </Label>
                <AddBlockMenu onAdd={(kind) => { const b = makeBlock(kind); addBlock(sec.id, col.id, b); selectBlock(sec.id, col.id, b.id) }} />
              </div>
              <SortableBlockList sec={sec} col={col} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Section panel ─────────────────────────────────────────────────────────────

export function SectionPanel() {
  const { doc, addSection, reorderSections } = useCanvasStore()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  if (!doc) return null

  function handleSectionDragEnd(event: DragEndEvent) {
    if (!doc) return
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = doc.sections.findIndex((s) => s.id === active.id)
      const newIdx = doc.sections.findIndex((s) => s.id === over.id)
      const newOrder = arrayMove(doc.sections, oldIdx, newIdx).map((s) => s.id)
      reorderSections(newOrder)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sections</span>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => addSection()}>
          <Plus className="size-3" /> Add
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={doc.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {doc.sections.map((sec, idx) => (
              <SortableSectionRow key={sec.id} sec={sec} idx={idx} total={doc.sections.length} />
            ))}
          </SortableContext>
        </DndContext>

        {doc.sections.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
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
        <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 px-2">
          <Plus className="size-3" /> Block
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-[11px] uppercase text-muted-foreground">Add Block</DropdownMenuLabel>
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
    text: Type, dualText: Rows3, date: Calendar, tags: Tag, progress: BarChart2,
    divider: Minus, image: Image, link: Link2, spacer: Space,
    rating: Star, timeline: Clock, badge: Award, stat: TrendingUp,
    card: SquareStack, socialLinks: Share2,
  }
  const Icon = map[kind] ?? Type
  return <Icon className="size-3 text-muted-foreground shrink-0" />
}

function blockLabel(block: CanvasBlock): string {
  if (block.kind === 'text') {
    const stripped = (block.content ?? '').replace(/<[^>]*>/g, '').slice(0, 32)
    return stripped || '(empty text)'
  }
  if (block.kind === 'dualText') {
    const left = (block.leftContent ?? '').replace(/<[^>]*>/g, '').trim()
    const right = (block.rightContent ?? '').replace(/<[^>]*>/g, '').trim()
    return [left || 'Title', right || 'Date'].filter(Boolean).join('  |  ')
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
