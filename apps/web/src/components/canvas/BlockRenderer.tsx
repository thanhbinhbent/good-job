import { useEffect, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import type { CanvasBlock, CanvasStyle, TextBlock } from '@binh-tran/shared'
import { useCanvasStore } from '@/stores/canvas.store'
import { Copy, Trash2, ChevronUp, ChevronDown, Pencil } from 'lucide-react'

// ── Color helper ──────────────────────────────────────────────────────────────

export function toRgba(c: { hex: string; opacity: number }): string {
  const hex = c.hex.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${c.opacity})`
}

// ── Date formatter ────────────────────────────────────────────────────────────

function formatDate(dateStr: string, fmt: string): string {
  if (!dateStr) return ''
  try {
    const [year, month] = dateStr.split('-')
    if (fmt === 'YYYY') return year ?? dateStr
    if (fmt === 'MM/YYYY') return `${month ?? ''}/${year ?? ''}`
    if (fmt === 'YYYY-MM') return `${year ?? ''}-${month ?? ''}`
    // MMM YYYY
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch { return dateStr }
}

// ── Floating action toolbar ───────────────────────────────────────────────────

interface ToolbarProps {
  blockKind: string
  isFirst: boolean
  isLast: boolean
  canEdit: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
  onEdit: () => void
}

function BlockFloatingToolbar({ blockKind, isFirst, isLast, canEdit, onMoveUp, onMoveDown, onDuplicate, onDelete, onEdit }: ToolbarProps) {
  const btnBase = 'flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-white/15 disabled:opacity-30 disabled:pointer-events-none'
  return (
    <div
      style={{ position: 'absolute', top: -30, right: 0, zIndex: 100 }}
      className="flex items-center gap-0.5 bg-slate-900/95 backdrop-blur-sm text-white rounded-md shadow-xl px-1.5 py-1 select-none"
      onMouseDown={(e) => e.preventDefault()}
    >
      <span className="text-[9px] text-slate-400 px-1 uppercase font-mono tracking-widest">{blockKind}</span>
      <div className="w-px h-3 bg-slate-600 mx-0.5" />
      {canEdit && (
        <button className={btnBase} title="Edit inline (double-click)" onClick={onEdit}>
          <Pencil size={9} />
        </button>
      )}
      <button className={btnBase} title="Move up" disabled={isFirst} onClick={onMoveUp}>
        <ChevronUp size={10} />
      </button>
      <button className={btnBase} title="Move down" disabled={isLast} onClick={onMoveDown}>
        <ChevronDown size={10} />
      </button>
      <button className={btnBase} title="Duplicate (⌘D)" onClick={onDuplicate}>
        <Copy size={9} />
      </button>
      <div className="w-px h-3 bg-slate-600 mx-0.5" />
      <button className={`${btnBase} hover:bg-red-500/30 text-red-400`} title="Delete (⌫)" onClick={onDelete}>
        <Trash2 size={9} />
      </button>
    </div>
  )
}

// ── Inline Tiptap editor for text blocks ──────────────────────────────────────

interface InlineEditorProps {
  block: TextBlock
  style: CanvasStyle
  sectionId: string
  columnId: string
  onClose: () => void
}

function InlineTextEditor({ block, style, sectionId, columnId, onClose }: InlineEditorProps) {
  const { updateBlock } = useCanvasStore()

  const save = useCallback((html: string) => {
    updateBlock(sectionId, columnId, block.id, { content: html })
  }, [updateBlock, sectionId, columnId, block.id])

  const editor = useEditor({
    extensions: [StarterKit],
    content: block.content,
    autofocus: 'end',
    editorProps: {
      attributes: {
        style: [
          `font-size:${block.fontSize}px`,
          `font-family:${block.fontFamily || style.fontFamily}`,
          `font-weight:${block.fontWeight}`,
          `font-style:${block.fontStyle}`,
          `color:${toRgba(block.color)}`,
          `text-align:${block.align}`,
          `line-height:${block.lineHeight}`,
          block.letterSpacing ? `letter-spacing:${block.letterSpacing}em` : '',
          block.textTransform && block.textTransform !== 'none' ? `text-transform:${block.textTransform}` : '',
          'outline:none',
          'min-height:20px',
          'cursor:text',
        ].filter(Boolean).join(';'),
      },
    },
    onBlur: ({ editor }) => {
      save(editor.getHTML())
      onClose()
    },
  })

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (editor) save(editor.getHTML())
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey, { capture: true })
    return () => window.removeEventListener('keydown', handleKey, { capture: true })
  }, [editor, save, onClose])

  return (
    <div
      className="ring-2 ring-blue-400 ring-offset-1 rounded-sm bg-white/5"
      style={{ marginBottom: block.marginBottom }}
    >
      <EditorContent editor={editor} />
    </div>
  )
}

// ── Block renderer ────────────────────────────────────────────────────────────

interface BlockProps {
  block: CanvasBlock
  style: CanvasStyle
  /** sectionId + columnId enable the floating toolbar's store actions */
  sectionId?: string
  columnId?: string
  isFirst?: boolean
  isLast?: boolean
  isSelected?: boolean
  isPreview?: boolean
  onClick?: () => void
}

export function BlockRenderer({
  block, style, sectionId = '', columnId = '',
  isFirst = false, isLast = false,
  isSelected = false, isPreview = false, onClick,
}: BlockProps) {
  const { editingBlockId, setEditingBlock, duplicateBlock, removeBlock, moveBlock, selectBlock } = useCanvasStore()
  const isEditing = !isPreview && editingBlockId === block.id

  const handleDelete = useCallback(() => {
    removeBlock(sectionId, columnId, block.id)
    selectBlock(null, null, null)
  }, [removeBlock, selectBlock, sectionId, columnId, block.id])

  const handleDuplicate = useCallback(() => duplicateBlock(sectionId, columnId, block.id), [duplicateBlock, sectionId, columnId, block.id])
  const handleMoveUp = useCallback(() => moveBlock(sectionId, columnId, block.id, 'up'), [moveBlock, sectionId, columnId, block.id])
  const handleMoveDown = useCallback(() => moveBlock(sectionId, columnId, block.id, 'down'), [moveBlock, sectionId, columnId, block.id])
  const handleEdit = useCallback(() => { if (block.kind === 'text') setEditingBlock(block.id) }, [block.kind, block.id, setEditingBlock])
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (isPreview || block.kind !== 'text') return
    e.stopPropagation()
    setEditingBlock(block.id)
  }, [isPreview, block.kind, block.id, setEditingBlock])

  // ── Inline editing mode for text blocks ──────────────────────────────────
  if (isEditing && block.kind === 'text') {
    return (
      <div style={{ position: 'relative' }}>
        <BlockFloatingToolbar
          blockKind="text" isFirst={isFirst} isLast={isLast} canEdit={false}
          onMoveUp={handleMoveUp} onMoveDown={handleMoveDown}
          onDuplicate={handleDuplicate} onDelete={handleDelete} onEdit={() => {}}
        />
        <InlineTextEditor
          block={block} style={style}
          sectionId={sectionId} columnId={columnId}
          onClose={() => setEditingBlock(null)}
        />
      </div>
    )
  }

  // ── Wrappers ──────────────────────────────────────────────────────────────
  const ringCls = !isPreview
    ? isSelected
      ? 'ring-2 ring-blue-400 ring-offset-1 rounded-sm'
      : 'hover:ring-1 hover:ring-blue-300/50 hover:ring-offset-1 rounded-sm cursor-pointer'
    : ''

  const toolbar = !isPreview && isSelected ? (
    <BlockFloatingToolbar
      blockKind={block.kind} isFirst={isFirst} isLast={isLast}
      canEdit={block.kind === 'text'}
      onMoveUp={handleMoveUp} onMoveDown={handleMoveDown}
      onDuplicate={handleDuplicate} onDelete={handleDelete} onEdit={handleEdit}
    />
  ) : null

  const wrap = (children: React.ReactNode, extraStyle?: React.CSSProperties) => (
    <div
      className={ringCls}
      style={{ position: 'relative', ...extraStyle }}
      onClick={!isPreview ? onClick : undefined}
      onDoubleClick={handleDoubleClick}
    >
      {toolbar}
      {children}
    </div>
  )

  // ── Block type renderers ──────────────────────────────────────────────────

  if (block.kind === 'text') {
    const s: React.CSSProperties = {
      fontSize: block.fontSize,
      fontFamily: block.fontFamily || style.fontFamily,
      fontWeight: block.fontWeight,
      fontStyle: block.fontStyle,
      color: toRgba(block.color),
      textAlign: block.align,
      lineHeight: block.lineHeight,
      letterSpacing: block.letterSpacing ? `${block.letterSpacing}em` : undefined,
      marginBottom: block.marginBottom,
      textTransform: block.textTransform === 'none' ? undefined : block.textTransform,
    }
    return wrap(
      <div
        style={s}
        dangerouslySetInnerHTML={{
          __html: block.content || '<p style="color:#9ca3af;font-style:italic">Double-click to edit…</p>',
        }}
      />
    )
  }

  if (block.kind === 'date') {
    const start = formatDate(block.startDate, block.format)
    const end = block.current ? 'Present' : block.endDate ? formatDate(block.endDate, block.format) : ''
    const label = end ? `${start} – ${end}` : start
    return wrap(
      <div style={{
        fontSize: block.fontSize, color: toRgba(block.color),
        textAlign: block.align, marginBottom: block.marginBottom,
        fontFamily: style.fontFamily,
      }}>{label || 'Jan 2020 – Present'}</div>
    )
  }

  if (block.kind === 'tags') {
    return wrap(
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: block.gap, marginBottom: block.marginBottom }}>
        {(block.items.length > 0 ? block.items : ['Tag 1', 'Tag 2']).map((item, i) => (
          <span key={i} style={{
            background: toRgba(block.chipBackground), color: toRgba(block.chipColor),
            borderRadius: block.chipRadius, fontSize: block.fontSize,
            padding: '2px 8px', fontFamily: style.fontFamily,
          }}>{item}</span>
        ))}
      </div>
    )
  }

  if (block.kind === 'progress') {
    return wrap(
      <div style={{ marginBottom: block.marginBottom }}>
        {block.showLabel && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontFamily: style.fontFamily, fontSize: 12 }}>
            <span>{block.label || 'Skill'}</span>
            {block.showValue && <span>{block.value}%</span>}
          </div>
        )}
        <div style={{ background: toRgba(block.trackColor), borderRadius: 999, height: block.height, overflow: 'hidden' }}>
          <div style={{ width: `${block.value}%`, height: '100%', background: toRgba(block.fillColor), borderRadius: 999 }} />
        </div>
      </div>
    )
  }

  if (block.kind === 'divider') {
    return wrap(
      <hr style={{
        border: 'none',
        borderTop: `${block.thickness}px ${block.style} ${toRgba(block.color)}`,
        marginTop: block.marginTop, marginBottom: block.marginBottom,
      }} />
    )
  }

  if (block.kind === 'image') {
    const margin = block.align === 'center' ? '0 auto' : block.align === 'right' ? '0 0 0 auto' : undefined
    return wrap(
      <div style={{ marginBottom: block.marginBottom }}>
        {block.url ? (
          <img
            src={block.url} width={block.width} height={block.height}
            style={{ borderRadius: `${block.radius}%`, display: 'block', margin, objectFit: 'cover' }}
            alt=""
          />
        ) : (
          <div style={{ width: block.width, height: block.height, borderRadius: `${block.radius}%`, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#9ca3af', margin }}>Avatar</div>
        )}
      </div>
    )
  }

  if (block.kind === 'link') {
    return wrap(
      <a
        href={block.url || '#'}
        target="_blank" rel="noreferrer"
        onClick={(e) => { if (!isPreview) e.preventDefault() }}
        style={{ display: 'block', fontSize: block.fontSize, color: toRgba(block.color), marginBottom: block.marginBottom, fontFamily: style.fontFamily, textDecoration: 'underline' }}
      >{block.label || block.url || 'Click to set URL'}</a>
    )
  }

  if (block.kind === 'spacer') {
    return (
      <div
        className={ringCls}
        style={{ height: block.height, position: 'relative' }}
        onClick={!isPreview ? onClick : undefined}
      >
        {toolbar}
        {!isPreview && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: '50%', borderTop: '1px dashed #94a3b8', opacity: 0.3 }} />
          </div>
        )}
      </div>
    )
  }

  return null
}
