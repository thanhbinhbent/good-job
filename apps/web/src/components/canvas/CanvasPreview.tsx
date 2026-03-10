import { useEffect, useState } from 'react'
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CanvasDocument, CanvasSection, CanvasColumn, CanvasBlock } from '@binh-tran/shared'
import { BlockRenderer } from './BlockRenderer'
import { toRgba } from './canvas-utils'
import { useCanvasStore } from '@/stores/canvas.store'

interface Props {
  doc: CanvasDocument
  isPreview?: boolean
}

export function CanvasPreview({ doc, isPreview = false }: Props) {
  const {
    selectedSectionId, selectedColumnId, selectedBlockId, editingBlockId,
    selectBlock, duplicateBlock, removeBlock, moveBlock, setEditingBlock,
  } = useCanvasStore()

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    if (isPreview) return
    const handleKey = (e: KeyboardEvent) => {
      // Don't intercept when inline editor is open or typing in an input
      const tag = (e.target as HTMLElement)?.tagName
      if (editingBlockId || tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.getAttribute('contenteditable') === 'true') return

      if (!selectedBlockId || !selectedSectionId || !selectedColumnId) return

      if (e.key === 'Escape') {
        e.preventDefault()
        selectBlock(null, null, null)
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only delete with dedicated Delete key (not Backspace to avoid conflicts)
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
  }, [isPreview, selectedBlockId, selectedSectionId, selectedColumnId, editingBlockId, selectBlock, duplicateBlock, removeBlock, moveBlock, setEditingBlock])

  return (
    <div
      style={{
        width: doc.style.pageWidth,
        background: toRgba(doc.style.pageBackground),
        fontFamily: doc.style.fontFamily,
        fontSize: doc.style.baseFontSize,
        minHeight: 1000,
        boxShadow: isPreview ? 'none' : '0 4px 24px rgba(0,0,0,0.18)',
      }}
      // Click on canvas background to deselect
      onClick={() => { if (!isPreview) selectBlock(null, null, null) }}
    >
      {doc.sections.filter((s) => !s.hidden).map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          doc={doc}
          isPreview={isPreview}
        />
      ))}
    </div>
  )
}

function SectionRenderer({
  section, doc, isPreview,
}: {
  section: CanvasSection
  doc: CanvasDocument
  isPreview: boolean
}) {
  const { selectedSectionId, selectedBlockId } = useCanvasStore()
  const [hovered, setHovered] = useState(false)
  const isSectionActive = !isPreview && (selectedSectionId === section.id || hovered)

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => !isPreview && setHovered(true)}
      onMouseLeave={() => !isPreview && setHovered(false)}
      // Stop click propagation so canvas background onClick doesn't fire when clicking a section
      onClick={(e) => e.stopPropagation()}
    >
      {/* Section label tooltip shown on hover in edit mode */}
      {isSectionActive && !selectedBlockId && (
        <div
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, pointerEvents: 'none' }}
          className="px-2 py-0.5 bg-blue-500 text-white text-[9px] uppercase tracking-widest font-semibold rounded-br-md"
        >
          {section.label || 'Section'}
        </div>
      )}
      {/* Section border highlight on hover */}
      {isSectionActive && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}
          className="outline outline-1 outline-blue-400/40 outline-offset-[-1px]"
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
          />
        ))}
      </div>
    </div>
  )
}

// ── Sortable block wrapper (for canvas DnD) ───────────────────────────────────

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
    disabled: isPreview || isEditing,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : 1 }}
      // Spread DnD listeners onto the wrapper so dragging works by holding and moving the block
      {...attributes}
      {...listeners}
    >
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

// ── Column renderer ───────────────────────────────────────────────────────────

function ColumnRenderer({
  column, section, doc, isPreview,
}: {
  column: CanvasColumn
  section: CanvasSection
  doc: CanvasDocument
  isPreview: boolean
}) {
  const { reorderBlocks } = useCanvasStore()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIdx = column.blocks.findIndex((b) => b.id === active.id)
      const newIdx = column.blocks.findIndex((b) => b.id === over.id)
      if (oldIdx !== -1 && newIdx !== -1) {
        const newOrder = arrayMove(column.blocks, oldIdx, newIdx).map((b) => b.id)
        reorderBlocks(section.id, column.id, newOrder)
      }
    }
  }

  const colStyle: React.CSSProperties = {
    flex: column.weight,
    paddingTop: column.paddingY ?? (section.columns.length > 1 ? section.paddingY : 0),
    paddingBottom: column.paddingY ?? (section.columns.length > 1 ? section.paddingY : 0),
    paddingLeft: column.paddingX ?? (section.columns.length > 1 ? section.paddingX : 0),
    paddingRight: column.paddingX ?? (section.columns.length > 1 ? section.paddingX : 0),
    background: column.background ? toRgba(column.background) : undefined,
    minWidth: 0,
  }

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
    <div style={colStyle}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
      </DndContext>
      {column.blocks.length === 0 && (
        <div
          className="min-h-10 rounded border-2 border-dashed border-indigo-300/20 flex items-center justify-center text-[10px] text-indigo-300/40 cursor-default select-none"
          onClick={(e) => e.stopPropagation()}
        >
          Empty column
        </div>
      )}
    </div>
  )
}
