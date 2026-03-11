import { useEffect, useMemo, useRef, useState } from 'react'
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
import { GripVertical } from 'lucide-react'
import type { CanvasBlock, CanvasColumn, CanvasDocument, CanvasSection } from '@binh-tran/shared'
import { BlockRenderer } from './BlockRenderer'
import { toRgba } from './canvas-utils'
import { useCanvasStore } from '@/stores/canvas.store'
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
  side?: 'left' | 'right'
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
}

function SortableBlockItem({ block, section, column, doc, index, isPreview, activeBlockId }: SortableBlockItemProps) {
  const { selectedBlockId, selectBlock, editingBlockId } = useCanvasStore()
  const isEditing = editingBlockId === block.id

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: {
      type: 'block',
      sectionId: section.id,
      columnId: column.id,
    } satisfies DragData,
    disabled: isPreview || isEditing,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.2 : 1,
      }}
      className="group relative"
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

      <BlockRenderer
        block={block}
        style={doc.style}
        sectionId={section.id}
        columnId={column.id}
        isFirst={index === 0}
        isLast={index === column.blocks.length - 1}
        isSelected={!isPreview && selectedBlockId === block.id}
        isPreview={isPreview}
        onClick={() => selectBlock(section.id, column.id, block.id)}
      />

      {!isPreview && !!activeBlockId && activeBlockId !== block.id && (
        <>
          <SideDropZone sectionId={section.id} columnId={column.id} targetBlockId={block.id} side="left" />
          <SideDropZone sectionId={section.id} columnId={column.id} targetBlockId={block.id} side="right" />
        </>
      )}
    </div>
  )
}

function SideDropZone({
  sectionId,
  columnId,
  targetBlockId,
  side,
}: {
  sectionId: string
  columnId: string
  targetBlockId: string
  side: 'left' | 'right'
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

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'absolute top-0 bottom-0 w-3 z-30',
        side === 'left' ? '-left-1.5' : '-right-1.5',
        isOver ? 'bg-primary/25 border border-primary rounded-sm' : 'bg-transparent',
      )}
      aria-hidden
    />
  )
}

interface ColumnRendererProps {
  column: CanvasColumn
  section: CanvasSection
  doc: CanvasDocument
  isPreview: boolean
  overColumnId: string | null
  activeBlockId: string | null
}

function ColumnRenderer({ column, section, doc, isPreview, overColumnId, activeBlockId }: ColumnRendererProps) {
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

  const colStyle: React.CSSProperties = {
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
  }

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
      nextA = Math.max(20, Math.min(total - 20, nextA))
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
        {rows.map((row) => {
          if (row.blocks.length === 1) {
            const block = row.blocks[0]
            const idx = blockIndexById.get(block.id) ?? 0
            return (
              <SortableBlockItem
                key={block.id}
                block={block}
                section={section}
                column={column}
                doc={doc}
                index={idx}
                isPreview={false}
                activeBlockId={activeBlockId}
              />
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
                    />

                    {i < row.blocks.length - 1 && (
                      <button
                        type="button"
                        className="absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize z-30 bg-transparent hover:bg-primary/20"
                        title="Drag to resize blocks"
                        onMouseDown={(ev) => startResize(row, i, ev)}
                      />
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
}

function SectionRenderer({ section, doc, isPreview, overColumnId, activeBlockId }: SectionRendererProps) {
  const { selectedSectionId, selectedBlockId } = useCanvasStore()
  const [hovered, setHovered] = useState(false)
  const isSectionActive = !isPreview && (selectedSectionId === section.id || hovered)

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
          className="rounded-br-md bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-primary-foreground"
        >
          {section.label || 'Section'}
        </div>
      )}

      {isSectionActive && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}
          className="outline outline-1 outline-primary/40 outline-offset-[-1px]"
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
    editingBlockId,
    selectBlock,
    duplicateBlock,
    removeBlock,
    moveBlock,
    setEditingBlock,
    reorderBlocks,
    transferBlock,
    updateBlock,
  } = useCanvasStore()

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)

  const activeBlock = useMemo(() => {
    if (!activeBlockId) return null
    return findBlockById(doc, activeBlockId)
  }, [activeBlockId, doc])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveBlockId(String(event.active.id))
  }

  function handleDragOver(event: DragOverEvent) {
    const overData = event.over?.data.current as DragData | undefined
    setOverColumnId(overData?.columnId ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id)
    const overId = event.over?.id ? String(event.over.id) : null

    setActiveBlockId(null)
    setOverColumnId(null)

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

      const insertIdx = overData.side === 'left' ? targetIdx : targetIdx + 1
      transferBlock(fromData.sectionId, fromData.columnId, activeId, toSectionId, toColumnId, insertIdx)

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

  // Keyboard shortcuts
  useEffect(() => {
    if (isPreview) return

    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (editingBlockId || tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.getAttribute('contenteditable') === 'true') return

      if (!selectedBlockId || !selectedSectionId || !selectedColumnId) return

      if (e.key === 'Escape') {
        e.preventDefault()
        selectBlock(null, null, null)
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (e.key === 'Delete') {
          e.preventDefault()
          removeBlock(selectedSectionId, selectedColumnId, selectedBlockId)
          selectBlock(null, null, null)
        }
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault()
        duplicateBlock(selectedSectionId, selectedColumnId, selectedBlockId)
        return
      }
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
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [
    isPreview,
    selectedBlockId,
    selectedSectionId,
    selectedColumnId,
    editingBlockId,
    selectBlock,
    duplicateBlock,
    removeBlock,
    moveBlock,
    setEditingBlock,
  ])

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
    </DndContext>
  )
}
