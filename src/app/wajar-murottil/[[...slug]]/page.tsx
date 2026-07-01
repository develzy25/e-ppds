'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { mockSantri } from '@/config/mock-data';
import { Plus, ShieldCheck } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function WajarMurottilDashboard() {
  const { currentUser, addNotification } = useApp();
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string[] | undefined;
  
  // Set active tab based on path slug
  const activeTab = slug?.[0] === 'murottil' ? 'murottil' : 'wajar';

  // Wajar state (Attendance Simulation)
  const [attendance, setAttendance] = useState<Record<string, 'Hadir' | 'Sakit' | 'Izin' | 'Alfa'>>({
    s1: 'Hadir',
    s2: 'Hadir',
    s3: 'Izin',
    s4: 'Hadir',
    s5: 'Hadir'
  });

  // Murottil state (Hafalan progress list)
  const [murottilLogs, setMurottilLogs] = useState([
    { id: 'm-1', name: 'Ahmad Rafli Fauzi', juz: 30, surat: 'An-Naba', ayat: '1-20', status: 'Lancar (Jayyid Jiddan)' },
    { id: 'm-2', name: 'Muhammad Zinedine', juz: 30, surat: 'Al-Buruj', ayat: '1-22', status: 'Lancar (Jayyid)' },
    { id: 'm-3', name: 'Luthfi Hakim', juz: 1, surat: 'Al-Baqarah', ayat: '1-15', status: 'Cukup (Maqbul)' }
  ]);

  // Form input setoran baru
  const [selectedSantriId, setSelectedSantriId] = useState('');
  const [inputJuz, setInputJuz] = useState<number>(30);
  const [inputSurat, setInputSurat] = useState('An-Naziat');
  const [inputAyat, setInputAyat] = useState('1-15');
  const [inputStatus, setInputStatus] = useState('Lancar (Jayyid)');

  const isAuthorized = currentUser.permissions.includes('pendidikan.wajar.view');

  const updateAttendance = (santriId: string, status: 'Hadir' | 'Sakit' | 'Izin' | 'Alfa') => {
    setAttendance(prev => ({
      ...prev,
      [santriId]: status
    }));
  };

  const submitAttendance = () => {
    addNotification(
      'Absensi Kelas Wajar',
      'Daftar absensi kelas Wajib Belajar sore ini berhasil dikirim ke Kesekretariatan.',
      'umum'
    );
    alert('Absensi berhasil disimpan!');
  };

  const addSetoran = () => {
    if (!selectedSantriId) return;
    const santri = mockSantri.find(s => s.id === selectedSantriId);
    if (!santri) return;

    const newLog = {
      id: `m-${Date.now()}`,
      name: santri.name,
      juz: inputJuz,
      surat: inputSurat,
      ayat: inputAyat,
      status: inputStatus
    };

    setMurottilLogs(prev => [newLog, ...prev]);
    addNotification(
      'Setoran Hafalan Baru',
      `Santri ${santri.name} menyelesaikan setoran Surat ${inputSurat} ayat ${inputAyat} Juz ${inputJuz}.`,
      'umum'
    );

    alert('Setoran hafalan baru berhasil dicatat!');
    setSelectedSantriId('');
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul Wajar / Murottil.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran menjadi M. Lulu Khulaluddin (Sekretaris Umum).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4 text-left">
        <h1 className="text-xl font-black text-foreground">Wajib Belajar & Murottil Hafalan</h1>
        <p className="text-xs text-muted-foreground">
          Pusat kendali kehadiran santri kelas Wajar (sore/malam) dan perkembangan setoran hafalan Al-Qur&apos;an (Murottil).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Kehadiran Wajar" value="94%" description="Rerata kehadiran kelas sore" iconName="CheckSquare" status="success" />
        <KPICard title="Total Setoran Hafalan" value={murottilLogs.length} description="Setoran ayat tercatat bulan ini" iconName="BookOpen" status="primary" />
        <KPICard title="Santri Khatam Juz 30" value="12 Santri" description="Capaian tahfidz juz 30" iconName="Award" status="info" />
        <KPICard title="Kelas Wajar Aktif" value="4 Kelas" description="Ula 1 s/d Wustho 3" iconName="ListTodo" status="warning" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/40 pb-2">
        <button onClick={() => router.replace('/wajar-murottil/wajar')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'wajar' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          Absensi Kelas Wajar
        </button>
        <button onClick={() => router.replace('/wajar-murottil/murottil')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'murottil' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          Setoran Hafalan Murottil
        </button>
      </div>

      {/* Content */}
      <div className="text-left">
        {activeTab === 'wajar' && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4 max-w-3xl">
            <div className="flex justify-between items-center border-b border-border/30 pb-2.5">
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Input Absensi Kelas Sore</h4>
                <p className="text-[10px] text-muted-foreground">Pilih status kehadiran santri pengikut Wajib Belajar.</p>
              </div>
              <button
                onClick={submitAttendance}
                className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-sm"
              >
                Simpan & Kirim Absensi
              </button>
            </div>

            <div className="divide-y divide-border/45">
              {mockSantri.map((s) => (
                <div key={s.id} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-foreground">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground">NIS: {s.nis} • Kamar: {s.kamar} ({s.blok})</div>
                  </div>

                  {/* Radio Buttons Kehadiran */}
                  <div className="flex gap-2">
                    {['Hadir', 'Sakit', 'Izin', 'Alfa'].map((st) => {
                      const isSel = attendance[s.id] === st;
                      const colors = {
                        Hadir: 'border-emerald-500 text-emerald-500 bg-emerald-500/5',
                        Sakit: 'border-amber-500 text-amber-500 bg-amber-500/5',
                        Izin: 'border-sky-500 text-sky-500 bg-sky-500/5',
                        Alfa: 'border-rose-500 text-rose-500 bg-rose-500/5'
                      };
                      return (
                        <button
                          key={st}
                          onClick={() => updateAttendance(s.id, st as 'Hadir' | 'Sakit' | 'Izin' | 'Alfa')}
                          className={`px-3 py-1 rounded border text-[10px] font-bold transition-all ${
                            isSel ? colors[st as keyof typeof colors] : 'border-border bg-card text-muted-foreground'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'murottil' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Input Setoran Baru (col-span-1) */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4 text-xs">
              <div className="flex items-center gap-2 border-b border-border/20 pb-2">
                <Plus className="h-4 w-4 text-primary" />
                <h4 className="font-bold text-foreground uppercase tracking-wider">Catat Setoran Hafalan Baru</h4>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Nama Santri</label>
                  <select 
                    value={selectedSantriId}
                    onChange={(e) => setSelectedSantriId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2 font-bold text-foreground focus:outline-none"
                  >
                    <option value="">-- Pilih Santri --</option>
                    {mockSantri.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-3 grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Juz</label>
                    <input 
                      type="number" 
                      value={inputJuz}
                      onChange={(e) => setInputJuz(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background p-2 font-bold text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Surat</label>
                    <input 
                      type="text" 
                      value={inputSurat}
                      onChange={(e) => setInputSurat(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background p-2 font-bold text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-3 grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Ayat</label>
                    <input 
                      type="text" 
                      value={inputAyat}
                      onChange={(e) => setInputAyat(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background p-2 font-bold text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Kelancaran</label>
                    <select 
                      value={inputStatus}
                      onChange={(e) => setInputStatus(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background p-2 font-bold text-foreground focus:outline-none"
                    >
                      <option value="Lancar (Jayyid Jiddan)">Lancar (Jayyid Jiddan)</option>
                      <option value="Lancar (Jayyid)">Lancar (Jayyid)</option>
                      <option value="Cukup (Maqbul)">Cukup (Maqbul)</option>
                      <option value="Kurang (Dhoif)">Kurang (Dhoif)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={addSetoran}
                  disabled={!selectedSantriId}
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-md hover:scale-101 disabled:opacity-50 transition-all"
                >
                  Catat Setoran Hafalan
                </button>
              </div>
            </div>

            {/* Riwayat Setoran Murottil (col-span-2) */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4 text-xs">
              <div className="border-b border-border/20 pb-2">
                <h4 className="font-bold text-foreground uppercase tracking-wider">Log Setoran Hafalan Santri</h4>
              </div>

              <div className="space-y-2.5">
                {murottilLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-lg border border-border bg-secondary/15 flex justify-between items-center">
                    <div className="space-y-0.5 text-left">
                      <span className="font-bold text-foreground">{log.name}</span>
                      <div className="text-[10px] text-muted-foreground">
                        Setoran: Surat {log.surat} Ayat {log.ayat} (Juz {log.juz})
                      </div>
                    </div>

                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary shrink-0 uppercase tracking-wider">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
