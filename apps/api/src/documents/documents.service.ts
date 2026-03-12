import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { ulid } from 'ulid';
import { getDatabase } from '../db/database';
import { documents } from '../db/schema';

type DocumentRow = typeof documents.$inferSelect;
type NewDocument = typeof documents.$inferInsert;

export type CreateDocumentInput = {
  type: 'resume' | 'portfolio' | 'cover_letter';
  title: string;
  templateId?: string;
  content?: unknown;
};

export type UpdateDocumentInput = {
  title?: string;
  templateId?: string;
  content?: unknown;
};

function defaultContent(type: CreateDocumentInput['type']): unknown {
  if (type === 'resume') {
    return {
      personal: {
        name: 'Your Name',
        title: 'Software Engineer',
        email: 'you@example.com',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
      },
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      projects: [],
    };
  }

  if (type === 'portfolio') {
    return {
      hero: {
        headline: "Hello, I'm Your Name",
        subheadline: 'I build things for the web.',
        ctaLabel: 'View my work',
        ctaUrl: '#projects',
        avatarUrl: '',
      },
      about: {
        bio: 'A short bio about yourself.',
        highlights: [],
      },
      projects: [],
      techStack: [],
      timeline: [],
      contact: {
        email: 'you@example.com',
        linkedin: '',
        github: '',
        twitter: '',
        website: '',
      },
    };
  }

  // cover_letter
  const today = new Date().toISOString().split('T')[0];
  return {
    header: {
      senderName: 'Your Name',
      senderTitle: 'Software Engineer',
      senderEmail: 'you@example.com',
      senderPhone: '',
      date: today,
      recipientName: '',
      recipientTitle: '',
      companyName: 'Company Name',
      companyAddress: '',
    },
    opening: 'Dear Hiring Manager,',
    body: 'I am excited to apply for this position…',
    closing: 'Sincerely,\nYour Name',
    jobTitle: '',
  };
}

@Injectable()
export class DocumentsService {
  private get db() {
    return getDatabase();
  }

  findAll(): DocumentRow[] {
    return this.db.select().from(documents).all();
  }

  findById(id: string): DocumentRow {
    const rows = this.db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .all();
    if (!rows.length) throw new NotFoundException(`Document ${id} not found`);
    return rows[0];
  }

  create(input: CreateDocumentInput): DocumentRow {
    const now = new Date();
    const content = input.content ?? defaultContent(input.type);
    const row: NewDocument = {
      id: ulid(),
      type: input.type,
      title: input.title,
      templateId: input.templateId ?? 'default',
      content: JSON.stringify(content),
      createdAt: now,
      updatedAt: now,
    };
    this.db.insert(documents).values(row).run();
    return this.findById(row.id);
  }

  update(id: string, input: UpdateDocumentInput): DocumentRow {
    this.findById(id); // ensures 404 if missing
    const patch: Partial<NewDocument> = { updatedAt: new Date() };
    if (input.title !== undefined) patch.title = input.title;
    if (input.templateId !== undefined) patch.templateId = input.templateId;
    if (input.content !== undefined)
      patch.content = JSON.stringify(input.content);
    this.db.update(documents).set(patch).where(eq(documents.id, id)).run();
    return this.findById(id);
  }

  patchSection(
    id: string,
    sectionKey: string,
    sectionData: unknown,
  ): DocumentRow {
    const doc = this.findById(id);
    const content = JSON.parse(doc.content) as Record<string, unknown>;
    content[sectionKey] = sectionData;
    this.db
      .update(documents)
      .set({ content: JSON.stringify(content), updatedAt: new Date() })
      .where(eq(documents.id, id))
      .run();
    return this.findById(id);
  }

  remove(id: string): void {
    this.findById(id);
    this.db.delete(documents).where(eq(documents.id, id)).run();
  }
}
