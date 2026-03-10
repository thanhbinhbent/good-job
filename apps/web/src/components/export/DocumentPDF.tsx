import React from 'react'
import { Document as PDFDocument, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type {
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


