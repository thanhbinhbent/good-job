import type { CanvasDocument, CanvasSection, CanvasColumn } from '@binh-tran/shared'
import { BlockRenderer, toRgba } from './BlockRenderer'
import { useCanvasStore } from '@/stores/canvas.store'

interface Props {
  doc: CanvasDocument
  isPreview?: boolean  // true = read-only, no selection rings
}

export function CanvasPreview({ doc, isPreview = false }: Props) {
  const { selectedBlockId, selectBlock } = useCanvasStore()

  return (
    <div
      style={{
        width: doc.style.pageWidth,
        background: toRgba(doc.style.pageBackground),
        fontFamily: doc.style.fontFamily,
        fontSize: doc.style.baseFontSize,
        minHeight: 1000,
        boxShadow: isPreview ? 'none' : '0 4px 24px rgba(0,0,0,0.12)',
      }}
    >
      {doc.sections.filter((s) => !s.hidden).map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          doc={doc}
          selectedBlockId={selectedBlockId}
          isPreview={isPreview}
          onSelectBlock={selectBlock}
        />
      ))}
    </div>
  )
}

function SectionRenderer({
  section,
  doc,
  selectedBlockId,
  isPreview,
  onSelectBlock,
}: {
  section: CanvasSection
  doc: CanvasDocument
  selectedBlockId: string | null
  isPreview: boolean
  onSelectBlock: (sId: string | null, cId: string | null, bId: string | null) => void
}) {
  return (
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
          selectedBlockId={selectedBlockId}
          isPreview={isPreview}
          onSelectBlock={onSelectBlock}
        />
      ))}
    </div>
  )
}

function ColumnRenderer({
  column,
  section,
  doc,
  selectedBlockId,
  isPreview,
  onSelectBlock,
}: {
  column: CanvasColumn
  section: CanvasSection
  doc: CanvasDocument
  selectedBlockId: string | null
  isPreview: boolean
  onSelectBlock: (sId: string | null, cId: string | null, bId: string | null) => void
}) {
  return (
    <div
      style={{
        flex: column.weight,
        paddingTop: column.paddingY ?? (section.columns.length > 1 ? section.paddingY : 0),
        paddingBottom: column.paddingY ?? (section.columns.length > 1 ? section.paddingY : 0),
        paddingLeft: column.paddingX ?? (section.columns.length > 1 ? section.paddingX : 0),
        paddingRight: column.paddingX ?? (section.columns.length > 1 ? section.paddingX : 0),
        background: column.background ? toRgba(column.background) : undefined,
        minWidth: 0,
      }}
    >
      {column.blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          style={doc.style}
          isSelected={!isPreview && selectedBlockId === block.id}
          isPreview={isPreview}
          onClick={isPreview ? undefined : () => onSelectBlock(section.id, column.id, block.id)}
        />
      ))}
    </div>
  )
}
