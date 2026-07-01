'use client';

import React, { useState, useEffect } from 'react';

import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { LoadingState } from '@/components/ui/loading-state';
import { mockBudgets } from '@/config/mock-data';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { TrendingUp, Clock, ShieldCheck } from 'lucide-react';

export default function DashboardDewanHarian() {
  const { currentUser } = useApp();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);  
  }, []);

  // Filter access (Dewan Harian only)
  const isAuthorized = currentUser.permissions.includes('dashboard.dewan.view');

  // Chart Mock Data
  const cashflowData = [
    { name: 'Jan', Masuk: 42000000, Keluar: 31000000 },
    { name: 'Feb', Masuk: 48000000, Keluar: 35000000 },
    { name: 'Mar', Masuk: 55000000, Keluar: 40000000 },
    { name: 'Apr', Masuk: 61000000, Keluar: 45000000 },
    { name: 'Mei', Masuk: 59000000, Keluar: 48000000 },
    { name: 'Jun', Masuk: 72000000, Keluar: 52000000 }
  ];

  const seksiExpenses = [
    { name: 'Pendidikan', value: 12500000, color: 'oklch(0.52 0.16 155)' },
    { name: 'Keamanan', value: 3400000, color: 'oklch(0.57 0.22 25)' },
    { name: 'PLP (Fasilitas)', value: 18400000, color: 'oklch(0.48 0.15 195)' },
    { name: 'Kesehatan', value: 2100000, color: 'oklch(0.38 0.12 250)' },
    { name: 'Media/Lab', value: 6500000, color: 'oklch(0.7 0.14 85)' }
  ];

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin `dashboard.dewan.view` untuk melihat ringkasan eksekutif Dewan Harian.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran menjadi K.H. Ahmad Dahlan (Ketua Umum).
        </p>
      </div>
    );
  }

  if (!mounted) {
    return <LoadingState type="table" count={2} />;
  }

  // Aggregate stats
  const totalSantriCount = 1245; // Realistis
  const totalPengurusCount = 48;
  const totalKamarCount = 84;
  const kasSaldo = 'Rp 142.850.000';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4 text-left">
        <h1 className="text-xl font-black text-foreground flex items-center gap-2">
          Dashboard Dewan Harian
        </h1>
        <p className="text-xs text-muted-foreground">
          Ringkasan Eksekutif, Laporan Keuangan Konsolidasian, dan Monitoring Kinerja Seksi Pesantren.
        </p>
      </div>

      {/* Grid KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Total Santri"
          value={totalSantriCount}
          description="Santri aktif mukim"
          iconName="Users"
          status="primary"
        />
        <KPICard
          title="Total Pengurus"
          value={totalPengurusCount}
          description="Staf terdaftar aktif"
          iconName="ShieldCheck"
          status="info"
        />
        <KPICard
          title="Total Kamar"
          value={totalKamarCount}
          description="Kamar tersebar di 6 blok"
          iconName="Home"
          status="success"
        />
        <KPICard
          title="Saldo Kas Utama"
          value={kasSaldo}
          description="Kas utama di bendahara"
          iconName="DollarSign"
          status="warning"
        />
        <KPICard
          title="Pengajuan Pending"
          value={mockBudgets.filter(b => b.status === 'Musyawarah').length}
          description="RAB seksi menanti musyawarah"
          iconName="Clock"
          status="danger"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Grafik 1: Arus Kas Bulanan (lg: col-span-2) */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-premium glass">
          <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Laporan Arus Kas Bulanan (Semester I)
            </h2>
            <span className="text-[10px] text-muted-foreground font-semibold">Unit: Rupiah (IDR)</span>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.52 0.16 155)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="oklch(0.52 0.16 155)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.57 0.22 25)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="oklch(0.57 0.22 25)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="color-mix(in oklch, var(--border) 40%, transparent)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(v) => `${v/1000000}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', fontSize: '11px', borderRadius: '8px' }}
                  formatter={(value: ValueType | undefined) => [`Rp ${Number(value ?? 0).toLocaleString()}`]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Masuk" stroke="oklch(0.52 0.16 155)" fillOpacity={1} fill="url(#colorMasuk)" strokeWidth={2} />
                <Area type="monotone" dataKey="Keluar" stroke="oklch(0.57 0.22 25)" fillOpacity={1} fill="url(#colorKeluar)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grafik 2: Distribusi Pengeluaran Seksi (Pie Chart) */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass">
          <div className="border-b border-border/30 pb-3 mb-4">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider text-left">
              Distribusi Pengeluaran Seksi (Bulan Ini)
            </h2>
          </div>

          <div className="h-56 w-full text-xs relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={seksiExpenses}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {seksiExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', fontSize: '11px', borderRadius: '8px' }}
                  formatter={(value: ValueType | undefined) => [`Rp ${Number(value ?? 0).toLocaleString()}`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Custom */}
          <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-muted-foreground text-left">
            {seksiExpenses.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid Tambahan: Pengajuan Anggaran Menunggu Persetujuan */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-5 shadow-premium glass text-left">
          <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Daftar Pengajuan Anggaran Seksi (Butuh Approval Dewan Harian)
            </h2>
          </div>

          <div className="space-y-3">
            {mockBudgets.map((budget) => (
              <div 
                key={budget.id}
                className="p-3 rounded-lg border border-border/70 hover:border-primary/45 bg-secondary/15 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{budget.title}</span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                      {budget.seksi}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/90 line-clamp-1">{budget.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-black text-foreground">
                    Rp {budget.amount.toLocaleString()}
                  </span>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => alert(`Pengajuan "${budget.title}" disetujui!`)}
                      className="px-2 py-1 rounded bg-primary text-primary-foreground text-[10px] font-bold shadow-sm"
                    >
                      Setujui
                    </button>
                    <button 
                      onClick={() => alert(`Pengajuan "${budget.title}" ditolak!`)}
                      className="px-2 py-1 rounded border border-border bg-card text-destructive hover:bg-destructive/10 text-[10px] font-bold"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box: Kinerja Keamanan & Listrik */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass text-left">
          <div className="border-b border-border/30 pb-3 mb-4">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Capaian Iuran Listrik Kamar (PLP)
            </h2>
          </div>
          <div className="space-y-3.5">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span>Rasio Pembayaran Tagihan</span>
                <span className="text-primary">85%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground leading-normal space-y-1">
              <p>• Total Tagihan Juni: <strong>Rp 367.500</strong></p>
              <p>• Sudah Terbayar: <strong>Rp 157.500</strong></p>
              <p>• Tunggakan Kamar: <strong>1 Kamar (A-01)</strong></p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
