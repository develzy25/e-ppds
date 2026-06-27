'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { DataTable } from '@/components/ui/data-table';
import { mockPermits, mockOffenses, mockSantri } from '@/config/mock-data';
import { ColumnDef } from '@tanstack/react-table';
import { 
  ShieldCheck,
  FileText,
  CheckCircle2,
  Printer,
  ShieldAlert,
  UserCheck,
  Car,
  Tv,
  Flame
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

const slugToTab = (slugStr?: string): 'izin' | 'skkb' | 'pelanggaran' | 'formal' | 'registrasi' => {
  if (!slugStr) return 'izin';
  switch (slugStr) {
    case 'perizinan': return 'izin';
    case 'skkb': return 'skkb';
    case 'pelanggaran':
    case 'bullying':
      return 'pelanggaran';
    case 'formal': return 'formal';
    case 'registrasi': return 'registrasi';
    default: return 'izin';
  }
};

const tabToSlug = (tab: 'izin' | 'skkb' | 'pelanggaran' | 'formal' | 'registrasi') => {
  switch (tab) {
    case 'izin': return 'perizinan';
    case 'skkb': return 'skkb';
    case 'pelanggaran': return 'pelanggaran';
    case 'formal': return 'formal';
    case 'registrasi': return 'registrasi';
  }
};

export default function KeamananDashboard() {
  const { currentUser, addNotification } = useApp();
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string[] | undefined;
  
  // Set active tab based on path slug
  const activeTab = slugToTab(slug?.[0]);

  // local states for demo triggers
  const [permits, setPermits] = useState(mockPermits);
  const offenses = mockOffenses;
  const [skkbSantriId, setSkkbSantriId] = useState('');
  const [skkbStatus, setSkkbStatus] = useState<'idle' | 'verified' | 'failed'>('idle');

  // Check access: Keamanan / Dewan Harian
  const isAuthorized = currentUser.permissions.includes('keamanan_dashboard_view');

  const approvePermit = (id: string) => {
    setPermits(prev => prev.map(p => p.id === id ? { ...p, status: 'Disetujui' } : p));
    addNotification(
      'Izin Santri Disetujui',
      'Kartu Gate Pass izin keluar santri diterbitkan oleh Keamanan.',
      'perizinan'
    );
    alert('Izin berhasil disetujui! Kartu gate pass aktif.');
  };

  const verifySKKB = () => {
    if (!skkbSantriId) return;
    const santri = mockSantri.find(s => s.id === skkbSantriId);
    if (!santri) return;

    if (santri.poinPelanggaran >= 40) {
      setSkkbStatus('failed');
      alert(`Santri memiliki ${santri.poinPelanggaran} poin pelanggaran (Melampaui batas maksimal 40 poin). SKKB Ditolak!`);
    } else {
      setSkkbStatus('verified');
      addNotification(
        'SKKB Diverifikasi',
        `Rekomendasi Surat Kelakuan Baik untuk ${santri.name} disetujui keamanan.`,
        'umum'
      );
      alert('Verifikasi kelakuan baik sukses! SKKB siap dicetak.');
    }
  };

  // Columns definitions for Tables
   
  const permitColumns: ColumnDef<any>[] = [
    { accessorKey: 'id', header: 'ID Izin' },
    { accessorKey: 'santriName', header: 'Nama Santri' },
    { accessorKey: 'type', header: 'Keperluan' },
    { accessorKey: 'endDate', header: 'Batas Kembali', cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString('id-ID') },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          row.original.status === 'Kembali' || row.original.status === 'Disetujui'
            ? 'bg-emerald-500/10 text-emerald-500'
            : row.original.status === 'Aktif'
            ? 'bg-blue-500/10 text-blue-500'
            : 'bg-amber-500/10 text-amber-500'
        }`}>
          {row.original.status}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => row.original.status === 'Rekomendasi_Blok' || row.original.status === 'Rekomendasi Blok' ? (
        <button
          onClick={() => approvePermit(row.original.id)}
          className="px-2 py-1 rounded bg-primary text-primary-foreground text-[10px] font-bold shadow-sm"
        >
          Terbitkan Gate Pass
        </button>
      ) : (
        <span className="text-[10px] text-muted-foreground/60">Tidak ada aksi</span>
      )
    }
  ];

   
  const offenseColumns: ColumnDef<any>[] = [
    { accessorKey: 'santriName', header: 'Nama Santri' },
    { accessorKey: 'category', header: 'Kategori' },
    { accessorKey: 'description', header: 'Pelanggaran' },
    { accessorKey: 'points', header: 'Poin' },
    { accessorKey: 'penalty', header: 'Hukuman (Takzir)' },
    { accessorKey: 'status', header: 'Status' }
  ];

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul keamanan.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran menjadi Ust. Fikri Al-Hafidz (Kasie Keamanan).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4 text-left">
        <h1 className="text-xl font-black text-foreground">Seksi Keamanan & Ketertiban</h1>
        <p className="text-xs text-muted-foreground">
          Pusat kendali perizinan gerbang utama, kedisiplinan santri, generator SKKB, dan registrasi inventaris bawaan.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Izin Aktif Diluar" value={permits.filter(p => p.status === 'Aktif').length} description="Santri sedang di luar area pondok" iconName="Key" status="primary" />
        <KPICard title="Keterlambatan" value={permits.filter(p => p.status === 'Terlambat').length} description="Izin melebihi batas kembali" iconName="AlertTriangle" status="danger" />
        <KPICard title="Kasus Bullying" value="0 Laporan" description="Log aduan penanganan bullying" iconName="HeartHandshake" status="success" />
        <KPICard title="Kendaraan Terdaftar" value="15 Unit" description="Motor pengurus/santri berstiker" iconName="Car" status="info" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/40 pb-2">
        <button onClick={() => router.replace('/keamanan/perizinan')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'izin' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          Perizinan Keluar
        </button>
        <button onClick={() => router.replace('/keamanan/skkb')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'skkb' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          Generator SKKB
        </button>
        <button onClick={() => router.replace('/keamanan/pelanggaran')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'pelanggaran' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          Buku Pelanggaran
        </button>
        <button onClick={() => router.replace('/keamanan/formal')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'formal' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          Absensi Formal
        </button>
        <button onClick={() => router.replace('/keamanan/registrasi')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'registrasi' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          Registrasi Barang
        </button>
      </div>

      {/* Content */}
      <div className="text-left">
        {activeTab === 'izin' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Log Perizinan & Gerbang Utama</h3>
            <DataTable columns={permitColumns} data={permits} searchColumnKey="santriName" searchPlaceholder="Cari nama santri..." />
          </div>
        )}

        {activeTab === 'skkb' && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4 max-w-2xl">
            <div>
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Generator SKKB (Surat Keterangan Kelakuan Baik)
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">Sistem memverifikasi status poin pelanggaran santri sebelum mencetak SKKB.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Pilih Santri Pemohon</label>
                <select
                  value={skkbSantriId}
                  onChange={(e) => {
                    setSkkbSantriId(e.target.value);
                    setSkkbStatus('idle');
                  }}
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="">-- Pilih Santri --</option>
                  {mockSantri.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.nis}) — Poin: {s.poinPelanggaran}
                    </option>
                  ))}
                </select>
              </div>

              {skkbSantriId && (
                <button
                  onClick={verifySKKB}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-md hover:scale-102 transition-all"
                >
                  Verifikasi Rekam Pelanggaran
                </button>
              )}

              {skkbStatus === 'verified' && (
                <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-emerald-500 text-xs font-bold space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    <span>Santri dinyatakan Layak Berkelakuan Baik!</span>
                  </div>
                  <button 
                    onClick={() => alert('Cetak PDF SKKB berhasil dikirim ke printer!')}
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Cetak SKKB Resmi
                  </button>
                </div>
              )}

              {skkbStatus === 'failed' && (
                <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-500 text-xs font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
                  <ShieldAlert className="h-4.5 w-4.5" />
                  <span>Santri tidak layak! Poin pelanggaran melampaui batas toleransi 40 poin.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pelanggaran' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Buku Pencatatan Pelanggaran Disiplin</h3>
              <button 
                onClick={() => alert('Simulasi: Dialog form input pelanggaran dibuka!')}
                className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-bold"
              >
                Catat Pelanggaran Baru
              </button>
            </div>
            <DataTable columns={offenseColumns} data={offenses} searchColumnKey="santriName" searchPlaceholder="Cari nama santri..." />
          </div>
        )}

        {activeTab === 'formal' && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-5 max-w-2xl">
            <div>
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="h-4.5 w-4.5 text-primary" />
                Absensi Keberangkatan & Kepulangan Sekolah Formal
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">Keamanan menginput jam keberangkatan santri menuju gerbang sekolah formal.</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-lg border border-border bg-secondary/15 flex justify-between items-center">
                <div>
                  <div className="font-bold text-foreground">MA Al-Hidayah (Semua Kelas)</div>
                  <div className="text-[10px] text-muted-foreground">Berangkat: 07:00 • Kepulangan: 13:00</div>
                </div>
                <button 
                  onClick={() => alert('Absensi keberangkatan MA berhasil dicatat!')}
                  className="px-3 py-1.5 rounded bg-primary text-primary-foreground font-bold"
                >
                  Absen Berangkat Gerbang (25 Santri)
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registrasi' && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Registrasi Motor */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-border/20 pb-2">
                <Car className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground">Registrasi Motor</h4>
              </div>
              <p className="text-[10px] text-muted-foreground">Stiker parkir barcode plat nomor.</p>
              <button 
                onClick={() => alert('Form registrasi motor baru dibuka!')}
                className="w-full py-1.5 text-center text-xs font-bold rounded bg-primary/10 text-primary border border-primary/20"
              >
                Registrasi Motor Baru
              </button>
            </div>

            {/* Registrasi Elektronik */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-border/20 pb-2">
                <Tv className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground">Registrasi Laptop/HP</h4>
              </div>
              <p className="text-[10px] text-muted-foreground">Barcode IMEI & serial number bawaan santri.</p>
              <button 
                onClick={() => alert('Form registrasi elektronik baru dibuka!')}
                className="w-full py-1.5 text-center text-xs font-bold rounded bg-primary/10 text-primary border border-primary/20"
              >
                Registrasi Elektronik Baru
              </button>
            </div>

            {/* Registrasi Kompor */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-border/20 pb-2">
                <Flame className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground">Registrasi Kompor Kamar</h4>
              </div>
              <p className="text-[10px] text-muted-foreground">Registrasi kompor gas mini dapur kamar.</p>
              <button 
                onClick={() => alert('Form registrasi kompor baru dibuka!')}
                className="w-full py-1.5 text-center text-xs font-bold rounded bg-primary/10 text-primary border border-primary/20"
              >
                Registrasi Kompor Baru
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
