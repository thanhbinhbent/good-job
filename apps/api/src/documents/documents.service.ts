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
    const row: NewDocument = {
      id: ulid(),
      type: input.type,
      title: input.title,
      templateId: input.templateId ?? 'default',
      content: JSON.stringify(input.content ?? {}),
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
