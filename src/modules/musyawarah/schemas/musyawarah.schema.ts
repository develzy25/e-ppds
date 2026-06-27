import { sqliteTable, text, integer, real, unique, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { periodes, pondoks, users } from '@/modules/core/schemas/core.schema';
import { masterSantri, masterDepartment } from '@/modules/master/schemas/master.schema';

// 14. MUSYAWARAH MODUL

import { sqliteTable as sqliteTableGenmusyawarah, text as textGenmusyawarah } from 'drizzle-orm/sqlite-core';
import { sql as sqlGenmusyawarah } from 'drizzle-orm';
export const musyawarahTable = sqliteTableGenmusyawarah('musyawarah_gen', {
  id: textGenmusyawarah('id').primaryKey(),
  name: textGenmusyawarah('name').notNull(),
  pondokId: textGenmusyawarah('pondok_id').notNull(),
});
