import { useEffect, useMemo, useRef, useState, memo, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus } from 'lucide-react'
import type { CanvasBlock, CanvasColumn, CanvasDocument, CanvasSection } from '@binh-tran/shared'
import { BlockRenderer } from './BlockRenderer'
import { toRgba } from './canvas-utils'
import {
  useCanvasStore,
  makeTextBlock,
  makeDateBlock,
  makeTagBlock,
  makeDividerBlock,
  makeProgressBlock,
  makeImageBlock,
  makeLinkBlock,
  makeDualTextBlock,
  makeSpacerBlock,
  makeRatingBlock,
  makeTimelineBlock,
  makeBadgeBlock,
  makeStatBlock,
  makeCardBlock,
  makeSocialLinksBlock,
} from '@/stores/canvas.store'
import { cn } from '@/lib/utils'

interface Props {
  doc: CanvasDocument
  isPreview?: boolean
}

type DragData = {
  type: 'block' | 'column-dropzone' | 'side-dropzone'
  sectionId: string
  columnId: string
  targetBlockId?: string
  side?: 'left' | 'right' | 'top' | 'bottom'
}

type BlockRow = {
  id: string
  blocks: CanvasBlock[]
}

function blockRowId(block: CanvasBlock): string | null {
  const rowId = 'rowId' in block ? block.rowId : undefined
  if (!rowId) return null
  const normalized = rowId.trim()
  return normalized.length > 0 ? normalized : null
}

function groupBlocksIntoRows(blocks: CanvasBlock[]): BlockRow[] {
  const rows: BlockRow[] = []

  for (const block of blocks) {
    const rowId = blockRowId(block)
    if (!rowId) {
      rows.push({ id: block.id, blocks: [block] })
      continue
    }

    const prev = rows[rows.length - 1]
    if (prev && prev.id === `row:${rowId}`) {
      prev.blocks.push(block)
      continue
    }

    rows.push({ id: `row:${rowId}`, blocks: [block] })
  }

  return rows
}

function findBlockById(doc: CanvasDocument, blockId: string): CanvasBlock | null {
  for (const section of doc.sections) {
    for (const column of section.columns) {
      const block = column.blocks.find((b) => b.id === blockId)
      if (block) return block
    }
  }
  return null
}

function DragGhost({ block }: { block: CanvasBlock }) {
  const label =
    block.kind === 'text' && 'content' in block
      ? (block.content || '').replace(/<[^>]+>/g, '').trim().slice(0, 56) || 'Text'
      : block.kind

  return (
    <div className="max-w-[240px] truncate rounded-md border border-[var(--color-canvas-dropzone-border)] bg-[var(--color-canvas-toolbar)] px-3 py-2 text-[11px] text-[var(--color-canvas-toolbar-foreground)] shadow-2xl opacity-95">
      {label}
    </div>
  )
}

interface SortableBlockItemProps {
  block: CanvasBlock
  section: CanvasSection
  column: CanvasColumn
  doc: CanvasDocument
  index: number
  isPreview: boolean
  activeBlockId: string | null
  overTargetBlockId: string | null
  onContextMenu?: (e: React.MouseEvent, blockId: string, sectionId: string, columnId: string) => void
}

const SortableBlockItemInner = ({ block, section, column, doc, index, isPreview, activeBlockId, overTargetBlockId, onContextMenu }: SortableBlockItemProps) => {
  const { selectedBlockIds, selectBlock, toggleBlockSelection, editingBlockId } = useCanvasStore()
  const isEditing = editingBlockId === block.id
  const isSelected = selectedBlockIds.includes(block.id)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: {
      type: 'block',
      sectionId: section.id,
      columnId: column.id,
    } satisfies DragData,
    disabled: isPreview || isEditing,
  })

  const handleSelectBlock = useCallback((e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) {
      // Cmd/Ctrl+click: toggle selection
      e.stopPropagation()
      toggleBlockSelection(section.id, column.id, block.id)
    } else if (e.shiftKey) {
      // Shift+click: select range (implement later)
      e.stopPropagation()
      // For now, just select this block
      selectBlock(section.id, column.id, block.id)
    } else {
      selectBlock(section.id, column.id, block.id)
    }
  }, [selectBlock, toggleBlockSelection, section.id, column.id, block.id])

  const blockStyle = useMemo<React.CSSProperties>(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
    pointerEvents: isDragging ? 'none' : 'auto',
  }), [transform, transition, isDragging])

  return (
    <div
      ref={setNodeRef}
      style={blockStyle}
      className={cn("group relative", isDragging && "dragging")}
      {...attributes}
    >
      {!isPreview && !isEditing && (
        <div
          {...listeners}
          className="absolute -left-5 inset-y-0 z-20 flex items-center px-0.5 opacity-0 transition-opacity group-hover:opacity-70 hover:!opacity-100 cursor-grab active:cursor-grabbing"
          title="Drag block"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-3.5 text-muted-foreground" />
        </div>
      )}

      {/* Multi-select overlay */}
      {!isPreview && isSelected && selectedBlockIds.length > 1 && (
        <div
          className="absolute inset-0 bg-primary/10 border-2 border-primary/40 rounded-sm pointer-events-none z-10 animate-in fade-in duration-150"
          style={{ mixBlendMode: 'multiply' }}
        />
      )}

      <BlockRenderer
        block={block}
        style={doc.style}
        sectionId={section.id}
        columnId={column.id}
        isFirst={index === 0}
        isLast={index === column.blocks.length - 1}
        isSelected={!isPreview && isSelected}
        isPreview={isPreview}
        onClick={handleSelectBlock}
        onContextMenu={onContextMenu ? (e) => onContextMenu(e, block.id, section.id, column.id) : undefined}
      />

      {!isPreview && !!activeBlockId && activeBlockId !== block.id && overTargetBlockId === block.id && (
        <>
          <EdgeDropZone sectionId={section.id} columnId={column.id} targetBlockId={block.id} side="left" />
          <EdgeDropZone sectionId={section.id} columnId={column.id} targetBlockId={block.id} side="right" />
          <EdgeDropZone sectionId={section.id} columnId={column.id} targetBlockId={block.id} side="top" />
          <EdgeDropZone sectionId={section.id} columnId={column.id} targetBlockId={block.id} side="bottom" />
        </>
      )}
    </div>
  )
}

// Memoize SortableBlockItem to prevent unnecessary re-renders
const SortableBlockItem = memo(SortableBlockItemInner, (prev, next) => {
  // Check if block properties have changed (deep comparison)
  const blockChanged = prev.block !== next.block || JSON.stringify(prev.block) !== JSON.stringify(next.block)

  return (
    !blockChanged &&
    prev.activeBlockId === next.activeBlockId &&
    prev.overTargetBlockId === next.overTargetBlockId &&
    prev.index === next.index &&
    prev.isPreview === next.isPreview
  )
})

function EdgeDropZone({
  sectionId,
  columnId,
  targetBlockId,
  side,
}: {
  sectionId: string
  columnId: string
  targetBlockId: string
  side: 'left' | 'right' | 'top' | 'bottom'
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `side::${side}::${targetBlockId}`,
    data: {
      type: 'side-dropzone',
      sectionId,
      columnId,
      targetBlockId,
      side,
    } satisfies DragData,
  })

  const isVertical = side === 'left' || side === 'right'

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'absolute z-30 flex items-center justify-center pointer-events-auto',
        side === 'left' && '-left-1.5 top-0 bottom-0 w-3',
        side === 'right' && '-right-1.5 top-0 bottom-0 w-3',
        side === 'top' && 'left-0 right-0 -top-1.5 h-3',
        side === 'bottom' && 'left-0 right-0 -bottom-1.5 h-3',
      )}
      aria-hidden
    >
      <div
        className={cn(
          'rounded-full transition-all',
          isVertical ? 'w-px h-[80%]' : 'h-px w-[80%]', // Increased from 65% to 80%
          isOver ? 'bg-primary/80 shadow-lg shadow-primary/20' : 'bg-primary/20',
          isOver && 'animate-pulse', // Add pulsing animation on hover
        )}
      />
      {isOver && (
        <>
          <div className="absolute rounded-full bg-primary text-primary-foreground p-[2px] shadow-lg animate-in zoom-in-50 duration-150">
            <Plus className="size-2.5" />
          </div>
          {/* Preview line showing where block will land */}
          <div
            className={cn(
              'absolute bg-primary/60 animate-in fade-in duration-150',
              isVertical ? 'w-0.5 h-full' : 'h-0.5 w-full',
            )}
          />
        </>
      )}
    </div>
  )
}

interface ColumnRendererProps {
  column: CanvasColumn
  section: CanvasSection
  doc: CanvasDocument
  isPreview: boolean
  overColumnId: string | null
  activeBlockId: string | null
  overTargetBlockId: string | null
  onContextMenu?: (e: React.MouseEvent, blockId: string, sectionId: string, columnId: string) => void
  onShowBlockAdder?: (sectionId: string, columnId: string, afterBlockId: string | null) => void
}

function ColumnRenderer({ column, section, doc, isPreview, overColumnId, activeBlockId, overTargetBlockId, onContextMenu, onShowBlockAdder }: ColumnRendererProps) {
  const { updateBlock } = useCanvasStore()
  const { setNodeRef: dropRef } = useDroppable({
    id: `drop::${column.id}`,
    data: {
      type: 'column-dropzone',
      sectionId: section.id,
      columnId: column.id,
    } satisfies DragData,
    disabled: isPreview,
  })

  const colStyle = useMemo<React.CSSProperties>(() => ({
    flex: column.weight,
    paddingTop: column.paddingY ?? (section.columns.length > 1 ? section.paddingY : 0),
    paddingBottom: column.paddingY ?? (section.columns.length > 1 ? section.paddingY : 0),
    paddingLeft: column.paddingX ?? (section.columns.length > 1 ? section.paddingX : 0),
    paddingRight: column.paddingX ?? (section.columns.length > 1 ? section.paddingX : 0),
    background: column.background ? toRgba(column.background) : undefined,
    minWidth: 0,
    paddingInlineStart: !isPreview && section.columns.length > 1
      ? Math.max(column.paddingX ?? section.paddingX, 16)
      : undefined,
    paddingInlineEnd: !isPreview && section.columns.length > 1
      ? Math.max(column.paddingX ?? section.paddingX, 16)
      : undefined,
  }), [
    column.weight,
    column.paddingY,
    column.paddingX,
    column.background,
    section.columns.length,
    section.paddingY,
    section.paddingX,
    isPreview,
  ])

  const isDropTarget =
    !isPreview &&
    !!activeBlockId &&
    overColumnId === column.id &&
    !column.blocks.some((b) => b.id === activeBlockId)

  const rows = useMemo(() => groupBlocksIntoRows(column.blocks), [column.blocks])
  const blockIndexById = useMemo(() => {
    const map = new Map<string, number>()
    column.blocks.forEach((block, idx) => map.set(block.id, idx))
    return map
  }, [column.blocks])
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const startResize = (row: BlockRow, idx: number, e: React.MouseEvent) => {
    const a = row.blocks[idx]
    const b = row.blocks[idx + 1]
    if (!a || !b) return

    const rowEl = rowRefs.current[row.id]
    if (!rowEl) return
    const widthPx = rowEl.clientWidth
    if (widthPx <= 0) return

    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startA = a.rowWidth ?? 50
    const startB = b.rowWidth ?? 50
    const total = startA + startB

    let rafId: number | null = null
    let pendingA = startA
    let pendingB = startB

    const flush = () => {
      updateBlock(section.id, column.id, a.id, { rowWidth: pendingA } as Partial<CanvasBlock>)
      updateBlock(section.id, column.id, b.id, { rowWidth: pendingB } as Partial<CanvasBlock>)
      rafId = null
    }

    const onMove = (ev: MouseEvent) => {
      const deltaPct = ((ev.clientX - startX) / widthPx) * 100
      let nextA = startA + deltaPct
      // Enforce min 15% / max 85% constraints
      nextA = Math.max(15, Math.min(85, nextA))
      nextA = Math.max(15, Math.min(total - 15, nextA)) // Ensure B also stays >= 15%
      const nextB = total - nextA

      pendingA = nextA
      pendingB = nextB
      if (rafId === null) {
        rafId = window.requestAnimationFrame(flush)
      }
    }

    const onUp = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
        rafId = null
      }
      flush()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  if (isPreview) {
    return (
      <div style={colStyle}>
        {rows.map((row) => {
          if (row.blocks.length === 1) {
            const block = row.blocks[0]
            const idx = blockIndexById.get(block.id) ?? 0
            return (
              <BlockRenderer
                key={block.id}
                block={block}
                style={doc.style}
                sectionId={section.id}
                columnId={column.id}
                isFirst={idx === 0}
                isLast={idx === column.blocks.length - 1}
                isPreview
              />
            )
          }

          return (
            <div key={row.id} className="flex items-stretch gap-3">
              {row.blocks.map((block) => (
                <div key={block.id} style={{ flex: `0 0 ${Math.max(20, block.rowWidth ?? 100)}%`, minWidth: 0 }}>
                  <BlockRenderer
                    block={block}
                    style={doc.style}
                    sectionId={section.id}
                    columnId={column.id}
                    isPreview
                  />
                </div>
              ))}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      ref={dropRef}
      style={colStyle}
      className={cn(
        'relative transition-all duration-150',
        isDropTarget && 'rounded-sm outline outline-2 outline-dashed outline-[var(--color-canvas-dropzone-border)] outline-offset-2 bg-[var(--color-canvas-dropzone)]',
      )}
    >
      <SortableContext items={column.blocks.map((b) => b.id)} strategy={rectSortingStrategy}>
        {/* Add button at the beginning */}
        {!isPreview && onShowBlockAdder && column.blocks.length === 0 && (
          <div className="group/add-first flex items-center justify-center py-4">
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors opacity-0 group-hover/add-first:opacity-100"
              onClick={() => onShowBlockAdder(section.id, column.id, null)}
            >
              <Plus className="size-3" />
              <span>Add block</span>
            </button>
          </div>
        )}

        {rows.map((row) => {
          if (row.blocks.length === 1) {
            const block = row.blocks[0]
            const idx = blockIndexById.get(block.id) ?? 0
            return (
              <div key={block.id} className="relative">
                <SortableBlockItem
                  block={block}
                  section={section}
                  column={column}
                  doc={doc}
                  index={idx}
                  isPreview={false}
                  activeBlockId={activeBlockId}
                  overTargetBlockId={overTargetBlockId}
                  onContextMenu={onContextMenu}
                />
                {/* Add button after each block - positioned absolutely to not affect spacing */}
                {!isPreview && onShowBlockAdder && (
                  <div className="group/add absolute left-0 right-0 -bottom-0 flex items-center justify-center h-0 overflow-visible z-10">
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/90 backdrop-blur-sm rounded-full border border-border/50 transition-all opacity-0 group-hover/add:opacity-100 scale-90 group-hover/add:scale-100 shadow-sm"
                      onClick={() => onShowBlockAdder(section.id, column.id, block.id)}
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                )}
              </div>
            )
          }

          return (
            <div key={row.id} className="flex items-stretch gap-3" ref={(node) => { rowRefs.current[row.id] = node }}>
              {row.blocks.map((block, i) => {
                const idx = blockIndexById.get(block.id) ?? 0
                return (
                  <div key={block.id} className="relative" style={{ flex: `0 0 ${Math.max(20, block.rowWidth ?? 100)}%`, minWidth: 0 }}>
                    <SortableBlockItem
                      block={block}
                      section={section}
                      column={column}
                      doc={doc}
                      index={idx}
                      isPreview={false}
                      activeBlockId={activeBlockId}
                      overTargetBlockId={overTargetBlockId}
                      onContextMenu={onContextMenu}
                    />

                    {i < row.blocks.length - 1 && (
                      <button
                        type="button"
                        className={cn(
                          'absolute -right-1.5 top-0 bottom-0 w-3 cursor-col-resize z-30 group/resize',
                          'bg-transparent hover:bg-primary/10 transition-colors',
                          activeBlockId && 'hidden',
                        )}
                        title="Drag to resize blocks (15% min, 85% max)"
                        onMouseDown={(ev) => startResize(row, i, ev)}
                      >
                        {/* Visual divider line on hover */}
                        <div className="absolute inset-y-0 left-1/2 w-px bg-primary/0 group-hover/resize:bg-primary/40 transition-colors" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </SortableContext>

      {column.blocks.length === 0 && (
        <div
          className={cn(
            'min-h-12 rounded border border-dashed flex items-center justify-center text-[10px] select-none transition-colors',
            isDropTarget
              ? 'border-[var(--color-canvas-dropzone-border)] text-primary bg-[var(--color-canvas-dropzone)]'
              : 'border-border/50 text-muted-foreground',
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {isDropTarget ? 'Drop here' : 'Empty column'}
        </div>
      )}
    </div>
  )
}

interface SectionRendererProps {
  section: CanvasSection
  doc: CanvasDocument
  isPreview: boolean
  overColumnId: string | null
  activeBlockId: string | null
  overTargetBlockId: string | null
  onContextMenu?: (e: React.MouseEvent, blockId: string, sectionId: string, columnId: string) => void
  onShowBlockAdder?: (sectionId: string, columnId: string, afterBlockId: string | null) => void
}

function SectionRenderer({ section, doc, isPreview, overColumnId, activeBlockId, overTargetBlockId, onContextMenu, onShowBlockAdder }: SectionRendererProps) {
  const { selectedSectionId, selectedBlockId } = useCanvasStore()
  const [hovered, setHovered] = useState(false)
  const isSectionActive = !isPreview && (selectedSectionId === section.id || hovered)

  // Check if we're dragging over this section (for cross-section affordance)
  const isDragTarget = useMemo(() => {
    if (!activeBlockId || !overColumnId) return false
    return section.columns.some((col) => col.id === overColumnId)
  }, [activeBlockId, overColumnId, section.columns])

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => !isPreview && setHovered(true)}
      onMouseLeave={() => !isPreview && setHovered(false)}
      onClick={(e) => e.stopPropagation()}
    >
      {isSectionActive && !selectedBlockId && (
        <div
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, pointerEvents: 'none' }}
          className={cn(
            'rounded-br-md px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest transition-all',
            isDragTarget ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-primary text-primary-foreground',
          )}
        >
          {section.label || 'Section'}
        </div>
      )}

      {isSectionActive && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}
          className={cn(
            'outline outline-1 outline-offset-[-1px] transition-all',
            isDragTarget ? 'outline-primary outline-2' : 'outline-primary/40',
          )}
        />
      )}

      {/* Show cross-section drag indicator */}
      {isDragTarget && activeBlockId && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none' }}
          className="bg-primary/5 animate-in fade-in duration-200"
        />
      )}

      <div
        style={{
          paddingTop: section.paddingY,
          paddingBottom: section.paddingY,
          paddingLeft: section.columns.length > 1 ? 0 : section.paddingX,
          paddingRight: section.columns.length > 1 ? 0 : section.paddingX,
          background: section.background ? toRgba(section.background) : undefined,
          display: 'flex',
          gap: section.gap,
          ...(section.border
            ? {
                border: `${section.border.width}px ${section.border.style} ${toRgba(section.border.color)}`,
                borderRadius: section.border.radius,
              }
            : {}),
        }}
      >
        {section.columns.map((column) => (
          <ColumnRenderer
            key={column.id}
            column={column}
            section={section}
            doc={doc}
            isPreview={isPreview}
            overColumnId={overColumnId}
            activeBlockId={activeBlockId}
            overTargetBlockId={overTargetBlockId}
            onContextMenu={onContextMenu}
            onShowBlockAdder={onShowBlockAdder}
          />
        ))}
      </div>
    </div>
  )
}

export function CanvasPreview({ doc, isPreview = false }: Props) {
  const {
    selectedSectionId,
    selectedColumnId,
    selectedBlockId,
    selectedBlockIds,
    editingBlockId,
    selectBlock,
    duplicateBlock,
    bulkDeleteBlocks,
    bulkDuplicateBlocks,
    removeBlock,
    moveBlock,
    setEditingBlock,
    reorderBlocks,
    transferBlock,
    updateBlock,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvasStore()

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)
  const [overTargetBlockId, setOverTargetBlockId] = useState<string | null>(null)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    blockId: string
    sectionId: string
    columnId: string
  } | null>(null)
  const [copiedBlock, setCopiedBlock] = useState<CanvasBlock | null>(null)
  const [blockAdder, setBlockAdder] = useState<{
    sectionId: string
    columnId: string
    afterBlockId: string | null // null means add at beginning
  } | null>(null)

  const activeBlock = useMemo(() => {
    if (!activeBlockId) return null
    return findBlockById(doc, activeBlockId)
  }, [activeBlockId, doc])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveBlockId(String(event.active.id))
    setOverTargetBlockId(null)
  }

  function handleDragOver(event: DragOverEvent) {
    const overData = event.over?.data.current as DragData | undefined
    setOverColumnId(overData?.columnId ?? null)
    if (overData?.type === 'side-dropzone' && overData.targetBlockId) {
      setOverTargetBlockId(overData.targetBlockId)
      return
    }
    if (overData?.type === 'block' && event.over?.id) {
      setOverTargetBlockId(String(event.over.id))
      return
    }
    setOverTargetBlockId(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id)
    const overId = event.over?.id ? String(event.over.id) : null

    setActiveBlockId(null)
    setOverColumnId(null)
    setOverTargetBlockId(null)

    if (!overId || activeId === overId) return

    const fromData = event.active.data.current as DragData | undefined
    const overData = event.over?.data.current as DragData | undefined
    if (!fromData || fromData.type !== 'block') return

    if (overData?.type === 'side-dropzone' && overData.targetBlockId && overData.side) {
      const toSectionId = overData.sectionId
      const toColumnId = overData.columnId
      const targetBlockId = overData.targetBlockId

      const toSection = doc.sections.find((s) => s.id === toSectionId)
      const toColumn = toSection?.columns.find((c) => c.id === toColumnId)
      if (!toColumn) return

      const targetIdx = toColumn.blocks.findIndex((b) => b.id === targetBlockId)
      if (targetIdx === -1) return

      const isLeftOrTop = overData.side === 'left' || overData.side === 'top'
      const insertIdx = isLeftOrTop ? targetIdx : targetIdx + 1
      transferBlock(fromData.sectionId, fromData.columnId, activeId, toSectionId, toColumnId, insertIdx)

      if (overData.side === 'top' || overData.side === 'bottom') {
        window.requestAnimationFrame(() => {
          updateBlock(toSectionId, toColumnId, activeId, { rowId: undefined, rowWidth: 100 } as Partial<CanvasBlock>)
        })
        return
      }

      const targetBlock = toColumn.blocks[targetIdx]
      if (!targetBlock) return
      const groupId = targetBlock.rowId?.trim() || `row-${targetBlock.id}`

      if (!targetBlock.rowId) {
        updateBlock(toSectionId, toColumnId, targetBlock.id, { rowId: groupId, rowWidth: 50 } as Partial<CanvasBlock>)
      }

      window.requestAnimationFrame(() => {
        updateBlock(toSectionId, toColumnId, activeId, { rowId: groupId } as Partial<CanvasBlock>)

        const latest = useCanvasStore.getState().doc
        const latestCol = latest?.sections.find((s) => s.id === toSectionId)?.columns.find((c) => c.id === toColumnId)
        if (!latestCol) return
        const rowBlocks = latestCol.blocks.filter((b) => (b.rowId?.trim() || '') === groupId)
        if (rowBlocks.length <= 1) {
          updateBlock(toSectionId, toColumnId, activeId, { rowWidth: 50 } as Partial<CanvasBlock>)
          return
        }
        const equal = Math.max(20, Math.floor(100 / rowBlocks.length))
        rowBlocks.forEach((b, i) => {
          const width = i === rowBlocks.length - 1 ? Math.max(20, 100 - equal * (rowBlocks.length - 1)) : equal
          if (Math.abs((b.rowWidth ?? 100) - width) > 0.5) {
            updateBlock(toSectionId, toColumnId, b.id, { rowWidth: width } as Partial<CanvasBlock>)
          }
        })
      })

      return
    }

    const fromSectionId = fromData.sectionId
    const fromColumnId = fromData.columnId
    const toSectionId = overData?.sectionId ?? fromSectionId
    const toColumnId = overData?.columnId ?? fromColumnId

    if (fromSectionId === toSectionId && fromColumnId === toColumnId) {
      const section = doc.sections.find((s) => s.id === fromSectionId)
      const column = section?.columns.find((c) => c.id === fromColumnId)
      if (!column) return

      const oldIdx = column.blocks.findIndex((b) => b.id === activeId)
      const newIdx = column.blocks.findIndex((b) => b.id === overId)
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return

      reorderBlocks(fromSectionId, fromColumnId, arrayMove(column.blocks, oldIdx, newIdx).map((b) => b.id))
      return
    }

    const toSection = doc.sections.find((s) => s.id === toSectionId)
    const toColumn = toSection?.columns.find((c) => c.id === toColumnId)
    if (!toColumn) return

    let atIndex = toColumn.blocks.length
    if (overData?.type === 'block') {
      const idx = toColumn.blocks.findIndex((b) => b.id === overId)
      if (idx !== -1) atIndex = idx
    }

    transferBlock(fromSectionId, fromColumnId, activeId, toSectionId, toColumnId, atIndex)
  }

  // Context menu handlers
  const handleContextMenu = useCallback((e: React.MouseEvent, blockId: string, sectionId: string, columnId: string) => {
    if (isPreview) return
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      blockId,
      sectionId,
      columnId,
    })
    // Select the block if not already selected
    if (selectedBlockId !== blockId) {
      selectBlock(sectionId, columnId, blockId)
    }
  }, [isPreview, selectedBlockId, selectBlock])

  const handleCopyBlock = useCallback(() => {
    if (!contextMenu) return
    const block = findBlockById(doc, contextMenu.blockId)
    if (block) {
      setCopiedBlock(block)
      setContextMenu(null)
    }
  }, [contextMenu, doc])

  const handlePasteBlock = useCallback(() => {
    if (!contextMenu || !copiedBlock) return
    const { sectionId, columnId, blockId } = contextMenu

    // Find the index to insert after
    const section = doc.sections.find(s => s.id === sectionId)
    const column = section?.columns.find(c => c.id === columnId)
    const blockIndex = column?.blocks.findIndex(b => b.id === blockId)

    if (blockIndex !== undefined && blockIndex >= 0) {
      // Create a new block with a new ID
      const newBlock = { ...copiedBlock, id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
      // Insert after current block
      const newBlocks = [...(column?.blocks || [])]
      newBlocks.splice(blockIndex + 1, 0, newBlock)
      reorderBlocks(sectionId, columnId, newBlocks.map(b => b.id))
    }
    setContextMenu(null)
  }, [contextMenu, copiedBlock, doc, reorderBlocks])

  const handleAddBlockBefore = useCallback(() => {
    if (!contextMenu) return
    // This would need a block type picker - for now, just close menu
    // TODO: Implement block type picker
    setContextMenu(null)
  }, [contextMenu])

  const handleAddBlockAfter = useCallback(() => {
    if (!contextMenu) return
    // This would need a block type picker - for now, just close menu
    // TODO: Implement block type picker
    setContextMenu(null)
  }, [contextMenu])

  const handleMoveToSection = useCallback((targetSectionId: string) => {
    if (!contextMenu) return
    const { blockId, sectionId, columnId } = contextMenu

    const targetSection = doc.sections.find(s => s.id === targetSectionId)
    if (!targetSection) return

    // Move to first column of target section
    const targetColumnId = targetSection.columns[0]?.id
    if (targetColumnId) {
      transferBlock(sectionId, columnId, blockId, targetSectionId, targetColumnId, 0)
    }
    setContextMenu(null)
  }, [contextMenu, doc, transferBlock])

  const handleAddBlock = useCallback((blockType: string) => {
    if (!blockAdder) return
    const { sectionId, columnId, afterBlockId } = blockAdder

    // Create the new block based on type
    let newBlock: CanvasBlock
    switch (blockType) {
      case 'text': newBlock = makeTextBlock(); break
      case 'dualText': newBlock = makeDualTextBlock(); break
      case 'date': newBlock = makeDateBlock(); break
      case 'tags': newBlock = makeTagBlock(); break
      case 'progress': newBlock = makeProgressBlock(); break
      case 'divider': newBlock = makeDividerBlock(); break
      case 'image': newBlock = makeImageBlock(); break
      case 'link': newBlock = makeLinkBlock(); break
      case 'spacer': newBlock = makeSpacerBlock(); break
      case 'rating': newBlock = makeRatingBlock(); break
      case 'timeline': newBlock = makeTimelineBlock(); break
      case 'badge': newBlock = makeBadgeBlock(); break
      case 'stat': newBlock = makeStatBlock(); break
      case 'card': newBlock = makeCardBlock(); break
      case 'socialLinks': newBlock = makeSocialLinksBlock(); break
      default: newBlock = makeTextBlock()
    }

    // Find the section and column
    const section = doc.sections.find(s => s.id === sectionId)
    const column = section?.columns.find(c => c.id === columnId)
    if (!column) return

    // Find the insertion index
    let insertIndex = 0
    if (afterBlockId) {
      const blockIndex = column.blocks.findIndex(b => b.id === afterBlockId)
      insertIndex = blockIndex >= 0 ? blockIndex + 1 : column.blocks.length
    }

    // Insert the block at the correct position
    const newBlocks = [...column.blocks]
    newBlocks.splice(insertIndex, 0, newBlock)
    reorderBlocks(sectionId, columnId, newBlocks.map(b => b.id))

    // Select the new block
    selectBlock(sectionId, columnId, newBlock.id)
    setBlockAdder(null)
  }, [blockAdder, doc, reorderBlocks, selectBlock])

  // Keyboard shortcuts
  useEffect(() => {
    if (isPreview) return

    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (editingBlockId || tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.getAttribute('contenteditable') === 'true') return

      // Global shortcuts (work without selection)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo()) {
          undo()
        }
        return
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'Z' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        if (canRedo()) {
          redo()
        }
        return
      }

      if (!selectedBlockId || !selectedSectionId || !selectedColumnId) return

      const hasMultiSelection = selectedBlockIds.length > 1

      if (e.key === 'Escape') {
        e.preventDefault()
        selectBlock(null, null, null)
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (e.key === 'Delete') {
          e.preventDefault()
          if (hasMultiSelection) {
            // Bulk delete
            bulkDeleteBlocks(selectedSectionId, selectedColumnId, selectedBlockIds)
          } else {
            removeBlock(selectedSectionId, selectedColumnId, selectedBlockId)
          }
          selectBlock(null, null, null)
        }
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault()
        if (hasMultiSelection) {
          // Bulk duplicate
          bulkDuplicateBlocks(selectedSectionId, selectedColumnId, selectedBlockIds)
        } else {
          duplicateBlock(selectedSectionId, selectedColumnId, selectedBlockId)
        }
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault()
        // Select all blocks in the current column
        const section = doc.sections.find((s) => s.id === selectedSectionId)
        const column = section?.columns.find((c) => c.id === selectedColumnId)
        if (column) {
          const allBlockIds = column.blocks.map(b => b.id)
          // Use the UI store directly for this special case
          useCanvasStore.setState({
            selectedBlockIds: allBlockIds,
            selectedBlockId: null,
            selectedSectionId,
            selectedColumnId,
          })
        }
        return
      }
      // Only allow single-block operations if no multi-select
      if (hasMultiSelection) return

      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        setEditingBlock(selectedBlockId)
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowUp') {
        e.preventDefault()
        moveBlock(selectedSectionId, selectedColumnId, selectedBlockId, 'up')
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowDown') {
        e.preventDefault()
        moveBlock(selectedSectionId, selectedColumnId, selectedBlockId, 'down')
        return
      }
      // Keyboard resize for blocks in rows: Cmd/Ctrl + [ decreases width by 5%, Cmd/Ctrl + ] increases by 5%
      if ((e.metaKey || e.ctrlKey) && (e.key === '[' || e.key === ']')) {
        e.preventDefault()
        const section = doc.sections.find((s) => s.id === selectedSectionId)
        const column = section?.columns.find((c) => c.id === selectedColumnId)
        const block = column?.blocks.find((b) => b.id === selectedBlockId)

        if (block && 'rowId' in block && block.rowId) {
          const currentWidth = block.rowWidth ?? 50
          const delta = e.key === '[' ? -5 : 5
          const newWidth = Math.max(15, Math.min(85, currentWidth + delta))
          updateBlock(selectedSectionId, selectedColumnId, selectedBlockId, { rowWidth: newWidth } as Partial<CanvasBlock>)
        }
        return
      }
      // Show keyboard shortcuts modal: Cmd/Ctrl + /
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShowShortcutsModal(true)
        return
      }
      // Arrow key navigation: navigate to next/previous block (without modifiers)
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !hasMultiSelection) {
        e.preventDefault()
        const section = doc.sections.find((s) => s.id === selectedSectionId)
        const column = section?.columns.find((c) => c.id === selectedColumnId)
        if (!column) return

        const currentIndex = column.blocks.findIndex((b) => b.id === selectedBlockId)
        if (currentIndex === -1) return

        const newIndex = e.key === 'ArrowUp'
          ? Math.max(0, currentIndex - 1) // ArrowUp: previous
          : Math.min(column.blocks.length - 1, currentIndex + 1) // ArrowDown: next

        const nextBlock = column.blocks[newIndex]
        if (nextBlock && nextBlock.id !== selectedBlockId) {
          selectBlock(selectedSectionId, selectedColumnId, nextBlock.id)
        }
        return
      }
      // Tab navigation: navigate to next/previous block
      if (e.key === 'Tab' && !hasMultiSelection) {
        e.preventDefault()
        const section = doc.sections.find((s) => s.id === selectedSectionId)
        const column = section?.columns.find((c) => c.id === selectedColumnId)
        if (!column) return

        const currentIndex = column.blocks.findIndex((b) => b.id === selectedBlockId)
        if (currentIndex === -1) return

        const newIndex = e.shiftKey
          ? (currentIndex - 1 + column.blocks.length) % column.blocks.length // Shift+Tab: previous
          : (currentIndex + 1) % column.blocks.length // Tab: next

        const nextBlock = column.blocks[newIndex]
        if (nextBlock) {
          selectBlock(selectedSectionId, selectedColumnId, nextBlock.id)
        }
        return
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [
    isPreview,
    selectedBlockId,
    selectedBlockIds,
    selectedSectionId,
    selectedColumnId,
    editingBlockId,
    selectBlock,
    duplicateBlock,
    bulkDuplicateBlocks,
    removeBlock,
    bulkDeleteBlocks,
    moveBlock,
    setEditingBlock,
    updateBlock,
    doc.sections,
    undo,
    redo,
    canUndo,
    canRedo,
  ])

  // Close context menu on click outside or escape
  useEffect(() => {
    if (!contextMenu) return

    const handleClickOutside = () => setContextMenu(null)
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null)
    }

    window.addEventListener('click', handleClickOutside)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('click', handleClickOutside)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [contextMenu])

  const canvas = (
    <div
      style={{
        width: doc.style.pageWidth,
        background: toRgba(doc.style.forceBackground ?? doc.style.pageBackground),
        fontFamily: doc.style.fontFamily,
        fontSize: doc.style.baseFontSize,
        paddingLeft: doc.style.pagePaddingX,
        paddingRight: doc.style.pagePaddingX,
        paddingTop: doc.style.pagePaddingY,
        paddingBottom: doc.style.pagePaddingY,
        minHeight: 1000,
        boxShadow: 'none',
      }}
      onClick={() => {
        if (isPreview) return
        const activeEl = document.activeElement as HTMLElement | null
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
          return
        }
        selectBlock(null, null, null)
      }}
    >
      {doc.sections.filter((s) => !s.hidden).map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          doc={doc}
          isPreview={isPreview}
          overColumnId={overColumnId}
          activeBlockId={activeBlockId}
          overTargetBlockId={overTargetBlockId}
          onContextMenu={handleContextMenu}
          onShowBlockAdder={(sectionId, columnId, afterBlockId) => setBlockAdder({ sectionId, columnId, afterBlockId })}
        />
      ))}
    </div>
  )

  if (isPreview) return canvas

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {canvas}
      <DragOverlay>{activeBlock ? <DragGhost block={activeBlock} /> : null}</DragOverlay>

      {/* Keyboard shortcuts modal */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
            <div className="space-y-3 text-sm">
              <ShortcutRow keys="Cmd/Ctrl + Z" description="Undo" />
              <ShortcutRow keys="Cmd/Ctrl + Shift + Z" description="Redo" />
              <ShortcutRow keys="Cmd/Ctrl + A" description="Select all blocks in column" />
              <ShortcutRow keys="Cmd/Ctrl + D" description="Duplicate selected block(s)" />
              <ShortcutRow keys="Cmd/Ctrl + E" description="Edit selected block" />
              <ShortcutRow keys="Cmd/Ctrl + ↑/↓" description="Move block up/down" />
              <ShortcutRow keys="Cmd/Ctrl + [/]" description="Adjust row block width (±5%)" />
              <ShortcutRow keys="Cmd/Ctrl + /" description="Show/hide keyboard shortcuts" />
              <ShortcutRow keys="Tab" description="Navigate to next block" />
              <ShortcutRow keys="Shift + Tab" description="Navigate to previous block" />
              <ShortcutRow keys="Delete" description="Delete selected block(s)" />
              <ShortcutRow keys="Escape" description="Deselect all" />
            </div>
            <button
              className="mt-6 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              onClick={() => setShowShortcutsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-[100] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[200px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextMenuItem
            label="Copy"
            onClick={handleCopyBlock}
            shortcut="Cmd+C"
          />
          <ContextMenuItem
            label="Paste"
            onClick={handlePasteBlock}
            disabled={!copiedBlock}
            shortcut="Cmd+V"
          />
          <ContextMenuItem
            label="Duplicate"
            onClick={() => {
              if (contextMenu) {
                duplicateBlock(contextMenu.sectionId, contextMenu.columnId, contextMenu.blockId)
                setContextMenu(null)
              }
            }}
            shortcut="Cmd+D"
          />
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
          <ContextMenuItem
            label="Add block before"
            onClick={handleAddBlockBefore}
          />
          <ContextMenuItem
            label="Add block after"
            onClick={handleAddBlockAfter}
          />
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
          <div className="relative group">
            <ContextMenuItem
              label="Move to section"
              onClick={() => {}}
              hasSubmenu
            />
            <div className="hidden group-hover:block absolute left-full top-0 ml-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[180px]">
              {doc.sections.map((section) => (
                <ContextMenuItem
                  key={section.id}
                  label={section.label || 'Untitled Section'}
                  onClick={() => handleMoveToSection(section.id)}
                  disabled={contextMenu?.sectionId === section.id}
                />
              ))}
            </div>
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
          <ContextMenuItem
            label="Delete"
            onClick={() => {
              if (contextMenu) {
                removeBlock(contextMenu.sectionId, contextMenu.columnId, contextMenu.blockId)
                setContextMenu(null)
              }
            }}
            shortcut="Del"
            destructive
          />
        </div>
      )}

      {/* Block type picker */}
      {blockAdder && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          onClick={() => setBlockAdder(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-sm w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Add Block</h3>
            <div className="grid grid-cols-2 gap-2">
              <BlockTypeButton label="Text" onClick={() => handleAddBlock('text')} />
              <BlockTypeButton label="Two Columns" onClick={() => handleAddBlock('dualText')} />
              <BlockTypeButton label="Date" onClick={() => handleAddBlock('date')} />
              <BlockTypeButton label="Tags" onClick={() => handleAddBlock('tags')} />
              <BlockTypeButton label="Progress Bar" onClick={() => handleAddBlock('progress')} />
              <BlockTypeButton label="Divider" onClick={() => handleAddBlock('divider')} />
              <BlockTypeButton label="Image" onClick={() => handleAddBlock('image')} />
              <BlockTypeButton label="Link" onClick={() => handleAddBlock('link')} />
              <BlockTypeButton label="Spacer" onClick={() => handleAddBlock('spacer')} />
              <BlockTypeButton label="Rating" onClick={() => handleAddBlock('rating')} />
              <BlockTypeButton label="Timeline" onClick={() => handleAddBlock('timeline')} />
              <BlockTypeButton label="Badge" onClick={() => handleAddBlock('badge')} />
              <BlockTypeButton label="Stat" onClick={() => handleAddBlock('stat')} />
              <BlockTypeButton label="Card" onClick={() => handleAddBlock('card')} />
              <BlockTypeButton label="Social Links" onClick={() => handleAddBlock('socialLinks')} />
            </div>
            <button
              className="mt-4 w-full px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              onClick={() => setBlockAdder(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </DndContext>
  )
}

function BlockTypeButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="px-3 py-2 text-sm text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors text-gray-700 dark:text-gray-300"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function ContextMenuItem({
  label,
  onClick,
  shortcut,
  disabled,
  destructive,
  hasSubmenu,
}: {
  label: string
  onClick: () => void
  shortcut?: string
  disabled?: boolean
  destructive?: boolean
  hasSubmenu?: boolean
}) {
  return (
    <button
      className={cn(
        'w-full px-3 py-1.5 text-sm text-left flex items-center justify-between transition-colors',
        disabled
          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          : destructive
          ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <span>{label}</span>
      {shortcut && (
        <kbd className="text-xs text-gray-500 dark:text-gray-500 font-mono">{shortcut}</kbd>
      )}
      {hasSubmenu && <span className="ml-2">›</span>}
    </button>
  )
}

function ShortcutRow({ keys, description }: { keys: string; description: string }) {
  return (
    <div className="flex justify-between items-center">
      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-700 dark:text-gray-300">
        {keys}
      </kbd>
      <span className="text-gray-600 dark:text-gray-400">{description}</span>
    </div>
  )
}
