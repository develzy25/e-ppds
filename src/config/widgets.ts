// Dashboard Widget Registry untuk PPDS ERP

export interface WidgetConfig {
  id: string;
  label: string;
  size: 'sm' | 'md' | 'lg' | 'xl'; // Ukuran kolom grid
  permissions: string[]; // Hak akses yang dibutuhkan untuk memuat widget
}

export const widgets: Record<string, WidgetConfig> = {
  // Widget Statistik (sm)
  total_santri: {
    id: 'total_santri',
    label: 'Total Santri Aktif',
    size: 'sm',
    permissions: ['sekr_santri_view', 'dewan_harian_dashboard_view']
  },
  total_pengurus: {
    id: 'total_pengurus',
    label: 'Total Pengurus',
    size: 'sm',
    permissions: ['sekr_sk_pengurus_view', 'dewan_harian_dashboard_view']
  },
  total_kamar: {
    id: 'total_kamar',
    label: 'Kamar Terisi',
    size: 'sm',
    permissions: ['sekr_kamar_view', 'dewan_harian_dashboard_view']
  },
  total_blok: {
    id: 'total_blok',
    label: 'Wilayah Blok',
    size: 'sm',
    permissions: ['sekr_blok_view', 'dewan_harian_dashboard_view']
  },
  
  // Widget Keuangan & Anggaran
  kas_pondok_ringkasan: {
    id: 'kas_pondok_ringkasan',
    label: 'Saldo Kas Utama',
    size: 'sm',
    permissions: ['bendahara_kas_view', 'dewan_harian_dashboard_view']
  },
  anggaran_pending_list: {
    id: 'anggaran_pending_list',
    label: 'Pengajuan Anggaran Menunggu',
    size: 'md',
    permissions: ['bendahara_anggaran_view', 'dewan_harian_approval_view']
  },
  keuangan_grafik_bulanan: {
    id: 'keuangan_grafik_bulanan',
    label: 'Grafik Arus Kas Pondok',
    size: 'lg',
    permissions: ['bendahara_kas_view', 'dewan_harian_dashboard_view']
  },

  // Widget Keamanan & Perizinan
  izin_keluar_pending: {
    id: 'izin_keluar_pending',
    label: 'Permohonan Izin Menunggu',
    size: 'md',
    permissions: ['keamanan_izin_view', 'blok_perizinan_approve']
  },
  santri_terlambat_list: {
    id: 'santri_terlambat_list',
    label: 'Santri Terlambat Kembali',
    size: 'sm',
    permissions: ['keamanan_izin_overdue']
  },
  pelanggaran_grafik: {
    id: 'pelanggaran_grafik',
    label: 'Tren Pelanggaran Santri',
    size: 'md',
    permissions: ['keamanan_pelanggaran_view']
  },

  // Widget Operasional Seksi
  lab_billing_aktif: {
    id: 'lab_billing_aktif',
    label: 'PC Lab Sedang Aktif',
    size: 'sm',
    permissions: ['lab_billing_session_view']
  },
  lab_pos_hari_ini: {
    id: 'lab_pos_hari_ini',
    label: 'Omset Kasir Lab Hari Ini',
    size: 'sm',
    permissions: ['lab_pos_report_view']
  },
  sound_system_dipinjam: {
    id: 'sound_system_dipinjam',
    label: 'Peminjaman Sound System',
    size: 'sm',
    permissions: ['plp_sound_view']
  },
  kunjungan_sakit_hari_ini: {
    id: 'kunjungan_sakit_hari_ini',
    label: 'Santri Rawat Poskestren',
    size: 'sm',
    permissions: ['kesehatan_rekammedis_view']
  },

  // Widget Kesekretariatan
  surat_masuk_terbaru: {
    id: 'surat_masuk_terbaru',
    label: 'Surat Masuk Menunggu Disposisi',
    size: 'md',
    permissions: ['sekr_surat_masuk_view']
  },
  proker_monitoring_rekap: {
    id: 'proker_monitoring_rekap',
    label: 'Rekap Target Program Kerja',
    size: 'md',
    permissions: ['sekr_monitoring_view']
  },

  // Widget Dewan Harian & Musyawarah
  musyawarah_aktif_card: {
    id: 'musyawarah_aktif_card',
    label: 'Musyawarah Sidang Aktif',
    size: 'md',
    permissions: ['musyawarah_sidang_view']
  }
};
