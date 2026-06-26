import { sqliteTable, text, integer, unique, index } from 'drizzle-orm/sqlite-core';

// -------------------------------------------------------------
// CORE PONDOK & ACADEMIC
// -------------------------------------------------------------
export const pondoks = sqliteTable('pondoks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

export const masterAcademicYear = sqliteTable('master_academic_year', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "2026/2027"
  status: text('status').notNull(), // "Aktif" | "Tidak Aktif"
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

export const masterPeriod = sqliteTable('master_period', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "Periode Kepengurusan 2026-2029"
  status: text('status').notNull(),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

// -------------------------------------------------------------
// RBAC (ROLE & PERMISSION)
// -------------------------------------------------------------
export const masterRole = sqliteTable('master_role', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(), // e.g. "SUPER_ADMIN", "BENDAHARA"
  description: text('description'),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

export const masterPermission = sqliteTable('master_permission', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(), // e.g. "keuangan.tagihan.view"
  description: text('description'),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

export const rolePermissions = sqliteTable('role_permissions', {
  id: text('id').primaryKey(),
  roleId: text('role_id').notNull().references(() => masterRole.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  permissionId: text('permission_id').notNull().references(() => masterPermission.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

// -------------------------------------------------------------
// INFRASTRUCTURE (ROOM & BLOCK)
// -------------------------------------------------------------
export const masterBlock = sqliteTable('master_block', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "Blok A", "Blok B"
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

export const masterRoom = sqliteTable('master_room', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "Kamar A-01"
  capacity: integer('capacity').notNull(),
  blockId: text('block_id').notNull().references(() => masterBlock.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

// -------------------------------------------------------------
// EDUCATION (SCHOOL & CLASS)
// -------------------------------------------------------------
export const masterSchool = sqliteTable('master_school', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "MTs PPDS", "MA PPDS"
  type: text('type').notNull(), // "Formal" | "Diniyah"
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

export const masterClass = sqliteTable('master_class', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "Kelas 7A", "Ula 1"
  schoolId: text('school_id').notNull().references(() => masterSchool.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

// -------------------------------------------------------------
// ORGANIZATION (DEPARTMENT & POSITION)
// -------------------------------------------------------------
export const masterDepartment = sqliteTable('master_department', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "Keamanan", "Pendidikan"
  type: text('type').notNull(), // "Divisi", "Seksi"
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

export const masterPosition = sqliteTable('master_position', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "Ketua Keamanan", "Anggota"
  departmentId: text('department_id').notNull().references(() => masterDepartment.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

// -------------------------------------------------------------
// ENTITIES (SANTRI & PENGURUS)
// -------------------------------------------------------------
export const masterSantri = sqliteTable('master_santri', {
  id: text('id').primaryKey(),
  nis: text('nis').unique().notNull(),
  name: text('name').notNull(),
  gender: text('gender').notNull(), // "L" | "P"
  statusAktif: text('status_aktif').notNull(), // "Aktif" | "Alumni"
  roomId: text('room_id').references(() => masterRoom.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  classFormalId: text('class_formal_id').references(() => masterClass.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  classDiniyahId: text('class_diniyah_id').references(() => masterClass.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  academicYearId: text('academic_year_id').notNull().references(() => masterAcademicYear.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
}, (t) => ({
  idxSantriAcademicYear: index('idx_santri_academic_year').on(t.academicYearId),
}));

export const masterPengurus = sqliteTable('master_pengurus', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').references(() => masterSantri.id, { onDelete: 'set null', onUpdate: 'cascade' }), // if the pengurus is also a santri
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  statusAktif: text('status_aktif').notNull(), // "Aktif" | "Nonaktif"
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});

export const pengurusPositions = sqliteTable('pengurus_positions', {
  id: text('id').primaryKey(),
  pengurusId: text('pengurus_id').notNull().references(() => masterPengurus.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  positionId: text('position_id').notNull().references(() => masterPosition.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  periodId: text('period_id').notNull().references(() => masterPeriod.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  status: text('status').notNull(), // "Aktif" | "Selesai"
}, (t) => ({
  unqPengurusPositionPeriod: unique('unq_pengurus_position_period').on(t.pengurusId, t.positionId, t.periodId),
}));

export const pengurusRoles = sqliteTable('pengurus_roles', {
  id: text('id').primaryKey(),
  pengurusId: text('pengurus_id').notNull().references(() => masterPengurus.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  roleId: text('role_id').notNull().references(() => masterRole.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});
