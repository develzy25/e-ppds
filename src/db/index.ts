import { DatabaseClient } from '../infrastructure/database/client';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Export db instance wrapped by the adapter layer, statically typed to maintain strict app-wide types
export const db = DatabaseClient.getInstance() as BetterSQLite3Database<typeof schema>;
