import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { masterSantri } from '../../master/schemas/master.schema';

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
  santriId: text('santri_id').references(() => masterSantri.id, { onDelete: 'set null', onUpdate: 'cascade' }),
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
