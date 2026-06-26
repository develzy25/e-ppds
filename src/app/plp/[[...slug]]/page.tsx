'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { mockElectricity } from '@/config/mock-data';
import { CheckCircle, Calculator, ShieldCheck } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

const slugToTab = (slugStr?: string): 'listrik' | 'sound' | 'air' => {
  if (!slugStr) return 'listrik';
  switch (slugStr) {
    case 'listrik': return 'listrik';
    case 'sound': return 'sound';
    case 'pengairan': return 'air';
    default: return 'listrik';
  }
};

const tabToSlug = (tab: 'listrik' | 'sound' | 'air') => {
  switch (tab) {
    case 'listrik': return 'listrik';
    case 'sound': return 'sound';
    case 'air': return 'pengairan';
  }
};

export default function PLPDashboard() {
  const { currentUser, addNotification } = useApp();
  
  // Local state for electricity iuran
  const [electricityLog, setElectricityLog] = useState(mockElectricity);
  
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string[] | undefined;
  
  // Set active tab based on path slug
  const activeTab = slugToTab(slug?.[0]);

  // Input meteran state
  const [inputMeterKamar, setInputMeterKamar] = useState('A-01');
  const [inputMeterValue, setInputMeterValue] = useState<number | ''>('');
  
  const isAuthorized = currentUser.permissions.includes('plp_dashboard_view');

  const recordMeter = () => {
    if (inputMeterValue === '') return;
    
    // Simulate updating meter log for A-01
    setElectricityLog(prev => prev.map(kam => {
      if (kam.kamarName === inputMeterKamar) {
        const usage = inputMeterValue - kam.meterStart;
        const total = usage * kam.ratePerWatt;
        return {
          ...kam,
          meterEnd: inputMeterValue,
          usageWatt: usage,
          totalBill: total,
          status: 'Belum Bayar'
        };
      }
      return kam;
    }));

    addNotification(
      'Meteran Listrik Diinput',
      `Meteran listrik Kamar ${inputMeterKamar} diperbarui ke ${inputMeterValue} Watt.`,
      'umum'
    );

    alert(`Meteran Kamar ${inputMeterKamar} berhasil diperbarui!`);
    setInputMeterValue('');
  };

  const payElectricity = (kamarName: string, amount: number) => {
    setElectricityLog(prev => prev.map(kam => 
      kam.kamarName === kamarName ? { ...kam, status: 'Lunas' } : kam
    ));

    addNotification(
      'Iuran Listrik Lunas',
      `Iuran listrik Kamar ${kamarName} sebesar Rp ${amount.toLocaleString()} telah dilunasi.`,
      'umum'
    );

    alert(`Pembayaran iuran listrik Kamar ${kamarName} sukses!`);
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul PLP.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran menjadi Ust. Fikri Al-Hafidz (Kasie Keamanan, yang memiliki jabatan tambahan anggota PLP).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4 text-left">
        <h1 className="text-xl font-black text-foreground">Seksi PLP (Fasilitas & Lingkungan)</h1>
        <p className="text-xs text-muted-foreground">
          Pusat kendali iuran kelistrikan kamar santri, inventaris sound system, pengelolaan air bersih, dan ro&apos;an berkala.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Daya Kelistrikan" value="33.000 VA" description="Kapasitas daya listrik gardu utama" iconName="Lightbulb" status="primary" />
        <KPICard title="Tunggakan Iuran Listrik" value={electricityLog.filter(e => e.status === 'Belum Bayar').length} description="Kamar belum membayar listrik" iconName="AlertCircle" status="danger" />
        <KPICard title="Sound System Aktif" value="3 Set" description="Unit siap dipinjam seksi/blok" iconName="Volume2" status="success" />
        <KPICard title="Status Pengairan" value="Normal" description="Pompa & pipa air bersih utama" iconName="Droplets" status="info" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/40 pb-2">
        <button onClick={() => router.replace('/plp/listrik')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'listrik' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          Kelistrikan Kamar
        </button>
        <button onClick={() => router.replace('/plp/sound')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'sound' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          Sound System
        </button>
        <button onClick={() => router.replace('/plp/pengairan')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'air' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          Pengairan & Sarana
        </button>
      </div>

      {/* Content */}
      <div className="text-left">
        {activeTab === 'listrik' && (
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Input Meteran Kamar (col-span-1) */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
              <div className="flex items-center gap-2 border-b border-border/20 pb-2">
                <Calculator className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Input Meteran Listrik Kamar</h4>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Pilih Kamar</label>
                  <select 
                    value={inputMeterKamar}
                    onChange={(e) => setInputMeterKamar(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2 font-bold text-foreground focus:outline-none"
                  >
                    {electricityLog.map(kam => (
                      <option key={kam.kamarId} value={kam.kamarName}>
                        {kam.kamarName} ({kam.blokName}) — Meter Awal: {kam.meterStart} W
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Meteran Akhir (Watt)</label>
                  <input 
                    type="number"
                    placeholder="Contoh: 1450"
                    value={inputMeterValue}
                    onChange={(e) => setInputMeterValue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background p-2 font-bold text-foreground focus:outline-none"
                  />
                </div>

                <button
                  onClick={recordMeter}
                  disabled={inputMeterValue === ''}
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-md hover:scale-101 disabled:opacity-50 transition-all"
                >
                  Hitung & Generate Tagihan
                </button>
              </div>
            </div>

            {/* List Tagihan Listrik (col-span-2) */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
              <div className="border-b border-border/20 pb-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Monitoring & Kasir Pembayaran Iuran Listrik</h4>
              </div>

              <div className="space-y-3.5 text-xs">
                {electricityLog.map((kam) => (
                  <div key={kam.kamarId} className="p-3.5 rounded-xl border border-border bg-secondary/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">Kamar {kam.kamarName}</span>
                        <span className="text-[9px] text-muted-foreground">({kam.blokName})</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Meter: {kam.meterStart} W s/d {kam.meterEnd} W • Penggunaan: <strong className="text-foreground/80">{kam.usageWatt} Watt</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div>
                        <div className="font-black text-foreground">Rp {kam.totalBill.toLocaleString()}</div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          kam.status === 'Lunas' ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {kam.status}
                        </span>
                      </div>

                      {kam.status === 'Belum Bayar' && (
                        <button
                          onClick={() => payElectricity(kam.kamarName, kam.totalBill)}
                          className="px-3 py-1.5 rounded bg-primary text-primary-foreground font-bold hover:scale-102 transition-all shadow-sm"
                        >
                          Bayar Listrik
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'sound' && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass text-xs space-y-4 max-w-2xl">
            <div>
              <h4 className="font-bold text-foreground uppercase tracking-wider">Peminjaman Sound System Utama</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Seksi/blok dapat meminjam unit sound system luar untuk kegiatan pengajian atau sholawatan.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-secondary/15 text-center py-8 text-muted-foreground">
              Simulasi: Log peminjaman sound system kosong. Semua unit berada di gudang PLP.
            </div>
          </div>
        )}

        {activeTab === 'air' && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass text-xs space-y-4 max-w-2xl">
            <div>
              <h4 className="font-bold text-foreground uppercase tracking-wider">Kontrol Distribusi Air Bersih</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Sistem memantau level tangki air utama (tandon) dan status pipa Blok A/B/C.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-secondary/15 text-center py-8 text-emerald-500 font-bold flex items-center justify-center gap-1.5">
              <CheckCircle className="h-4.5 w-4.5" />
              Sirkulasi air bersih normal. Pompa hisap utama menyala otomatis.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
