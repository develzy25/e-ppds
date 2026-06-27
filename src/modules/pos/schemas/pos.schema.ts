import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const posTable = sqliteTable('pos', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  pondokId: text('pondok_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});
