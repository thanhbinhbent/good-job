import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { getDatabase } from '../db/database';
import { templates } from '../db/schema';

type TemplateRow = typeof templates.$inferSelect;

const DEFAULT_TEMPLATES: TemplateRow[] = [
  {
    id: 'resume-default',
    name: 'Classic',
    type: 'resume',
    previewUrl: null,
    isDefault: true,
  },
  {
    id: 'portfolio-default',
    name: 'Classic',
    type: 'portfolio',
    previewUrl: null,
    isDefault: true,
  },
  {
    id: 'cover-letter-default',
    name: 'Classic',
    type: 'cover_letter',
    previewUrl: null,
    isDefault: true,
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
