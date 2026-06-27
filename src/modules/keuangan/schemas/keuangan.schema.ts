import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core';
import { masterSantri, masterAcademicYear } from '../../master/schemas/master.schema';
import { pondoks } from '@/modules/core/schemas/core.schema';

// -------------------------------------------------------------
// MASTER KEUANGAN
// -------------------------------------------------------------
export const keuanganMasterJenisTagihan = sqliteTable('keuangan_master_jenis_tagihan', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "SPP", "Daftar Ulang"
  category: text('category').notNull(), // "Bulanan" | "Tahunan" | "Insidental"
  description: text('description'),
    pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
    createdBy: text('created_by'),
    updatedBy: text('updated_by'),
    deletedBy: text('deleted_by'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

export const keuanganMasterTarif = sqliteTable('keuangan_master_tarif', {
  id: text('id').primaryKey(),
  jenisTagihanId: text('jenis_tagihan_id').notNull().references(() => keuanganMasterJenisTagihan.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  academicYearId: text('academic_year_id').notNull().references(() => masterAcademicYear.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  amount: real('amount').notNull(),
  description: text('description'),
    pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
    createdBy: text('created_by'),
    updatedBy: text('updated_by'),
    deletedBy: text('deleted_by'),
});

// -------------------------------------------------------------
// TAGIHAN & PIUTANG
// -------------------------------------------------------------
export const keuanganTagihan = sqliteTable('keuangan_tagihan', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').unique().notNull(),
  santriId: text('santri_id').notNull().references(() => masterSantri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  jenisTagihanId: text('jenis_tagihan_id').notNull().references(() => keuanganMasterJenisTagihan.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  academicYearId: text('academic_year_id').notNull().references(() => masterAcademicYear.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  month: integer('month'), // 1-12 if category is "Bulanan"
  totalAmount: real('total_amount').notNull(),
  remainingAmount: real('remaining_amount').notNull(), // For partial payments / Piutang
  status: text('status').notNull(), // "Unpaid" | "Partial" | "Paid" | "Void"
  dueDate: text('due_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
    pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
}, (t) => ({
  idxSantriTagihan: index('idx_santri_tagihan').on(t.santriId, t.status),
}));

// -------------------------------------------------------------
// PEMBAYARAN
// -------------------------------------------------------------
export const keuanganPembayaran = sqliteTable('keuangan_pembayaran', {
  id: text('id').primaryKey(),
  receiptNumber: text('receipt_number').unique().notNull(), // No Struk
  santriId: text('santri_id').notNull().references(() => masterSantri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  totalPaid: real('total_paid').notNull(),
  paymentMethod: text('payment_method').notNull(), // "Cash" | "Transfer" | "Virtual Account"
  paymentDate: text('payment_date').notNull(),
  cashierId: text('cashier_id').notNull(), // References User ID
  status: text('status').notNull(), // "Success" | "Void"
  createdAt: text('created_at').notNull(),
});

export const keuanganPembayaranDetail = sqliteTable('keuangan_pembayaran_detail', {
  id: text('id').primaryKey(),
  pembayaranId: text('pembayaran_id').notNull().references(() => keuanganPembayaran.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  tagihanId: text('tagihan_id').notNull().references(() => keuanganTagihan.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  amountPaid: real('amount_paid').notNull(), // Can be partial
});

// -------------------------------------------------------------
// AKUNTANSI KEUANGAN
// -------------------------------------------------------------
export const keuanganBukuKas = sqliteTable('keuangan_buku_kas', {
  id: text('id').primaryKey(),
  transactionDate: text('transaction_date').notNull(),
  type: text('type').notNull(), // "In" | "Out"
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  referenceId: text('reference_id'), // e.g. receiptNumber
  saldo: real('saldo').notNull(),
  createdAt: text('created_at').notNull(),
});

export const keuanganRekonsiliasi = sqliteTable('keuangan_rekonsiliasi', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  systemAmount: real('system_amount').notNull(),
  bankAmount: real('bank_amount').notNull(),
  difference: real('difference').notNull(),
  status: text('status').notNull(), // "Matched" | "Unmatched" | "Resolved"
  notes: text('notes'),
  resolvedAt: text('resolved_at'),
});



