import { sqliteTable, text, integer, real, unique, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { periodes, pondoks, users } from '@/modules/core/schemas/core.schema';
import { masterSantri, masterDepartment } from '@/modules/master/schemas/master.schema';

// 18. TAKMIR MASJID

import { sqliteTable as sqliteTableGentakmir, text as textGentakmir } from 'drizzle-orm/sqlite-core';
import { sql as sqlGentakmir } from 'drizzle-orm';
export const takmirTable = sqliteTableGentakmir('takmir_gen', {
  id: textGentakmir('id').primaryKey(),
  name: textGentakmir('name').notNull(),
  pondokId: textGentakmir('pondok_id').notNull(),
});
