import { ulid } from 'ulid'
import type {
  CanvasDocument,
  CanvasSection,
  CanvasColumn,
  CanvasBlock,
  CanvasStyle,
  ResumeContent,
  PortfolioContent,
  CoverLetterContent,
} from '@binh-tran/shared'

export function defaultStructuredContent(type: 'resume' | 'portfolio' | 'cover_letter'): unknown {
  if (type === 'resume') {
    return {
      personal: {
        name: 'Alex Nguyen',
        title: 'Senior Product Engineer',
        email: 'alex.nguyen@example.com',
        phone: '+84 912 345 678',
        location: 'Ho Chi Minh City, Vietnam',
        website: 'alexnguyen.dev',
        linkedin: 'linkedin.com/in/alex-nguyen',
        github: 'github.com/alexnguyen',
        summary: 'Product-minded software engineer with 8+ years building scalable web platforms, design systems, and high-performing teams.',
      },
      experience: [
        {
          id: id(),
          company: 'Nimbus Labs',
          role: 'Senior Frontend Engineer',
          startDate: '2022-03',
          endDate: '',
          current: true,
          location: 'Remote',
          description: 'Led migration to modern React architecture, improved page performance by 38%, and shipped reusable editor framework used across 4 products.',
        },
        {
          id: id(),
          company: 'CloudBridge',
          role: 'Software Engineer',
          startDate: '2019-01',
          endDate: '2022-02',
          current: false,
          location: 'Singapore',
          description: 'Built customer-facing dashboards and document automation workflows serving 50K+ monthly users.',
        },
      ],
      education: [
        {
          id: id(),
          institution: 'University of Engineering & Technology',
          degree: 'B.Eng.',
          field: 'Computer Science',
          startDate: '2013-09',
          endDate: '2017-06',
          description: 'Focus on software architecture and human-computer interaction.',
        },
      ],
      skills: [
        { id: id(), category: 'Frontend', skills: ['React', 'TypeScript', 'TanStack Query', 'Tailwind CSS'] },
        { id: id(), category: 'Backend', skills: ['Node.js', 'NestJS', 'PostgreSQL', 'SQLite'] },
      ],
      certifications: [
        { id: id(), name: 'AWS Certified Developer Associate', issuer: 'Amazon Web Services', date: '2024-07', url: '' },
      ],
      projects: [
        {
          id: id(),
          name: 'Resume Forge',
          description: 'Template-driven resume builder with PDF export and collaborative editing.',
          url: 'https://resumeforge.dev',
          repo: 'https://github.com/alexnguyen/resume-forge',
          tags: ['React', 'NestJS', 'Editor'],
        },
      ],
    }
  }

  if (type === 'portfolio') {
    return {
      hero: {
        headline: 'Designing & Shipping Thoughtful Digital Products',
        subheadline: 'I’m Alex — a product engineer focused on delightful UX and reliable systems.',
        ctaLabel: 'See projects',
        ctaUrl: '#projects',
        avatarUrl: '',
      },
      about: {
        bio: 'I partner with startups and product teams to turn complex requirements into elegant, scalable experiences.',
        highlights: ['8+ years experience', 'Built products used by 100K+ users', 'Strong UX + engineering balance'],
      },
      projects: [
        {
          id: id(),
          name: 'DocFlow Studio',
          description: 'Low-code document automation platform with visual workflows and custom templates.',
          url: 'https://docflow.studio',
          repo: '',
          tags: ['React', 'TypeScript', 'Automation'],
        },
        {
          id: id(),
          name: 'Insight Board',
          description: 'Analytics dashboard with custom report builder and role-based access control.',
          url: '',
          repo: 'https://github.com/alexnguyen/insight-board',
          tags: ['Data Viz', 'NestJS', 'PostgreSQL'],
        },
      ],
      techStack: [
        { id: id(), name: 'React', level: 'expert', category: 'Frontend' },
        { id: id(), name: 'TypeScript', level: 'expert', category: 'Language' },
        { id: id(), name: 'Node.js', level: 'advanced', category: 'Backend' },
        { id: id(), name: 'Figma', level: 'advanced', category: 'Design' },
      ],
      timeline: [
        { id: id(), year: '2025', title: 'Led platform redesign', description: 'Improved activation conversion by 24%.', type: 'work' },
        { id: id(), year: '2023', title: 'Launched template engine', description: 'Enabled 10x faster customization for enterprise clients.', type: 'achievement' },
      ],
      contact: {
        email: 'alex.nguyen@example.com',
        linkedin: 'linkedin.com/in/alex-nguyen',
        github: 'github.com/alexnguyen',
        twitter: 'x.com/alexnguyen',
        website: 'alexnguyen.dev',
      },
    }
  }

  const today = new Date().toISOString().split('T')[0]
  return {
    header: {
      senderName: 'Alex Nguyen',
      senderTitle: 'Senior Product Engineer',
      senderEmail: 'alex.nguyen@example.com',
      senderPhone: '+84 912 345 678',
      date: today,
      recipientName: 'Hiring Manager',
      recipientTitle: 'Engineering Director',
      companyName: 'Acme Tech',
      companyAddress: 'District 1, Ho Chi Minh City',
    },
    opening: 'Dear Hiring Manager, I’m excited to apply for the Senior Frontend Engineer role at Acme Tech.',
    body: 'Over the past 8 years, I have delivered design-forward, high-performance web products. I focus on maintainable architecture, collaboration, and measurable business impact.',
    closing: 'Thank you for your time and consideration. I would welcome the opportunity to discuss how I can contribute to your team.\n\nSincerely,\nAlex Nguyen',
    jobTitle: 'Senior Frontend Engineer',
  }
}

// ─── Low-level helpers ────────────────────────────────────────────────────────

function id() { return ulid().toLowerCase() }

function text(content: string, overrides?: Partial<import('@binh-tran/shared').TextBlock>): CanvasBlock {
  return {
    kind: 'text', id: id(), content,
    fontSize: 14, fontFamily: 'Inter', fontWeight: '400', fontStyle: 'normal',
    color: { hex: '#111111', opacity: 1 }, align: 'left',
    lineHeight: 1.5, letterSpacing: 0, marginBottom: 4, textTransform: 'none', rowWidth: 100,
    ...overrides,
  }
}

function heading(content: string, overrides?: Partial<import('@binh-tran/shared').TextBlock>): CanvasBlock {
  return text(content, {
    fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 0.08, color: { hex: '#1e3a5f', opacity: 1 },
    marginBottom: 8, ...overrides,
  })
}

function divider(): CanvasBlock {
  return {
    kind: 'divider', id: id(),
    color: { hex: '#d1d5db', opacity: 1 }, thickness: 1, style: 'solid',
    marginTop: 2, marginBottom: 10, rowWidth: 100,
  }
}

function spacer(h = 12): CanvasBlock {
  return { kind: 'spacer', id: id(), height: h, rowWidth: 100 }
}

function date(startDate: string, endDate?: string, current = false): CanvasBlock {
  return {
    kind: 'date', id: id(), startDate, endDate, current,
    format: 'MMM YYYY', fontSize: 11, color: { hex: '#6b7280', opacity: 1 },
    align: 'right', marginBottom: 0, rowWidth: 100,
  }
}

function fmtMonth(ym?: string): string {
  if (!ym) return ''
  const [year, month] = ym.split('-')
  if (!year || !month) return ym
  const m = Number(month)
  if (!Number.isFinite(m) || m < 1 || m > 12) return ym
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${names[m - 1]} ${year}`
}

function dateRangeText(startDate: string, endDate?: string, current = false): string {
  const start = fmtMonth(startDate) || startDate
  const end = current ? 'Present' : (fmtMonth(endDate) || endDate || '')
  return end ? `${start} – ${end}` : start
}

function rowWithRightDate(
  leftHtml: string,
  rightText: string,
  overrides?: Partial<import('@binh-tran/shared').DualTextBlock>,
): CanvasBlock {
  return {
    kind: 'dualText',
    id: id(),
    leftContent: leftHtml,
    rightContent: rightText,
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '700',
    fontStyle: 'normal',
    lineHeight: 1.4,
    letterSpacing: 0,
    color: { hex: '#111111', opacity: 1 },
    rightFontWeight: '400',
    rightColor: { hex: '#6b7280', opacity: 1 },
    gap: 12,
    marginBottom: 0,
    rowWidth: 100,
    ...overrides,
  }
}

function tags(items: string[]): CanvasBlock {
  return {
    kind: 'tags', id: id(), items,
    chipBackground: { hex: '#f1f5f9', opacity: 1 },
    chipColor: { hex: '#334155', opacity: 1 },
    chipRadius: 4, fontSize: 11, gap: 6, marginBottom: 8, rowWidth: 100,
  }
}

function col(blocks: CanvasBlock[], weight = 1): CanvasColumn {
  return { id: id(), weight, paddingX: 0, paddingY: 0, blocks }
}

function section(label: string, columns: CanvasColumn[], overrides?: Partial<CanvasSection>): CanvasSection {
  return {
    id: id(), label, hidden: false,
    paddingX: 40, paddingY: 14, gap: 24,
    columns,
    ...overrides,
  }
}

// ─── Preset: Harvard Resume ───────────────────────────────────────────────────

export function harvardResumePreset(content: ResumeContent): CanvasDocument {
  const p = content.personal
  const contacts = [p.email, p.phone, p.location, p.website && `🔗 ${p.website}`].filter(Boolean) as string[]

  const style: CanvasStyle = {
    pageWidth: 794,
    pageBackground: { hex: '#ffffff', opacity: 1 },
    forceBackground: { hex: '#ffffff', opacity: 1 },
    pagePaddingX: 0, pagePaddingY: 0,
    fontFamily: 'Georgia',
    headingFontFamily: 'Georgia',
    baseFontSize: 13,
    primaryColor: { hex: '#1a1a1a', opacity: 1 },
    accentColor: { hex: '#1a1a1a', opacity: 1 },
    textColor: { hex: '#1a1a1a', opacity: 1 },
    mutedColor: { hex: '#555555', opacity: 1 },
  }

  const sections: CanvasSection[] = []

  // Header
  sections.push(section('Header', [col([
    text(p.name || 'Your Name', { fontSize: 26, fontWeight: '700', align: 'center', textTransform: 'uppercase', letterSpacing: 0.05, marginBottom: 4 }),
    p.title ? text(p.title, { fontSize: 13, align: 'center', color: { hex: '#555555', opacity: 1 }, marginBottom: 6 }) : spacer(0),
    text(contacts.join('  ·  '), { fontSize: 11, align: 'center', color: { hex: '#555555', opacity: 1 }, marginBottom: 0 }),
  ])], { paddingY: 24, paddingX: 40 }))

  // Summary
  if (p.summary) {
    sections.push(section('Summary', [col([
      heading('Summary'),
      divider(),
      text(p.summary, { fontSize: 13, lineHeight: 1.6 }),
    ])]))
  }

  // Experience
  if (content.experience.length > 0) {
    const blocks: CanvasBlock[] = [heading('Experience'), divider()]
    content.experience.forEach((exp, i) => {
      if (i > 0) blocks.push(spacer(8))
      blocks.push(
        rowWithRightDate(`<strong>${exp.company}</strong>`, dateRangeText(exp.startDate, exp.endDate, exp.current), { fontFamily: 'Georgia' }),
        text(exp.role, { fontSize: 12, fontStyle: 'italic', color: { hex: '#444444', opacity: 1 }, marginBottom: 2 }),
        exp.description ? text(exp.description, { fontSize: 12, lineHeight: 1.55, color: { hex: '#333333', opacity: 1 } }) : spacer(0),
      )
    })
    sections.push(section('Experience', [col(blocks)]))
  }

  // Education
  if (content.education.length > 0) {
    const blocks: CanvasBlock[] = [heading('Education'), divider()]
    content.education.forEach((edu, i) => {
      if (i > 0) blocks.push(spacer(8))
      blocks.push(
        rowWithRightDate(`<strong>${edu.institution}</strong>`, dateRangeText(edu.startDate, edu.endDate), { fontFamily: 'Georgia' }),
        text(`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`, { fontSize: 12, fontStyle: 'italic', color: { hex: '#444444', opacity: 1 } }),
      )
    })
    sections.push(section('Education', [col(blocks)]))
  }

  // Skills
  if (content.skills.length > 0) {
    const blocks: CanvasBlock[] = [heading('Skills'), divider()]
    content.skills.forEach((sg) => {
      blocks.push(
        text(`<strong>${sg.category}:</strong> ${sg.skills.join(', ')}`, { fontSize: 12, marginBottom: 6 })
      )
    })
    sections.push(section('Skills', [col(blocks)]))
  }

  return { version: 1, style, sections }
}

// ─── Preset: Modern (2-col sidebar) Resume ────────────────────────────────────

export function modernResumePreset(content: ResumeContent): CanvasDocument {
  const p = content.personal

  const style: CanvasStyle = {
    pageWidth: 794,
    pageBackground: { hex: '#ffffff', opacity: 1 },
    forceBackground: { hex: '#ffffff', opacity: 1 },
    pagePaddingX: 0, pagePaddingY: 0,
    fontFamily: 'Inter',
    baseFontSize: 13,
    primaryColor: { hex: '#1e3a5f', opacity: 1 },
    accentColor: { hex: '#2563eb', opacity: 1 },
    textColor: { hex: '#111111', opacity: 1 },
    mutedColor: { hex: '#6b7280', opacity: 1 },
  }

  const sections: CanvasSection[] = []

  // Header row (full-width dark)
  sections.push(section('Header', [col([
    text(p.name || 'Your Name', { fontSize: 26, fontWeight: '700', color: { hex: '#ffffff', opacity: 1 }, marginBottom: 4 }),
    text(p.title || '', { fontSize: 14, color: { hex: '#93c5fd', opacity: 1 } }),
  ])], { paddingY: 28, paddingX: 40, background: { hex: '#1e3a5f', opacity: 1 } }))

  // Body (sidebar + main)
  const sideBlocks: CanvasBlock[] = []
  sideBlocks.push(heading('Contact', { color: { hex: '#93c5fd', opacity: 1 } }), divider() )
  if (p.email) sideBlocks.push(text(p.email, { fontSize: 11, color: { hex: '#e2e8f0', opacity: 1 } }))
  if (p.phone) sideBlocks.push(text(p.phone, { fontSize: 11, color: { hex: '#e2e8f0', opacity: 1 } }))
  if (p.location) sideBlocks.push(text(p.location, { fontSize: 11, color: { hex: '#e2e8f0', opacity: 1 } }))
  if (p.linkedin) sideBlocks.push(text(`linkedin: ${p.linkedin}`, { fontSize: 11, color: { hex: '#93c5fd', opacity: 1 } }))
  if (p.github) sideBlocks.push(text(`github: ${p.github}`, { fontSize: 11, color: { hex: '#93c5fd', opacity: 1 } }))

  if (content.skills.length > 0) {
    sideBlocks.push(spacer(16), heading('Skills', { color: { hex: '#93c5fd', opacity: 1 } }), divider())
    content.skills.forEach((sg) => {
      sideBlocks.push(
        text(sg.category, { fontSize: 10, fontWeight: '600', color: { hex: '#93c5fd', opacity: 1 }, textTransform: 'uppercase', letterSpacing: 0.05, marginBottom: 4 }),
        tags(sg.skills),
      )
    })
  }

  const mainBlocks: CanvasBlock[] = []
  if (p.summary) {
    mainBlocks.push(heading('Profile'), divider(), text(p.summary, { fontSize: 13, lineHeight: 1.6 }), spacer(12))
  }
  if (content.experience.length > 0) {
    mainBlocks.push(heading('Experience'), divider())
    content.experience.forEach((exp, i) => {
      if (i > 0) mainBlocks.push(spacer(10))
      mainBlocks.push(
        rowWithRightDate(`<strong>${exp.role}</strong>`, dateRangeText(exp.startDate, exp.endDate, exp.current), { fontSize: 14 }),
        text(exp.company + (exp.location ? ` · ${exp.location}` : ''), { fontSize: 12, color: { hex: '#2563eb', opacity: 1 }, marginBottom: 2 }),
        exp.description ? text(exp.description, { fontSize: 12, lineHeight: 1.55 }) : spacer(0),
      )
    })
  }
  if (content.education.length > 0) {
    mainBlocks.push(spacer(12), heading('Education'), divider())
    content.education.forEach((edu, i) => {
      if (i > 0) mainBlocks.push(spacer(8))
      mainBlocks.push(
        rowWithRightDate(`<strong>${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</strong>`, dateRangeText(edu.startDate, edu.endDate)),
        text(edu.institution, { fontSize: 12, color: { hex: '#6b7280', opacity: 1 } }),
      )
    })
  }

  sections.push(section('Body', [
    col(sideBlocks, 5),
    col(mainBlocks, 8),
  ], {
    paddingX: 0, paddingY: 0, gap: 0,
    columns: [
      { id: id(), weight: 5, paddingX: 24, paddingY: 24, background: { hex: '#1e3a5f', opacity: 1 }, blocks: sideBlocks },
      { id: id(), weight: 8, paddingX: 32, paddingY: 24, blocks: mainBlocks },
    ],
  }))

  return { version: 1, style, sections }
}

// ─── Preset: Minimal Resume ───────────────────────────────────────────────────

export function minimalResumePreset(content: ResumeContent): CanvasDocument {
  const p = content.personal
  const contacts = [p.email, p.phone, p.location].filter(Boolean) as string[]

  const style: CanvasStyle = {
    pageWidth: 794, pageBackground: { hex: '#ffffff', opacity: 1 },
    forceBackground: { hex: '#ffffff', opacity: 1 },
    pagePaddingX: 0, pagePaddingY: 0, fontFamily: 'Inter', baseFontSize: 13,
    primaryColor: { hex: '#111827', opacity: 1 }, accentColor: { hex: '#6366f1', opacity: 1 },
    textColor: { hex: '#111827', opacity: 1 }, mutedColor: { hex: '#9ca3af', opacity: 1 },
  }

  const sections: CanvasSection[] = [
    section('Header', [col([
      text(p.name || 'Your Name', { fontSize: 30, fontWeight: '300', letterSpacing: -0.02, marginBottom: 4 }),
      p.title ? text(p.title, { fontSize: 14, color: { hex: '#6366f1', opacity: 1 }, fontWeight: '500', marginBottom: 8 }) : spacer(0),
      text(contacts.join('  ·  '), { fontSize: 11, color: { hex: '#9ca3af', opacity: 1 } }),
    ])], { paddingY: 28 }),
  ]

  if (p.summary) {
    sections.push(section('Summary', [col([
      text(p.summary, { fontSize: 13, lineHeight: 1.7, color: { hex: '#374151', opacity: 1 } }),
    ])]))
  }

  if (content.experience.length > 0) {
    content.experience.forEach((exp, i) => {
      const rightBlocks = [date(exp.startDate, exp.endDate, exp.current)]
      sections.push(section(i === 0 ? 'Experience' : '', [
        col([
          text(`<strong>${exp.role}</strong>`, { fontSize: 13, fontWeight: '600', marginBottom: 0 }),
          text(exp.company + (exp.location ? `, ${exp.location}` : ''), { fontSize: 11, color: { hex: '#9ca3af', opacity: 1 }, marginBottom: 6 }),
          exp.description ? text(exp.description, { fontSize: 12, lineHeight: 1.6, color: { hex: '#374151', opacity: 1 } }) : spacer(0),
        ], 8),
        col(rightBlocks, 3),
      ], { paddingY: 10 }))
    })
  }

  return { version: 1, style, sections }
}

// ─── Preset: empty canvas (blank start) ──────────────────────────────────────

export function blankCanvasPreset(type: 'resume' | 'portfolio' | 'cover_letter'): CanvasDocument {
  const style: CanvasStyle = {
    pageWidth: 794, pageBackground: { hex: '#ffffff', opacity: 1 },
    forceBackground: { hex: '#ffffff', opacity: 1 },
    pagePaddingX: 0, pagePaddingY: 0, fontFamily: 'Inter', baseFontSize: 14,
    primaryColor: { hex: '#1e3a5f', opacity: 1 }, accentColor: { hex: '#2563eb', opacity: 1 },
    textColor: { hex: '#111111', opacity: 1 }, mutedColor: { hex: '#6b7280', opacity: 1 },
  }
  return {
    version: 1, style,
    sections: [
      section(`${type.replace('_', ' ')} – Section 1`, [
        col([text(`Start typing your ${type.replace('_', ' ')} here…`, { color: { hex: '#9ca3af', opacity: 1 } })]),
      ]),
    ],
  }
}

// ─── Convert plain content → CanvasDocument ───────────────────────────────────

export function contentToCanvas(
  type: 'resume' | 'portfolio' | 'cover_letter',
  content: unknown,
  templateId: string,
): CanvasDocument {
  if (type === 'resume') {
    const c = content as ResumeContent
    if (templateId === 'resume-modern') return modernResumePreset(c)
    if (templateId === 'resume-minimal') return minimalResumePreset(c)
    return harvardResumePreset(c) // default
  }
  if (type === 'cover_letter') {
    const c = content as CoverLetterContent
    return coverLetterPreset(c)
  }
  if (type === 'portfolio') {
    const c = content as PortfolioContent
    return portfolioPreset(c)
  }
  return blankCanvasPreset(type)
}

// ─── Cover letter preset ──────────────────────────────────────────────────────

export function coverLetterPreset(content: CoverLetterContent): CanvasDocument {
  const h = content.header
  const style: CanvasStyle = {
    pageWidth: 794, pageBackground: { hex: '#ffffff', opacity: 1 },
    forceBackground: { hex: '#ffffff', opacity: 1 },
    pagePaddingX: 0, pagePaddingY: 0, fontFamily: 'Georgia', baseFontSize: 13,
    primaryColor: { hex: '#1a1a1a', opacity: 1 }, accentColor: { hex: '#2563eb', opacity: 1 },
    textColor: { hex: '#1a1a1a', opacity: 1 }, mutedColor: { hex: '#555555', opacity: 1 },
  }
  return {
    version: 1, style,
    sections: [
      section('Sender', [col([
        text(`<strong>${h.senderName}</strong>`, { fontSize: 15, fontWeight: '700' }),
        text(h.senderTitle, { fontSize: 12, color: { hex: '#555555', opacity: 1 } }),
        text(h.senderEmail, { fontSize: 12 }),
        h.senderPhone ? text(h.senderPhone, { fontSize: 12 }) : spacer(0),
        spacer(8),
        text(h.date, { fontSize: 12, color: { hex: '#888888', opacity: 1 } }),
      ])], { paddingY: 28 }),
      section('Recipient', [col([
        h.recipientName ? text(h.recipientName + (h.recipientTitle ? `, ${h.recipientTitle}` : ''), { fontSize: 13 }) : spacer(0),
        text(h.companyName, { fontSize: 13, fontWeight: '600' }),
        h.companyAddress ? text(h.companyAddress, { fontSize: 12, color: { hex: '#555555', opacity: 1 } }) : spacer(0),
        content.jobTitle ? text(`Re: ${content.jobTitle}`, { fontSize: 13, fontWeight: '600', marginBottom: 0, color: { hex: '#2563eb', opacity: 1 } }) : spacer(0),
      ])]),
      section('Body', [col([
        divider(),
        spacer(8),
        content.opening ? text(content.opening, { fontSize: 13, lineHeight: 1.7 }) : spacer(0),
        spacer(8),
        content.body ? text(content.body, { fontSize: 13, lineHeight: 1.7 }) : spacer(0),
        spacer(8),
        content.closing ? text(content.closing, { fontSize: 13, lineHeight: 1.7 }) : spacer(0),
        spacer(16),
        text('Sincerely,', { fontSize: 13 }),
        spacer(20),
        text(`<strong>${h.senderName}</strong>`, { fontSize: 13, fontWeight: '700' }),
      ])]),
    ],
  }
}

// ─── Portfolio preset ─────────────────────────────────────────────────────────

export function portfolioPreset(content: PortfolioContent): CanvasDocument {
  const style: CanvasStyle = {
    pageWidth: 794, pageBackground: { hex: '#ffffff', opacity: 1 },
    forceBackground: { hex: '#ffffff', opacity: 1 },
    pagePaddingX: 0, pagePaddingY: 0, fontFamily: 'Inter', baseFontSize: 13,
    primaryColor: { hex: '#1e3a5f', opacity: 1 }, accentColor: { hex: '#2563eb', opacity: 1 },
    textColor: { hex: '#111111', opacity: 1 }, mutedColor: { hex: '#6b7280', opacity: 1 },
  }
  const sections: CanvasSection[] = []

  sections.push(section('Hero', [col([
    text(content.hero.headline || 'Your Name', { fontSize: 28, fontWeight: '700', color: { hex: '#ffffff', opacity: 1 } }),
    content.hero.subheadline ? text(content.hero.subheadline, { fontSize: 15, color: { hex: '#93c5fd', opacity: 1 } }) : spacer(0),
  ])], { background: { hex: '#1e3a5f', opacity: 1 }, paddingY: 40 }))

  sections.push(section('About', [col([
    heading('About'),
    divider(),
    text(content.about.bio, { fontSize: 13, lineHeight: 1.7 }),
  ])]))

  if (content.projects.length > 0) {
    const blocks: CanvasBlock[] = [heading('Projects'), divider()]
    content.projects.forEach((proj, i) => {
      if (i > 0) blocks.push(spacer(10))
      blocks.push(
        text(`<strong>${proj.name}</strong>`, { fontSize: 14, fontWeight: '700', marginBottom: 2 }),
        text(proj.description, { fontSize: 12, lineHeight: 1.55, color: { hex: '#374151', opacity: 1 } }),
        proj.tags.length > 0 ? tags(proj.tags) : spacer(0),
      )
    })
    sections.push(section('Projects', [col(blocks)]))
  }

  if (content.techStack.length > 0) {
    const grouped = content.techStack.reduce((acc, tech) => {
      acc[tech.category] = acc[tech.category] ?? []
      acc[tech.category].push(tech.name)
      return acc
    }, {} as Record<string, string[]>)
    const blocks: CanvasBlock[] = [heading('Tech Stack'), divider()]
    Object.entries(grouped).forEach(([cat, items]) => {
      blocks.push(text(cat, { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', color: { hex: '#6b7280', opacity: 1 }, letterSpacing: 0.06, marginBottom: 4 }))
      blocks.push(tags(items))
    })
    sections.push(section('Tech Stack', [col(blocks)]))
  }

  if (content.timeline.length > 0) {
    const blocks: CanvasBlock[] = [heading('Timeline'), divider()]
    content.timeline.forEach((item, i) => {
      if (i > 0) blocks.push(spacer(8))
      blocks.push(
        text(`<strong>${item.year}</strong> — ${item.title}`, { fontSize: 13, fontWeight: '600', marginBottom: 2 }),
        text(item.description, { fontSize: 12, color: { hex: '#374151', opacity: 1 } }),
      )
    })
    sections.push(section('Timeline', [col(blocks)]))
  }

  return { version: 1, style, sections }
}
