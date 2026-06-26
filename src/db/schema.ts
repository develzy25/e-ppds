import { sqliteTable, text, integer, real, unique, index } from 'drizzle-orm/sqlite-core';

export * from './audit.schema';

// =============================================================
// 0. MULTI-TENANT PONDOK & GLOBAL SCHEMA
// =============================================================

export const pondoks = sqliteTable('pondoks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// =============================================================
// 1. CORE MODUL & ENTERPRISE RBAC (Periode, User, Role, Session, Settings)
// =============================================================

export const periodes = sqliteTable('periodes', {
  id: text('id').primaryKey(),
  yearName: text('year_name').notNull(), // e.g. "2026-2027"
  status: text('status').notNull(), // e.g. "Aktif", "Arsip"
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  avatarUrl: text('avatar_url'),
  passwordHash: text('password_hash').notNull(),
  sessionVersion: integer('session_version').notNull().default(1),
  permissionVersion: integer('permission_version').notNull().default(1),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const masterRoles = sqliteTable('master_roles', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(), // e.g., "ketua_umum", "kasie_keamanan"
  description: text('description'),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const masterPermissions = sqliteTable('master_permissions', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(), // e.g., "izin_create", "skkb_approve"
  description: text('description'),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const rolePermissions = sqliteTable('role_permissions', {
  id: text('id').primaryKey(),
  roleId: text('role_id').notNull().references(() => masterRoles.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  permissionId: text('permission_id').notNull().references(() => masterPermissions.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
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
  createdAt: text('created_at').notNull(),
});

export const systemSettings = sqliteTable('system_settings', {
  id: text('id').primaryKey(),
  key: text('key').unique().notNull(),
  value: text('value').notNull(),
  description: text('description'),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const taskAssignments = sqliteTable('task_assignments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  taskUnitId: text('task_unit_id').notNull(), // e.g. "petugas_registrasi"
  assignedBy: text('assigned_by').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  assignedAt: text('assigned_at').notNull(), // ISO Date-time
});

// =============================================================
// 2. SANTRI & WILAYAH MODUL
// =============================================================

export const bloks = sqliteTable('bloks', {
  id: text('id').primaryKey(), // e.g. "Blok_A"
  name: text('name').notNull(),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const kamars = sqliteTable('kamars', {
  id: text('id').primaryKey(), // e.g. "kam-a01"
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  blokId: text('blok_id').notNull().references(() => bloks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const santri = sqliteTable('santri', {
  id: text('id').primaryKey(),
  nis: text('nis').unique().notNull(),
  name: text('name').notNull(),
  gender: text('gender').notNull(), // "L" | "P"
  statusAktif: text('status_aktif').notNull(), // "Aktif" | "Alumni"
  currentKamarId: text('current_kamar_id').references(() => kamars.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  kelasFormal: text('kelas_formal'),
  kelasDiniyah: text('kelas_diniyah'),
  jamiyyah: text('jamiyyah'),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
}, (t) => ({
  idxSantriPeriod: index('idx_santri_period').on(t.periodId),
}));

export const santriRoomHistories = sqliteTable('santri_room_histories', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').notNull().references(() => santri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  kamarId: text('kamar_id').notNull().references(() => kamars.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

// =============================================================
// 3. ORGANISASI & PROGRAM KERJA MODUL
// =============================================================

export const seksis = sqliteTable('seksis', {
  id: text('id').primaryKey(), // e.g. "Keamanan"
  name: text('name').notNull(),
  type: text('type').notNull(), // e.g. "Operasional", "Usaha"
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const programKerjas = sqliteTable('program_kerjas', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  seksiId: text('seksi_id').notNull().references(() => seksis.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pjUserId: text('pj_user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  budget: real('budget').notNull(),
  status: text('status').notNull(), // e.g. "Draft", "Disetujui"
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

// =============================================================
// 4. INVENTARIS TERPUSAT MODUL
// =============================================================

export const inventaris = sqliteTable('inventaris', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // e.g. "Elektronik", "Sound"
  location: text('location').notNull(),
  condition: text('condition').notNull(), // e.g. "Baik", "Rusak"
  ownerSeksiId: text('owner_seksi_id').notNull().references(() => seksis.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const inventarisMutations = sqliteTable('inventaris_mutations', {
  id: text('id').primaryKey(),
  inventarisId: text('inventaris_id').notNull().references(() => inventaris.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  mutationType: text('mutation_type').notNull(), // e.g. "Masuk", "Mutasi Lokasi", "Rusak", "Keluar"
  previousLocation: text('previous_location'),
  newLocation: text('new_location').notNull(),
  notes: text('notes'),
  timestamp: text('timestamp').notNull(),
});

// =============================================================
// 5. KESEKRETARIATAN & PERSURATAN
// =============================================================

export const surats = sqliteTable('surats', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // "Masuk" | "Keluar"
  letterNumber: text('letter_number').notNull(),
  title: text('title').notNull(),
  sender: text('sender').notNull(),
  recipient: text('recipient').notNull(),
  status: text('status').notNull(), // e.g. "Draft", "Dikirim"
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
}, (t) => ({
  unqLetterNumPeriod: unique('unq_letter_num_period').on(t.letterNumber, t.periodId),
}));

export const disposisi = sqliteTable('disposisi', {
  id: text('id').primaryKey(),
  suratId: text('surat_id').notNull().references(() => surats.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  toSeksiId: text('to_seksi_id').notNull().references(() => seksis.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  note: text('note').notNull(),
  date: text('date').notNull(),
});

// =============================================================
// 6. KEUANGAN MODUL (Dengan Double-Entry Ledger)
// =============================================================

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').notNull().references(() => santri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  billingMonth: text('billing_month').notNull(), // e.g. "Juni 2026"
  totalAmount: real('total_amount').notNull(),
  status: text('status').notNull(), // "Lunas" | "Belum Bayar" | "Tunggakan"
  paymentMethod: text('payment_method'),
  paidAt: text('paid_at'),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
}, (t) => ({
  idxInvoiceSantri: index('idx_invoice_santri').on(t.santriId),
  idxInvoicePeriod: index('idx_invoice_period').on(t.periodId),
  unqInvoiceSantriMonthPeriod: unique('unq_invoice_santri_month_period').on(t.santriId, t.billingMonth, t.periodId),
}));

export const setoranSeksi = sqliteTable('setoran_seksi', {
  id: text('id').primaryKey(),
  seksiId: text('seksi_id').notNull().references(() => seksis.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  details: text('details').notNull(),
  amount: real('amount').notNull(),
  status: text('status').notNull(), // "Pending" | "Verified"
  verifiedBy: text('verified_by').references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const kasPondokMutasis = sqliteTable('kas_pondok_mutasis', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // "Debit" | "Kredit"
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  date: text('date').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

// Akun Buku Besar (COA - Chart of Accounts)
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  code: text('code').unique().notNull(), // e.g. "101.01" (Kas Utama)
  name: text('name').notNull(),
  type: text('type').notNull(), // "Asset" | "Liability" | "Equity" | "Revenue" | "Expense"
  parentId: text('parent_id'),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

// Jurnal Transaksi Double-Entry
export const journalEntries = sqliteTable('journal_entries', {
  id: text('id').primaryKey(),
  description: text('description').notNull(),
  date: text('date').notNull(),
  referenceId: text('reference_id'), // Referensi ke Invoice ID, Setoran ID, dsb.
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const journalDetails = sqliteTable('journal_details', {
  id: text('id').primaryKey(),
  journalEntryId: text('journal_entry_id').notNull().references(() => journalEntries.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  accountId: text('account_id').notNull().references(() => accounts.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  type: text('type').notNull(), // "Debit" | "Credit"
  amount: real('amount').notNull(),
});

// =============================================================
// 7. KEAMANAN MODUL
// =============================================================

export const perizinans = sqliteTable('perizinans', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').notNull().references(() => santri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  type: text('type').notNull(), // e.g. "Keluar Pondok"
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  status: text('status').notNull(), // "Diajukan" | "Aktif" | "Kembali"
  checkoutAt: text('checkout_at'),
  checkinAt: text('checkin_at'),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
}, (t) => ({
  idxPerizinanSantri: index('idx_perizinan_santri').on(t.santriId),
}));

export const pelanggarans = sqliteTable('pelanggarans', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').notNull().references(() => santri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  category: text('category').notNull(), // "Ringan" | "Sedang" | "Berat"
  description: text('description').notNull(),
  points: integer('points').notNull(),
  penalty: text('penalty').notNull(),
  status: text('status').notNull(), // "Dilaporkan" | "Selesai"
  reportedBy: text('reported_by').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const registrasiBarangs = sqliteTable('registrasi_barangs', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').notNull().references(() => santri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  itemType: text('item_type').notNull(), // "Motor" | "Elektronik" | "Kompor" | "Lainnya"
  brandModel: text('brand_model').notNull(),
  uniqueCode: text('unique_code').unique().notNull(), // Plat Nomor atau S/N
  status: text('status').notNull(), // "Aktif" | "Nonaktif"
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

// =============================================================
// 8. LABORATORIUM & BILLING MODUL
// =============================================================

export const labClients = sqliteTable('lab_clients', {
  id: text('id').primaryKey(),
  kodePc: text('kode_pc').unique().notNull(), // e.g. "PC-01"
  namaPc: text('nama_pc').notNull(),
  hostname: text('hostname').notNull(),
  macAddress: text('mac_address').notNull(),
  status: text('status').notNull(), // "Idle" | "Running" | "Paused" | "Offline" | "Maintenance"
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const labBillingRates = sqliteTable('lab_billing_rates', {
  id: text('id').primaryKey(),
  namaTarif: text('nama_tarif').notNull(), // e.g. "Reguler", "Gaming", "Pelatihan"
  hargaPerJam: real('harga_per_jam').notNull(),
  hargaPerMenit: real('harga_per_menit').notNull(),
  aktif: integer('aktif').notNull().default(1), // boolean 1 / 0
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const labSessions = sqliteTable('lab_sessions', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().references(() => labClients.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  santriId: text('santri_id').references(() => santri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  tarifId: text('tarif_id').notNull().references(() => labBillingRates.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  durationMinutes: integer('duration_minutes'),
  ratePerMinute: real('rate_per_minute').notNull(),
  totalAmount: real('total_amount'),
  status: text('status').notNull(), // "Running" | "Paused" | "Finished" | "Force Stop"
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
});

export const labAgentLogs = sqliteTable('lab_agent_logs', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().references(() => labClients.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  hostname: text('hostname').notNull(),
  macAddress: text('mac_address').notNull(),
  status: text('status').notNull(),
  uptime: integer('uptime').notNull(), // in seconds
  lastSeen: text('last_seen').notNull(),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const labServiceRates = sqliteTable('lab_service_rates', {
  id: text('id').primaryKey(),
  namaJasa: text('nama_jasa').notNull(), // e.g. "Print Hitam Putih", "Fotocopy"
  satuan: text('satuan').notNull(), // e.g. "Lembar", "Buku"
  harga: real('harga').notNull(),
  aktif: integer('aktif').notNull().default(1),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
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
  serviceRateId: text('service_rate_id').references(() => labServiceRates.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
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

export const approvalPolicies = sqliteTable('approval_policies', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // e.g. "RAB"
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
  entityType: text('entity_type').notNull(), // e.g. "RAB", "Mutasi"
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
  status: text('status').notNull(), // "Pending" | "Approved" | "Skipped"
});

export const approvalHistories = sqliteTable('approval_histories', {
  id: text('id').primaryKey(),
  approvalRequestId: text('approval_request_id').notNull().references(() => approvalRequests.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  action: text('action').notNull(), // "Approved" | "Rejected"
  note: text('note'),
  timestamp: text('timestamp').notNull(),
});

// =============================================================
// 10. NOTIFIKASI & FILE TERPUSAT
// =============================================================

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  category: text('category').notNull(), // e.g. "anggaran", "perizinan"
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const notificationTargets = sqliteTable('notification_targets', {
  id: text('id').primaryKey(),
  notificationId: text('notification_id').notNull().references(() => notifications.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
});

export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  fileSize: integer('file_size').notNull(), // in Bytes
  uploaderId: text('uploader_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  deletedAt: text('deleted_at'),
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
// 11. AUDIT LOG MODUL
// =============================================================

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  action: text('action').notNull(), // e.g. "SKKB_CREATE"
  details: text('details').notNull(),
  timestamp: text('timestamp').notNull(), // Unix timestamp or string
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
}, (t) => ({
  idxAuditPeriod: index('idx_audit_period').on(t.periodId),
}));

// =============================================================
// 12. PENDIDIKAN (Diniyah, Wajar, Murottil)
// =============================================================

export const diniyahCurriculums = sqliteTable('diniyah_curriculums', {
  id: text('id').primaryKey(),
  subjectName: text('subject_name').notNull(),
  description: text('description'),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const diniyahSchedules = sqliteTable('diniyah_schedules', {
  id: text('id').primaryKey(),
  className: text('class_name').notNull(),
  subjectId: text('subject_id').notNull().references(() => diniyahCurriculums.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  ustadzName: text('ustadz_name').notNull(),
  day: text('day').notNull(), // e.g. "Senin"
  timeStart: text('time_start').notNull(),
  timeEnd: text('time_end').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const diniyahGrades = sqliteTable('diniyah_grades', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').notNull().references(() => santri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  subjectId: text('subject_id').notNull().references(() => diniyahCurriculums.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  examType: text('exam_type').notNull(), // e.g. "Harian", "Ujian"
  score: real('score').notNull(),
  gradeDate: text('grade_date').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
}, (t) => ({
  unqDiniyahGrade: unique('unq_diniyah_grade').on(t.santriId, t.subjectId, t.examType, t.periodId),
}));

export const wajarAttendances = sqliteTable('wajar_attendances', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').notNull().references(() => santri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  date: text('date').notNull(), // ISO Date
  status: text('status').notNull(), // "Hadir" | "Izin" | "Sakit" | "Alfa"
  notes: text('notes'),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const murottilHafalans = sqliteTable('murottil_hafalans', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').notNull().references(() => santri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  date: text('date').notNull(),
  surahName: text('surah_name').notNull(),
  startVerse: integer('start_verse').notNull(),
  endVerse: integer('end_verse').notNull(),
  statusKelancaran: text('status_kelancaran').notNull(), // "Lancar" | "Kurang" | "Belum"
  notes: text('notes'),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

// =============================================================
// 13. MEDIA MODUL
// =============================================================

export const mediaPublications = sqliteTable('media_publications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(), // "Galeri" | "Website" | "Sosmed" | "Buletin"
  contentUrl: text('content_url').notNull(),
  publishedBy: text('published_by').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  publishDate: text('publish_date').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

// =============================================================
// 14. MUSYAWARAH MODUL
// =============================================================

export const musyawarahs = sqliteTable('musyawarahs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  agenda: text('agenda').notNull(),
  date: text('date').notNull(),
  status: text('status').notNull(), // "Draft" | "Berjalan" | "Selesai"
  resultNote: text('result_note'),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const musyawarahVotes = sqliteTable('musyawarah_votes', {
  id: text('id').primaryKey(),
  musyawarahId: text('musyawarah_id').notNull().references(() => musyawarahs.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  voteChoice: text('vote_choice').notNull(), // "Setuju" | "Menolak" | "Abstain"
  timestamp: text('timestamp').notNull(),
});

// =============================================================
// 15. KESEHATAN (POSKESTREN)
// =============================================================

export const rekamMedis = sqliteTable('rekam_medis', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').notNull().references(() => santri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  visitDate: text('visit_date').notNull(),
  symptoms: text('symptoms').notNull(),
  diagnosis: text('diagnosis').notNull(),
  therapy: text('therapy').notNull(),
  referredTo: text('referred_to'),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const apotekObats = sqliteTable('apotek_obats', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  stock: integer('stock').notNull(),
  unit: text('unit').notNull(), // e.g. "Tablet", "Botol"
  expiredDate: text('expired_date').notNull(),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const rekamMedisObats = sqliteTable('rekam_medis_obats', {
  id: text('id').primaryKey(),
  rekamMedisId: text('rekam_medis_id').notNull().references(() => rekamMedis.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  obatId: text('obat_id').notNull().references(() => apotekObats.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  qty: integer('qty').notNull(),
});

// =============================================================
// 16. HUMASY & LOGISTIK
// =============================================================

export const bukuTamus = sqliteTable('buku_tamus', {
  id: text('id').primaryKey(),
  guestName: text('guest_name').notNull(),
  institution: text('institution'),
  purpose: text('purpose').notNull(),
  visitedUserId: text('visited_user_id').notNull().references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  visitDate: text('visit_date').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const dapurLogistiks = sqliteTable('dapur_logistiks', {
  id: text('id').primaryKey(),
  itemName: text('item_name').notNull(),
  stock: real('stock').notNull(),
  unit: text('unit').notNull(),
  lastUpdated: text('last_updated').notNull(),
});

// =============================================================
// 18. TAKMIR MASJID
// =============================================================

export const takmirJadwals = sqliteTable('takmir_jadwals', {
  id: text('id').primaryKey(),
  dutyType: text('duty_type').notNull(), // "Imam" | "Khatib" | "Bilal"
  officerName: text('officer_name').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

// =============================================================
// 19. PEMBANGUNAN
// =============================================================

export const pembangunanProyeks = sqliteTable('pembangunan_proyeks', {
  id: text('id').primaryKey(),
  projectName: text('project_name').notNull(),
  progressPercent: real('progress_percent').notNull(),
  startDate: text('start_date').notNull(),
  targetDate: text('target_date').notNull(),
  contractorName: text('contractor_name').notNull(),
  budget: real('budget').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

// =============================================================
// 20. BUMP
// =============================================================

export const bumpTransaksis = sqliteTable('bump_transaksis', {
  id: text('id').primaryKey(),
  unitName: text('unit_name').notNull(), // e.g. "Laundry", "Air Minum"
  amount: real('amount').notNull(),
  details: text('details').notNull(),
  timestamp: text('timestamp').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
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
});

export const documentSequences = sqliteTable('document_sequences', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "SuratMasuk", "Perizinan"
  prefix: text('prefix').notNull(), // e.g. "OUT-KEAM-"
  currentValue: integer('current_value').notNull().default(0),
  suffix: text('suffix'),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const systemEvents = sqliteTable('system_events', {
  id: text('id').primaryKey(),
  eventName: text('event_name').notNull(), // e.g. "invoice_created"
  payload: text('payload').notNull(), // JSON text
  status: text('status').notNull(), // "Pending" | "Processed" | "Failed"
  createdAt: text('created_at').notNull(),
  processedAt: text('processed_at'),
});

export const backupLogs = sqliteTable('backup_logs', {
  id: text('id').primaryKey(),
  backupTime: text('backup_time').notNull(),
  backupType: text('backup_type').notNull(), // "Auto" | "Manual"
  fileSize: integer('file_size').notNull(), // in Bytes
  status: text('status').notNull(), // "Success" | "Failed"
  filepath: text('filepath').notNull(),
});

export const schemaMigrations = sqliteTable('schema_migrations', {
  id: text('id').primaryKey(),
  version: text('version').notNull(),
  appliedAt: text('applied_at').notNull(),
});

// =============================================================
// 19. LAYANAN KATALOG, PRICING, MAP KEUANGAN, & LEDGER SANTRI (v1.2)
// =============================================================

export const serviceCatalogs = sqliteTable('service_catalogs', {
  id: text('id').primaryKey(), // e.g. "lab-print", "laundry-kiloan"
  name: text('name').notNull(),
  module: text('module').notNull(), // e.g. "Laboratorium", "BUMP", "Keuangan"
  description: text('description'),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const servicePrices = sqliteTable('service_prices', {
  id: text('id').primaryKey(),
  catalogId: text('catalog_id').notNull().references(() => serviceCatalogs.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  priceName: text('price_name').notNull(), // e.g. "Reguler", "Kilat"
  price: real('price').notNull(),
  unit: text('unit').notNull(), // e.g. "lembar", "kg", "sesi"
  isActive: integer('is_active').notNull().default(1), // 1 = true, 0 = false
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const accountMappings = sqliteTable('account_mappings', {
  id: text('id').primaryKey(),
  module: text('module').notNull(), // e.g. "LAB", "BUMP", "FINANCE"
  transactionType: text('transaction_type').notNull(), // e.g. "LAB_PRINT", "LAUNDRY", "SYAHRIYAH"
  debitAccountId: text('debit_account_id').notNull().references(() => accounts.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  creditAccountId: text('credit_account_id').notNull().references(() => accounts.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

export const studentAccounts = sqliteTable('student_accounts', {
  id: text('id').primaryKey(),
  santriId: text('santri_id').notNull().references(() => santri.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  currentBalance: real('current_balance').notNull().default(0),
  limitReceivable: real('limit_receivable').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
}, (t) => ({
  unqStudentAccountPeriod: unique('unq_student_account_period').on(t.santriId, t.periodId),
}));

export const studentLedgers = sqliteTable('student_ledgers', {
  id: text('id').primaryKey(),
  studentAccountId: text('student_account_id').notNull().references(() => studentAccounts.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  transactionId: text('transaction_id').references(() => posTransactions.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  type: text('type').notNull(), // "Debit" (Charges/Tagihan) | "Credit" (Payments/Pembayaran)
  amount: real('amount').notNull(),
  description: text('description').notNull(),
  timestamp: text('timestamp').notNull(),
  periodId: text('period_id').notNull().references(() => periodes.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  pondokId: text('pondok_id').notNull().references(() => pondoks.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
});

