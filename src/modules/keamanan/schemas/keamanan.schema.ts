import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { masterSantri } from '../../master/schemas/master.schema';

export const keamananPermits = sqliteTable('keamanan_permits', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').notNull().references(() => masterSantri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  type: text('type').notNull(), // 'Keluar Pondok' | 'Pulang (Sakit)' | 'Pulang (Izin)'
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  status: text('status').notNull(), // 'Draft' | 'Rekomendasi Blok' | 'Aktif' | 'Disetujui' | 'Kembali'
  notes: text('notes'),
  checkoutAt: text('checkout_at'),
  
  // Audit fields
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

export const keamananOffenses = sqliteTable('keamanan_offenses', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').notNull().references(() => masterSantri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  category: text('category').notNull(), // 'Ringan' | 'Sedang' | 'Berat'
  description: text('description').notNull(),
  points: integer('points').notNull(),
  date: text('date').notNull(),
  handlerName: text('handler_name').notNull(),
  
  // Audit fields
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});
