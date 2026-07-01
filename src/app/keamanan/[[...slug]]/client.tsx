'use client';

import React, { useState, useTransition } from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { DataTable } from '@/components/ui/data-table';
import { FormDialog } from '@/components/master';
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
import { approvePermitAction, createPermitAction, addOffenseAction } from '@/modules/keamanan/actions/keamanan.action';

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

export default function KeamananDashboardClient({
  initialPermits,
  initialOffenses,
  santriList,
  pondokProfile
}: {
  initialPermits: any[],
  initialOffenses: any[],
  santriList: any[],
  pondokProfile?: any
}) {
  const { currentUser, addNotification, showToast } = useApp();
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string[] | undefined;
  const [isPending, startTransition] = useTransition();
  
  // Set active tab based on path slug
  const activeTab = slugToTab(slug?.[0]);

  const permits = initialPermits;
  const offenses = initialOffenses;

  const [skkbSantriId, setSkkbSantriId] = useState('');
  const [skkbStatus, setSkkbStatus] = useState<'idle' | 'verified' | 'failed'>('idle');

  const [modalMotor, setModalMotor] = useState(false);
  const [modalElektronik, setModalElektronik] = useState(false);
  const [modalKompor, setModalKompor] = useState(false);

  // New Permit Modal States
  const [modalPermit, setModalPermit] = useState(false);
  const [permitSantriId, setPermitSantriId] = useState('');
  const [permitType, setPermitType] = useState('Keluar Pondok');
  const [permitNotes, setPermitNotes] = useState('');
  const [permitDays, setPermitDays] = useState(1);

  // New Offense Modal States
  const [modalOffense, setModalOffense] = useState(false);
  const [offenseSantriId, setOffenseSantriId] = useState('');
  const [offenseCategory, setOffenseCategory] = useState('Ringan');
  const [offenseDesc, setOffenseDesc] = useState('');
  const [offensePoints, setOffensePoints] = useState(10);

  // Check access: Keamanan / Dewan Harian
  const isAuthorized = currentUser.permissions.includes('keamanan.dashboard.view');

  const approvePermit = async (id: string) => {
    startTransition(async () => {
      try {
        await approvePermitAction(id);
        addNotification('Izin Santri Disetujui', 'Kartu Gate Pass izin keluar santri diterbitkan oleh Keamanan.', 'perizinan');
        showToast({ title: 'Sukses', message: 'Izin berhasil disetujui! Kartu gate pass aktif.', type: 'success' });
      } catch (err: any) {
        showToast({ title: 'Gagal', message: err.message, type: 'error' });
      }
    });
  };

  const handleCreatePermit = async () => {
    if (!permitSantriId) return alert('Pilih santri terlebih dahulu');
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(permitDays));

    startTransition(async () => {
      try {
        await createPermitAction({
          santriId: permitSantriId,
          type: permitType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          notes: permitNotes
        });
        setModalPermit(false);
        showToast({ title: 'Sukses', message: 'Izin berhasil dibuat (Draft).', type: 'success' });
      } catch (err: any) {
        showToast({ title: 'Gagal', message: err.message, type: 'error' });
      }
    });
  };

  const handleCreateOffense = async () => {
    if (!offenseSantriId || !offenseDesc) return alert('Lengkapi form pelanggaran');
    
    startTransition(async () => {
      try {
        await addOffenseAction({
          santriId: offenseSantriId,
          category: offenseCategory,
          description: offenseDesc,
          points: Number(offensePoints),
          handlerName: currentUser.name
        });
        setModalOffense(false);
        showToast({ title: 'Sukses', message: 'Pelanggaran berhasil dicatat.', type: 'success' });
      } catch (err: any) {
        showToast({ title: 'Gagal', message: err.message, type: 'error' });
      }
    });
  };

  const verifySKKB = () => {
    if (!skkbSantriId) return;
    const santri = santriList.find(s => s.id === skkbSantriId);
    if (!santri) return;

    // Hitung poin real dari database offenses!
    const santriOffenses = offenses.filter(o => o.santriId === skkbSantriId);
    const totalPoints = santriOffenses.reduce((sum, o) => sum + o.points, 0);

    if (totalPoints >= 40) {
      setSkkbStatus('failed');
      alert(`Santri memiliki ${totalPoints} poin pelanggaran (Melampaui batas maksimal 40 poin). SKKB Ditolak!`);
    } else {
      setSkkbStatus('verified');
      addNotification(
        'SKKB Diverifikasi',
        `Rekomendasi Surat Kelakuan Baik untuk ${santri.name} disetujui keamanan.`,
        'umum'
      );
      showToast({ title: 'Sukses', message: 'Verifikasi kelakuan baik sukses! SKKB siap dicetak.', type: 'success' });
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
      cell: ({ row }) => row.original.status === 'Draft' || row.original.status === 'Rekomendasi_Blok' || row.original.status === 'Rekomendasi Blok' ? (
        <button
          onClick={() => approvePermit(row.original.id)}
          disabled={isPending}
          className="px-2 py-1 rounded bg-primary text-primary-foreground text-[10px] font-bold shadow-sm disabled:opacity-50"
        >
          {isPending ? 'Loading...' : 'Setujui / Gate Pass'}
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
    { accessorKey: 'handlerName', header: 'Penindak' },
    { accessorKey: 'date', header: 'Tanggal', cell: ({row}) => new Date(row.original.date).toLocaleDateString('id-ID') }
  ];

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul keamanan.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 print:hidden">
        {/* Header */}
        <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4 text-left">
          <h1 className="text-xl font-black text-foreground">Seksi Keamanan & Ketertiban</h1>
          <p className="text-xs text-muted-foreground">
            Pusat kendali perizinan gerbang utama, kedisiplinan santri, generator SKKB, dan registrasi inventaris bawaan.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Total Izin Tercatat" value={permits.length} description="Semua data perizinan di DB" iconName="Key" status="primary" />
          <KPICard title="Izin Belum Disetujui" value={permits.filter(p => p.status === 'Draft').length} description="Menunggu tindakan" iconName="AlertTriangle" status="danger" />
          <KPICard title="Total Pelanggaran" value={offenses.length} description="Semua kasus pelanggaran" iconName="HeartHandshake" status="success" />
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
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Log Perizinan & Gerbang Utama</h3>
                <button 
                  onClick={() => setModalPermit(true)}
                  className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-bold"
                >
                  Buat Izin Baru
                </button>
              </div>
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
                    {santriList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.nis})
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
                      onClick={() => window.print()}
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
                  onClick={() => setModalOffense(true)}
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
                <p className="text-[10px] text-muted-foreground mt-0.5">Mock fitur absensi otomatis.</p>
              </div>

              <div className="space-y-4 text-xs mt-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase text-[10px]">Cari & Pilih Santri</label>
                  <select className="w-full rounded-lg border border-border bg-background p-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-primary/50">
                    <option value="">-- Pilih Santri --</option>
                    {santriList.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => alert('Fitur dalam pengembangan!')} 
                    className="flex-1 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/30 transition-all font-bold"
                  >
                    Catat Berangkat
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
                <button onClick={() => setModalMotor(true)} className="w-full py-1.5 text-center text-xs font-bold rounded bg-primary/10 text-primary border border-primary/20">
                  Registrasi Motor Baru
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Dialogs Buat Izin & Pelanggaran (Connected to DB) */}
        <FormDialog title="Buat Izin Keluar/Pulang (DB)" isOpen={modalPermit} onOpenChange={setModalPermit}>
          <div className="space-y-4 p-2 text-sm">
            <div className="space-y-1.5">
              <label className="font-semibold">Nama Santri</label>
              <select value={permitSantriId} onChange={e => setPermitSantriId(e.target.value)} className="w-full p-2 rounded-md border bg-background focus:outline-none focus:border-primary/50">
                <option value="">-- Pilih Santri --</option>
                {santriList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold">Keperluan</label>
              <select value={permitType} onChange={e => setPermitType(e.target.value)} className="w-full p-2 rounded-md border bg-background focus:outline-none focus:border-primary/50">
                <option>Keluar Pondok</option>
                <option>Pulang (Sakit)</option>
                <option>Pulang (Izin)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold">Berapa Hari?</label>
              <input type="number" min="1" value={permitDays} onChange={e => setPermitDays(Number(e.target.value))} className="w-full p-2 rounded-md border bg-background focus:outline-none focus:border-primary/50" />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold">Catatan</label>
              <input type="text" value={permitNotes} onChange={e => setPermitNotes(e.target.value)} className="w-full p-2 rounded-md border bg-background focus:outline-none focus:border-primary/50" placeholder="Keterangan..." />
            </div>
            <button onClick={handleCreatePermit} disabled={isPending} className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg mt-4 disabled:opacity-50">
              {isPending ? 'Menyimpan...' : 'Simpan Izin'}
            </button>
          </div>
        </FormDialog>

        <FormDialog title="Catat Pelanggaran Santri (DB)" isOpen={modalOffense} onOpenChange={setModalOffense}>
          <div className="space-y-4 p-2 text-sm">
            <div className="space-y-1.5">
              <label className="font-semibold">Nama Santri</label>
              <select value={offenseSantriId} onChange={e => setOffenseSantriId(e.target.value)} className="w-full p-2 rounded-md border bg-background focus:outline-none focus:border-primary/50">
                <option value="">-- Pilih Santri --</option>
                {santriList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold">Kategori Pelanggaran</label>
              <select value={offenseCategory} onChange={e => setOffenseCategory(e.target.value)} className="w-full p-2 rounded-md border bg-background focus:outline-none focus:border-primary/50">
                <option>Ringan</option>
                <option>Sedang</option>
                <option>Berat</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold">Deskripsi</label>
              <input type="text" value={offenseDesc} onChange={e => setOffenseDesc(e.target.value)} className="w-full p-2 rounded-md border bg-background focus:outline-none focus:border-primary/50" placeholder="Contoh: Tidak sholat berjamaah" />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold">Poin Sanksi</label>
              <input type="number" min="1" value={offensePoints} onChange={e => setOffensePoints(Number(e.target.value))} className="w-full p-2 rounded-md border bg-background focus:outline-none focus:border-primary/50" />
            </div>
            <button onClick={handleCreateOffense} disabled={isPending} className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-lg mt-4 disabled:opacity-50">
              {isPending ? 'Menyimpan...' : 'Simpan Pelanggaran'}
            </button>
          </div>
        </FormDialog>

        <FormDialog title="Fitur Registrasi Mock" isOpen={modalMotor} onOpenChange={setModalMotor}>
          <div className="p-4 text-center">Modul registrasi belum terhubung DB. (Fitur Sprint berikutnya).</div>
        </FormDialog>

      </div>

      {/* === PRINTABLE SKKB DOCUMENT === */}
      {skkbStatus === 'verified' && skkbSantriId && (
        <div className="hidden print:block fixed inset-0 bg-white z-9999 p-12 text-black" style={{ width: '210mm', minHeight: '297mm', color: 'black' }}>
          {(() => {
            const s = santriList.find(x => x.id === skkbSantriId);
            if (!s) return null;
            // Hitung total poin
            const santriOffenses = offenses.filter(o => o.santriId === skkbSantriId);
            const totalPoints = santriOffenses.reduce((sum, o) => sum + o.points, 0);

            return (
              <div className="space-y-8">
                {/* Kop Surat */}
                <div className="flex items-center gap-6 border-b-4 border-double border-black pb-4 mb-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-sidebar.png" alt="Logo" className="w-24 h-24 object-contain" />
                  <div className="text-center flex-1 space-y-1">
                    <h1 className="text-2xl font-black uppercase tracking-widest">{pondokProfile?.name || 'NAMA PONDOK'}</h1>
                    <p className="text-sm font-semibold uppercase">Seksi Keamanan & Ketertiban Santri</p>
                    <p className="text-xs">{pondokProfile?.address || 'Alamat pondok'}</p>
                  </div>
                </div>

                {/* Judul Surat */}
                <div className="text-center space-y-1 mb-10">
                  <h2 className="text-xl font-bold uppercase underline">Surat Keterangan Kelakuan Baik</h2>
                  <p className="text-sm">
                    Nomor: {`${(s.nis || '000').slice(-3).padStart(3, '0')}/SKKB/KEAM/${['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][new Date().getMonth()]}/${new Date().getFullYear()}`}
                  </p>
                </div>

                {/* Isi Surat */}
                <div className="text-justify text-sm leading-relaxed space-y-4">
                  <p>
                    Yang bertanda tangan di bawah ini, Kepala Seksi Keamanan {pondokProfile?.name || 'Pondok Pesantren'}, menerangkan dengan sesungguhnya bahwa santri di bawah ini:
                  </p>

                  <div className="px-8 space-y-2 font-semibold">
                    <div className="grid grid-cols-[220px_10px_1fr]">
                      <span>Nama Lengkap</span><span>:</span><span>{s.name}</span>
                    </div>
                    <div className="grid grid-cols-[220px_10px_1fr]">
                      <span>Nomor Induk Santri</span><span>:</span><span>{s.nis}</span>
                    </div>
                  </div>

                  <p className="mt-6">
                    Adalah benar santri aktif {pondokProfile?.name || 'Pondok Pesantren'}. Berdasarkan catatan dan evaluasi buku besar pelanggaran Seksi Keamanan, santri tersebut <strong>memiliki Total Poin Pelanggaran: {totalPoints} Poin</strong>.
                  </p>
                  <p>
                    Karena poin pelanggaran yang bersangkutan berada di bawah batas maksimal sanksi berat (40 Poin), maka yang bersangkutan dinyatakan <strong>BERKELAKUAN BAIK</strong> dan tidak sedang dalam masa skorsing atau sanksi administrasi pondok pesantren.
                  </p>
                  <p>
                    Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dipergunakan sebagaimana mestinya.
                  </p>
                </div>

                {/* Tanda Tangan */}
                <div className="flex justify-end mt-16 text-sm">
                  <div className="text-center space-y-16">
                    <p>{pondokProfile?.address?.split(',').pop()?.trim() || 'Pondok'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Kepala Seksi Keamanan,</p>
                    <div className="font-bold underline uppercase">{currentUser?.name || 'Pengurus Keamanan'}</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </>
  );
}
