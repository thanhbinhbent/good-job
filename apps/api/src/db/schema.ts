import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  type: text('type', {
    enum: ['resume', 'portfolio', 'cover_letter'],
  }).notNull(),
  title: text('title').notNull(),
  templateId: text('template_id').notNull().default('default'),
  content: text('content').notNull().default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const shareLinks = sqliteTable('share_links', {
  id: text('id').primaryKey(),
  documentId: text('document_id')
    .notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  passwordHash: text('password_hash'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', {
    enum: ['resume', 'portfolio', 'cover_letter'],
  }).notNull(),
  previewUrl: text('preview_url'),
  isDefault: integer('is_default', { mode: 'boolean' })
    .notNull()
    .default(false),
});
