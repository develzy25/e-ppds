'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { ActivityFeed } from '@/components/ui/approval-timeline';
import { Calendar, Clock, Sparkles, CheckSquare, Volume2 } from 'lucide-react';

export default function DashboardPersonal() {
  const { currentUser, notifications } = useApp();

  // Dynamic aggregation of duties based on user roles
  const getRoleDuties = (role: string) => {
    switch (role) {
      case 'ketua_umum':
        return [
          { title: 'Sidang Musyawarah Anggaran', desc: 'Memimpin sidang persetujuan anggaran bulanan seksi', deadline: 'Hari ini, 13:00', priority: 'Tinggi' },
          { title: 'Tanda Tangan SK Pengurus', desc: 'Mengesahkan 3 draf SK pengurus baru seksi media', deadline: 'Besok, 17:00', priority: 'Sedang' }
        ];
      case 'sekretaris_umum':
        return [
          { title: 'Review Mutasi Jabatan', desc: 'Pemeriksaan pengajuan mutasi staf seksi keamanan', deadline: '26 Juni 2026', priority: 'Sedang' },
          { title: 'Rekap SK Kepengurusan', desc: 'Menerbitkan SK Panitia Qurban Idul Adha', deadline: 'Hari ini, 15:00', priority: 'Tinggi' },
          { title: 'Update Struktur Organisasi', desc: 'Integrasi divisi baru di BUMP', deadline: '28 Juni 2026', priority: 'Rendah' }
        ];
      case 'ketua_blok':
        return [
          { title: 'Rekomendasi Izin Pulang', desc: 'Review pengajuan izin pulang santri Blok A (Bahrul Ulum)', deadline: 'Hari ini, 12:00', priority: 'Tinggi' },
          { title: 'Cek Kebersihan Kamar', desc: 'Menginput nilai kebersihan kamar mingguan Blok A', deadline: 'Jumat, 08:00', priority: 'Sedang' }
        ];
      case 'kasie': // e.g. Kasie Keamanan / Lab
        return [
          { title: 'Verifikasi Buku Pelanggaran', desc: 'Review log laporan bullying dan ketertiban santri', deadline: 'Hari ini, 20:00', priority: 'Tinggi' },
          { title: 'Stok Opname Unit Lab', desc: 'Pengecekan kerusakan PC client lab komputer', deadline: 'Sabtu, 10:00', priority: 'Sedang' }
        ];
      case 'anggota_seksi': // e.g. PLP
        return [
          { title: 'Pemeliharaan Sound System', desc: 'Pengecekan mic nirkabel masjid untuk kajian sore', deadline: 'Hari ini, 15:30', priority: 'Tinggi' }
        ];
      default:
        return [
          { title: 'Laporan Bulanan', desc: 'Mengisi berkas laporan rutin capaian seksi', deadline: 'Akhir bulan', priority: 'Sedang' }
        ];
    }
  };

  // Aggregate duties from primary role + all additional roles
  const primaryDuties = getRoleDuties(currentUser.primaryRole);
  const additionalDuties = currentUser.additionalRoles.flatMap(role => getRoleDuties(role));
  const allDuties = [...primaryDuties, ...additionalDuties];

  // Dummy activity logs
  const activityLogs = [
    { id: 'f-1', label: 'Perizinan Diperbarui', details: 'Santri Ahmad Rafli (A-01) disetujui izin keluar oleh Ketua Blok.', date: '10 menit yang lalu', type: 'success' as const },
    { id: 'f-2', label: 'Pelanggaran Baru', details: 'Bahrul Ulum (A-02) dilaporkan membawa HP tanpa registrasi resmi.', date: '30 menit yang lalu', type: 'danger' as const },
    { id: 'f-3', label: 'Kasir POS Jasa Lab', details: 'Transaksi Print Hitam Putih Rp 5.000 diselesaikan oleh kasir.', date: '1 jam yang lalu', type: 'info' as const }
  ];

  // Dummy announcements
  const announcements = [
    { id: 'a-1', title: 'Persiapan Rapat Dewan Harian Syawal', content: 'Rapat koordinasi pleno Dewan Harian akan diselenggarakan pada Kamis depan pukul 09:00 WIB di Aula Utama.', date: '24 Juni 2026' },
    { id: 'a-2', title: 'Imbauan Penertiban Barang Elektronik', content: 'Dimohon seluruh Ketua Blok mensosialisasikan kewajiban registrasi HP & Laptop ke Pos Keamanan sebelum tanggal 30 Juni.', date: '23 Juni 2026' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Selamat Datang */}
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between border-b border-border/30 pb-4">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            Assalamualaikum, {currentUser.name.split(',')[0]}
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </h1>
          <p className="text-xs text-muted-foreground">
            Selamat datang di SIM-PPDS. Berikut ringkasan tugas dan status kepengurusan Anda hari ini.
          </p>
        </div>
        <div className="text-right text-[11px] font-semibold text-muted-foreground">
          Hari ini: <span className="text-foreground font-bold">Rabu, 24 Juni 2026</span>
        </div>
      </div>

      {/* Grid KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Tugas Saya"
          value={allDuties.length}
          description="Total agenda & tugas aktif"
          iconName="ListTodo"
          status="primary"
        />
        <KPICard
          title="Persetujuan Menunggu"
          value={currentUser.primaryRole === 'ketua_umum' ? 3 : 1}
          description="Membutuhkan tanda tangan"
          iconName="Clock"
          status="warning"
        />
        <KPICard
          title="Notifikasi Baru"
          value={notifications.filter(n => !n.isRead).length}
          description="Pemberitahuan belum dibaca"
          iconName="Bell"
          status="info"
        />
        <KPICard
          title="Agenda Hari Ini"
          value={2}
          description="Kegiatan terjadwal hari ini"
          iconName="Calendar"
          status="success"
        />
        <KPICard
          title="Laporan Seksi"
          value="1 Pending"
          description="Laporan berkala seksi"
          iconName="AlertCircle"
          status="danger"
        />
      </div>

      {/* Widget Grid Layout Utama */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Kolom 1 & 2: Agregasi Tugas Saya */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass">
            <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4.5 w-4.5 text-primary" />
                <h2 className="text-sm font-extrabold text-foreground">Tugas Saya Berdasarkan Jabatan</h2>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                Gabungan Peran
              </span>
            </div>

            {allDuties.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                Tidak ada tugas aktif untuk jabatan Anda.
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {allDuties.map((duty, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 hover:bg-secondary/15 px-2 rounded-lg transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{duty.title}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          duty.priority === 'Tinggi' 
                            ? 'bg-rose-500/10 text-rose-500' 
                            : duty.priority === 'Sedang' 
                            ? 'bg-amber-500/10 text-amber-500' 
                            : 'bg-slate-500/10 text-slate-500'
                        }`}>
                          {duty.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground/90">{duty.desc}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div className="text-[10px] text-muted-foreground">
                        Batas: <span className="font-semibold text-foreground/80">{duty.deadline}</span>
                      </div>
                      <button 
                        onClick={() => alert(`Tugas "${duty.title}" ditandai selesai!`)}
                        className="px-2.5 py-1 rounded-md border border-border/80 bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary text-[10px] font-bold transition-all"
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Widget Pengumuman Pondok */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass">
            <div className="flex items-center gap-2 border-b border-border/30 pb-3 mb-4">
              <Volume2 className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-extrabold text-foreground">Pengumuman Resmi Pondok</h2>
            </div>
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3.5 rounded-xl border border-border bg-secondary/20 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xs font-bold text-foreground leading-snug">{ann.title}</h3>
                    <span className="text-[9px] text-muted-foreground font-semibold shrink-0">{ann.date}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/90 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Kolom 3: Aktivitas Terkini & Jadwal Harian */}
        <div className="space-y-6">
          {/* Widget Aktivitas Terkini */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass">
            <div className="flex items-center gap-2 border-b border-border/30 pb-3 mb-4">
              <Clock className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-extrabold text-foreground">Aktivitas Terkini</h2>
            </div>
            <ActivityFeed items={activityLogs} />
          </div>

          {/* Widget Jadwal Hari Ini */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass">
            <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-primary" />
                <h2 className="text-sm font-extrabold text-foreground">Jadwal Pengajian Diniyah</h2>
              </div>
            </div>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3 border-l-2 border-emerald-500 pl-3">
                <div className="text-[10px] font-bold text-primary shrink-0 w-12">14:00 - 15:30</div>
                <div className="space-y-0.5 text-left">
                  <div className="font-bold text-foreground">Kajian Fathul Qorib</div>
                  <div className="text-[10px] text-muted-foreground">Oleh: K.H. Ahmad Dahlan • Masjid Utama</div>
                </div>
              </div>
              <div className="flex items-start gap-3 border-l-2 border-sky-500 pl-3">
                <div className="text-[10px] font-bold text-primary shrink-0 w-12">20:00 - 21:30</div>
                <div className="space-y-0.5 text-left">
                  <div className="font-bold text-foreground">Kajian Alfiyah Ibn Malik</div>
                  <div className="text-[10px] text-muted-foreground">Oleh: Ust. M. Ali • Ruang Kelas Wustho</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
