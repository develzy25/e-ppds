import { sqliteTable, text, integer, real, unique, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { periodes, pondoks, users } from '@/modules/core/schemas/core.schema';
import { masterSantri, masterDepartment } from '@/modules/master/schemas/master.schema';

// 12. PENDIDIKAN (Diniyah, Wajar, Murottil)

import { sqliteTable as sqliteTableGenpendidikan, text as textGenpendidikan } from 'drizzle-orm/sqlite-core';
import { sql as sqlGenpendidikan } from 'drizzle-orm';
export const pendidikanTable = sqliteTableGenpendidikan('pendidikan_gen', {
  id: textGenpendidikan('id').primaryKey(),
  name: textGenpendidikan('name').notNull(),
  pondokId: textGenpendidikan('pondok_id').notNull(),
});
