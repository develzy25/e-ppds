import { sqliteTable, text, integer, real, unique, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { periodes, pondoks, users } from '@/modules/core/schemas/core.schema';
import { masterSantri, masterDepartment } from '@/modules/master/schemas/master.schema';

// 15. KESEHATAN (POSKESTREN)

import { sqliteTable as sqliteTableGenkesehatan, text as textGenkesehatan } from 'drizzle-orm/sqlite-core';
import { sql as sqlGenkesehatan } from 'drizzle-orm';
export const kesehatanTable = sqliteTableGenkesehatan('kesehatan_gen', {
  id: textGenkesehatan('id').primaryKey(),
  name: textGenkesehatan('name').notNull(),
  pondokId: textGenkesehatan('pondok_id').notNull(),
});
