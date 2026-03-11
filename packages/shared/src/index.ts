import { z } from 'zod';

// ─── Document Types ────────────────────────────────────────────────────────────

export const documentTypeSchema = z.enum(['resume', 'portfolio', 'cover_letter']);
export type DocumentType = z.infer<typeof documentTypeSchema>;

// ─── Resume Content ────────────────────────────────────────────────────────────

export const personalSectionSchema = z.object({
  name: z.string(),
  title: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  summary: z.string().optional(),
});

export const experienceItemSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  location: z.string().optional(),
  description: z.string(),
});

export const educationItemSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  description: z.string().optional(),
});

export const skillGroupSchema = z.object({
  id: z.string(),
  category: z.string(),
  skills: z.array(z.string()),
});

export const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  url: z.string().optional(),
});

export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string().optional(),
  repo: z.string().optional(),
  tags: z.array(z.string()),
});

export const resumeContentSchema = z.object({
  personal: personalSectionSchema,
  experience: z.array(experienceItemSchema).default([]),
  education: z.array(educationItemSchema).default([]),
  skills: z.array(skillGroupSchema).default([]),
  certifications: z.array(certificationItemSchema).default([]),
  projects: z.array(projectItemSchema).default([]),
});

export type PersonalSection = z.infer<typeof personalSectionSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type CertificationItem = z.infer<typeof certificationItemSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type ResumeContent = z.infer<typeof resumeContentSchema>;

// ─── Portfolio Content ─────────────────────────────────────────────────────────

export const heroSectionSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  ctaLabel: z.string().optional(),
  ctaUrl: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const aboutSectionSchema = z.object({
  bio: z.string(),
  highlights: z.array(z.string()),
});

export const techStackItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  category: z.string(),
});

export const timelineItemSchema = z.object({
  id: z.string(),
  year: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['work', 'education', 'achievement', 'project']),
});

export const contactSectionSchema = z.object({
  email: z.string(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  twitter: z.string().optional(),
  website: z.string().optional(),
});

export const portfolioContentSchema = z.object({
  hero: heroSectionSchema,
  about: aboutSectionSchema,
  projects: z.array(projectItemSchema).default([]),
  techStack: z.array(techStackItemSchema).default([]),
  timeline: z.array(timelineItemSchema).default([]),
  contact: contactSectionSchema,
});

export type PortfolioContent = z.infer<typeof portfolioContentSchema>;
export type HeroSection = z.infer<typeof heroSectionSchema>;
export type AboutSection = z.infer<typeof aboutSectionSchema>;
export type TechStackItem = z.infer<typeof techStackItemSchema>;
export type TimelineItem = z.infer<typeof timelineItemSchema>;
export type ContactSection = z.infer<typeof contactSectionSchema>;

// ─── Cover Letter Content ──────────────────────────────────────────────────────

export const coverLetterHeaderSchema = z.object({
  senderName: z.string(),
  senderTitle: z.string(),
  senderEmail: z.string(),
  senderPhone: z.string().optional(),
  date: z.string(),
  recipientName: z.string().optional(),
  recipientTitle: z.string().optional(),
  companyName: z.string(),
  companyAddress: z.string().optional(),
});

export const coverLetterContentSchema = z.object({
  header: coverLetterHeaderSchema,
  opening: z.string(),
  body: z.string(),
  closing: z.string(),
  jobTitle: z.string().optional(),
});

export type CoverLetterContent = z.infer<typeof coverLetterContentSchema>;

// ─── Document Content Union ────────────────────────────────────────────────────

export type DocumentContent = ResumeContent | PortfolioContent | CoverLetterContent;

// ─── Document DTO ─────────────────────────────────────────────────────────────

export const documentSchema = z.object({
  id: z.string(),
  type: documentTypeSchema,
  title: z.string(),
  templateId: z.string(),
  content: z.unknown(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Document = z.infer<typeof documentSchema>;

export const createDocumentSchema = z.object({
  type: documentTypeSchema,
  title: z.string().min(1).max(200),
  templateId: z.string().optional(),
  content: z.unknown().optional(),
});

export type CreateDocumentDto = z.infer<typeof createDocumentSchema>;

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  templateId: z.string().optional(),
  content: z.unknown().optional(),
});

export type UpdateDocumentDto = z.infer<typeof updateDocumentSchema>;

export const patchSectionSchema = z.object({
  sectionKey: z.string(),
  sectionData: z.unknown(),
});

export type PatchSectionDto = z.infer<typeof patchSectionSchema>;

// ─── Share Link DTO ────────────────────────────────────────────────────────────

export const shareLinkSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  expiresAt: z.string().nullable(),
  hasPassword: z.boolean(),
  createdAt: z.string(),
});

export type ShareLink = z.infer<typeof shareLinkSchema>;

export const createShareLinkSchema = z.object({
  documentId: z.string(),
  password: z.string().min(4).max(100).optional(),
  expiresAt: z.string().optional(),
});

export type CreateShareLinkDto = z.infer<typeof createShareLinkSchema>;

export const unlockShareSchema = z.object({
  password: z.string().min(1),
});

export type UnlockShareDto = z.infer<typeof unlockShareSchema>;

// ─── Template DTO ─────────────────────────────────────────────────────────────

export const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: documentTypeSchema,
  previewUrl: z.string().nullable(),
  isDefault: z.boolean(),
});

export type Template = z.infer<typeof templateSchema>;

// ─── Canvas Document Schema ────────────────────────────────────────────────────
// A fully dynamic, user-customisable document model.
// Inspired by Canva / Enhancv / Resume.io editor paradigms.
// Structure: DocumentCanvas → sections[] → columns[] → blocks[]
// Every visual and content property lives in a typed, serialisable block.

// ── Fonts & Colors ──────────────────────────────────────────────────────────

export const FONT_FAMILIES = [
  'Inter', 'Geist', 'Georgia', 'Times New Roman', 'Garamond',
  'Roboto', 'Open Sans', 'Lato', 'Merriweather', 'Playfair Display',
  'Source Code Pro', 'JetBrains Mono', 'Raleway', 'Montserrat',
] as const

export type FontFamily = typeof FONT_FAMILIES[number]

export const canvasColorSchema = z.object({
  hex: z.string(),  // '#1e3a5f'
  opacity: z.number().min(0).max(1).default(1),
})
export type CanvasColor = z.infer<typeof canvasColorSchema>

export const canvasBorderSchema = z.object({
  width: z.number().default(0),
  style: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
  color: canvasColorSchema,
  radius: z.number().default(0),  // px
})
export type CanvasBorder = z.infer<typeof canvasBorderSchema>

// ── Block types — each block = one atomic piece of content ──────────────────

// Text block (heading / paragraph / label)
export const textBlockSchema = z.object({
  kind: z.literal('text'),
  id: z.string(),
  content: z.string().default(''),        // HTML (Tiptap)
  fontSize: z.number().default(14),       // px
  fontFamily: z.string().default('Inter'),
  fontWeight: z.enum(['300','400','500','600','700','800']).default('400'),
  fontStyle: z.enum(['normal','italic']).default('normal'),
  color: canvasColorSchema.default({ hex: '#111111', opacity: 1 }),
  align: z.enum(['left','center','right','justify']).default('left'),
  lineHeight: z.number().default(1.5),
  letterSpacing: z.number().default(0),   // em
  marginBottom: z.number().default(4),    // px
  textTransform: z.enum(['none','uppercase','lowercase','capitalize']).default('none'),
})
export type TextBlock = z.infer<typeof textBlockSchema>

// Date range block
export const dateBlockSchema = z.object({
  kind: z.literal('date'),
  id: z.string(),
  startDate: z.string().default(''),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  format: z.enum(['MMM YYYY','YYYY','MM/YYYY','YYYY-MM']).default('MMM YYYY'),
  fontSize: z.number().default(12),
  color: canvasColorSchema.default({ hex: '#666666', opacity: 1 }),
  align: z.enum(['left','center','right']).default('left'),
  marginBottom: z.number().default(4),
})
export type DateBlock = z.infer<typeof dateBlockSchema>

// Tag / Badge list block  
export const tagBlockSchema = z.object({
  kind: z.literal('tags'),
  id: z.string(),
  items: z.array(z.string()).default([]),
  chipBackground: canvasColorSchema.default({ hex: '#e2e8f0', opacity: 1 }),
  chipColor: canvasColorSchema.default({ hex: '#1e293b', opacity: 1 }),
  chipRadius: z.number().default(4),
  fontSize: z.number().default(11),
  gap: z.number().default(6),           // px gap between tags
  marginBottom: z.number().default(8),
})
export type TagBlock = z.infer<typeof tagBlockSchema>

// Progress/skill bar block
export const progressBlockSchema = z.object({
  kind: z.literal('progress'),
  id: z.string(),
  label: z.string().default(''),
  value: z.number().min(0).max(100).default(80),
  trackColor: canvasColorSchema.default({ hex: '#e2e8f0', opacity: 1 }),
  fillColor: canvasColorSchema.default({ hex: '#2563eb', opacity: 1 }),
  height: z.number().default(6),
  showLabel: z.boolean().default(true),
  showValue: z.boolean().default(false),
  marginBottom: z.number().default(8),
})
export type ProgressBlock = z.infer<typeof progressBlockSchema>

// Divider block
export const dividerBlockSchema = z.object({
  kind: z.literal('divider'),
  id: z.string(),
  color: canvasColorSchema.default({ hex: '#e2e8f0', opacity: 1 }),
  thickness: z.number().default(1),
  style: z.enum(['solid','dashed','dotted']).default('solid'),
  marginTop: z.number().default(8),
  marginBottom: z.number().default(8),
})
export type DividerBlock = z.infer<typeof dividerBlockSchema>

// Avatar / image block
export const imageBlockSchema = z.object({
  kind: z.literal('image'),
  id: z.string(),
  url: z.string().default(''),
  width: z.number().default(80),         // px
  height: z.number().default(80),
  radius: z.number().default(50),        // % — 50 = circle
  align: z.enum(['left','center','right']).default('left'),
  marginBottom: z.number().default(12),
})
export type ImageBlock = z.infer<typeof imageBlockSchema>

// Link block
export const linkBlockSchema = z.object({
  kind: z.literal('link'),
  id: z.string(),
  label: z.string().default(''),
  url: z.string().default(''),
  icon: z.string().optional(),           // lucide icon name
  fontSize: z.number().default(12),
  color: canvasColorSchema.default({ hex: '#2563eb', opacity: 1 }),
  marginBottom: z.number().default(4),
})
export type LinkBlock = z.infer<typeof linkBlockSchema>

// Spacer block
export const spacerBlockSchema = z.object({
  kind: z.literal('spacer'),
  id: z.string(),
  height: z.number().default(16),        // px
})
export type SpacerBlock = z.infer<typeof spacerBlockSchema>

// Union of all block types
export const canvasBlockSchema = z.discriminatedUnion('kind', [
  textBlockSchema,
  dateBlockSchema,
  tagBlockSchema,
  progressBlockSchema,
  dividerBlockSchema,
  imageBlockSchema,
  linkBlockSchema,
  spacerBlockSchema,
])
export type CanvasBlock = z.infer<typeof canvasBlockSchema>
export type CanvasBlockKind = CanvasBlock['kind']

// ── Column ──────────────────────────────────────────────────────────────────

export const canvasColumnSchema = z.object({
  id: z.string(),
  weight: z.number().default(1),         // flex-weight relative to siblings
  paddingX: z.number().default(0),       // px
  paddingY: z.number().default(0),
  background: canvasColorSchema.optional(),
  blocks: z.array(canvasBlockSchema).default([]),
})
export type CanvasColumn = z.infer<typeof canvasColumnSchema>

// ── Section ─────────────────────────────────────────────────────────────────

export const canvasSectionSchema = z.object({
  id: z.string(),
  label: z.string().default('Section'),  // user-editable section name
  hidden: z.boolean().default(false),
  columns: z.array(canvasColumnSchema).min(1).default([]),  // 1–3 columns
  // Section-level visual overrides
  paddingX: z.number().default(40),      // px
  paddingY: z.number().default(16),
  background: canvasColorSchema.optional(),
  border: canvasBorderSchema.optional(),
  gap: z.number().default(24),           // gap between columns in px
})
export type CanvasSection = z.infer<typeof canvasSectionSchema>

// ── Global document style ────────────────────────────────────────────────────

export const canvasStyleSchema = z.object({
  // Page
  pageWidth: z.number().default(794),    // px — A4 = 794
  pageBackground: canvasColorSchema.default({ hex: '#ffffff', opacity: 1 }),
  forceBackground: z
    .union([canvasColorSchema, z.boolean()])
    .transform((value) => {
      if (typeof value === 'boolean') {
        return { hex: '#ffffff', opacity: value ? 1 : 0 }
      }
      return value
    })
    .default({ hex: '#ffffff', opacity: 1 }),
  pagePaddingX: z.number().default(0),   // outer margin handled in sections
  pagePaddingY: z.number().default(0),

  // Typography defaults (overridable per block)
  fontFamily: z.string().default('Inter'),
  baseFontSize: z.number().default(14),
  headingFontFamily: z.string().optional(),

  // Palette shortcuts
  primaryColor: canvasColorSchema.default({ hex: '#1e3a5f', opacity: 1 }),
  accentColor: canvasColorSchema.default({ hex: '#2563eb', opacity: 1 }),
  textColor: canvasColorSchema.default({ hex: '#111111', opacity: 1 }),
  mutedColor: canvasColorSchema.default({ hex: '#6b7280', opacity: 1 }),
})
export type CanvasStyle = z.infer<typeof canvasStyleSchema>

// ── Root canvas document ─────────────────────────────────────────────────────

export const canvasDocumentSchema = z.object({
  version: z.literal(1).default(1),
  style: canvasStyleSchema,
  sections: z.array(canvasSectionSchema).default([]),
})
export type CanvasDocument = z.infer<typeof canvasDocumentSchema>

// ─── API Envelope ─────────────────────────────────────────────────────────────

export type ApiResponse<T> = {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
};

export type ApiError = {
  error: string;
  details?: unknown;
};
