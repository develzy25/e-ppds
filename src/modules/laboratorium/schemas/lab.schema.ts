import { sqliteTable, text, integer, real, unique, index } from 'drizzle-orm/sqlite-core';
import { periodes, pondoks, users, masterRoles } from '@/modules/core/schemas/core.schema';
import { masterSantri as santri } from '@/modules/master/schemas/master.schema';
import { keuanganBukuKas as accounts } from '@/modules/keuangan/schemas/keuangan.schema';

export const labComputers = sqliteTable('lab_computers', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(), // e.g. "PC-01"
  status: text('status').notNull(), // "Available" | "In Use" | "Maintenance"
  ipAddress: text('ip_address'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const labTariffs = sqliteTable('lab_tariffs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "Tarif Reguler", "Tarif Anggota"
  pricePerHour: real('price_per_hour').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

export const labSessions = sqliteTable('lab_sessions', {
  id: text('id').primaryKey(),
  computerId: text('computer_id').notNull().references(() => labComputers.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  userId: text('user_id'), // could be user ID or santri ID
  santriId: text('santri_id').references(() => santri.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  tariffId: text('tariff_id').notNull().references(() => labTariffs.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  totalCost: real('total_cost').default(0), // Calculated at end_time
  status: text('status').notNull(), // "Running" | "Finished"
});

export const labServices = sqliteTable('lab_services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "Print Hitam Putih", "Scan", "Fotocopy"
  price: real('price').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
});

export const labInventory = sqliteTable('lab_inventory', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "Kertas A4", "Tinta Printer"
  stock: integer('stock').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});

export const labTransactions = sqliteTable('lab_transactions', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').unique().notNull(),
  sessionId: text('session_id').references(() => labSessions.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  totalAmount: real('total_amount').notNull(),
  status: text('status').notNull(), // "Unpaid" | "Paid" | "Void"
  paymentMethod: text('payment_method'), // "Cash" | "Transfer"
  paidAt: text('paid_at'),
  createdAt: text('created_at').notNull(),
});

export const labTransactionItems = sqliteTable('lab_transaction_items', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id').notNull().references(() => labTransactions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  serviceId: text('service_id').references(() => labServices.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  inventoryId: text('inventory_id').references(() => labInventory.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  description: text('description').notNull(), // e.g. "Billing 2 Jam", "Print 10 lbr"
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  subtotal: real('subtotal').notNull(),
});

export const posTransactions = sqliteTable('pos_transactions', {
  id: text('id').primaryKey(), // LAB-YYYY-XXXXX
  transactionType: text('transaction_type').notNull(), // "Rental Komputer" | "Jasa Laboratorium"
  billingSessionId: text('billing_session_id').references(() => labSessions.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  totalAmount: real('total_amount').notNull(),
  status: text('status').notNull(), // "Menunggu Pembayaran" | "Lunas" | "Dibatalkan"
  cashierName: text('cashier_name'),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
});

export const posTransactionItems = sqliteTable('pos_transaction_items', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id').notNull().references(() => posTransactions.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  serviceRateId: text('service_rate_id').references(() => labServices.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  qty: integer('qty').notNull(),
  priceAtSale: real('price_at_sale').notNull(),
});

export const posPayments = sqliteTable('pos_payments', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id').notNull().references(() => posTransactions.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  amountPaid: real('amount_paid').notNull(),
  paymentMethod: text('payment_method').notNull(), // "Tunai" | "Transfer" | "QRIS"
  timestamp: text('timestamp').notNull(),
});

export const cashBooks = sqliteTable('cash_books', {
  id: text('id').primaryKey(),
  date: text('date').notNull(), // YYYY-MM-DD
  kasAwal: real('kas_awal').notNull(),
  pemasukanBilling: real('pemasukan_billing').notNull(),
  pemasukanJasa: real('pemasukan_jasa').notNull(),
  pengeluaran: real('pengeluaran').notNull(),
  kasAkhir: real('kas_akhir').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const cashMovements = sqliteTable('cash_movements', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  type: text('type').notNull(), // "Debit" | "Kredit"
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const cashDeposits = sqliteTable('cash_deposits', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  totalPemasukan: real('total_pemasukan').notNull(),
  jumlahDisetor: real('jumlah_disetor').notNull(),
  saldoOperasional: real('saldo_operasional').notNull(),
  keterangan: text('keterangan'),
  verifiedBy: text('verified_by').references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

// =============================================================
// 9. APPROVAL ENGINE TERPUSAT
// =============================================================

