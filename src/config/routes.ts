// Route & Menu Registry untuk PPDS ERP

export interface RouteItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  permissions?: string[];
  children?: RouteItem[];
}

export const routes: RouteItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    permissions: ['dashboard.personal.view', 'dashboard.dewan.view'],
    children: [
      { id: 'dashboard-personal', label: 'Personal', path: '/dashboard/personal', permissions: ['dashboard.personal.view'] },
      { id: 'dashboard-dewan', label: 'Dewan Harian', path: '/dashboard/dewan-harian', permissions: ['dashboard.dewan.view'] }
    ]
  },
  {
    id: 'master-data',
    label: 'Master Data',
    path: '/master',
    icon: 'Database',
    permissions: ['master.santri.view', 'master.pengurus.view', 'master.role.view'],
    children: [
      { id: 'master-santri', label: 'Data Santri', path: '/master/santri', permissions: ['master.santri.view'] },
      { id: 'master-pengurus', label: 'Data Pengurus', path: '/master/pengurus', permissions: ['master.pengurus.view'] },
      { id: 'master-role', label: 'Role & Permission', path: '/master/role', permissions: ['master.role.view'] },
      { id: 'master-room', label: 'Data Kamar & Blok', path: '/master/room', permissions: ['master.room.view'] },
      { id: 'master-academic', label: 'Tahun Ajaran', path: '/master/academic', permissions: ['master.academic_year.view'] }
    ]
  },
  {
    id: 'kesekretariatan',
    label: 'Kesekretariatan',
    path: '/kesekretariatan',
    icon: 'FileText',
    permissions: ['kesekretariatan.umum.view', 'kesekretariatan.satu.view', 'kesekretariatan.dua.view', 'kesekretariatan.tiga.view'],
    children: [
      {
        id: 'sekr-umum',
        label: 'Sekretaris Umum',
        path: '/kesekretariatan/umum',
        permissions: ['kesekretariatan.umum.view'],
        children: [
          { id: 'sekr-org', label: 'Struktur Organisasi', path: '/kesekretariatan/umum/organisasi', permissions: ['kesekretariatan.organisasi.view'] },
          { id: 'sekr-mutasi', label: 'Mutasi Jabatan', path: '/kesekretariatan/umum/mutasi', permissions: ['kesekretariatan.mutasi.view'] },
          { id: 'sekr-sk', label: 'SK Pengurus', path: '/kesekretariatan/umum/sk-pengurus', permissions: ['kesekretariatan.sk.view'] },
          { id: 'sekr-periode', label: 'Periode Kepengurusan', path: '/kesekretariatan/umum/periode', permissions: ['kesekretariatan.periode.view'] }
        ]
      },
      {
        id: 'sekr-1',
        label: 'Sekretaris I (Santri)',
        path: '/kesekretariatan/satu',
        permissions: ['kesekretariatan.satu.view'],
        children: [
          { id: 'sekr-santri', label: 'Data Santri', path: '/kesekretariatan/satu/santri', permissions: ['kesekretariatan.santri.view'] },
          { id: 'sekr-kamar', label: 'Data Kamar', path: '/kesekretariatan/satu/kamar', permissions: ['kesekretariatan.kamar.view'] },
          { id: 'sekr-blok', label: 'Data Blok', path: '/kesekretariatan/satu/blok', permissions: ['kesekretariatan.blok.view'] }
        ]
      },
      {
        id: 'sekr-2',
        label: 'Sekretaris II (Surat)',
        path: '/kesekretariatan/dua',
        permissions: ['kesekretariatan.dua.view'],
        children: [
          { id: 'sekr-surat-masuk', label: 'Surat Masuk', path: '/kesekretariatan/dua/surat-masuk', permissions: ['kesekretariatan.surat_masuk.view'] },
          { id: 'sekr-surat-keluar', label: 'Surat Keluar', path: '/kesekretariatan/dua/surat-keluar', permissions: ['kesekretariatan.surat_keluar.view'] },
          { id: 'sekr-disposisi', label: 'Disposisi Surat', path: '/kesekretariatan/dua/disposisi', permissions: ['kesekretariatan.disposisi.view'] }
        ]
      }
    ]
  },
  {
    id: 'keuangan',
    label: 'Keuangan Santri',
    path: '/keuangan',
    icon: 'Receipt',
    permissions: ['keuangan.dashboard.view'],
    children: [
      {
        id: 'keuangan-master',
        label: 'Master',
        path: '/keuangan/master',
        permissions: ['keuangan.master.view'],
        children: [
          { id: 'keu-master-jenis', label: 'Jenis Tagihan', path: '/keuangan/master/jenis-tagihan', permissions: ['keuangan.master.view'] },
          { id: 'keu-master-tarif', label: 'Tarif Tagihan', path: '/keuangan/master/tarif', permissions: ['keuangan.master.view'] },
          { id: 'keu-master-tahun', label: 'Tahun Ajaran', path: '/keuangan/master/tahun-ajaran', permissions: ['keuangan.master.view'] }
        ]
      },
      {
        id: 'keuangan-tagihan',
        label: 'Tagihan',
        path: '/keuangan/tagihan',
        permissions: ['keuangan.tagihan.view'],
        children: [
          { id: 'keu-tagihan-generate', label: 'Generate Tagihan', path: '/keuangan/tagihan/generate', permissions: ['keuangan.tagihan.create'] },
          { id: 'keu-tagihan-santri', label: 'Tagihan Santri', path: '/keuangan/tagihan/list', permissions: ['keuangan.tagihan.view'] },
          { id: 'keu-piutang', label: 'Piutang', path: '/keuangan/tagihan/piutang', permissions: ['keuangan.tagihan.view'] }
        ]
      },
      {
        id: 'keuangan-pembayaran',
        label: 'Pembayaran',
        path: '/keuangan/pembayaran',
        permissions: ['keuangan.pembayaran.view'],
        children: [
          { id: 'keu-bayar-pos', label: 'POS Pembayaran', path: '/keuangan/pembayaran/pos', permissions: ['keuangan.pembayaran.create'] },
          { id: 'keu-bayar-reg', label: 'Pembayaran', path: '/keuangan/pembayaran/list', permissions: ['keuangan.pembayaran.view'] },
          { id: 'keu-bayar-sebagian', label: 'Pembayaran Sebagian', path: '/keuangan/pembayaran/sebagian', permissions: ['keuangan.pembayaran.create'] },
          { id: 'keu-bayar-massal', label: 'Pembayaran Massal', path: '/keuangan/pembayaran/massal', permissions: ['keuangan.pembayaran.create'] },
          { id: 'keu-cetak-struk', label: 'Cetak Struk', path: '/keuangan/pembayaran/struk', permissions: ['keuangan.pembayaran.view'] },
          { id: 'keu-riwayat-bayar', label: 'Riwayat Pembayaran', path: '/keuangan/pembayaran/riwayat', permissions: ['keuangan.pembayaran.view'] }
        ]
      },
      {
        id: 'keuangan-akuntansi',
        label: 'Akuntansi',
        path: '/keuangan/akuntansi',
        permissions: ['keuangan.akuntansi.view'],
        children: [
          { id: 'keu-buku-kas', label: 'Buku Kas', path: '/keuangan/akuntansi/buku-kas', permissions: ['keuangan.akuntansi.view'] },
          { id: 'keu-rekonsiliasi', label: 'Rekonsiliasi', path: '/keuangan/akuntansi/rekonsiliasi', permissions: ['keuangan.akuntansi.view'] }
        ]
      },
      {
        id: 'keuangan-laporan',
        label: 'Laporan',
        path: '/keuangan/laporan',
        permissions: ['keuangan.laporan.view'],
        children: [
          { id: 'keu-lap-harian', label: 'Harian', path: '/keuangan/laporan/harian', permissions: ['keuangan.laporan.view'] },
          { id: 'keu-lap-bulanan', label: 'Bulanan', path: '/keuangan/laporan/bulanan', permissions: ['keuangan.laporan.view'] }
        ]
      }
    ]
  },
  {
    id: 'bendahara',
    label: 'Bendahara Pondok',
    path: '/bendahara',
    icon: 'Wallet',
    permissions: ['bendahara.dashboard.view'],
    children: [
      {
        id: 'bendahara-kas',
        label: 'Kas',
        path: '/bendahara/kas',
        permissions: ['bendahara.kas.view'],
        children: [
          { id: 'ben-kas-besar', label: 'Kas Besar', path: '/bendahara/kas/besar', permissions: ['bendahara.kas.view'] },
          { id: 'ben-kas-kecil', label: 'Kas Kecil', path: '/bendahara/kas/kecil', permissions: ['bendahara.kas.view'] }
        ]
      },
      {
        id: 'bendahara-anggaran',
        label: 'Anggaran',
        path: '/bendahara/anggaran',
        permissions: ['bendahara.rab.view'],
        children: [
          { id: 'ben-rab', label: 'RAB', path: '/bendahara/anggaran/rab', permissions: ['bendahara.rab.view'] },
          { id: 'ben-pengajuan', label: 'Pengajuan Dana', path: '/bendahara/anggaran/pengajuan', permissions: ['bendahara.pengajuan.view'] },
          { id: 'ben-approval', label: 'Approval', path: '/bendahara/anggaran/approval', permissions: ['bendahara.rab.approve'] }
        ]
      },
      {
        id: 'bendahara-akuntansi',
        label: 'Akuntansi',
        path: '/bendahara/akuntansi',
        permissions: ['bendahara.akuntansi.view'],
        children: [
          { id: 'ben-jurnal', label: 'Jurnal', path: '/bendahara/akuntansi/jurnal', permissions: ['bendahara.akuntansi.view'] },
          { id: 'ben-buku-besar', label: 'Buku Besar', path: '/bendahara/akuntansi/buku-besar', permissions: ['bendahara.akuntansi.view'] },
          { id: 'ben-neraca', label: 'Neraca', path: '/bendahara/akuntansi/neraca', permissions: ['bendahara.akuntansi.view'] },
          { id: 'ben-arus-kas', label: 'Arus Kas', path: '/bendahara/akuntansi/arus-kas', permissions: ['bendahara.akuntansi.view'] }
        ]
      },
      {
        id: 'bendahara-dokumen',
        label: 'Dokumen',
        path: '/bendahara/dokumen',
        permissions: ['bendahara.dokumen.view'],
        children: [
          { id: 'ben-lpj', label: 'LPJ', path: '/bendahara/dokumen/lpj', permissions: ['bendahara.dokumen.view'] },
          { id: 'ben-nota', label: 'Nota', path: '/bendahara/dokumen/nota', permissions: ['bendahara.dokumen.view'] }
        ]
      }
    ]
  },
  {
    id: 'bump',
    label: 'BUMP Usaha',
    path: '/bump',
    icon: 'Briefcase',
    permissions: ['bump.dashboard.view'],
    children: [
      { id: 'bump-pos', label: 'POS Penjualan', path: '/bump/pos', permissions: ['bump.pos.create'] },
      { id: 'bump-laundry', label: 'Laundry', path: '/bump/laundry', permissions: ['bump.laundry.view'] },
      { id: 'bump-online', label: 'Jasa Pembelian Online', path: '/bump/online', permissions: ['bump.online_order.view'] }
    ]
  },
  {
    id: 'laboratorium',
    label: 'Laboratorium Komputer',
    path: '/laboratorium',
    icon: 'Monitor',
    permissions: ['laboratorium.dashboard.view'],
    children: [
      { id: 'lab-billing', label: 'Billing Komputer', path: '/laboratorium/billing', permissions: ['laboratorium.billing.start'] },
      { id: 'lab-pos', label: 'POS Kasir', path: '/laboratorium/pos', permissions: ['laboratorium.pos.create'] },
      { id: 'lab-inventaris', label: 'Inventaris', path: '/laboratorium/inventaris', permissions: ['laboratorium.inventory.view'] },
      { id: 'lab-service', label: 'Service', path: '/laboratorium/service', permissions: ['laboratorium.service.view'] },
      { id: 'lab-riwayat', label: 'Riwayat Billing', path: '/laboratorium/riwayat', permissions: ['laboratorium.billing.view'] }
    ]
  },
  {
    id: 'keamanan',
    label: 'Seksi Keamanan',
    path: '/keamanan',
    icon: 'Shield',
    permissions: ['keamanan.dashboard.view'],
    children: [
      { id: 'keamanan-izin', label: 'Perizinan Keluar', path: '/keamanan/perizinan', permissions: ['keamanan.izin.view'] },
      { id: 'keamanan-pelanggaran', label: 'Pelanggaran & Takzir', path: '/keamanan/pelanggaran', permissions: ['keamanan.pelanggaran.view'] },
      { id: 'keamanan-bullying', label: 'Log Bullying', path: '/keamanan/bullying', permissions: ['keamanan.bullying.view'] }
    ]
  }
];
