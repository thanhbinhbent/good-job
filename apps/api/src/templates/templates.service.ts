import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { getDatabase } from '../db/database';
import { templates } from '../db/schema';

type TemplateRow = typeof templates.$inferSelect;

const DEFAULT_TEMPLATES: TemplateRow[] = [
  // ── Resume ──────────────────────────────────────────────────────────────────
  {
    id: 'resume-harvard',
    name: 'Harvard',
    type: 'resume',
    previewUrl: null,
    isDefault: true,
  },
  {
    id: 'resume-modern',
    name: 'Modern',
    type: 'resume',
    previewUrl: null,
    isDefault: false,
  },
  {
    id: 'resume-minimal',
    name: 'Minimal',
    type: 'resume',
    previewUrl: null,
    isDefault: false,
  },
  {
    id: 'resume-tech',
    name: 'Tech',
    type: 'resume',
    previewUrl: null,
    isDefault: false,
  },
  // ── Portfolio ────────────────────────────────────────────────────────────────
  {
    id: 'portfolio-grid',
    name: 'Grid',
    type: 'portfolio',
    previewUrl: null,
    isDefault: true,
  },
  {
    id: 'portfolio-developer',
    name: 'Developer',
    type: 'portfolio',
    previewUrl: null,
    isDefault: false,
  },
  {
    id: 'portfolio-creative',
    name: 'Creative',
    type: 'portfolio',
    previewUrl: null,
    isDefault: false,
  },
  // ── Cover Letter ─────────────────────────────────────────────────────────────
  {
    id: 'cover-letter-formal',
    name: 'Formal',
    type: 'cover_letter',
    previewUrl: null,
    isDefault: true,
  },
  {
    id: 'cover-letter-modern',
    name: 'Modern',
    type: 'cover_letter',
    previewUrl: null,
    isDefault: false,
  },
  {
    id: 'cover-letter-minimal',
    name: 'Minimal',
    type: 'cover_letter',
    previewUrl: null,
    isDefault: false,
  },
];

@Injectable()
export class TemplatesService implements OnModuleInit {
  private get db() {
    return getDatabase();
  }

  onModuleInit(): void {
    this.seedDefaults();
  }

  private seedDefaults(): void {
    for (const tpl of DEFAULT_TEMPLATES) {
      const existing = this.db
        .select()
        .from(templates)
        .where(eq(templates.id, tpl.id))
        .all();
      if (!existing.length) {
        this.db.insert(templates).values(tpl).run();
      }
    }
  }

  findAll(type?: TemplateRow['type']): TemplateRow[] {
    if (type) {
      return this.db
        .select()
        .from(templates)
        .where(eq(templates.type, type))
        .all();
    }
    return this.db.select().from(templates).all();
  }

  findById(id: string): TemplateRow {
    const rows = this.db
      .select()
      .from(templates)
      .where(eq(templates.id, id))
      .all();
    if (!rows.length) throw new NotFoundException(`Template ${id} not found`);
    return rows[0];
  }
}
