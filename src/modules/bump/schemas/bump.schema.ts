import { sqliteTable, text, integer, real, unique, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { periodes, pondoks, users } from '@/modules/core/schemas/core.schema';
import { masterSantri, masterDepartment } from '@/modules/master/schemas/master.schema';

// 20. BUMP


import { sqliteTable as sqliteTableGenbump, text as textGenbump } from 'drizzle-orm/sqlite-core';
import { sql as sqlGenbump } from 'drizzle-orm';
export const bumpTable = sqliteTableGenbump('bump_gen', {
  id: textGenbump('id').primaryKey(),
  name: textGenbump('name').notNull(),
  pondokId: textGenbump('pondok_id').notNull(),
});
