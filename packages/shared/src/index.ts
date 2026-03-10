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
