import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

import { periodes, pondoks, masterRoles, users } from './core.schema';
// =============================================================
// GLOBAL APPROVAL ENGINE
// =============================================================

export const approvalPolicies = sqliteTable('approval_policies', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // e.g. "RAB", "SuratKeluar"
  minAmount: real('min_amount').notNull().default(0),
  maxAmount: real('max_amount'), // null means infinity/no limit
  requiredRoles: text('required_roles').notNull(), // JSON array of role IDs, e.g., '["role-bend", "role-ketum"]'
  version: integer('version').notNull().default(1),
  isActive: integer('is_active').notNull().default(1), // 1 = active, 0 = inactive
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const approvalRequests = sqliteTable('approval_requests', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // e.g. "RAB", "Mutasi", "SuratKeluar"
  entityId: text('entity_id').notNull(),
  status: text('status').notNull(), // "Pending" | "Approved" | "Rejected"
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const approvalSteps = sqliteTable('approval_steps', {
  id: text('id').primaryKey(),
  approvalRequestId: text('approval_request_id').notNull().references(() => approvalRequests.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  stepOrder: integer('step_order').notNull(),
  roleId: text('role_id').notNull().references(() => masterRoles.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  status: text('status').notNull(), // "Pending" | "Approved" | "Skipped" | "Rejected"
});

export const approvalHistories = sqliteTable('approval_histories', {
  id: text('id').primaryKey(),
  approvalRequestId: text('approval_request_id').notNull().references(() => approvalRequests.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  action: text('action').notNull(), // "Approved" | "Rejected"
  note: text('note'),
  timestamp: text('timestamp').notNull(),
});

