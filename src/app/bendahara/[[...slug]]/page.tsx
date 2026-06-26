'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { mockBudgets } from '@/config/mock-data';
import { Coins, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function BendaharaDashboard() {
  const { currentUser, addNotification } = useApp();
  
  // Local state for dummy transactions in kas
  const [cashBalance, setCashBalance] = useState(142850000);
  const [budgets, setBudgets] = useState(mockBudgets);

  const isAuthorized = currentUser.permissions.includes('bendahara_dashboard_view');

  const approveBudget = (id: string, amount: number) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, status: 'Pencairan' } : b));
    setCashBalance(prev => prev - amount);
    addNotification(
      'RAB Dicairkan',
      `Dana pengajuan sebesar Rp ${amount.toLocaleString()} telah dicairkan oleh Bendahara Utama.`,
      'anggaran'
    );
    alert('Dana berhasil dicairkan! Saldo kas utama berkurang.');
  };

  // Mock list of seksi deposits waiting for validation
  const [seksiSetoran, setSeksiSetoran] = useState([
    { id: 'dep-1', seksi: 'BUMP (POS Penjualan)', details: 'Setoran laba penjualan kasir minimarket', amount: 3500000, date: 'Hari ini, 08:00', status: 'Pending' },
    { id: 'dep-2', seksi: 'Laboratorium', details: 'Setoran pendapatan harian rental & print', amount: 320000, date: 'Hari ini, 09:30', status: 'Pending' },
    { id: 'dep-3', seksi: 'PLP (Fasilitas)', details: 'Iuran pembayaran listrik kamar A-02', amount: 157500, date: 'Kemarin, 16:00', status: 'Verified' }
  ]);

  const verifyDeposit = (id: string, amount: number) => {
    setSeksiSetoran(prev => prev.map(dep => dep.id === id ? { ...dep, status: 'Verified' } : dep));
    setCashBalance(prev => prev + amount);
    addNotification(
      'Setoran Terverifikasi',
      `Uang masuk dari seksi sebesar Rp ${amount.toLocaleString()} telah diverifikasi.`,
      'umum'
    );
    alert('Setoran fisik diterima & diverifikasi! Saldo kas utama bertambah.');
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin `bendahara_dashboard_view`.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran menjadi H. Zaid Muzakki (Bendahara Umum).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4 text-left">
        <h1 className="text-xl font-black text-foreground">Dashboard Bendahara Pondok</h1>
        <p className="text-xs text-muted-foreground">
          Manajemen kas utama, pencairan dana program kerja seksi, dan pencatatan iuran setoran seksi.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Saldo Kas Utama"
          value={`Rp ${cashBalance.toLocaleString()}`}
          description="Total saldo aktif kas utama"
          iconName="Wallet"
          status="warning"
        />
        <KPICard
          title="Setoran Seksi Pending"
          value={seksiSetoran.filter(s => s.status === 'Pending').length}
          description="Uang masuk menunggu verifikasi"
          iconName="Coins"
          status="success"
        />
        <KPICard
          title="Pengajuan RAB Pending"
          value={budgets.filter(b => b.status === 'Musyawarah').length}
          description="Usulan dana menunggu keputusan"
          iconName="Clock"
          status="danger"
        />
        <KPICard
          title="Total Pengeluaran Bulan Ini"
          value="Rp 12.800.000"
          description="Alokasi dana seksi teralisasi"
          iconName="ArrowDownRight"
          status="info"
        />
      </div>

      {/* Grid Utama */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Kolom 1 & 2: Pengajuan RAB & Verifikasi LPJ */}
        <div className="lg:col-span-2 space-y-6 text-left">
          
          {/* List RAB Seksi */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass">
            <div className="flex items-center gap-2 border-b border-border/30 pb-3 mb-4">
              <Clock className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-extrabold text-foreground">Pencairan Dana Anggaran Seksi</h2>
            </div>

            <div className="space-y-4">
              {budgets.map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl border border-border bg-secondary/15 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{b.title}</span>
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                          {b.seksi}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{b.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-foreground">Rp {b.amount.toLocaleString()}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">Diajukan oleh: {b.proposedBy}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/20 pt-2.5">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-muted-foreground">Status Alur:</span>
                      <span className={`font-bold uppercase tracking-wider ${
                        b.status === 'Musyawarah' 
                          ? 'text-amber-500' 
                          : b.status === 'Pencairan' 
                          ? 'text-blue-500' 
                          : 'text-emerald-500'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    {b.status === 'Musyawarah' && (
                      <button
                        onClick={() => approveBudget(b.id, b.amount)}
                        className="px-3 py-1 rounded bg-primary hover:bg-primary/95 text-primary-foreground text-[10px] font-bold shadow-sm"
                      >
                        Cairkan Dana Sekarang
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kolom 3: Setoran Seksi (Verifikasi) */}
        <div className="space-y-6 text-left">
          
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass">
            <div className="flex items-center gap-2 border-b border-border/30 pb-3 mb-4">
              <Coins className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-extrabold text-foreground">Verifikasi Setoran Seksi</h2>
            </div>

            <div className="space-y-3.5">
              {seksiSetoran.map((dep) => (
                <div key={dep.id} className="p-3 rounded-lg border border-border bg-secondary/10 flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-primary uppercase">{dep.seksi}</span>
                      <div className="text-xs font-bold text-foreground leading-tight">{dep.details}</div>
                    </div>
                    <span className="text-xs font-black text-foreground shrink-0">
                      Rp {dep.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] border-t border-border/10 pt-1.5">
                    <span className="text-muted-foreground">{dep.date}</span>
                    {dep.status === 'Pending' ? (
                      <button
                        onClick={() => verifyDeposit(dep.id, dep.amount)}
                        className="px-2 py-1 rounded bg-primary text-primary-foreground font-bold hover:scale-102"
                      >
                        Terima & Verifikasi
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-500 font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        Terverifikasi
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
