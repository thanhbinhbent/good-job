/** Shared canvas utilities — NOT a React component file (Fast Refresh safe) */

export function toRgba(c?: { hex?: string; opacity?: number } | null): string {
  if (!c || typeof c !== 'object') return 'transparent'

  const inputHex = typeof c.hex === 'string' ? c.hex : '#000000'
  const normalized = inputHex.trim().replace('#', '')
  const expanded = normalized.length === 3
    ? normalized.split('').map((x) => `${x}${x}`).join('')
    : normalized
  const safeHex = expanded.length === 6 ? expanded : '000000'

  const r = parseInt(safeHex.slice(0, 2), 16)
  const g = parseInt(safeHex.slice(2, 4), 16)
  const b = parseInt(safeHex.slice(4, 6), 16)
  const opacity = typeof c.opacity === 'number' && Number.isFinite(c.opacity)
    ? Math.min(1, Math.max(0, c.opacity))
    : 1

  return `rgba(${r},${g},${b},${opacity})`
}

export function formatDate(dateStr: string, fmt: string): string {
  if (!dateStr) return ''
  try {
    const [year, month] = dateStr.split('-')
    if (fmt === 'YYYY') return year ?? dateStr
    if (fmt === 'MM/YYYY') return `${month ?? ''}/${year ?? ''}`
    if (fmt === 'YYYY-MM') return `${year ?? ''}-${month ?? ''}`
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch { return dateStr }
}
