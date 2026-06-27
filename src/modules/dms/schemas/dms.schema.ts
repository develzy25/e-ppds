import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { periodes, pondoks } from '@/modules/core/schemas/core.schema';
import { masterDepartment } from '@/modules/master/schemas/master.schema';
import { sql } from 'drizzle-orm';

// -----------------------------------------------------------------------------
// DMS: TEMPLATES
// -----------------------------------------------------------------------------
export const dmsTemplates = sqliteTable('dms_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'Surat Keluar', 'Surat Keterangan', 'Sertifikat'
  content: text('content').notNull(), // HTML string with {{variables}}
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  
  // Standard Audit Columns
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

// -----------------------------------------------------------------------------
// DMS: SURAT (Masuk & Keluar)
// -----------------------------------------------------------------------------
export const dmsSurats = sqliteTable('dms_surats', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'Masuk', 'Keluar'
  letterNumber: text('letter_number'), // Auto-generated for Keluar, input for Masuk
  title: text('title').notNull(),
  sender: text('sender').notNull(),
  recipient: text('recipient').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull().default('DRAFT'), // 'DRAFT', 'REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED'
  templateId: text('template_id'), // Relasi ke dmsTemplates (optional, untuk surat keluar)
  contentData: text('content_data'), // JSON string dari variable yang di-isi (misal { "nama": "Ahmad" })
  
  // Standard Audit Columns
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

// -----------------------------------------------------------------------------
// DMS: SURAT APPROVALS (Workflow)
// -----------------------------------------------------------------------------
export const dmsSuratApprovals = sqliteTable('dms_surat_approvals', {
  id: text('id').primaryKey(),
  suratId: text('surat_id').notNull(), // references dmsSurats.id
  requiredRole: text('required_role').notNull(), // Role/Permission yang harus approve (e.g. 'Kepala Pondok')
  status: text('status').notNull().default('PENDING'), // 'PENDING', 'APPROVED', 'REJECTED'
  notes: text('notes'),
  approvedBy: text('approved_by'), // userId
  approvedAt: integer('approved_at', { mode: 'timestamp' }),
  stepOrder: integer('step_order').notNull().default(1), // Urutan approval jika berjenjang
  
  // Standard Audit Columns
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

// -----------------------------------------------------------------------------
// DMS: ATTACHMENTS
// -----------------------------------------------------------------------------
export const dmsAttachments = sqliteTable('dms_attachments', {
  id: text('id').primaryKey(),
  suratId: text('surat_id').notNull(), // references dmsSurats.id
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size').notNull(), // in bytes
  
  // Standard Audit Columns
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

// 5. KESEKRETARIATAN & PERSURATAN
// =============================================================

export const surats = sqliteTable('surats', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // "Masuk" | "Keluar"
  letterNumber: text('letter_number').notNull(),
  title: text('title').notNull(),
  sender: text('sender').notNull(),
  recipient: text('recipient').notNull(),
  status: text('status').notNull(), // e.g. "Draft", "Dikirim"
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
}, (t) => ({
  unqLetterNumPeriod: unique('unq_letter_num_period').on(t.letterNumber, t.periodId),
}));

export const disposisi = sqliteTable('disposisi', {
  id: text('id').primaryKey(),
  suratId: text('surat_id').notNull().references(() => surats.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  toSeksiId: text('to_seksi_id').notNull().references(() => masterDepartment.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  note: text('note').notNull(),
  date: text('date').notNull(),
});

// =============================================================



import { sqliteTable as sqliteTableGendms, text as textGendms } from 'drizzle-orm/sqlite-core';
import { sql as sqlGendms } from 'drizzle-orm';
export const dmsTable = sqliteTableGendms('dms_gen', {
  id: textGendms('id').primaryKey(),
  name: textGendms('name').notNull(),
  pondokId: textGendms('pondok_id').notNull(),
});
