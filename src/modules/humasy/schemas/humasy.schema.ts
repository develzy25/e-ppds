import { sqliteTable, text, integer, real, unique, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { periodes, pondoks, users } from '@/modules/core/schemas/core.schema';
import { masterSantri, masterDepartment } from '@/modules/master/schemas/master.schema';

// 16. HUMASY & LOGISTIK

import { sqliteTable as sqliteTableGenhumasy, text as textGenhumasy } from 'drizzle-orm/sqlite-core';
import { sql as sqlGenhumasy } from 'drizzle-orm';
export const humasyTable = sqliteTableGenhumasy('humasy_gen', {
  id: textGenhumasy('id').primaryKey(),
  name: textGenhumasy('name').notNull(),
  pondokId: textGenhumasy('pondok_id').notNull(),
});
