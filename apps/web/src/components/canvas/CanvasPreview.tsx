import { useEffect, useMemo, useState } from 'react'
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
  verticalListSortingStrategy,
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
  type: 'block' | 'column-dropzone'
  sectionId: string
  columnId: string
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
}

function SortableBlockItem({ block, section, column, doc, index, isPreview }: SortableBlockItemProps) {
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
}

function ColumnRenderer({ column, section, doc, isPreview, overColumnId, activeBlockId }: ColumnRendererProps) {
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

  if (isPreview) {
    return (
      <div style={colStyle}>
        {column.blocks.map((block, idx) => (
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
        ))}
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
      <SortableContext items={column.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        {column.blocks.map((block, idx) => (
          <SortableBlockItem
            key={block.id}
            block={block}
            section={section}
            column={column}
            doc={doc}
            index={idx}
            isPreview={false}
          />
        ))}
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
        if (!isPreview) selectBlock(null, null, null)
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
