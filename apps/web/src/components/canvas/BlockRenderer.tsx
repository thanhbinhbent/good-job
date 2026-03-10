import { useEffect, useCallback, useReducer, useRef } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import type { CanvasBlock, CanvasStyle, TextBlock } from '@binh-tran/shared'
import { FONT_FAMILIES } from '@binh-tran/shared'
import { useCanvasStore } from '@/stores/canvas.store'
import {
  Copy, Trash2, ChevronUp, ChevronDown,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from 'lucide-react'
import { toRgba, formatDate } from './canvas-utils'

// ── Floating action toolbar (for non-text blocks) ────────────────────────────

interface ToolbarProps {
  blockKind: string
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
}

function BlockFloatingToolbar({ blockKind, isFirst, isLast, onMoveUp, onMoveDown, onDuplicate, onDelete }: ToolbarProps) {
  const b = 'flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none'
  return (
    <div
      style={{ position: 'absolute', top: -26, right: 0, zIndex: 100 }}
      className="flex items-center gap-px bg-slate-900/95 border border-slate-700/60 backdrop-blur text-slate-200 rounded-md shadow-lg px-1 py-0.5 select-none"
      onMouseDown={(e) => e.preventDefault()}
    >
      <span className="text-[8px] text-slate-500 pr-1 font-mono uppercase tracking-widest">{blockKind}</span>
      <div className="w-px h-3 bg-slate-700 mr-0.5" />
      <button className={b} title="Move up" disabled={isFirst} onClick={onMoveUp}><ChevronUp size={9} /></button>
      <button className={b} title="Move down" disabled={isLast} onClick={onMoveDown}><ChevronDown size={9} /></button>
      <button className={b} title="Duplicate" onClick={onDuplicate}><Copy size={9} /></button>
      <div className="w-px h-3 bg-slate-700 mx-0.5" />
      <button className={`${b} hover:bg-red-500/20 text-red-400`} title="Delete" onClick={onDelete}><Trash2 size={9} /></button>
    </div>
  )
}

// ── Rich format bar (for text blocks while editing) ───────────────────────────

interface RichFormatBarProps {
  editor: Editor | null
  block: TextBlock
  update: (patch: Partial<TextBlock>) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
}

const ALIGN_OPTIONS = [
  { value: 'left' as const,    Icon: AlignLeft },
  { value: 'center' as const,  Icon: AlignCenter },
  { value: 'right' as const,   Icon: AlignRight },
  { value: 'justify' as const, Icon: AlignJustify },
]

function RichFormatBar({ editor, block, update, onMoveUp, onMoveDown, onDuplicate, onDelete }: RichFormatBarProps) {
  const prevent = (e: React.MouseEvent) => e.preventDefault()
  const refocus = () => setTimeout(() => editor?.commands.focus(), 10)

  // Base classes for tiny controls — matches app's dark surface
  const ctrl = [
    'h-5 text-[9px] bg-[hsl(var(--color-surface))] text-[hsl(var(--color-text))]',
    'border border-[hsl(var(--color-border))] rounded px-1 cursor-pointer shrink-0',
    'hover:border-[hsl(var(--color-primary-light))] focus:outline-none focus:border-[hsl(var(--color-primary))]',
    'transition-colors',
  ].join(' ')

  const iconBtn = (
    active: boolean,
    onMD: () => void,
    icon: React.ReactNode,
    title: string,
    danger = false,
  ) => (
    <button
      key={title}
      type="button"
      title={title}
      onMouseDown={(e) => { prevent(e); onMD() }}
      className={[
        'flex items-center justify-center w-5 h-5 rounded transition-colors shrink-0',
        active   ? 'bg-[hsl(var(--color-primary)/0.3)] text-[hsl(var(--color-primary-light))]' : '',
        danger   ? 'text-[hsl(var(--color-danger))] hover:bg-[hsl(var(--color-danger)/0.15)]' : '',
        !active && !danger ? 'text-[hsl(var(--color-muted))] hover:bg-white/8 hover:text-[hsl(var(--color-text))]' : '',
      ].join(' ')}
    >
      {icon}
    </button>
  )

  const sep = <div className="w-px h-3.5 bg-[hsl(var(--color-border))] shrink-0 mx-0.5" />

  return (
    <div
      className="flex items-center gap-0.5 border-b border-[hsl(var(--color-border))] px-1.5 py-1 overflow-x-auto overflow-y-hidden select-none rounded-t-sm"
      style={{ background: 'hsl(222 47% 8%)', scrollbarWidth: 'none' } as React.CSSProperties}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* ── Inline marks ────────────────────────────────── */}
      {iconBtn(editor?.isActive('bold') ?? false,      () => editor?.chain().focus().toggleBold().run(),      <strong className="text-[10px] leading-none font-bold">B</strong>,              'Bold')}
      {iconBtn(editor?.isActive('italic') ?? false,    () => editor?.chain().focus().toggleItalic().run(),    <em className="text-[10px] leading-none font-serif italic">I</em>,           'Italic')}
      {iconBtn(editor?.isActive('underline') ?? false, () => editor?.chain().focus().toggleUnderline().run(), <span className="text-[10px] leading-none underline">U</span>,            'Underline')}
      {iconBtn(editor?.isActive('strike') ?? false,    () => editor?.chain().focus().toggleStrike().run(),    <span className="text-[10px] leading-none line-through">S</span>,         'Strike')}
      {sep}

      {/* ── Font family ──────────────────────────────────── */}
      <select
        value={block.fontFamily || FONT_FAMILIES[0]}
        className={`${ctrl} max-w-[84px]`}
        onChange={(e) => { update({ fontFamily: e.target.value }); refocus() }}
      >
        {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>

      {/* ── Font size ────────────────────────────────────── */}
      <input
        type="number" value={block.fontSize} min={6} max={144}
        className={`${ctrl} w-10 text-center`}
        onChange={(e) => { update({ fontSize: Number(e.target.value) }); refocus() }}
      />

      {/* ── Font weight ──────────────────────────────────── */}
      <select
        value={String(block.fontWeight)}
        className={`${ctrl} w-[44px]`}
        onChange={(e) => { update({ fontWeight: e.target.value as TextBlock['fontWeight'] }); refocus() }}
      >
        {['300', '400', '500', '600', '700', '800'].map((w) => <option key={w} value={w}>{w}</option>)}
      </select>
      {sep}

      {/* ── Text color ───────────────────────────────────── */}
      <label className="cursor-pointer shrink-0" title="Text color" onMouseDown={prevent}>
        <input
          type="color" value={block.color.hex}
          className="w-5 h-5 rounded cursor-pointer p-0 border border-[hsl(var(--color-border))]"
          style={{ WebkitAppearance: 'none' } as React.CSSProperties}
          onChange={(e) => { update({ color: { ...block.color, hex: e.target.value } }); refocus() }}
        />
      </label>
      {sep}

      {/* ── Alignment ────────────────────────────────────── */}
      {ALIGN_OPTIONS.map(({ value, Icon }) =>
        iconBtn(block.align === value, () => update({ align: value }), <Icon size={9} />, `Align ${value}`)
      )}
      {sep}

      {/* ── Text transform ───────────────────────────────── */}
      <select
        value={block.textTransform ?? 'none'}
        className={`${ctrl} w-[46px]`}
        onChange={(e) => { update({ textTransform: e.target.value as TextBlock['textTransform'] }); refocus() }}
      >
        <option value="none">Aa</option>
        <option value="uppercase">ABC</option>
        <option value="lowercase">abc</option>
        <option value="capitalize">Ab</option>
      </select>

      <div className="flex-1 min-w-[2px]" />

      {/* ── Block actions ────────────────────────────────── */}
      {iconBtn(false, onMoveUp,    <ChevronUp size={9} />,   'Move up')}
      {iconBtn(false, onMoveDown,  <ChevronDown size={9} />, 'Move down')}
      {iconBtn(false, onDuplicate, <Copy size={9} />,        'Duplicate')}
      {iconBtn(false, onDelete,    <Trash2 size={9} />,      'Delete', true)}
    </div>
  )
}

// ── Inline Tiptap editor for text blocks ──────────────────────────────────────

interface InlineEditorProps {
  block: TextBlock
  style: CanvasStyle
  sectionId: string
  columnId: string
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
  onClose: () => void
}

function InlineTextEditor({ block, style, sectionId, columnId, onMoveUp, onMoveDown, onDuplicate, onDelete, onClose }: InlineEditorProps) {
  const { updateBlock } = useCanvasStore()
  const containerRef = useRef<HTMLDivElement>(null)
  // Prevent double-save by tracking whether we already saved
  const savedRef = useRef(false)

  const update = useCallback((patch: Partial<TextBlock>) => {
    updateBlock(sectionId, columnId, block.id, patch as Partial<CanvasBlock>)
  }, [updateBlock, sectionId, columnId, block.id])

  const save = useCallback((html: string) => {
    if (!savedRef.current) {
      savedRef.current = true
      updateBlock(sectionId, columnId, block.id, { content: html })
    }
  }, [updateBlock, sectionId, columnId, block.id])

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: block.content,
    autofocus: 'end',
    editorProps: {
      attributes: {
        style: 'outline:none;cursor:text;min-height:22px;padding:4px 0;',
      },
    },
  })

  // Force re-render when selection / marks change so RichFormatBar updates active states
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0)
  useEffect(() => {
    if (!editor) return
    const cb = () => forceUpdate()
    editor.on('selectionUpdate', cb)
    editor.on('transaction', cb)
    return () => { editor.off('selectionUpdate', cb); editor.off('transaction', cb) }
  }, [editor])

  // Close when focus leaves the entire editing container (handles blur from selects / inputs too)
  const handleContainerBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    if (containerRef.current?.contains(e.relatedTarget as Node)) return
    if (editor) save(editor.getHTML())
    onClose()
  }, [editor, save, onClose])

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        if (editor) save(editor.getHTML())
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey, { capture: true })
    return () => window.removeEventListener('keydown', handleKey, { capture: true })
  }, [editor, save, onClose])

  // Block-level styles applied to wrapper → editor inherits via CSS cascade
  const wrapStyle: React.CSSProperties = {
    fontSize: block.fontSize,
    fontFamily: block.fontFamily || style.fontFamily,
    fontWeight: block.fontWeight,
    fontStyle: block.fontStyle,
    color: toRgba(block.color),
    textAlign: block.align as React.CSSProperties['textAlign'],
    lineHeight: block.lineHeight,
    letterSpacing: block.letterSpacing ? `${block.letterSpacing}em` : undefined,
    textTransform: block.textTransform === 'none' ? undefined : block.textTransform as React.CSSProperties['textTransform'],
  }

  return (
    /*
     * Overlay pattern: the container is offset upward by the toolbar height (32px)
     * so toolbar sits above the text and editor area aligns exactly with the static text.
     * overflow:visible ensures the toolbar is never clipped by parent rounding.
     */
    <div
      ref={containerRef}
      tabIndex={-1}
      onBlur={handleContainerBlur}
      className="outline-none"
      style={{
        position: 'absolute',
        top: -34,      // ← pulls up by toolbar height
        left: -4,
        right: -4,
        bottom: -2,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
      }}
    >
      {/* Toolbar — fixed height, rendered first in flex column */}
      <div className="shrink-0">
        <RichFormatBar
          editor={editor}
          block={block}
          update={update}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>
      {/* Editor area — takes remaining height, aligns with the static text below */}
      <div
        style={{ ...wrapStyle, flex: 1 }}
        className="px-1.5 py-0.5 rounded-b-sm ring-2 ring-t-0 ring-indigo-500/70 bg-[hsl(var(--color-surface))] min-h-[1.5em] overflow-hidden"
      >
        <EditorContent editor={editor} />
      </div>
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
    setEditingBlock(null)
  }, [removeBlock, selectBlock, setEditingBlock, sectionId, columnId, block.id])

  const handleDuplicate = useCallback(() => duplicateBlock(sectionId, columnId, block.id), [duplicateBlock, sectionId, columnId, block.id])
  const handleMoveUp = useCallback(() => moveBlock(sectionId, columnId, block.id, 'up'), [moveBlock, sectionId, columnId, block.id])
  const handleMoveDown = useCallback(() => moveBlock(sectionId, columnId, block.id, 'down'), [moveBlock, sectionId, columnId, block.id])

  // Text blocks: single click → immediately enter edit mode
  const handleTextClick = useCallback((e: React.MouseEvent) => {
    if (isPreview) return
    e.stopPropagation()
    selectBlock(sectionId, columnId, block.id)
    setEditingBlock(block.id)
  }, [isPreview, sectionId, columnId, block.id, selectBlock, setEditingBlock])

  // ── Wrappers ──────────────────────────────────────────────────────────────
  const ringCls = !isPreview
    ? isSelected
      ? 'ring-1 ring-indigo-400/70 rounded-sm'
      : 'hover:ring-1 hover:ring-indigo-300/25 rounded-sm'
    : ''

  const toolbar = !isPreview && isSelected && block.kind !== 'text' ? (
    <BlockFloatingToolbar
      blockKind={block.kind} isFirst={isFirst} isLast={isLast}
      onMoveUp={handleMoveUp} onMoveDown={handleMoveDown}
      onDuplicate={handleDuplicate} onDelete={handleDelete}
    />
  ) : null

  const wrap = (children: React.ReactNode, extraStyle?: React.CSSProperties) => (
    <div
      className={ringCls}
      style={{ position: 'relative', ...extraStyle }}
      onClick={!isPreview ? onClick : undefined}
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
      textAlign: block.align as React.CSSProperties['textAlign'],
      lineHeight: block.lineHeight,
      letterSpacing: block.letterSpacing ? `${block.letterSpacing}em` : undefined,
      marginBottom: block.marginBottom,
      textTransform: block.textTransform === 'none' ? undefined : block.textTransform as React.CSSProperties['textTransform'],
    }
    return (
      // position:relative anchors the absolutely-positioned overlay editor
      <div
        className={[ringCls, !isPreview && !isEditing ? 'cursor-text' : ''].join(' ')}
        style={{ position: 'relative' }}
        onClick={!isPreview && !isEditing ? handleTextClick : undefined}
      >
        {/* Static content — invisible when editing so it doesn't bleed through the overlay */}
        <div
          style={{ ...s, visibility: isEditing ? 'hidden' : undefined }}
          dangerouslySetInnerHTML={{ __html: block.content || '<p style="color:#9ca3af;font-style:italic;font-size:12px">Click to edit\u2026</p>' }}
        />
        {/* Floating editor — overlays the static text, no layout shift */}
        {isEditing && (
          <InlineTextEditor
            block={block} style={style}
            sectionId={sectionId} columnId={columnId}
            onMoveUp={handleMoveUp} onMoveDown={handleMoveDown}
            onDuplicate={handleDuplicate} onDelete={handleDelete}
            onClose={() => { setEditingBlock(null); selectBlock(null, null, null) }}
          />
        )}
      </div>
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
