import { sqliteTable, text, integer, real, unique, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { periodes, pondoks, users } from '@/modules/core/schemas/core.schema';
import { masterSantri, masterDepartment } from '@/modules/master/schemas/master.schema';

// 19. PEMBANGUNAN

import { sqliteTable as sqliteTableGenpembangunan, text as textGenpembangunan } from 'drizzle-orm/sqlite-core';
import { sql as sqlGenpembangunan } from 'drizzle-orm';
export const pembangunanTable = sqliteTableGenpembangunan('pembangunan_gen', {
  id: textGenpembangunan('id').primaryKey(),
  name: textGenpembangunan('name').notNull(),
  pondokId: textGenpembangunan('pondok_id').notNull(),
});
