import type { ResumeContent, PortfolioContent, CoverLetterContent, DocumentType } from '@binh-tran/shared'
import { HarvardTemplate } from './resume/HarvardTemplate'
import { ModernTemplate } from './resume/ModernTemplate'
import { MinimalTemplate } from './resume/MinimalTemplate'
import { TechTemplate } from './resume/TechTemplate'
import { GridPortfolioTemplate } from './portfolio/GridTemplate'
import { DeveloperPortfolioTemplate } from './portfolio/DeveloperTemplate'
import { CreativePortfolioTemplate } from './portfolio/CreativeTemplate'
import { FormalCoverLetterTemplate } from './cover-letter/FormalTemplate'
import { ModernCoverLetterTemplate } from './cover-letter/ModernCoverLetterTemplate'
import { MinimalCoverLetterTemplate } from './cover-letter/MinimalCoverLetterTemplate'

// ── Types ─────────────────────────────────────────────────────────────────────

export type TemplateId = string

export interface TemplateDefinition {
  id: TemplateId
  name: string
  type: DocumentType
  description: string
  render: (props: { content: unknown; title: string }) => React.ReactElement
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  // Resume
  {
    id: 'resume-harvard',
    name: 'Harvard',
    type: 'resume',
    description: 'Traditional academic style — clean, serif, professional. Ideal for academia, law, finance.',
    render: ({ content }) => <HarvardTemplate content={content as ResumeContent} />,
  },
  {
    id: 'resume-modern',
    name: 'Modern',
    type: 'resume',
    description: 'Two-column layout with a navy sidebar. Great for business and management roles.',
    render: ({ content }) => <ModernTemplate content={content as ResumeContent} />,
  },
  {
    id: 'resume-minimal',
    name: 'Minimal',
    type: 'resume',
    description: 'Ultra-clean with generous whitespace. Works across all industries.',
    render: ({ content }) => <MinimalTemplate content={content as ResumeContent} />,
  },
  {
    id: 'resume-tech',
    name: 'Tech',
    type: 'resume',
    description: 'Dark terminal-inspired. Perfect for software engineers and developers.',
    render: ({ content }) => <TechTemplate content={content as ResumeContent} />,
  },

  // Portfolio
  {
    id: 'portfolio-grid',
    name: 'Grid',
    type: 'portfolio',
    description: 'Card grid layout with a gradient hero. Clean and versatile.',
    render: ({ content }) => <GridPortfolioTemplate content={content as PortfolioContent} />,
  },
  {
    id: 'portfolio-developer',
    name: 'Developer',
    type: 'portfolio',
    description: 'Terminal/code aesthetic. Ideal for software developers.',
    render: ({ content }) => <DeveloperPortfolioTemplate content={content as PortfolioContent} />,
  },
  {
    id: 'portfolio-creative',
    name: 'Creative',
    type: 'portfolio',
    description: 'Bold typography with dark hero and colorful accents. For designers and creatives.',
    render: ({ content }) => <CreativePortfolioTemplate content={content as PortfolioContent} />,
  },

  // Cover Letter
  {
    id: 'cover-letter-formal',
    name: 'Formal',
    type: 'cover_letter',
    description: 'Traditional business letter format. Suitable for conservative industries.',
    render: ({ content, title }) => <FormalCoverLetterTemplate content={content as CoverLetterContent} title={title} />,
  },
  {
    id: 'cover-letter-modern',
    name: 'Modern',
    type: 'cover_letter',
    description: 'Clean with a navy accent bar and sectioned layout.',
    render: ({ content, title }) => <ModernCoverLetterTemplate content={content as CoverLetterContent} title={title} />,
  },
  {
    id: 'cover-letter-minimal',
    name: 'Minimal',
    type: 'cover_letter',
    description: 'Light weight, generous whitespace. Confident and understated.',
    render: ({ content, title }) => <MinimalCoverLetterTemplate content={content as CoverLetterContent} title={title} />,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getTemplatesForType(type: DocumentType): TemplateDefinition[] {
  return TEMPLATE_REGISTRY.filter((t) => t.type === type)
}

export function getTemplate(id: TemplateId): TemplateDefinition | undefined {
  return TEMPLATE_REGISTRY.find((t) => t.id === id)
}

export const DEFAULT_TEMPLATE_ID: Record<DocumentType, TemplateId> = {
  resume: 'resume-harvard',
  portfolio: 'portfolio-grid',
  cover_letter: 'cover-letter-formal',
}
