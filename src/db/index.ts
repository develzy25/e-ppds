import { DatabaseClient } from '../infrastructure/database/client';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema';

// Export db instance wrapped by the adapter layer, statically typed to maintain strict app-wide types
export const db = DatabaseClient.getInstance() as DrizzleD1Database<typeof schema>;
