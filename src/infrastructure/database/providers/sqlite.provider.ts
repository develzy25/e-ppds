import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@/db/schema';
import { IDatabaseProvider } from '../provider.interface';

export class SQLiteProvider implements IDatabaseProvider {
  private db: any;

  constructor() {
    const sqlite = new Database('sqlite.db');
    // Using any for now to allow cross-dialect dynamic resolution later
    this.db = drizzle(sqlite, { schema });
  }

  getDb() {
    return this.db;
  }
}
