import type { CanvasBlock, CanvasStyle } from '@binh-tran/shared'

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

// ── Block renderer ────────────────────────────────────────────────────────────

interface BlockProps {
  block: CanvasBlock
  style: CanvasStyle
  isSelected?: boolean
  onClick?: () => void
  isPreview?: boolean  // if true — no selection outline
}

export function BlockRenderer({ block, style, isSelected, onClick, isPreview }: BlockProps) {
  const selectCls = !isPreview && isSelected
    ? 'ring-2 ring-blue-400 ring-offset-1 rounded-sm cursor-pointer'
    : !isPreview
    ? 'hover:ring-1 hover:ring-blue-200 hover:ring-offset-1 rounded-sm cursor-pointer'
    : ''

  const wrap = (children: React.ReactNode, extra?: string) => (
    <div className={`${selectCls} ${extra ?? ''}`} onClick={onClick}>
      {children}
    </div>
  )

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
      <div style={s} dangerouslySetInnerHTML={{ __html: block.content || '' }} />
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
            <span>{block.label}</span>
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
        borderTop: `${block.thickness}px ${block.style} ${toRgba(block.color)}`,
        marginTop: block.marginTop, marginBottom: block.marginBottom, border: 'none',
        borderTopWidth: block.thickness, borderTopStyle: block.style, borderTopColor: toRgba(block.color),
      }} />
    )
  }

  if (block.kind === 'image') {
    const align = block.align === 'center' ? 'auto' : block.align === 'right' ? 'auto 0 auto auto' : '0'
    return wrap(
      <div style={{ marginBottom: block.marginBottom }}>
        {block.url ? (
          <img
            src={block.url} width={block.width} height={block.height}
            style={{ borderRadius: `${block.radius}%`, display: 'block', margin: align === '0' ? undefined : 'auto', objectFit: 'cover' }}
            alt=""
          />
        ) : (
          <div style={{ width: block.width, height: block.height, borderRadius: `${block.radius}%`, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#9ca3af' }}>Avatar</div>
        )}
      </div>
    )
  }

  if (block.kind === 'link') {
    return wrap(
      <a href={block.url || '#'} target="_blank" rel="noreferrer" style={{
        display: 'block', fontSize: block.fontSize, color: toRgba(block.color),
        marginBottom: block.marginBottom, fontFamily: style.fontFamily, textDecoration: 'underline',
      }}>{block.label || block.url || 'Link'}</a>
    )
  }

  if (block.kind === 'spacer') {
    return <div style={{ height: block.height }} onClick={onClick} />
  }

  return null
}
