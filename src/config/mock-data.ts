// Data Tiruan (Mock Data) Komprehensif untuk PPDS ERP

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  primaryRole: string;
  additionalRoles: string[];
  blokId?: string; // Menentukan domain blok (jika pengurus blok)
  permissions: string[]; // Gabungan seluruh permission dari jabatan
  taskAssignments: string[]; // Task-based assignment (delegasi tugas harian)
}

export interface Santri {
  id: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  blok: string;
  kamar: string;
  kelasFormal: string;
  kelasDiniyah: string;
  jamiyyah: string;
  status: 'Aktif' | 'Izin Pulang' | 'Skorsing' | 'Alumni';
  poinPelanggaran: number;
}

export interface Invoice {
  id: string;
  santriId: string;
  santriName: string;
  kamarInfo: string;
  billingMonth: string; // e.g. "Juni 2026"
  items: { name: string; amount: number }[];
  total: number;
  status: 'Lunas' | 'Belum Bayar' | 'Tunggakan';
  createdAt: string;
  paidAt?: string;
  paymentMethod?: string;
}

export interface Letter {
  id: string;
  type: 'Masuk' | 'Keluar';
  number: string;
  title: string;
  sender: string;
  recipient: string;
  date: string;
  status: 'Draft' | 'Diajukan' | 'Disetujui' | 'Dikirim' | 'Diarsipkan';
  disposisi?: {
    to: string;
    note: string;
    date: string;
  }[];
}

export interface BudgetProposal {
  id: string;
  seksi: string;
  title: string;
  amount: number;
  status: 'Draft' | 'Diajukan' | 'Musyawarah' | 'Disetujui' | 'Ditolak' | 'Pencairan' | 'Selesai';
  proposedBy: string;
  proposedAt: string;
  description: string;
  voting?: {
    yes: number;
    no: number;
    abstain: number;
    voters: { userName: string; vote: 'Setuju' | 'Tolak' | 'Abstain' }[];
  };
  lpj?: {
    submittedAt: string;
    status: 'Verified' | 'Pending' | 'Rejected';
    notes: string;
    receipts: { title: string; amount: number }[];
  };
}

export interface Permit {
  id: string;
  santriId: string;
  santriName: string;
  kamarInfo: string;
  type: 'Keluar Pondok' | 'Pulang (Sakit)' | 'Pulang (Izin Syar\'i)';
  startDate: string;
  endDate: string;
  status: 'Diajukan' | 'Rekomendasi Blok' | 'Disetujui' | 'Aktif' | 'Kembali' | 'Terlambat';
  notes: string;
  checkoutAt?: string;
  checkinAt?: string;
}

export interface Offense {
  id: string;
  santriId: string;
  santriName: string;
  kamarInfo: string;
  category: 'Ringan' | 'Sedang' | 'Berat';
  description: string;
  points: number;
  penalty: string;
  status: 'Dilaporkan' | 'Investigasi' | 'Selesai';
  reportedAt: string;
  reportedBy: string;
}

export interface LabBillingSession {
  id: string;
  clientPc: string;
  userName: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  ratePerMin: number;
  amount: number;
  status: 'Active' | 'Closed' | 'Unpaid';
}

export interface LabPosTransaction {
  id: string;
  type: 'Rental' | 'Print' | 'Fotocopy' | 'Scan' | 'Laminating' | 'Jilid';
  details: string;
  amount: number;
  cashierName: string;
  timestamp: string;
}

export interface ElectricityUsage {
  kamarId: string;
  kamarName: string;
  blokName: string;
  meterStart: number;
  meterEnd: number;
  usageWatt: number;
  ratePerWatt: number;
  totalBill: number;
  billingMonth: string;
  status: 'Lunas' | 'Belum Bayar';
}

export interface MediaDocument {
  id: string;
  activityTitle: string;
  uploadedBy: string;
  uploadedAt: string;
  photos: { url: string; sizeMb: number }[];
  status: 'Draft' | 'Published';
  publishedAt?: string;
}

export interface HealthRecord {
  id: string;
  santriId: string;
  santriName: string;
  complaint: string;
  alignment?: string;
  diagnosis: string;
  tension: string;
  treatment: string;
  givenObat: { name: string; qty: number }[];
  needRujukan: boolean;
  rujukanTo?: string;
  date: string;
  handler: string;
}

// -------------------------------------------------------------
// DUMMY DATA INSTANCES
// -------------------------------------------------------------

// 1. Data User (Pengurus dengan Multi-Jabatan)
//
// PENTING: Format permission WAJIB menggunakan dot-notation
//          yang sesuai dengan routes.ts: [modul].[resource].[action]
//          Contoh: 'dashboard.personal.view', 'master.santri.create'
//
export const mockUsers: UserProfile[] = [
  {
    id: 'u1',
    name: 'K.H. Ahmad Dahlan',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    primaryRole: 'ketua_umum',
    additionalRoles: [],
    permissions: [
      // Dashboard
      'dashboard.personal.view', 'dashboard.dewan.view',
      // Master Data (full access for ketua umum)
      'master.santri.view', 'master.pengurus.view', 'master.role.view',
      'master.permission.view', 'master.department.view', 'master.jabatan.view',
      'master.sekolah.view', 'master.kelas.view', 'master.periode.view',
      'master.room.view', 'master.academic_year.view',
      // Kesekretariatan
      'kesekretariatan.umum.view', 'kesekretariatan.satu.view', 'kesekretariatan.dua.view', 'kesekretariatan.tiga.view',
      'kesekretariatan.organisasi.view', 'kesekretariatan.mutasi.view', 'kesekretariatan.sk.view', 'kesekretariatan.periode.view',
      'kesekretariatan.santri.view', 'kesekretariatan.kamar.view', 'kesekretariatan.blok.view',
      'kesekretariatan.surat_masuk.view', 'kesekretariatan.surat_keluar.view', 'kesekretariatan.disposisi.view',
      // Keuangan
      'keuangan.dashboard.view', 'keuangan.master.view', 'keuangan.tagihan.view', 'keuangan.pembayaran.view',
      'keuangan.akuntansi.view', 'keuangan.laporan.view',
      // Bendahara
      'bendahara.dashboard.view', 'bendahara.kas.view', 'bendahara.rab.view',
      'bendahara.rab.approve', 'bendahara.pengajuan.view', 'bendahara.akuntansi.view', 'bendahara.dokumen.view',
      // Keamanan
      'keamanan.dashboard.view', 'keamanan.izin.view', 'keamanan.pelanggaran.view', 'keamanan.bullying.view',
      // Pendidikan
      'pendidikan.dashboard.view', 'pendidikan.jamiyyah.view', 'pendidikan.wajar.view',
      // Musyawarah
      'musyawarah.dashboard.view',
      // Laboratorium
      'laboratorium.dashboard.view', 'laboratorium.billing.view', 'laboratorium.billing.start',
      'laboratorium.pos.create', 'laboratorium.inventory.view', 'laboratorium.service.view',
      // BUMP
      'bump.dashboard.view', 'bump.pos.create', 'bump.laundry.view', 'bump.online_order.view',
      // Other modules
      'kesehatan.dashboard.view', 'humasy.dashboard.view', 'dms.dashboard.view',
      'media.dashboard.view', 'pembangunan.dashboard.view', 'takmir.dashboard.view', 'plp.dashboard.view',
    ],
    taskAssignments: []
  },
  {
    id: 'u2',
    name: 'M. Lulu Khulaluddin',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    primaryRole: 'sekretaris_umum',
    additionalRoles: ['ketua_blok'], // Rangkap Jabatan
    blokId: 'Blok_A', // Domain blok
    permissions: [
      // Dashboard
      'dashboard.personal.view', 'dashboard.dewan.view',
      // Master Data
      'master.santri.view', 'master.santri.create', 'master.santri.edit', 'master.santri.delete',
      'master.santri.import', 'master.santri.export',
      'master.pengurus.view', 'master.pengurus.create', 'master.pengurus.edit',
      'master.role.view', 'master.role.edit',
      'master.permission.view',
      'master.department.view', 'master.department.create', 'master.department.edit',
      'master.jabatan.view', 'master.jabatan.create', 'master.jabatan.edit',
      'master.sekolah.view', 'master.kelas.view',
      'master.periode.view', 'master.periode.create', 'master.periode.edit',
      'master.room.view', 'master.room.create', 'master.room.edit',
      'master.academic_year.view',
      // Kesekretariatan (full access)
      'kesekretariatan.umum.view', 'kesekretariatan.satu.view', 'kesekretariatan.dua.view', 'kesekretariatan.tiga.view',
      'kesekretariatan.organisasi.view', 'kesekretariatan.organisasi.edit',
      'kesekretariatan.mutasi.view', 'kesekretariatan.mutasi.create',
      'kesekretariatan.sk.view', 'kesekretariatan.sk.create', 'kesekretariatan.sk.edit', 'kesekretariatan.sk.print', 'kesekretariatan.sk.delete',
      'kesekretariatan.periode.view', 'kesekretariatan.periode.edit',
      'kesekretariatan.santri.view', 'kesekretariatan.santri.create', 'kesekretariatan.santri.edit', 'kesekretariatan.santri.delete',
      'kesekretariatan.kamar.view', 'kesekretariatan.kamar.create', 'kesekretariatan.kamar.edit', 'kesekretariatan.kamar.delete',
      'kesekretariatan.blok.view', 'kesekretariatan.blok.create', 'kesekretariatan.blok.edit', 'kesekretariatan.blok.delete',
      'kesekretariatan.surat_masuk.view', 'kesekretariatan.surat_masuk.create', 'kesekretariatan.surat_masuk.edit', 'kesekretariatan.surat_masuk.delete',
      'kesekretariatan.surat_keluar.view', 'kesekretariatan.surat_keluar.create', 'kesekretariatan.surat_keluar.edit', 'kesekretariatan.surat_keluar.approve', 'kesekretariatan.surat_keluar.delete',
      'kesekretariatan.disposisi.view', 'kesekretariatan.disposisi.create',
      // DMS
      'dms.dashboard.view',
      // Musyawarah
      'musyawarah.dashboard.view',
    ],
    taskAssignments: []
  },
  {
    id: 'usr-sekr-ppds',
    name: 'Sekretariat PPDS',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    primaryRole: 'sekretaris',
    additionalRoles: [],
    permissions: [
      // Dashboard
      'dashboard.personal.view', 'dashboard.dewan.view',
      // Master Data
      'master.santri.view', 'master.santri.create', 'master.santri.edit', 'master.santri.delete',
      'master.santri.import', 'master.santri.export',
      'master.pengurus.view', 'master.pengurus.create', 'master.pengurus.edit',
      'master.role.view', 'master.role.edit',
      'master.permission.view',
      'master.department.view', 'master.department.create', 'master.department.edit',
      'master.jabatan.view', 'master.jabatan.create', 'master.jabatan.edit',
      'master.sekolah.view', 'master.kelas.view',
      'master.periode.view', 'master.periode.create', 'master.periode.edit',
      'master.room.view', 'master.room.create', 'master.room.edit',
      'master.academic_year.view',
      // Kesekretariatan (full access)
      'kesekretariatan.umum.view', 'kesekretariatan.satu.view', 'kesekretariatan.dua.view', 'kesekretariatan.tiga.view',
      'kesekretariatan.organisasi.view', 'kesekretariatan.organisasi.edit',
      'kesekretariatan.mutasi.view', 'kesekretariatan.mutasi.create',
      'kesekretariatan.sk.view', 'kesekretariatan.sk.create', 'kesekretariatan.sk.edit', 'kesekretariatan.sk.print', 'kesekretariatan.sk.delete',
      'kesekretariatan.periode.view', 'kesekretariatan.periode.edit',
      'kesekretariatan.santri.view', 'kesekretariatan.santri.create', 'kesekretariatan.santri.edit', 'kesekretariatan.santri.delete',
      'kesekretariatan.kamar.view', 'kesekretariatan.kamar.create', 'kesekretariatan.kamar.edit', 'kesekretariatan.kamar.delete',
      'kesekretariatan.blok.view', 'kesekretariatan.blok.create', 'kesekretariatan.blok.edit', 'kesekretariatan.blok.delete',
      'kesekretariatan.surat_masuk.view', 'kesekretariatan.surat_masuk.create', 'kesekretariatan.surat_masuk.edit', 'kesekretariatan.surat_masuk.delete',
      'kesekretariatan.surat_keluar.view', 'kesekretariatan.surat_keluar.create', 'kesekretariatan.surat_keluar.edit', 'kesekretariatan.surat_keluar.approve', 'kesekretariatan.surat_keluar.delete',
      'kesekretariatan.disposisi.view', 'kesekretariatan.disposisi.create',
      // DMS
      'dms.dashboard.view',
      // Musyawarah
      'musyawarah.dashboard.view',
    ],
    taskAssignments: []
  },
  {
    id: 'u3',
    name: 'Ust. Fikri Al-Hafidz',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    primaryRole: 'kasie', // Kasie Keamanan
    additionalRoles: ['ketua_blok', 'anggota_seksi'], // Kasie Keamanan + Ketua Blok A + Anggota PLP
    blokId: 'Blok_A',
    permissions: [
      // Dashboard
      'dashboard.personal.view',
      // Keamanan (full access)
      'keamanan.dashboard.view',
      'keamanan.izin.view', 'keamanan.izin.create', 'keamanan.izin.approve',
      'keamanan.pelanggaran.view', 'keamanan.pelanggaran.create', 'keamanan.pelanggaran.approve',
      'keamanan.bullying.view', 'keamanan.bullying.report', 'keamanan.bullying.followup',
      // PLP (sebagai anggota)
      'plp.dashboard.view',
    ],
    taskAssignments: ['petugas_registrasi'] // Ditugaskan sebagai petugas registrasi harian
  },
  {
    id: 'u4',
    name: 'H. Zaid Muzakki',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    primaryRole: 'bendahara_umum',
    additionalRoles: [],
    permissions: [
      // Dashboard
      'dashboard.personal.view',
      // Bendahara (full access)
      'bendahara.dashboard.view',
      'bendahara.kas.view', 'bendahara.kas.debit', 'bendahara.kas.credit',
      'bendahara.rab.view', 'bendahara.rab.approve',
      'bendahara.pengajuan.view', 'bendahara.pengajuan.review',
      'bendahara.akuntansi.view',
      'bendahara.dokumen.view', 'bendahara.dokumen.verify',
      // Keuangan (view only for oversight)
      'keuangan.dashboard.view', 'keuangan.master.view',
      'keuangan.tagihan.view', 'keuangan.pembayaran.view',
      'keuangan.akuntansi.view', 'keuangan.laporan.view',
    ],
    taskAssignments: []
  },
  {
    id: 'u5',
    name: 'Ust. M. Ali',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    primaryRole: 'kasie', // Kasie Lab
    additionalRoles: ['anggota_seksi'], // Kasie Lab + Anggota Media
    permissions: [
      // Dashboard
      'dashboard.personal.view',
      // Laboratorium (full access)
      'laboratorium.dashboard.view',
      'laboratorium.billing.view', 'laboratorium.billing.start',
      'laboratorium.pos.view', 'laboratorium.pos.create',
      'laboratorium.inventory.view', 'laboratorium.inventory.edit',
      'laboratorium.service.view', 'laboratorium.service.create',
      // Media (sebagai anggota)
      'media.dashboard.view',
    ],
    taskAssignments: ['petugas_billing_lab']
  }
];

// 2. Data Santri
export const mockSantri: Santri[] = [
  { id: 's1', nis: '12026001', name: 'Ahmad Rafli Fauzi', gender: 'L', blok: 'Blok A', kamar: 'A-01', kelasFormal: 'MA Al-Hidayah (X)', kelasDiniyah: 'Wustho 1', jamiyyah: 'Yasin & Tahlil A', status: 'Aktif', poinPelanggaran: 15 },
  { id: 's2', nis: '12026002', name: 'Muhammad Zinedine', gender: 'L', blok: 'Blok A', kamar: 'A-01', kelasFormal: 'MA Al-Hidayah (X)', kelasDiniyah: 'Wustho 1', jamiyyah: 'Yasin & Tahlil A', status: 'Aktif', poinPelanggaran: 0 },
  { id: 's3', nis: '12026003', name: 'Bahrul Ulum', gender: 'L', blok: 'Blok A', kamar: 'A-02', kelasFormal: 'MA Al-Hidayah (XI)', kelasDiniyah: 'Wustho 2', jamiyyah: 'Diba\'iyah A', status: 'Izin Pulang', poinPelanggaran: 45 },
  { id: 's4', nis: '12026004', name: 'Luthfi Hakim', gender: 'L', blok: 'Blok B', kamar: 'B-01', kelasFormal: 'SMP Islam (VIII)', kelasDiniyah: 'Ula 2', jamiyyah: 'Hadroh B', status: 'Aktif', poinPelanggaran: 5 },
  { id: 's5', nis: '12026005', name: 'Zahra Amelia', gender: 'P', blok: 'Blok C', kamar: 'C-01', kelasFormal: 'SMA Islam (XII)', kelasDiniyah: 'Wustho 3', jamiyyah: 'Yasin & Tahlil C', status: 'Aktif', poinPelanggaran: 0 },
];

// 3. Data Tagihan Santri (Keuangan ≠ Bendahara)
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-01',
    santriId: 's1',
    santriName: 'Ahmad Rafli Fauzi',
    kamarInfo: 'Blok A / A-01',
    billingMonth: 'Juni 2026',
    items: [
      { name: 'Syahriyah Pondok', amount: 150000 },
      { name: 'Madrasah Diniyah', amount: 50000 },
      { name: 'Uang Kebersihan & Jamiyyah', amount: 20000 }
    ],
    total: 220000,
    status: 'Belum Bayar',
    createdAt: '2026-06-01T08:00:00Z'
  },
  {
    id: 'inv-02',
    santriId: 's2',
    santriName: 'Muhammad Zinedine',
    kamarInfo: 'Blok A / A-01',
    billingMonth: 'Juni 2026',
    items: [
      { name: 'Syahriyah Pondok', amount: 150000 },
      { name: 'Madrasah Diniyah', amount: 50000 },
      { name: 'Uang Kebersihan & Jamiyyah', amount: 20000 }
    ],
    total: 220000,
    status: 'Lunas',
    createdAt: '2026-06-01T08:00:00Z',
    paidAt: '2026-06-05T09:30:00Z',
    paymentMethod: 'Cash (Kasir Keuangan)'
  },
  {
    id: 'inv-03',
    santriId: 's3',
    santriName: 'Bahrul Ulum',
    kamarInfo: 'Blok A / A-02',
    billingMonth: 'Juni 2026',
    items: [
      { name: 'Syahriyah Pondok', amount: 150000 },
      { name: 'Madrasah Diniyah', amount: 50000 },
      { name: 'Uang Kebersihan & Jamiyyah', amount: 20000 }
    ],
    total: 220000,
    status: 'Tunggakan',
    createdAt: '2026-05-01T08:00:00Z'
  }
];

// 4. Data Persuratan
export const mockLetters: Letter[] = [
  {
    id: 'let-01',
    type: 'Masuk',
    number: 'PPDS/SM/2026/089',
    title: 'Undangan Rapat Koordinasi Wilayah Kementerian Agama',
    sender: 'Kemenag Kab. Banyumas',
    recipient: 'Pimpinan PPDS',
    date: '2026-06-20',
    status: 'Diarsipkan',
    disposisi: [
      { to: 'Seksi Pendidikan', note: 'Tolong diwakilkan oleh Kasie Pendidikan dan siapkan data santri formal.', date: '2026-06-21' }
    ]
  },
  {
    id: 'let-02',
    type: 'Keluar',
    number: 'PPDS/SK/2026/045',
    title: 'Surat Edaran Libur Hari Raya Idul Adha 1447 H',
    sender: 'Sekretaris Umum',
    recipient: 'Wali Santri PPDS',
    date: '2026-06-22',
    status: 'Disetujui',
  },
  {
    id: 'let-03',
    type: 'Keluar',
    number: 'PPDS/SK/2026/046',
    title: 'SK Kepengurusan Panitia Qurban 2026',
    sender: 'Sekretaris Umum',
    recipient: 'Internal Pengurus',
    date: '2026-06-24',
    status: 'Draft',
  }
];

// 5. Data Rencana Anggaran (RAB) & Musyawarah
export const mockBudgets: BudgetProposal[] = [
  {
    id: 'b-01',
    seksi: 'Seksi Keamanan',
    title: 'Pengadaan Seragam Petugas Gerbang Keamanan',
    amount: 1200000,
    status: 'Musyawarah',
    proposedBy: 'Ust. Fikri Al-Hafidz',
    proposedAt: '2026-06-22T10:00:00Z',
    description: 'Pembelian 6 pasang seragam baru untuk petugas jaga pos gerbang luar guna merapikan performa dan identitas keamanan.',
    voting: {
      yes: 4,
      no: 1,
      abstain: 0,
      voters: [
        { userName: 'K.H. Ahmad Dahlan', vote: 'Setuju' },
        { userName: 'M. Lulu Khulaluddin', vote: 'Setuju' },
        { userName: 'H. Zaid Muzakki', vote: 'Tolak' },
        { userName: 'Ust. M. Ali', vote: 'Setuju' }
      ]
    }
  },
  {
    id: 'b-02',
    seksi: 'Seksi Laboratorium',
    title: 'Pembaruan Tinta & Kertas POS Printer Jasa Print',
    amount: 450000,
    status: 'Pencairan',
    proposedBy: 'Ust. M. Ali',
    proposedAt: '2026-06-23T09:00:00Z',
    description: 'Kebutuhan tinta printer Epson L3110 4 warna dan 3 rim kertas A4 untuk unit POS Print Lab Komputer.'
  },
  {
    id: 'b-03',
    seksi: 'Seksi PLP',
    title: 'Perbaikan Saluran Pipa Air Bersih Blok B',
    amount: 850000,
    status: 'Selesai',
    proposedBy: 'Kang Mamat (PLP)',
    proposedAt: '2026-06-10T07:30:00Z',
    description: 'Pembelian 5 batang pipa PVC Rucika 3 inch dan lem pipa untuk memperbaiki pipa bocor di samping kamar mandi Blok B.',
    lpj: {
      submittedAt: '2026-06-15T11:00:00Z',
      status: 'Verified',
      notes: 'Laporan diverifikasi lengkap dan sisa anggaran Rp 25.000 telah dikembalikan ke kas utama.',
      receipts: [
        { title: 'Pipa Rucika 3 inch (5 pcs)', amount: 720000 },
        { title: 'Lem Pipa & Fitting PVC', amount: 105000 }
      ]
    }
  }
];

// 6. Data Perizinan Keluar/Pulang Santri
export const mockPermits: Permit[] = [
  {
    id: 'prm-01',
    santriId: 's1',
    santriName: 'Ahmad Rafli Fauzi',
    kamarInfo: 'Blok A / A-01',
    type: 'Keluar Pondok',
    startDate: '2026-06-24T13:00:00Z',
    endDate: '2026-06-24T17:00:00Z',
    status: 'Rekomendasi Blok',
    notes: 'Ke apotek terdekat membeli obat resep dokter.'
  },
  {
    id: 'prm-02',
    santriId: 's3',
    santriName: 'Bahrul Ulum',
    kamarInfo: 'Blok A / A-02',
    type: 'Pulang (Sakit)',
    startDate: '2026-06-20T08:00:00Z',
    endDate: '2026-06-27T17:00:00Z',
    status: 'Aktif',
    notes: 'Pemulihan demam berdarah (DBD) di rumah orang tua.',
    checkoutAt: '2026-06-20T09:15:00Z'
  },
  {
    id: 'prm-03',
    santriId: 's4',
    santriName: 'Luthfi Hakim',
    kamarInfo: 'Blok B / B-01',
    type: 'Keluar Pondok',
    startDate: '2026-06-23T14:00:00Z',
    endDate: '2026-06-23T16:00:00Z',
    status: 'Kembali',
    notes: 'Fotokopi berkas sekolah formal di fotokopi luar.',
    checkoutAt: '2026-06-23T14:05:00Z',
    checkinAt: '2026-06-23T15:52:00Z'
  }
];

// 7. Data Pelanggaran Ketertiban
export const mockOffenses: Offense[] = [
  {
    id: 'off-01',
    santriId: 's1',
    santriName: 'Ahmad Rafli Fauzi',
    kamarInfo: 'Blok A / A-01',
    category: 'Ringan',
    description: 'Terlambat mengikuti shalat jamaah Subuh di masjid.',
    points: 5,
    penalty: 'Membersihkan teras masjid luar setelah pengajian.',
    status: 'Selesai',
    reportedAt: '2026-06-23T05:00:00Z',
    reportedBy: 'Takmir Masjid (Ust. Jafar)'
  },
  {
    id: 'off-02',
    santriId: 's3',
    santriName: 'Bahrul Ulum',
    kamarInfo: 'Blok A / A-02',
    category: 'Sedang',
    description: 'Membawa barang elektronik (HP) tanpa registrasi resmi keamanan.',
    points: 15,
    penalty: 'HP disita 1 bulan, menyalin kitab Ta\'lim Muta\'alim sebanyak 5 halaman.',
    status: 'Investigasi',
    reportedAt: '2026-06-24T06:30:00Z',
    reportedBy: 'Kasi Keamanan (Ust. Fikri)'
  }
];

// 8. Data Laboratorium (Billing PC & POS)
export const mockLabSessions: LabBillingSession[] = [
  { id: 'sess-01', clientPc: 'PC-03', userName: 's1', startTime: '2026-06-24T09:00:00Z', ratePerMin: 100, amount: 6000, status: 'Active' },
  { id: 'sess-02', clientPc: 'PC-08', userName: 's2', startTime: '2026-06-24T09:15:00Z', ratePerMin: 100, amount: 4500, status: 'Active' },
  { id: 'sess-03', clientPc: 'PC-01', userName: 's4', startTime: '2026-06-24T08:00:00Z', endTime: '2026-06-24T09:30:00Z', durationMinutes: 90, ratePerMin: 100, amount: 9000, status: 'Closed' }
];

export const mockLabTransactions: LabPosTransaction[] = [
  { id: 'pos-01', type: 'Rental', details: 'Rental PC-01 (90 menit)', amount: 9000, cashierName: 'Ust. M. Ali', timestamp: '2026-06-24T09:31:00Z' },
  { id: 'pos-02', type: 'Print', details: 'Print Hitam Putih (5 lembar) s4', amount: 5000, cashierName: 'Ust. M. Ali', timestamp: '2026-06-24T09:35:00Z' },
  { id: 'pos-03', type: 'Laminating', details: 'Laminating SK Pengurus s2', amount: 7000, cashierName: 'Ust. M. Ali', timestamp: '2026-06-24T09:40:00Z' }
];

// 9. Data PLP (Tagihan Listrik Kamar)
export const mockElectricity: ElectricityUsage[] = [
  { kamarId: 'kam-a01', kamarName: 'A-01', blokName: 'Blok A', meterStart: 1250, meterEnd: 1390, usageWatt: 140, ratePerWatt: 1500, totalBill: 210000, billingMonth: 'Juni 2026', status: 'Belum Bayar' },
  { kamarId: 'kam-a02', kamarName: 'A-02', blokName: 'Blok A', meterStart: 890, meterEnd: 995, usageWatt: 105, ratePerWatt: 1500, totalBill: 157500, billingMonth: 'Juni 2026', status: 'Lunas' }
];

// 10. Data Media Dokumentasi
export const mockMediaDocs: MediaDocument[] = [
  {
    id: 'med-01',
    activityTitle: 'Khataman Al-Quran Akbar Akhir Sya\'ban',
    uploadedBy: 'Ust. M. Ali',
    uploadedAt: '2026-06-15T21:00:00Z',
    photos: [
      { url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80', sizeMb: 2.4 },
      { url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&auto=format&fit=crop&q=80', sizeMb: 3.1 }
    ],
    status: 'Published',
    publishedAt: '2026-06-16T08:00:00Z'
  }
];

// 11. Data Kesehatan Rekam Medis Poskestren
export const mockHealthRecords: HealthRecord[] = [
  {
    id: 'medrec-01',
    santriId: 's1',
    santriName: 'Ahmad Rafli Fauzi',
    complaint: 'Sakit gigi berdenyut sejak kemarin malam, kepala pusing.',
    diagnosis: 'Karies gigi interna dengan pulpitis ringan.',
    tension: '110/70 mmHg',
    treatment: 'Diberikan analgesik pereda nyeri, edukasi kebersihan gigi.',
    givenObat: [
      { name: 'Paracetamol 500mg', qty: 10 },
      { name: 'Amoxicillin 500mg', qty: 9 }
    ],
    needRujukan: false,
    date: '2026-06-23T15:30:00Z',
    handler: 'Dr. Zulfikar (Dokter Kunjung)'
  }
];
