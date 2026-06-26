import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { masterAcademicYear } from '../../master/schemas/master.schema';

// -------------------------------------------------------------
// KAS (BESAR & KECIL)
// -------------------------------------------------------------
export const bendaharaKas = sqliteTable('bendahara_kas', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "Kas Besar Yayasan", "Kas Kecil Operasional"
  type: text('type').notNull(), // "Besar" | "Kecil"
  saldo: real('saldo').notNull().default(0),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

export const bendaharaMutasiKas = sqliteTable('bendahara_mutasi_kas', {
  id: text('id').primaryKey(),
  kasId: text('kas_id').notNull().references(() => bendaharaKas.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  transactionDate: text('transaction_date').notNull(),
  type: text('type').notNull(), // "In" | "Out"
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  referenceId: text('reference_id'), // can link to LPJ or Pengajuan
  saldoAfter: real('saldo_after').notNull(),
  createdAt: text('created_at').notNull(),
});

// -------------------------------------------------------------
// ANGGARAN (RAB & PENGAJUAN)
// -------------------------------------------------------------
export const bendaharaRab = sqliteTable('bendahara_rab', {
  id: text('id').primaryKey(),
  departmentId: text('department_id').notNull(), // References Master Department
  academicYearId: text('academic_year_id').notNull().references(() => masterAcademicYear.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  title: text('title').notNull(),
  totalBudget: real('total_budget').notNull(),
  status: text('status').notNull(), // "Draft" | "Submitted" | "Approved" | "Rejected"
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const bendaharaRabItems = sqliteTable('bendahara_rab_items', {
  id: text('id').primaryKey(),
  rabId: text('rab_id').notNull().references(() => bendaharaRab.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  subtotal: real('subtotal').notNull(),
});

export const bendaharaPengajuanDana = sqliteTable('bendahara_pengajuan_dana', {
  id: text('id').primaryKey(),
  requestNumber: text('request_number').unique().notNull(),
  rabItemId: text('rab_item_id').references(() => bendaharaRabItems.id, { onDelete: 'set null', onUpdate: 'cascade' }), // Optional if it's outside RAB
  departmentId: text('department_id').notNull(),
  title: text('title').notNull(),
  amountRequested: real('amount_requested').notNull(),
  amountApproved: real('amount_approved'),
  status: text('status').notNull(), // "Pending" | "Approved" | "Rejected" | "Disbursed"
  requestedBy: text('requested_by').notNull(), // User ID
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const bendaharaApproval = sqliteTable('bendahara_approval', {
  id: text('id').primaryKey(),
  referenceId: text('reference_id').notNull(), // References Pengajuan Dana or RAB
  referenceType: text('reference_type').notNull(), // "Pengajuan" | "RAB"
  approverId: text('approver_id').notNull(), // User ID
  action: text('action').notNull(), // "Approve" | "Reject" | "Revision"
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

// -------------------------------------------------------------
// DOKUMEN (LPJ & NOTA)
// -------------------------------------------------------------
export const bendaharaLpj = sqliteTable('bendahara_lpj', {
  id: text('id').primaryKey(),
  pengajuanId: text('pengajuan_id').notNull().references(() => bendaharaPengajuanDana.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  title: text('title').notNull(),
  amountSpent: real('amount_spent').notNull(),
  amountReturned: real('amount_returned').default(0),
  status: text('status').notNull(), // "Submitted" | "Verified" | "Rejected"
  submittedBy: text('submitted_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const bendaharaNota = sqliteTable('bendahara_nota', {
  id: text('id').primaryKey(),
  lpjId: text('lpj_id').notNull().references(() => bendaharaLpj.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  fileUrl: text('file_url').notNull(),
  description: text('description'),
  amount: real('amount').notNull(),
});

// -------------------------------------------------------------
// AKUNTANSI (JURNAL, BUKU BESAR, NERACA)
// -------------------------------------------------------------
export const bendaharaAkun = sqliteTable('bendahara_akun', {
  id: text('id').primaryKey(),
  code: text('code').unique().notNull(), // e.g. "101", "401"
  name: text('name').notNull(), // e.g. "Kas Tunai", "Pendapatan SPP"
  type: text('type').notNull(), // "Asset" | "Liability" | "Equity" | "Revenue" | "Expense"
  normalBalance: text('normal_balance').notNull(), // "Debit" | "Credit"
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

export const bendaharaJurnal = sqliteTable('bendahara_jurnal', {
  id: text('id').primaryKey(),
  journalNumber: text('journal_number').unique().notNull(),
  date: text('date').notNull(),
  description: text('description').notNull(),
  referenceId: text('reference_id'), // Optional link to Mutasi, Penerimaan, LPJ
  createdAt: text('created_at').notNull(),
  createdBy: text('created_by').notNull(),
});

export const bendaharaJurnalDetail = sqliteTable('bendahara_jurnal_detail', {
  id: text('id').primaryKey(),
  jurnalId: text('jurnal_id').notNull().references(() => bendaharaJurnal.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  akunId: text('akun_id').notNull().references(() => bendaharaAkun.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  debit: real('debit').notNull().default(0),
  credit: real('credit').notNull().default(0),
});
