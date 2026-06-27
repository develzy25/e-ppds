import { sqliteTable, text, integer, unique, index } from 'drizzle-orm/sqlite-core';
import { pondoks } from '../../core/schemas/core.schema';


// -------------------------------------------------------------
// CORE PONDOK & ACADEMIC
// -------------------------------------------------------------
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
  name: text('name').notNull(), // DEPRECATED: Do not use, use fullName
  fullName: text('full_name'), // NEW field
  
  // STATUS & ENROLLMENT
  studentStatus: text('student_status'), // e.g. "Aktif", "Alumni", "Cuti", "Keluar", "Pindah"
  admissionType: text('admission_type'), // e.g. "Baru", "Pindahan", "Mutasi"
  entryYear: text('entry_year'),
  registrationWave: text('registration_wave'),
  registrationNumber: text('registration_number'),
  previousSchool: text('previous_school'),
  boardingEntryDate: text('boarding_entry_date'),
  
  // PERSONAL DATA
  photoUrl: text('photo_url'),
  nisn: text('nisn'),
  nik: text('nik'),
  familyCardNumber: text('family_card_number'),
  birthPlace: text('birth_place'),
  birthDate: text('birth_date'),
  gender: text('gender').notNull(), // "L" | "P"
  siblingCount: integer('sibling_count'),
  childOrder: integer('child_order'),
  religion: text('religion'),
  hobby: text('hobby'),
  ambition: text('ambition'),
  nationality: text('nationality'),
  
  // MEDICAL & EMERGENCY
  bloodType: text('blood_type'),
  height: integer('height'), // in cm
  weight: integer('weight'), // in kg
  medicalHistory: text('medical_history'),
  allergies: text('allergies'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  
  // CONTACT & ADDRESS
  studentPhone: text('student_phone'),
  studentEmail: text('student_email'),
  addressLine1: text('address_line1'),
  addressLine2: text('address_line2'),
  hamlet: text('hamlet'),
  village: text('village'),
  rt: text('rt'),
  rw: text('rw'),
  district: text('district'),
  city: text('city'),
  province: text('province'),
  postalCode: text('postal_code'),
  
  // PARENT (FATHER)
  fatherNik: text('father_nik'),
  fatherName: text('father_name'),
  fatherBirthPlace: text('father_birth_place'),
  fatherBirthDate: text('father_birth_date'),
  fatherOccupation: text('father_occupation'),
  fatherCompany: text('father_company'),
  fatherJobAddress: text('father_job_address'),
  fatherEducation: text('father_education'),
  fatherPhone: text('father_phone'),
  fatherIncome: text('father_income'),
  
  // PARENT (MOTHER)
  motherNik: text('mother_nik'),
  motherName: text('mother_name'),
  motherBirthPlace: text('mother_birth_place'),
  motherBirthDate: text('mother_birth_date'),
  motherOccupation: text('mother_occupation'),
  motherCompany: text('mother_company'),
  motherJobAddress: text('mother_job_address'),
  motherEducation: text('mother_education'),
  motherPhone: text('mother_phone'),
  motherIncome: text('mother_income'),
  
  // RELATIONS (EXISTING)
  statusAktif: text('status_aktif').notNull(), // Legacy status
  roomId: text('room_id').references(() => masterRoom.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  classFormalId: text('class_formal_id').references(() => masterClass.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  classDiniyahId: text('class_diniyah_id').references(() => masterClass.id, { onDelete: 'set null', onUpdate: 'cascade' }),
  academicYearId: text('academic_year_id').notNull().references(() => masterAcademicYear.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  
  // AUDIT
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
