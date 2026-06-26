import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Inisialisasi database lokal sqlite untuk development
const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema });
