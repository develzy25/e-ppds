'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { mockLabSessions, mockLabTransactions } from '@/config/mock-data';
import { CreditCard, Square, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function LaboratoriumDashboard() {
  const { currentUser, addNotification, showPopup, showConfirm } = useApp();
  const [sessions, setSessions] = useState(mockLabSessions);
  const [posTransactions, setPosTransactions] = useState(mockLabTransactions);
  
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string[] | undefined;
  
  // Set active tab based on path slug
  const activeTab = slug?.[0] === 'pos' ? 'pos' : 'billing';

  // POS State
  const [posService, setPosService] = useState<'Rental' | 'Print' | 'Fotocopy' | 'Scan' | 'Laminating' | 'Jilid'>('Print');
  const [posQty, setPosQty] = useState<number>(1);
  const [posCashAmount, setPosCashAmount] = useState<number | ''>('');
  const [posSuccess, setPosSuccess] = useState(false);

  const isAuthorized = currentUser.permissions.includes('laboratorium.dashboard.view');

  // POS Service Tariffs
  const serviceTariffs = {
    Rental: 6000, // per jam
    Print: 1000,  // per lembar
    Fotocopy: 500, // per lembar
    Scan: 2000,   // per lembar
    Laminating: 7000,
    Jilid: 10000
  };

  const posTotal = serviceTariffs[posService] * posQty;
  const posChange = posCashAmount !== '' && posCashAmount >= posTotal ? posCashAmount - posTotal : 0;

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPosService(e.target.value as "Rental" | "Print" | "Fotocopy" | "Scan" | "Laminating" | "Jilid");
    setPosQty(1);
    setPosCashAmount('');
    setPosSuccess(false);
  };

  const closeSession = (id: string, pc: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'Closed', endTime: new Date().toISOString() } : s));
    addNotification(
      'Session PC Ditutup',
      `Sesi rental pada ${pc} telah ditutup dari server billing.`,
      'umum'
    );
    showPopup({
      title: 'Billing Selesai',
      message: `Sesi rental pada ${pc} telah berhasil ditutup dan billing siap dicetak!`,
      type: 'success',
      duration: 3500
    });
  };

  const confirmCloseSession = (id: string, pc: string) => {
    showConfirm({
      title: 'Tutup Sesi Billing?',
      message: `Apakah Anda yakin ingin menutup sesi rental untuk ${pc}? Tindakan ini akan menghentikan waktu rental dan membuat invoice POS.`,
      type: 'warning',
      confirmLabel: 'Tutup Sesi',
      cancelLabel: 'Batal',
      onConfirm: () => closeSession(id, pc)
    });
  };

  const processPosTransaction = () => {
    if (posCashAmount === '' || posCashAmount < posTotal) {
      showPopup({
        title: 'Pembayaran Kurang',
        message: 'Jumlah uang tunai yang diinput tidak mencukupi total belanja.',
        type: 'error'
      });
      return;
    }

    const newTx = {
      id: `pos-${Date.now()}`,
      type: posService,
      details: `${posService} (${posQty}x)`,
      amount: posTotal,
      cashierName: currentUser.name,
      timestamp: 'Baru saja'
    };

    setPosTransactions(prev => [newTx, ...prev]);
    addNotification(
      'Transaksi POS Lab',
      `Kasir mencatat transaksi jasa ${posService} sebesar Rp ${posTotal.toLocaleString()}`,
      'umum'
    );
    showPopup({
      title: 'Pembayaran Berhasil',
      message: `Transaksi POS jasa ${posService} sebesar Rp ${posTotal.toLocaleString()} berhasil dicatat. Kembalian: Rp ${posChange.toLocaleString()}`,
      type: 'success',
      duration: 4000
    });
    setPosSuccess(true);
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul laboratorium komputer.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran menjadi Ust. M. Ali (Kasie Lab).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4 text-left">
        <h1 className="text-xl font-black text-foreground">Laboratorium Komputer</h1>
        <p className="text-xs text-muted-foreground">
          Server Billing Lab, remote monitoring status client PC, serta POS kasir jasa penunjang (print, scan, fotokopi, jilid).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="PC Client Aktif" value={sessions.filter(s => s.status === 'Active').length} description="PC sedang menyala & digunakan" iconName="Monitor" status="primary" />
        <KPICard title="Omset Lab Hari Ini" value="Rp 21.000" description="Hasil transaksi rental & POS" iconName="Coins" status="success" />
        <KPICard title="Kerusakan Unit" value="1 PC (PC-05)" description="PC dalam proses servis/maintenance" iconName="Wrench" status="danger" />
        <KPICard title="Kuota Voucher Aktif" value="12 User" description="Santri terdaftar di voucher billing" iconName="Users" status="info" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/40 pb-2">
        <button onClick={() => router.replace('/laboratorium/billing')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'billing' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          Billing Server & Client PC
        </button>
        <button onClick={() => router.replace('/laboratorium/pos')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'pos' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-secondary/40'}`}>
          POS Kasir Jasa Lab
        </button>
      </div>

      {/* Content */}
      <div className="text-left">
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Status PC Client Lab (Real-Time)</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, idx) => {
                const pcName = `PC-0${idx + 1}`;
                const activeSess = sessions.find(s => s.clientPc === pcName && s.status === 'Active');
                const isMaintenance = pcName === 'PC-05';

                return (
                  <div 
                    key={pcName}
                    className={`p-4 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between gap-4 card-3d ${
                      activeSess 
                        ? 'border-l-4 border-l-emerald-500' 
                        : isMaintenance 
                        ? 'border-l-4 border-l-rose-500 bg-rose-500/5' 
                        : 'border-l-4 border-l-slate-400 bg-secondary/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">{pcName}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        activeSess 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : isMaintenance 
                          ? 'bg-rose-500/10 text-rose-500 animate-pulse' 
                          : 'bg-slate-500/10 text-slate-500'
                      }`}>
                        {activeSess ? 'Active' : isMaintenance ? 'Repair' : 'Idle'}
                      </span>
                    </div>

                    <div className="text-xs">
                      {activeSess ? (
                        <div className="space-y-1">
                          <div className="text-[10px] text-muted-foreground">User: <strong className="text-foreground/80">{activeSess.userName}</strong></div>
                          <div className="text-[10px] text-muted-foreground">Tarif: <strong className="text-foreground/80">Rp 6.000/jam</strong></div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-muted-foreground">
                          {isMaintenance ? 'Mainboard sedang diperbaiki vendor.' : 'PC siap digunakan oleh santri.'}
                        </div>
                      )}
                    </div>

                    {activeSess && (
                      <button
                        onClick={() => confirmCloseSession(activeSess.id, pcName)}
                        className="w-full py-1 text-center text-[10px] font-bold rounded bg-rose-500 text-white flex items-center justify-center gap-1 hover:bg-rose-600"
                      >
                        <Square className="h-3 w-3" />
                        <span>Log Out Client</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'pos' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* POS Kasir Form (col-span-2) */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
              <div className="flex items-center gap-2 border-b border-border/30 pb-2">
                <Printer className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">POS Kasir Layanan Jasa Lab</h4>
              </div>

              {!posSuccess ? (
                <div className="space-y-4 text-xs">
                  {/* Pilihan Jasa */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Jenis Layanan</label>
                      <select 
                        value={posService}
                        onChange={handleServiceChange}
                        className="w-full rounded-lg border border-border bg-background p-2 font-bold text-foreground focus:outline-none"
                      >
                        <option value="Rental">Rental PC (Rp 6.000/jam)</option>
                        <option value="Print">Jasa Print Dokumen (Rp 1.000/lembar)</option>
                        <option value="Fotocopy">Fotocopy Kertas (Rp 500/lembar)</option>
                        <option value="Scan">Scan Dokumen (Rp 2.000/lembar)</option>
                        <option value="Laminating">Laminating Sertifikat (Rp 7.000)</option>
                        <option value="Jilid">Jilid Buku/Makalah (Rp 10.000)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Jumlah (Quantity)</label>
                      <input 
                        type="number"
                        min={1}
                        value={posQty}
                        onChange={(e) => setPosQty(Math.max(1, Number(e.target.value)))}
                        className="w-full rounded-lg border border-border bg-background p-2 font-bold text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-border/40 my-2" />

                  <div className="flex justify-between items-center text-sm font-extrabold">
                    <span>Total Tarif Jasa:</span>
                    <span className="text-primary text-base">Rp {posTotal.toLocaleString()}</span>
                  </div>

                  {/* Nominal Uang Tunai */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Nominal Uang Tunai</label>
                    <input 
                      type="number"
                      placeholder="Masukkan uang tunai..."
                      value={posCashAmount}
                      onChange={(e) => setPosCashAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background p-2 font-bold text-foreground focus:outline-none"
                    />
                  </div>

                  {posCashAmount !== '' && posCashAmount >= posTotal && (
                    <div className="p-2 rounded bg-emerald-500/10 text-emerald-500 font-bold flex justify-between">
                      <span>Uang Kembalian:</span>
                      <span>Rp {posChange.toLocaleString()}</span>
                    </div>
                  )}

                  <button
                    onClick={processPosTransaction}
                    disabled={posCashAmount === '' || posCashAmount < posTotal}
                    className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow-md hover:scale-101 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Selesaikan Jasa POS</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-foreground">Transaksi POS Selesai!</h4>
                    <p className="text-[10px] text-muted-foreground">Nota transaksi print/rental berhasil ditambahkan ke riwayat lab.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setPosCashAmount('');
                      setPosQty(1);
                      setPosSuccess(false);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold mx-auto block"
                  >
                    Transaksi Baru
                  </button>
                </div>
              )}
            </div>

            {/* Riwayat Transaksi POS Lab (col-span-1) */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
              <div className="border-b border-border/30 pb-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Log Transaksi Kasir Lab</h4>
              </div>

              <div className="space-y-2.5 text-xs">
                {posTransactions.map(tx => (
                  <div key={tx.id} className="p-2.5 rounded-lg border border-border bg-secondary/15 flex justify-between items-center">
                    <div className="space-y-0.5 text-left">
                      <span className="text-[9px] font-bold text-primary uppercase">{tx.type}</span>
                      <div className="font-bold text-foreground">{tx.details}</div>
                      <div className="text-[8px] text-muted-foreground">{tx.timestamp}</div>
                    </div>
                    <span className="font-black text-foreground">Rp {tx.amount.toLocaleString()}</span>
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
