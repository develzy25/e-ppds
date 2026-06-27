import { sqliteTable, text, integer, real, unique, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { periodes, pondoks, users } from '@/modules/core/schemas/core.schema';
import { masterSantri, masterDepartment } from '@/modules/master/schemas/master.schema';

// 13. MEDIA MODUL

import { sqliteTable as sqliteTableGenmedia, text as textGenmedia } from 'drizzle-orm/sqlite-core';
import { sql as sqlGenmedia } from 'drizzle-orm';
export const mediaTable = sqliteTableGenmedia('media_gen', {
  id: textGenmedia('id').primaryKey(),
  name: textGenmedia('name').notNull(),
  pondokId: textGenmedia('pondok_id').notNull(),
});
