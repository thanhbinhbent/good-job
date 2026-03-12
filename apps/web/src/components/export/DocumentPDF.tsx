import { Document as PDFDocument, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer'
import geistFontUrl from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url'
import type {
  CanvasDocument,
  CanvasBlock,
  ResumeContent,
  PortfolioContent,
  CoverLetterContent,
} from '@binh-tran/shared'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1e293b', lineHeight: 1.5 },
  name: { fontSize: 22, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  title: { fontSize: 12, color: '#475569', marginBottom: 4 },
  contact: { fontSize: 9, color: '#64748b', marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', marginTop: 14, marginBottom: 6, paddingBottom: 2 },
  itemHeader: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 1 },
  itemSub: { fontSize: 9, color: '#64748b', marginBottom: 2 },
  body: { fontSize: 9.5, color: '#334155', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  bullet: { marginBottom: 2,  },
})

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ')
}

function sanitizeText(input?: string): string {
  if (!input) return ''
  return input
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/p\s*>/gi, '\n')
    .replace(/<\s*\/h[1-6]\s*>/gi, '\n')
    .replace(/<\s*\/li\s*>/gi, '\n')
    .replace(/<\s*li\b[^>]*>/gi, '• ')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function toHex6(input?: string): string {
  const raw = (input ?? '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`
  return '#000000'
}

function colorToRgba(color?: { hex?: string; opacity?: number }): string {
  const hex = toHex6(color?.hex)
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  const opacity = Math.max(0, Math.min(1, color?.opacity ?? 1))
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function safeBorderWidth(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  return 0
}

const PDF_SANS_FONTS = [
  'Geist',
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Raleway',
  'Montserrat',
] as const

const PDF_SANS_FONT_MAP: Record<string, string> = PDF_SANS_FONTS.reduce((acc, family) => {
  acc[family.toLowerCase()] = family
  return acc
}, {} as Record<string, string>)

let pdfFontsRegistered = false

function ensurePdfFontsRegistered(): void {
  if (pdfFontsRegistered) return
  for (const family of PDF_SANS_FONTS) {
    Font.register({ family, src: geistFontUrl })
  }
  pdfFontsRegistered = true
}

function mapPdfFontFamily(font?: string): string {
  const raw = (font ?? '').trim()
  const f = raw.toLowerCase()
  if (PDF_SANS_FONT_MAP[f]) return PDF_SANS_FONT_MAP[f]
  if (f.includes('times') || f.includes('georgia') || f.includes('garamond') || f.includes('merriweather') || f.includes('playfair')) {
    return 'Times-Roman'
  }
  if (f.includes('mono') || f.includes('code') || f.includes('courier') || f.includes('jetbrains')) {
    return 'Courier'
  }
  return 'Helvetica'
}

type CanvasRow = { id: string; blocks: CanvasDocument['sections'][number]['columns'][number]['blocks'] }

function groupedRows(blocks: CanvasDocument['sections'][number]['columns'][number]['blocks']): CanvasRow[] {
  const rows: CanvasRow[] = []
  for (const block of blocks) {
    const rowId = block.rowId?.trim()
    if (!rowId) {
      rows.push({ id: block.id, blocks: [block] })
      continue
    }
    const prev = rows[rows.length - 1]
    if (prev && prev.id === `row:${rowId}`) {
      prev.blocks.push(block)
    } else {
      rows.push({ id: `row:${rowId}`, blocks: [block] })
    }
  }
  return rows
}

export function CanvasPDF({ content }: { content: CanvasDocument }) {
  ensurePdfFontsRegistered()
  const docFont = mapPdfFontFamily(content.style.fontFamily)

  const renderBlock = (block: CanvasBlock) => {
    if (block.kind === 'text') {
      return (
        <Text
          key={block.id}
          style={{
            fontFamily: mapPdfFontFamily(block.fontFamily || content.style.fontFamily),
            fontSize: block.fontSize,
            fontWeight: block.fontWeight,
            fontStyle: block.fontStyle,
            color: colorToRgba(block.color),
            textAlign: block.align,
            lineHeight: block.lineHeight,
            letterSpacing: block.letterSpacing,
            marginBottom: block.marginBottom,
            textTransform: block.textTransform === 'none' ? undefined : block.textTransform,
          }}
        >
          {sanitizeText(block.content)}
        </Text>
      )
    }

    if (block.kind === 'dualText') {
      return (
        <View key={block.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', columnGap: block.gap, marginBottom: block.marginBottom }}>
          <Text style={{ flexGrow: 1, fontFamily: mapPdfFontFamily(block.fontFamily || content.style.fontFamily), fontSize: block.fontSize, fontWeight: block.fontWeight, fontStyle: block.fontStyle, color: colorToRgba(block.color), lineHeight: block.lineHeight, letterSpacing: block.letterSpacing }}>
            {sanitizeText(block.leftContent)}
          </Text>
          <Text style={{ fontFamily: mapPdfFontFamily(block.fontFamily || content.style.fontFamily), fontSize: block.fontSize, fontWeight: block.rightFontWeight, color: colorToRgba(block.rightColor), lineHeight: block.lineHeight, letterSpacing: block.letterSpacing }}>
            {sanitizeText(block.rightContent)}
          </Text>
        </View>
      )
    }

    if (block.kind === 'date') {
      const end = block.current ? 'Present' : (block.endDate ?? '')
      const label = [block.startDate, end].filter(Boolean).join(' – ')
      return <Text key={block.id} style={{ fontFamily: docFont, fontSize: block.fontSize, color: colorToRgba(block.color), textAlign: block.align, marginBottom: block.marginBottom }}>{label}</Text>
    }

    if (block.kind === 'tags') {
      return (
        <View key={block.id} style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: block.gap, rowGap: block.gap, marginBottom: block.marginBottom }}>
          {block.items.map((item, i) => (
            <Text key={`${block.id}-${i}`} style={{ backgroundColor: colorToRgba(block.chipBackground), color: colorToRgba(block.chipColor), borderRadius: block.chipRadius, fontSize: block.fontSize, paddingHorizontal: 6, paddingVertical: 2 }}>
              {item}
            </Text>
          ))}
        </View>
      )
    }

    if (block.kind === 'progress') {
      return (
        <View key={block.id} style={{ marginBottom: block.marginBottom }}>
          {block.showLabel && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 10 }}>{block.label}</Text>
              {block.showValue && <Text style={{ fontSize: 10 }}>{block.value}%</Text>}
            </View>
          )}
          <View style={{ height: block.height, borderRadius: 999, backgroundColor: colorToRgba(block.trackColor) }}>
            <View style={{ width: `${block.value}%`, height: block.height, borderRadius: 999, backgroundColor: colorToRgba(block.fillColor) }} />
          </View>
        </View>
      )
    }

    if (block.kind === 'divider') {
      const thickness = safeBorderWidth(block.thickness)
      return <View key={block.id} style={{ height: thickness, backgroundColor: colorToRgba(block.color), marginTop: block.marginTop, marginBottom: block.marginBottom }} />
    }

    if (block.kind === 'image') {
      if (block.url) {
        return <Image key={block.id} src={block.url} style={{ width: block.width, height: block.height, borderRadius: `${block.radius}%`, marginBottom: block.marginBottom, alignSelf: block.align === 'center' ? 'center' : (block.align === 'right' ? 'flex-end' : 'flex-start') }} />
      }
      return (
        <View key={block.id} style={{ width: block.width, height: block.height, borderRadius: `${block.radius}%`, marginBottom: block.marginBottom, alignSelf: block.align === 'center' ? 'center' : (block.align === 'right' ? 'flex-end' : 'flex-start'), backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 8, color: '#64748b' }}>Avatar</Text>
        </View>
      )
    }

    if (block.kind === 'link') {
      return <Text key={block.id} style={{ fontSize: block.fontSize, color: colorToRgba(block.color), textDecoration: 'underline', marginBottom: block.marginBottom }}>{sanitizeText(block.label || block.url || '')}</Text>
    }

    if (block.kind === 'spacer') {
      return <View key={block.id} style={{ height: block.height }} />
    }

    return null
  }

  return (
    <PDFDocument>
      <Page
        size="A4"
        style={{
          ...styles.page,
          fontFamily: docFont,
          fontSize: content.style.baseFontSize,
          backgroundColor: colorToRgba(content.style.forceBackground ?? content.style.pageBackground),
          paddingLeft: content.style.pagePaddingX,
          paddingRight: content.style.pagePaddingX,
          paddingTop: content.style.pagePaddingY,
          paddingBottom: content.style.pagePaddingY,
        }}
      >
        {content.sections.filter((s) => !s.hidden).map((section) => (
          (() => {
            const borderWidth = safeBorderWidth(section.border?.width)
            return (
          <View
            key={section.id}
            style={{
              flexDirection: 'row',
              columnGap: section.gap,
              paddingLeft: section.columns.length > 1 ? 0 : section.paddingX,
              paddingRight: section.columns.length > 1 ? 0 : section.paddingX,
              paddingTop: section.paddingY,
              paddingBottom: section.paddingY,
              backgroundColor: section.background ? colorToRgba(section.background) : undefined,
              borderTopWidth: borderWidth,
              borderRightWidth: borderWidth,
              borderBottomWidth: borderWidth,
              borderLeftWidth: borderWidth,
              borderTopStyle: borderWidth > 0 ? (section.border?.style ?? 'solid') : undefined,
              borderRightStyle: borderWidth > 0 ? (section.border?.style ?? 'solid') : undefined,
              borderBottomStyle: borderWidth > 0 ? (section.border?.style ?? 'solid') : undefined,
              borderLeftStyle: borderWidth > 0 ? (section.border?.style ?? 'solid') : undefined,
              borderTopColor: borderWidth > 0 ? colorToRgba(section.border?.color) : undefined,
              borderRightColor: borderWidth > 0 ? colorToRgba(section.border?.color) : undefined,
              borderBottomColor: borderWidth > 0 ? colorToRgba(section.border?.color) : undefined,
              borderLeftColor: borderWidth > 0 ? colorToRgba(section.border?.color) : undefined,
              borderRadius: section.border?.radius,
            }}
          >
            {section.columns.map((col) => (
              <View
                key={col.id}
                style={{
                  flex: col.weight,
                  paddingLeft: col.paddingX,
                  paddingRight: col.paddingX,
                  paddingTop: col.paddingY,
                  paddingBottom: col.paddingY,
                  backgroundColor: col.background ? colorToRgba(col.background) : undefined,
                }}
              >
                {groupedRows(col.blocks).map((row) => {
                  if (row.blocks.length === 1) return <View key={row.id}>{renderBlock(row.blocks[0])}</View>
                  return (
                    <View key={row.id} style={{ flexDirection: 'row', columnGap: 12 }}>
                      {row.blocks.map((block) => (
                        <View key={block.id} style={{ width: `${Math.max(20, block.rowWidth ?? 100)}%` }}>
                          {renderBlock(block)}
                        </View>
                      ))}
                    </View>
                  )
                })}
              </View>
            ))}
          </View>
            )
          })()
        ))}
      </Page>
    </PDFDocument>
  )
}

// ── Resume PDF ────────────────────────────────────────────────────────────────

export function ResumePDF({ content }: { content: ResumeContent }) {
  const p = content.personal
  const contactLine = [p.email, p.phone, p.location, p.website, p.linkedin && `linkedin.com/in/${p.linkedin}`, p.github && `github.com/${p.github}`].filter(Boolean).join('  ·  ')

  return (
    <PDFDocument>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{p.name}</Text>
        {p.title && <Text style={styles.title}>{p.title}</Text>}
        {contactLine && <Text style={styles.contact}>{contactLine}</Text>}

        {content.experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {content.experience.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 8 }}>
                <View style={styles.row}>
                  <Text style={styles.itemHeader}>{exp.role}{exp.company ? ` — ${exp.company}` : ''}</Text>
                  <Text style={styles.itemSub}>{exp.startDate} – {exp.current ? 'Present' : (exp.endDate ?? '')}</Text>
                </View>
                {exp.location && <Text style={styles.itemSub}>{exp.location}</Text>}
                {exp.description && <Text style={styles.body}>{stripHtml(exp.description)}</Text>}
              </View>
            ))}
          </View>
        )}

        {content.education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {content.education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 6 }}>
                <View style={styles.row}>
                  <Text style={styles.itemHeader}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</Text>
                  <Text style={styles.itemSub}>{edu.startDate} – {edu.endDate ?? ''}</Text>
                </View>
                <Text style={styles.itemSub}>{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</Text>
              </View>
            ))}
          </View>
        )}

        {content.skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            {content.skills.map((sg) => (
              <Text key={sg.id} style={styles.bullet}><Text style={{ fontFamily: 'Helvetica-Bold' }}>{sg.category}: </Text>{sg.skills.join(', ')}</Text>
            ))}
          </View>
        )}

        {content.projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {content.projects.map((proj) => (
              <View key={proj.id} style={{ marginBottom: 6 }}>
                <Text style={styles.itemHeader}>{proj.name}{proj.url ? ` · ${proj.url}` : ''}</Text>
                {proj.description && <Text style={styles.body}>{stripHtml(proj.description)}</Text>}
                {proj.tags.length > 0 && <Text style={styles.itemSub}>{proj.tags.join(', ')}</Text>}
              </View>
            ))}
          </View>
        )}

        {content.certifications.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {content.certifications.map((cert) => (
              <Text key={cert.id} style={styles.bullet}>{cert.name} — {cert.issuer}, {cert.date}</Text>
            ))}
          </View>
        )}
      </Page>
    </PDFDocument>
  )
}

// ── Portfolio PDF ─────────────────────────────────────────────────────────────

export function PortfolioPDF({ content }: { content: PortfolioContent }) {
  return (
    <PDFDocument>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{content.hero.headline}</Text>
        <Text style={styles.title}>{content.hero.subheadline}</Text>

        {content.about.bio && (
          <View>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.body}>{stripHtml(content.about.bio)}</Text>
            {content.about.highlights.map((h, i) => <Text key={i} style={styles.bullet}>• {h}</Text>)}
          </View>
        )}

        {content.projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {content.projects.map((proj) => (
              <View key={proj.id} style={{ marginBottom: 6 }}>
                <Text style={styles.itemHeader}>{proj.name}</Text>
                {proj.description && <Text style={styles.body}>{stripHtml(proj.description)}</Text>}
                {proj.tags.length > 0 && <Text style={styles.itemSub}>{proj.tags.join(', ')}</Text>}
              </View>
            ))}
          </View>
        )}

        {content.techStack.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Tech Stack</Text>
            <Text style={styles.body}>{content.techStack.map((t) => `${t.name} (${t.level})`).join('  ·  ')}</Text>
          </View>
        )}

        {content.contact.email && (
          <View>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.body}>{[content.contact.email, content.contact.linkedin, content.contact.github, content.contact.website].filter(Boolean).join('  ·  ')}</Text>
          </View>
        )}
      </Page>
    </PDFDocument>
  )
}

// ── Cover Letter PDF ──────────────────────────────────────────────────────────

export function CoverLetterPDF({ title, content }: { title: string; content: CoverLetterContent }) {
  const h = content.header
  return (
    <PDFDocument>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{h.senderName || title}</Text>
        {h.senderTitle && <Text style={styles.title}>{h.senderTitle}</Text>}
        <Text style={styles.contact}>{[h.senderEmail, h.senderPhone].filter(Boolean).join('  ·  ')}</Text>

        <Text style={{ marginBottom: 12 }}>{h.date}</Text>

        {(h.companyName || h.recipientName) && (
          <View style={{ marginBottom: 12 }}>
            {h.recipientName && <Text>{h.recipientName}{h.recipientTitle ? `, ${h.recipientTitle}` : ''}</Text>}
            {h.companyName && <Text>{h.companyName}</Text>}
            {h.companyAddress && <Text style={styles.itemSub}>{h.companyAddress}</Text>}
          </View>
        )}

        {content.opening && <Text style={{ marginBottom: 10 }}>{stripHtml(content.opening)}</Text>}
        {content.body && <Text style={{ marginBottom: 10, lineHeight: 1.8 }}>{stripHtml(content.body)}</Text>}
        {content.closing && <Text>{stripHtml(content.closing)}</Text>}
      </Page>
    </PDFDocument>
  )
}


