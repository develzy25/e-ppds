'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { mockSantri, mockInvoices, Invoice } from '@/config/mock-data';
import { 
  Receipt, CreditCard, Search, CheckCircle, 
  Printer, Coins, ShieldCheck 
} from 'lucide-react';

export default function KeuanganDashboard() {
  const { currentUser, addNotification } = useApp();

  // Kasir POS State
  const [selectedSantriId, setSelectedSantriId] = useState('');
  const [cashAmount, setCashAmount] = useState<number | ''>('');
  const [paymentDone, setPaymentDone] = useState(false);
  const [activeInvoices, setActiveInvoices] = useState<Invoice[]>(mockInvoices);

  // Filter access: Keuangan / Dewan Harian
  const isAuthorized = currentUser.permissions.includes('keuangan.dashboard.view');

  // Search active santri invoice
  const currentInvoice = activeInvoices.find(
    (inv) => inv.santriId === selectedSantriId && inv.status !== 'Lunas'
  );

  const totalBill = currentInvoice ? currentInvoice.total : 0;
  const changeAmount = cashAmount !== '' && cashAmount >= totalBill ? cashAmount - totalBill : 0;

  const processPayment = () => {
    if (!currentInvoice) return;
    if (cashAmount === '' || cashAmount < totalBill) {
      alert('Uang tunai kurang dari total tagihan!');
      return;
    }

    // Mark current invoice as paid
    setActiveInvoices(prev => prev.map(inv => 
      inv.id === currentInvoice.id 
        ? { ...inv, status: 'Lunas', paidAt: new Date().toISOString(), paymentMethod: 'Cash (Kasir Keuangan)' } 
        : inv
    ));

    addNotification(
      'Pembayaran Kasir Berhasil',
      `Iuran bulanan santri ${currentInvoice.santriName} sebesar Rp ${totalBill.toLocaleString()} telah dilunasi.`,
      'umum'
    );

    setPaymentDone(true);
  };

  const resetKasir = () => {
    setSelectedSantriId('');
    setCashAmount('');
    setPaymentDone(false);
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul keuangan santri.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran menjadi M. Lulu Khulaluddin (Sekretaris Umum).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4 text-left">
        <h1 className="text-xl font-black text-foreground">Sistem Keuangan Santri</h1>
        <p className="text-xs text-muted-foreground">
          Modul Kasir Iuran Syahriyah santri, tagihan bulanan, pencatatan tunggakan, dan setoran dana kepesantrenan.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Omset Kasir Hari Ini"
          value="Rp 3.420.000"
          description="Penerimaan pembayaran lunas"
          iconName="Coins"
          status="success"
        />
        <KPICard
          title="Tunggakan Iuran"
          value={activeInvoices.filter(i => i.status === 'Tunggakan' || i.status === 'Belum Bayar').length}
          description="Santri belum melunasi iuran"
          iconName="AlertTriangle"
          status="danger"
        />
        <KPICard
          title="Master Tarif Tagihan"
          value="4 Paket"
          description="Syahriyah, Diniyah, Listrik, Jamiyyah"
          iconName="FileText"
          status="info"
        />
        <KPICard
          title="Rasio Kepatuhan Iuran"
          value="78%"
          description="Capaian pelunasan bulan berjalan"
          iconName="Receipt"
          status="primary"
        />
      </div>

      {/* POS Kasir Modern */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Kolom 1 & 2: POS Kasir Kas Utama (Left Side) */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-premium glass text-left space-y-6">
          <div className="flex items-center gap-2 border-b border-border/30 pb-3">
            <Receipt className="h-4.5 w-4.5 text-primary" />
            <h2 className="text-sm font-extrabold text-foreground">Kasir POS Iuran Santri (Syahriyah)</h2>
          </div>

          {!paymentDone ? (
            <div className="space-y-4">
              {/* Step 1: Pilih Santri */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Cari Santri / NIS
                </label>
                <div className="relative">
                  <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground/60" />
                  <select
                    value={selectedSantriId}
                    onChange={(e) => setSelectedSantriId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-xs font-bold text-foreground focus:border-primary/50 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Pilih Santri (Lihat Status Tagihan) --</option>
                    {mockSantri.map(s => {
                      const hasUnpaid = activeInvoices.some(i => i.santriId === s.id && i.status !== 'Lunas');
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.nis}) — {hasUnpaid ? '⚠️ Ada Tagihan' : '✓ Lunas'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Rincian Tagihan */}
              {selectedSantriId && (
                <div className="p-4 rounded-xl border border-border bg-secondary/10 space-y-3 animate-in fade-in duration-200">
                  {currentInvoice ? (
                    <>
                      <div className="flex justify-between items-center border-b border-border/30 pb-2">
                        <div className="text-[10px] font-bold text-primary uppercase">Rincian Invoice: {currentInvoice.id}</div>
                        <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold text-rose-500">
                          {currentInvoice.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        {currentInvoice.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-muted-foreground">
                            <span>{item.name}</span>
                            <span className="font-semibold text-foreground">Rp {item.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="h-px bg-border/40 my-2" />

                      <div className="flex justify-between items-center text-sm font-extrabold">
                        <span>Total Tagihan:</span>
                        <span className="text-primary text-base">Rp {totalBill.toLocaleString()}</span>
                      </div>

                      {/* Input Nominal Pembayaran Cash */}
                      <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                          Uang Tunai Diterima (Cash)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">Rp</span>
                          <input
                            type="number"
                            placeholder="Nominal uang tunai..."
                            value={cashAmount}
                            onChange={(e) => setCashAmount(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-xs font-bold text-foreground focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Kembalian Kalkulator */}
                      {cashAmount !== '' && cashAmount >= totalBill && (
                        <div className="flex justify-between items-center p-2 rounded bg-emerald-500/10 text-emerald-500 text-xs font-bold animate-in slide-in-from-top-1">
                          <span>Uang Kembalian:</span>
                          <span>Rp {changeAmount.toLocaleString()}</span>
                        </div>
                      )}

                      {/* Tombol Bayar */}
                      <button
                        onClick={processPayment}
                        disabled={cashAmount === '' || cashAmount < totalBill}
                        className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/95 disabled:opacity-50 text-primary-foreground text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Selesaikan & Lunasi Tagihan</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-6 text-xs text-emerald-500 font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle className="h-4.5 w-4.5" />
                      Semua tagihan bulan berjalan untuk santri ini sudah lunas!
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Layout Kwitansi Pembayaran Sukses
            <div className="p-6 border border-border/80 bg-secondary/15 rounded-xl text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mx-auto shadow-sm">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-foreground">Pembayaran Berhasil Dilunasi!</h3>
                <p className="text-[11px] text-muted-foreground">Kwitansi pembayaran elektronik siap dicetak.</p>
              </div>

              {/* Rincian Kwitansi Ringkas */}
              <div className="max-w-xs mx-auto border border-border/60 p-4 bg-card rounded-lg text-left text-xs space-y-2 font-mono">
                <div className="text-center font-bold border-b border-border pb-1.5 mb-1.5">PPDS KASIR RECEIPT</div>
                <div className="text-[10px]">Nama: {currentInvoice?.santriName}</div>
                <div className="text-[10px]">NIS: {mockSantri.find(s => s.id === selectedSantriId)?.nis}</div>
                <div className="text-[10px]">Tanggal: {new Date().toLocaleDateString('id-ID')}</div>
                <div className="h-px bg-dashed border-t border-border/60 my-1.5" />
                <div className="flex justify-between text-[10px]">
                  <span>Total Tagihan</span>
                  <span>Rp {totalBill.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>Bayar Tunai</span>
                  <span>Rp {Number(cashAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold border-t border-border/30 pt-1.5 mt-1">
                  <span>Kembali</span>
                  <span>Rp {changeAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-center max-w-xs mx-auto">
                <button
                  onClick={() => {
                    alert('Print Kwitansi dikirim ke sistem pencetak!');
                    resetKasir();
                  }}
                  className="flex-1 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-secondary text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>
                <button
                  onClick={resetKasir}
                  className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
                >
                  Transaksi Baru
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Kolom 3: Rincian Setoran Iuran Keuangan (Pondok, Diniyah, Jam'iyyah) */}
        <div className="space-y-6 text-left">
          <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass">
            <div className="flex items-center gap-2 border-b border-border/30 pb-3 mb-4">
              <Coins className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-extrabold text-foreground">Setoran Unit Iuran</h2>
            </div>
            
            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg border border-border bg-secondary/15 space-y-1">
                <div className="flex justify-between font-bold text-foreground">
                  <span>Setoran Kas Pondok</span>
                  <span>Rp 2.150.000</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Diserahkan ke Bendahara Pondok (Zaid Muzakki).</p>
                <button 
                  onClick={() => alert('Uang kas iuran disetorkan ke Bendahara!')}
                  className="mt-2 w-full py-1 text-center text-[10px] font-bold rounded bg-primary text-primary-foreground"
                >
                  Kirim Setoran Pondok
                </button>
              </div>

              <div className="p-3 rounded-lg border border-border bg-secondary/15 space-y-1">
                <div className="flex justify-between font-bold text-foreground">
                  <span>Setoran Kas Madrasah</span>
                  <span>Rp 750.000</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Diserahkan ke Seksi Pendidikan untuk honor Ustadz.</p>
                <button 
                  onClick={() => alert('Iuran Madrasah disetorkan ke Seksi Pendidikan!')}
                  className="mt-2 w-full py-1 text-center text-[10px] font-bold rounded bg-primary/10 text-primary border border-primary/20"
                >
                  Kirim Setoran Madrasah
                </button>
              </div>

              <div className="p-3 rounded-lg border border-border bg-secondary/15 space-y-1">
                <div className="flex justify-between font-bold text-foreground">
                  <span>Setoran Kas Jam&apos;iyyah</span>
                  <span>Rp 240.000</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Diserahkan ke pengurus Seksi Jam&apos;iyyah untuk kegiatan lomba.</p>
                <button 
                  onClick={() => alert('Iuran disetorkan ke Seksi Jamiyyah!')}
                  className="mt-2 w-full py-1 text-center text-[10px] font-bold rounded bg-primary/10 text-primary border border-primary/20"
                >
                  Kirim Setoran Jam&apos;iyyah
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
