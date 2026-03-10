/** Shared canvas utilities — NOT a React component file (Fast Refresh safe) */

export function toRgba(c: { hex: string; opacity: number }): string {
  const hex = c.hex.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${c.opacity})`
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
