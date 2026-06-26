import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const bumpServices = sqliteTable('bump_services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "Laundry Kiloan", "Jasa Titip"
  type: text('type').notNull(), // "POS" | "Laundry" | "OnlineOrder"
  basePrice: real('base_price').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const bumpInventory = sqliteTable('bump_inventory', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "Sabun Mandi", "Air Mineral"
  sku: text('sku').unique().notNull(),
  stock: integer('stock').notNull().default(0),
  sellingPrice: real('selling_price').notNull(),
  purchasePrice: real('purchase_price').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const bumpInventoryMovements = sqliteTable('bump_inventory_movements', {
  id: text('id').primaryKey(),
  inventoryId: text('inventory_id').notNull().references(() => bumpInventory.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  type: text('type').notNull(), // "In" | "Out"
  quantity: integer('quantity').notNull(),
  reason: text('reason'), // e.g. "Restock", "Penjualan", "Rusak"
  recordedAt: text('recorded_at').notNull(),
});

export const bumpTransactions = sqliteTable('bump_transactions', {
  id: text('id').primaryKey(),
  transactionNumber: text('transaction_number').unique().notNull(),
  customerName: text('customer_name'), // Can be santri name or guest
  totalAmount: real('total_amount').notNull(),
  type: text('type').notNull(), // "POS" | "Laundry" | "OnlineOrder"
  status: text('status').notNull(), // "Pending" | "Paid" | "Cancelled"
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const bumpOrderItems = sqliteTable('bump_order_items', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id').notNull().references(() => bumpTransactions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  inventoryId: text('inventory_id').references(() => bumpInventory.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  serviceId: text('service_id').references(() => bumpServices.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  subtotal: real('subtotal').notNull(),
});

export const bumpLaundryOrders = sqliteTable('bump_laundry_orders', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id').unique().notNull().references(() => bumpTransactions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  weightKg: real('weight_kg').notNull(),
  status: text('status').notNull(), // "Received" | "Washing" | "Ironing" | "Done" | "Delivered"
  estimatedDoneAt: text('estimated_done_at'),
});

export const bumpOnlineOrders = sqliteTable('bump_online_orders', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id').unique().notNull().references(() => bumpTransactions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  marketplaceUrl: text('marketplace_url'),
  productName: text('product_name').notNull(),
  shippingCost: real('shipping_cost').notNull().default(0),
  serviceFee: real('service_fee').notNull().default(0), // Jasa Pembelian
  status: text('status').notNull(), // "Ordered" | "Shipped" | "Arrived" | "HandedOver"
});

export const bumpPayments = sqliteTable('bump_payments', {
  id: text('id').primaryKey(),
  transactionId: text('transaction_id').notNull().references(() => bumpTransactions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  amountPaid: real('amount_paid').notNull(),
  paymentMethod: text('payment_method').notNull(), // "Cash" | "Transfer" | "E-Wallet"
  paidAt: text('paid_at').notNull(),
});
