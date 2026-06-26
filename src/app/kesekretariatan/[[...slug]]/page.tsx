'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KPICard } from '@/components/ui/kpi-card';
import { DataTable } from '@/components/ui/data-table';
import { mockSantri, mockLetters } from '@/config/mock-data';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Users, ShieldCheck, UserPlus, Mail, ClipboardList
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function KesekretariatanDashboard() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string[] | undefined;
  
  // Dynamic derived active tab based on route slug
  const activeTab = (slug?.[0] as 'umum' | 'satu' | 'dua' | 'tiga') || 'umum';

  // 1. Columns for Santri Table (Sekretaris I)
  const santriColumns: ColumnDef<typeof mockSantri[0]>[] = [
    { accessorKey: 'nis', header: 'NIS' },
    { accessorKey: 'name', header: 'Nama Santri' },
    { accessorKey: 'blok', header: 'Blok' },
    { accessorKey: 'kamar', header: 'Kamar' },
    { accessorKey: 'kelasFormal', header: 'Sekolah Formal' },
    { accessorKey: 'status', header: 'Status' }
  ];

  // 2. Columns for Letters Table (Sekretaris II)
  const letterColumns: ColumnDef<typeof mockLetters[0]>[] = [
    { accessorKey: 'number', header: 'Nomor Surat' },
    { accessorKey: 'title', header: 'Perihal' },
    { accessorKey: 'type', header: 'Jenis' },
    { accessorKey: 'sender', header: 'Pengirim/Instansi' },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          row.original.status === 'Disetujui' || row.original.status === 'Diarsipkan'
            ? 'bg-emerald-500/10 text-emerald-500'
            : row.original.status === 'Draft'
            ? 'bg-slate-500/10 text-slate-500'
            : 'bg-amber-500/10 text-amber-500'
        }`}>
          {row.original.status}
        </span>
      )
    }
  ];

  // Tabs Configuration
  const tabs = [
    { id: 'umum', label: 'Sekretaris Umum', icon: ShieldCheck },
    { id: 'satu', label: 'Sekretaris I (Santri)', icon: Users },
    { id: 'dua', label: 'Sekretaris II (Persuratan)', icon: Mail },
    { id: 'tiga', label: 'Sekretaris III (Evaluasi)', icon: ClipboardList }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4 text-left">
        <h1 className="text-xl font-black text-foreground">Dashboard Kesekretariatan</h1>
        <p className="text-xs text-muted-foreground">
          Pusat Administrasi PPDS. Navigasikan ke masing-masing divisi kesekretariatan untuk mengelola data operasional.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-border/40 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => router.replace(`/kesekretariatan/${tab.id}`)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all relative ${
                isActive 
                  ? 'text-primary bg-primary/5' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeSecretariatTab"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-primary" 
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* 1. SEKRETARIS UMUM */}
          {activeTab === 'umum' && (
            <div className="space-y-6 text-left">
              {/* KPI */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard title="SK Pengurus Aktif" value="12 SK" description="SK kepengurusan periode ini" iconName="FileText" />
                <KPICard title="Pengusulan Mutasi" value="1 Pengajuan" description="Draf mutasi pengurus masuk" iconName="UserPlus" status="warning" />
                <KPICard title="Rangkap Jabatan" value="3 Pengurus" description="Pengurus memegang >1 posisi" iconName="Users" status="info" />
                <KPICard title="Periode Aktif" value="2026/2027" description="Tahun Ajaran/Kepengurusan" iconName="Calendar" status="success" />
              </div>

              {/* Fitur Draf Mutasi Pengurus */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass">
                <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    Simulasi Pengajuan Mutasi Jabatan Staf
                  </h2>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-lg border border-border bg-secondary/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-foreground">Pengusulan Mutasi: Ahmad Rafli (Anggota Blok)</div>
                      <div className="text-[10px] text-muted-foreground">Diajukan oleh: Kasie Keamanan • Rencana Jabatan Baru: Anggota Keamanan</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => alert('Mutasi Disetujui! Hak akses user diperbarui.')}
                        className="px-3 py-1.5 rounded bg-primary text-primary-foreground font-bold shadow-sm"
                      >
                        Setujui Mutasi
                      </button>
                      <button 
                        onClick={() => alert('Mutasi Ditolak')}
                        className="px-3 py-1.5 rounded border border-border bg-card font-bold hover:bg-secondary"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SEKRETARIS I */}
          {activeTab === 'satu' && (
            <div className="space-y-6 text-left">
              {/* KPI */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard title="Total Santri" value={mockSantri.length} description="Jumlah santri mukim" iconName="Users" />
                <KPICard title="Kamar Terisi" value="A-01, A-02, B-01, C-01" description="Pemetaan kamar aktif" iconName="Home" status="success" />
                <KPICard title="Sekolah Formal" value="3 Instansi" description="MA, SMA, SMP Islam" iconName="GraduationCap" status="info" />
                <KPICard title="Kelompok Jam'iyyah" value="4 Kelompok" description="Kelompok pembinaan santri" iconName="Users" status="warning" />
              </div>

              {/* Data Table Santri */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Daftar Data Santri PPDS</h3>
                <DataTable 
                  columns={santriColumns} 
                  data={mockSantri} 
                  searchColumnKey="name" 
                  searchPlaceholder="Cari nama santri..."
                />
              </div>
            </div>
          )}

          {/* 3. SEKRETARIS II */}
          {activeTab === 'dua' && (
            <div className="space-y-6 text-left">
              {/* KPI */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard title="Surat Masuk" value="8 Surat" description="Surat masuk terdaftar" iconName="Mail" />
                <KPICard title="Surat Keluar" value="12 Surat" description="Surat resmi diterbitkan" iconName="Send" status="success" />
                <KPICard title="Disposisi Pending" value="1 Lembar" description="Menunggu instruksi seksi" iconName="CornerDownRight" status="warning" />
                <KPICard title="Arsip Surat" value="45 Dokumen" description="Pindaian berkas digital" iconName="Folder" status="info" />
              </div>

              {/* Data Table Surat */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Log Persuratan Pondok</h3>
                <DataTable 
                  columns={letterColumns} 
                  data={mockLetters} 
                  searchColumnKey="title" 
                  searchPlaceholder="Cari perihal surat..."
                />
              </div>
            </div>
          )}

          {/* 4. SEKRETARIS III */}
          {activeTab === 'tiga' && (
            <div className="space-y-6 text-left">
              {/* KPI */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard title="Agenda Bulan Ini" value="6 Kegiatan" description="Kalender kerja terjadwal" iconName="Calendar" />
                <KPICard title="Capaian Program" value="92%" description="Persentase proker selesai" iconName="BarChart4" status="success" />
                <KPICard title="Evaluasi Seksi" value="19 Seksi" description="Seksi terdaftar dalam sistem" iconName="ClipboardList" status="info" />
                <KPICard title="Notulen Rapat" value="15 Berkas" description="Hasil rapat dewan harian" iconName="PenTool" status="warning" />
              </div>

              {/* Laporan Kinerja Seksi */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass">
                <div className="border-b border-border/30 pb-3 mb-4">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Monitoring & Evaluasi Target Seksi</h2>
                </div>
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>Seksi Keamanan (Pemberantasan Bullying)</span>
                      <span className="text-primary">100% Target</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>Seksi Pendidikan (Kajian Kitab Kuning)</span>
                      <span className="text-primary">85% Target</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>Seksi Laboratorium (Sistem POS Kasir Komputer)</span>
                      <span className="text-primary">70% Target</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
