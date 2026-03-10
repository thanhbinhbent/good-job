import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;

export function getDatabase(): ReturnType<typeof drizzle> {
  if (!_db) {
    const url = process.env.DATABASE_URL ?? './data/app.db';
    const sqlite = new Database(url);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    _db = drizzle(sqlite, { schema });
  }
  return _db;
}

export type Database = ReturnType<typeof drizzle>;
