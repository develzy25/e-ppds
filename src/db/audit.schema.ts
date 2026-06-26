import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const systemAuditLogs = sqliteTable('system_audit_logs', {
  id: text('id').primaryKey(),
  module: text('module').notNull(), // e.g. "MASTER_SANTRI", "KEUANGAN_TAGIHAN"
  entity: text('entity').notNull(), // e.g. "santri", "invoices"
  entityId: text('entity_id').notNull(), // The ID of the record being modified
  action: text('action').notNull(), // Enum: CREATE, UPDATE, DELETE, RESTORE, LOGIN, LOGOUT, APPROVE, REJECT, EXPORT, IMPORT
  beforeData: text('before_data'), // JSON string
  afterData: text('after_data'), // JSON string
  performedBy: text('performed_by').notNull(), // User ID
  performedAt: text('performed_at').notNull(), // ISO timestamp
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  remarks: text('remarks'), // Optional reason or context
});
