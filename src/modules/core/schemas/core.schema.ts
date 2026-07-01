import { sqliteTable, text, integer, unique, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// =============================================================
// 0. MULTI-TENANT PONDOK & GLOBAL SCHEMA
// =============================================================

export const pondoks = sqliteTable('pondoks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


// =============================================================
// 1. CORE MODUL & ENTERPRISE RBAC (Periode, User, Role, Session, Settings)
// =============================================================

export const periodes = sqliteTable('periodes', {
  id: text('id').primaryKey(),
  yearName: text('year_name').notNull(), // e.g. "2026-2027"
  status: text('status').notNull(), // e.g. "Aktif", "Arsip"
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  avatarUrl: text('avatar_url'),
  passwordHash: text('password_hash').notNull(),
  pin: text('pin'),
  failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
  lockedUntil: text('locked_until'),
  sessionVersion: integer('session_version').notNull().default(1),
  permissionVersion: integer('permission_version').notNull().default(1),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


export const masterRoles = sqliteTable('master_roles', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(), // e.g., "ketua_umum", "kasie_keamanan"
  description: text('description'),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


export const masterPermissions = sqliteTable('master_permissions', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(), // e.g., "izin_create", "skkb_approve"
  description: text('description'),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


export const userRoles = sqliteTable('user_roles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  roleId: text('role_id').notNull().references(() => masterRoles.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  status: text('status').notNull(), // e.g. "Aktif", "Nonaktif"
  appointedAt: text('appointed_at'),
  endedAt: text('ended_at'),
  appointmentLetter: text('appointment_letter'),
}, (t) => ({
  unqUserRolePeriod: unique('unq_user_role_period').on(t.userId, t.roleId, t.periodId),
}));

export const userSessions = sqliteTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  token: text('token').unique().notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  ipAddress: text('ip_address'),
  device: text('device'),
  browser: text('browser'),
  os: text('os'),
  userAgent: text('user_agent'),
  lastActivity: text('last_activity'),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


export const systemSettings = sqliteTable('system_settings', {
  id: text('id').primaryKey(),
  key: text('key').unique().notNull(),
  value: text('value').notNull(),
  description: text('description'),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


export const taskAssignments = sqliteTable('task_assignments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  taskUnitId: text('task_unit_id').notNull(), // e.g. "petugas_registrasi"
  assignedBy: text('assigned_by').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  assignedAt: text('assigned_at').notNull(), // ISO Date-time,
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


// =============================================================
// 10. NOTIFIKASI & FILE TERPUSAT
// =============================================================

// Notifications table already exists here from before
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }), // Penerima notifikasi
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('info'), // 'info', 'warning', 'success', 'error', 'approval'
  category: text('category').notNull().default('general'), // e.g. "anggaran", "perizinan"
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  link: text('link'), // URL action jika di-klik
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


export const notificationTargets = sqliteTable('notification_targets', {
  id: text('id').primaryKey(),
  notificationId: text('notification_id').notNull().references(() => notifications.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  fileSize: integer('file_size').notNull(), // in Bytes
  uploaderId: text('uploader_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  fileId: text('file_id').notNull().references(() => files.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  entityType: text('entity_type').notNull(), // e.g. "surats", "perizinans"
  entityId: text('entity_id').notNull(),
}, (t) => ({
  idxAttachmentEntity: index('idx_attachment_entity').on(t.entityType, t.entityId),
}));

// =============================================================
// AUDIT LOGS & BACKGROUND JOBS
// =============================================================
export const systemAuditLogs = sqliteTable('system_audit_logs', {
  id: text('id').primaryKey(), // cuid or uuid
  tenantId: text('tenant_id').notNull().default('default'), // As per user request
  module: text('module').notNull(), // 'master', 'keuangan', 'dms', dll
  entityName: text('entity_name').notNull(), // 'santris', 'invoices', dll
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(), // 'CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'APPROVE'
  beforeData: text('before_data'), // JSON string snapshot
  afterData: text('after_data'), // JSON string snapshot
  performedBy: text('performed_by').notNull(), // Yang melakukan aksi
  ipAddress: text('ip_address'),
  device: text('device'),
  browser: text('browser'),
  userAgent: text('user_agent'),
  requestId: text('request_id'),
  sessionId: text('session_id'),
  remarks: text('remarks'),
  performedAt: integer('performed_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


export const backgroundJobs = sqliteTable('background_jobs', {
  id: text('id').primaryKey(),
  jobName: text('job_name').notNull(), // 'generate_pdf', 'broadcast_wa'
  payload: text('payload'), // JSON string data pekerjaan
  status: text('status').notNull().default('PENDING'), // 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
  attempts: integer('attempts').notNull().default(0),
  errorLog: text('error_log'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


// =============================================================
// 21. ENTERPRISE INFRASTRUCTURE & MUTATIONS (New Tables)
// =============================================================

export const stockMovements = sqliteTable('stock_movements', {
  id: text('id').primaryKey(),
  inventoryId: text('inventory_id').notNull(), // polymorphic: refers to apotekObats, inventaris, or dapurLogistiks
  itemType: text('item_type').notNull(), // "Apotek" | "Inventaris" | "Dapur"
  quantity: real('quantity').notNull(),
  movementType: text('movement_type').notNull(), // "IN" | "OUT" | "ADJUSTMENT" | "DAMAGE"
  referenceId: text('reference_id'), // e.g. transactionId, visitDate
  notes: text('notes'),
  timestamp: text('timestamp').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


export const documentSequences = sqliteTable('document_sequences', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "SuratMasuk", "Perizinan"
  prefix: text('prefix').notNull(), // e.g. "OUT-KEAM-"
  currentValue: integer('current_value').notNull().default(0),
  suffix: text('suffix'),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


export const systemEvents = sqliteTable('system_events', {
  id: text('id').primaryKey(),
  eventName: text('event_name').notNull(), // e.g. "invoice_created"
  payload: text('payload').notNull(), // JSON text
  status: text('status').notNull(), // "Pending" | "Processed" | "Failed"
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  processedAt: text('processed_at'),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


export const backupLogs = sqliteTable('backup_logs', {
  id: text('id').primaryKey(),
  backupTime: text('backup_time').notNull(),
  backupType: text('backup_type').notNull(), // "Auto" | "Manual"
  fileSize: integer('file_size').notNull(), // in Bytes
  status: text('status').notNull(), // "Success" | "Failed"
  filepath: text('filepath').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});


export const schemaMigrations = sqliteTable('schema_migrations', {
  id: text('id').primaryKey(),
  version: text('version').notNull(),
  appliedAt: text('applied_at').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

