import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { ulid } from 'ulid';
import bcrypt from 'bcrypt';
import { getDatabase } from '../db/database';
import { shareLinks, documents } from '../db/schema';
import { AuthService } from '../auth/auth.service';

type ShareLinkRow = typeof shareLinks.$inferSelect;

@Injectable()
export class SharingService {
  private get db() {
    return getDatabase();
  }

  constructor(private readonly auth: AuthService) {}

  findByDocumentId(documentId: string): ShareLinkRow[] {
    return this.db
      .select()
      .from(shareLinks)
      .where(eq(shareLinks.documentId, documentId))
      .all();
  }

  async createShareLink(input: {
    documentId: string;
    password?: string;
    expiresAt?: string;
  }): Promise<ShareLinkRow> {
    const docRows = this.db
      .select()
      .from(documents)
      .where(eq(documents.id, input.documentId))
      .all();
    if (!docRows.length) throw new NotFoundException('Document not found');

    const passwordHash = input.password
      ? await bcrypt.hash(input.password, 10)
      : null;

    const row = {
      id: ulid(),
      documentId: input.documentId,
      passwordHash,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      createdAt: new Date(),
    };

    this.db.insert(shareLinks).values(row).run();
    return this.getShareLink(row.id);
  }

  getShareLink(id: string): ShareLinkRow {
    const rows = this.db
      .select()
      .from(shareLinks)
      .where(eq(shareLinks.id, id))
      .all();
    if (!rows.length) throw new NotFoundException(`Share link ${id} not found`);
    const link = rows[0];
    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new BadRequestException('Share link has expired');
    }
    return link;
  }

  async unlockShareLink(id: string, password: string): Promise<string> {
    const link = this.getShareLink(id);
    if (!link.passwordHash) return this.auth.signShareToken(id);

    const valid = await bcrypt.compare(password, link.passwordHash);
    if (!valid) throw new UnauthorizedException('Incorrect password');
    return this.auth.signShareToken(id);
  }

  deleteShareLink(id: string): void {
    this.getShareLink(id);
    this.db.delete(shareLinks).where(eq(shareLinks.id, id)).run();
  }
}
