-- Skema Database DDL untuk Cloudflare D1 (SQLite) - PPDS ERP v1.1 - Enterprise Edition

PRAGMA foreign_keys = ON;

-- 0. MULTI-TENANT PONDOK
CREATE TABLE IF NOT EXISTS pondoks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 1. CORE MODUL & RBAC
CREATE TABLE IF NOT EXISTS periodes (
  id TEXT PRIMARY KEY,
  year_name TEXT NOT NULL,
  status TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  password_hash TEXT NOT NULL,
  session_version INTEGER NOT NULL DEFAULT 1,
  permission_version INTEGER NOT NULL DEFAULT 1,
  pondok_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS master_roles (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  pondok_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS master_permissions (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  pondok_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id TEXT PRIMARY KEY,
  role_id TEXT NOT NULL,
  permission_id TEXT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES master_roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES master_permissions(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  period_id TEXT NOT NULL,
  status TEXT NOT NULL,
  appointed_at TEXT,
  ended_at TEXT,
  appointment_letter TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (role_id) REFERENCES master_roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE(user_id, role_id, period_id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS task_assignments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  task_unit_id TEXT NOT NULL,
  assigned_by TEXT NOT NULL,
  assigned_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 2. SANTRI & WILAYAH MODUL
CREATE TABLE IF NOT EXISTS bloks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS kamars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  blok_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (blok_id) REFERENCES bloks(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS santri (
  id TEXT PRIMARY KEY,
  nis TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  status_aktif TEXT NOT NULL,
  current_kamar_id TEXT,
  kelas_formal TEXT,
  kelas_diniyah TEXT,
  jamiyyah TEXT,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (current_kamar_id) REFERENCES kamars(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS santri_room_histories (
  id TEXT PRIMARY KEY,
  santri_id TEXT NOT NULL,
  kamar_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (kamar_id) REFERENCES kamars(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 3. ORGANISASI & PROGRAM KERJA MODUL
CREATE TABLE IF NOT EXISTS seksis (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS program_kerjas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  seksi_id TEXT NOT NULL,
  pj_user_id TEXT NOT NULL,
  budget REAL NOT NULL,
  status TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (seksi_id) REFERENCES seksis(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pj_user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 4. INVENTARIS TERPUSAT MODUL
CREATE TABLE IF NOT EXISTS inventaris (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  condition TEXT NOT NULL,
  owner_seksi_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (owner_seksi_id) REFERENCES seksis(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS inventaris_mutations (
  id TEXT PRIMARY KEY,
  inventaris_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  mutation_type TEXT NOT NULL,
  previous_location TEXT,
  new_location TEXT NOT NULL,
  notes TEXT,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (inventaris_id) REFERENCES inventaris(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 5. KESEKRETARIATAN & PERSURATAN
CREATE TABLE IF NOT EXISTS surats (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  letter_number TEXT NOT NULL,
  title TEXT NOT NULL,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  status TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE(letter_number, period_id)
);

CREATE TABLE IF NOT EXISTS disposisi (
  id TEXT PRIMARY KEY,
  surat_id TEXT NOT NULL,
  to_seksi_id TEXT NOT NULL,
  note TEXT NOT NULL,
  date TEXT NOT NULL,
  FOREIGN KEY (surat_id) REFERENCES surats(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (to_seksi_id) REFERENCES seksis(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 6. KEUANGAN MODUL & DOUBLE-ENTRY LEDGER
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  santri_id TEXT NOT NULL,
  billing_month TEXT NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT,
  paid_at TEXT,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE(santri_id, billing_month, period_id)
);

CREATE TABLE IF NOT EXISTS setoran_seksi (
  id TEXT PRIMARY KEY,
  seksi_id TEXT NOT NULL,
  details TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL,
  verified_by TEXT,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (seksi_id) REFERENCES seksis(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS kas_pondok_mutasis (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parent_id TEXT,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  reference_id TEXT,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS journal_details (
  id TEXT PRIMARY KEY,
  journal_entry_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 7. KEAMANAN MODUL
CREATE TABLE IF NOT EXISTS perizinans (
  id TEXT PRIMARY KEY,
  santri_id TEXT NOT NULL,
  type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL,
  checkout_at TEXT,
  checkin_at TEXT,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS pelanggarans (
  id TEXT PRIMARY KEY,
  santri_id TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  penalty TEXT NOT NULL,
  status TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS registrasi_barangs (
  id TEXT PRIMARY KEY,
  santri_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  brand_model TEXT NOT NULL,
  unique_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 8. LABORATORIUM & BILLING MODUL
CREATE TABLE IF NOT EXISTS lab_billing_sessions (
  id TEXT PRIMARY KEY,
  client_pc TEXT NOT NULL,
  user_id TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  rate_per_min INTEGER NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS lab_pos_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS lab_pos_transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  details TEXT NOT NULL,
  amount REAL NOT NULL,
  cashier_name TEXT NOT NULL,
  timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lab_pos_transaction_items (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  qty INTEGER NOT NULL,
  price_at_sale REAL NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES lab_pos_transactions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (item_id) REFERENCES lab_pos_items(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 9. APPROVAL ENGINE TERPUSAT
CREATE TABLE IF NOT EXISTS approval_policies (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  min_amount REAL NOT NULL DEFAULT 0,
  max_amount REAL,
  required_roles TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS approval_requests (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  status TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS approval_steps (
  id TEXT PRIMARY KEY,
  approval_request_id TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  role_id TEXT NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (role_id) REFERENCES master_roles(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS approval_histories (
  id TEXT PRIMARY KEY,
  approval_request_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  note TEXT,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 10. NOTIFIKASI & FILE TERPUSAT
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_targets (
  id TEXT PRIMARY KEY,
  notification_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploader_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 11. AUDIT LOG MODUL
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 12. PENDIDIKAN (Diniyah, Wajar, Murottil)
CREATE TABLE IF NOT EXISTS diniyah_curriculums (
  id TEXT PRIMARY KEY,
  subject_name TEXT NOT NULL,
  description TEXT,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS diniyah_schedules (
  id TEXT PRIMARY KEY,
  class_name TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  ustadz_name TEXT NOT NULL,
  day TEXT NOT NULL,
  time_start TEXT NOT NULL,
  time_end TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES diniyah_curriculums(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS diniyah_grades (
  id TEXT PRIMARY KEY,
  santri_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  exam_type TEXT NOT NULL,
  score REAL NOT NULL,
  grade_date TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES diniyah_curriculums(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE(santri_id, subject_id, exam_type, period_id)
);

CREATE TABLE IF NOT EXISTS wajar_attendances (
  id TEXT PRIMARY KEY,
  santri_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS murottil_hafalans (
  id TEXT PRIMARY KEY,
  santri_id TEXT NOT NULL,
  date TEXT NOT NULL,
  surah_name TEXT NOT NULL,
  start_verse INTEGER NOT NULL,
  end_verse INTEGER NOT NULL,
  status_kelancaran TEXT NOT NULL,
  notes TEXT,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 13. MEDIA MODUL
CREATE TABLE IF NOT EXISTS media_publications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content_url TEXT NOT NULL,
  published_by TEXT NOT NULL,
  publish_date TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 14. MUSYAWARAH MODUL
CREATE TABLE IF NOT EXISTS musyawarahs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  agenda TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  result_note TEXT,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS musyawarah_votes (
  id TEXT PRIMARY KEY,
  musyawarah_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  vote_choice TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (musyawarah_id) REFERENCES musyawarahs(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 15. KESEHATAN (POSKESTREN)
CREATE TABLE IF NOT EXISTS rekam_medis (
  id TEXT PRIMARY KEY,
  santri_id TEXT NOT NULL,
  visit_date TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  therapy TEXT NOT NULL,
  referred_to TEXT,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS apotek_obats (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stock INTEGER NOT NULL,
  unit TEXT NOT NULL,
  expired_date TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS rekam_medis_obats (
  id TEXT PRIMARY KEY,
  rekam_medis_id TEXT NOT NULL,
  obat_id TEXT NOT NULL,
  qty INTEGER NOT NULL,
  FOREIGN KEY (rekam_medis_id) REFERENCES rekam_medis(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (obat_id) REFERENCES apotek_obats(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 16. HUMASY & LOGISTIK
CREATE TABLE IF NOT EXISTS buku_tamus (
  id TEXT PRIMARY KEY,
  guest_name TEXT NOT NULL,
  institution TEXT,
  purpose TEXT NOT NULL,
  visited_user_id TEXT NOT NULL,
  visit_date TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (visited_user_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS dapur_logistiks (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  stock REAL NOT NULL,
  unit TEXT NOT NULL,
  last_updated TEXT NOT NULL
);

-- 17. KBR (KOPERASI BARU)
CREATE TABLE IF NOT EXISTS kbr_transactions (
  id TEXT PRIMARY KEY,
  cashier_name TEXT NOT NULL,
  total_amount REAL NOT NULL,
  timestamp TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS kbr_stocks (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL,
  pondok_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS kbr_transaction_items (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL,
  stock_id TEXT NOT NULL,
  qty INTEGER NOT NULL,
  price_at_sale REAL NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES kbr_transactions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (stock_id) REFERENCES kbr_stocks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 18. TAKMIR MASJID
CREATE TABLE IF NOT EXISTS takmir_jadwals (
  id TEXT PRIMARY KEY,
  duty_type TEXT NOT NULL,
  officer_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 19. PEMBANGUNAN
CREATE TABLE IF NOT EXISTS pembangunan_proyeks (
  id TEXT PRIMARY KEY,
  project_name TEXT NOT NULL,
  progress_percent REAL NOT NULL,
  start_date TEXT NOT NULL,
  target_date TEXT NOT NULL,
  contractor_name TEXT NOT NULL,
  budget REAL NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 20. BUMP
CREATE TABLE IF NOT EXISTS bump_transaksis (
  id TEXT PRIMARY KEY,
  unit_name TEXT NOT NULL,
  amount REAL NOT NULL,
  details TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 21. ENTERPRISE INFRASTRUCTURE & MUTATIONS (New Tables)
CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  inventory_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  quantity REAL NOT NULL,
  movement_type TEXT NOT NULL,
  reference_id TEXT,
  notes TEXT,
  timestamp TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS document_sequences (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  prefix TEXT NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  suffix TEXT,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS system_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  processed_at TEXT
);

CREATE TABLE IF NOT EXISTS backup_logs (
  id TEXT PRIMARY KEY,
  backup_time TEXT NOT NULL,
  backup_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL,
  filepath TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  applied_at TEXT NOT NULL
);

-- =============================================================
-- 22. LAYANAN KATALOG, PRICING, MAP KEUANGAN, & LEDGER SANTRI (v1.2)
-- =============================================================

CREATE TABLE IF NOT EXISTS service_catalogs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  module TEXT NOT NULL,
  description TEXT,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS service_prices (
  id TEXT PRIMARY KEY,
  catalog_id TEXT NOT NULL,
  price_name TEXT NOT NULL,
  price REAL NOT NULL,
  unit TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (catalog_id) REFERENCES service_catalogs(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS account_mappings (
  id TEXT PRIMARY KEY,
  module TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  debit_account_id TEXT NOT NULL,
  credit_account_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (debit_account_id) REFERENCES accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (credit_account_id) REFERENCES accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS student_accounts (
  id TEXT PRIMARY KEY,
  santri_id TEXT NOT NULL,
  current_balance REAL NOT NULL DEFAULT 0,
  limit_receivable REAL NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE(santri_id, period_id)
);

CREATE TABLE IF NOT EXISTS student_ledgers (
  id TEXT PRIMARY KEY,
  student_account_id TEXT NOT NULL,
  transaction_id TEXT,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  period_id TEXT NOT NULL,
  pondok_id TEXT NOT NULL,
  FOREIGN KEY (student_account_id) REFERENCES student_accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES pos_transactions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (period_id) REFERENCES periodes(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (pondok_id) REFERENCES pondoks(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- =============================================================
-- DATABASE INDEXES FOR OPTIMAL PERFORMANCE
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_santri_period ON santri(period_id);
CREATE INDEX IF NOT EXISTS idx_santri_pondok ON santri(pondok_id);
CREATE INDEX IF NOT EXISTS idx_invoice_santri ON invoices(santri_id);
CREATE INDEX IF NOT EXISTS idx_invoice_period ON invoices(period_id);
CREATE INDEX IF NOT EXISTS idx_audit_period ON audit_logs(period_id);
CREATE INDEX IF NOT EXISTS idx_perizinan_santri ON perizinans(santri_id);
CREATE INDEX IF NOT EXISTS idx_attachment_entity ON attachments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry ON journal_details(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_account ON journal_details(account_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_ref ON stock_movements(inventory_id, item_type);
CREATE INDEX IF NOT EXISTS idx_student_ledgers_account ON student_ledgers(student_account_id);
CREATE INDEX IF NOT EXISTS idx_student_accounts_santri ON student_accounts(santri_id);
CREATE INDEX IF NOT EXISTS idx_service_prices_catalog ON service_prices(catalog_id);
