'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { Briefcase, ShoppingBag, Box, ShieldCheck } from 'lucide-react';

export default function BUMPDashboard() {
  const { currentUser } = useApp();

  const isAuthorized = currentUser.permissions.includes('bump_dashboard_view') || 
                       currentUser.primaryRole === 'ketua_umum'; // Ketua Umum has access

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul BUMP.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran menjadi K.H. Ahmad Dahlan (Ketua Umum).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4">
        <h1 className="text-xl font-black text-foreground flex items-center gap-2">
          BUMP (Badan Usaha Milik Pesantren)
        </h1>
        <p className="text-xs text-muted-foreground">
          Pusat pemantauan kinerja unit bisnis pondok (Jasa Laundry, Air Minum Depo Galon, Kantin Santri, dll).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Laba Bersih BUMP" value="Rp 8.240.000" description="Keuntungan unit usaha gabungan" iconName="Briefcase" status="success" />
        <KPICard title="Total Unit Usaha" value="3 Unit" description="Laundry, Depo Air, Kantin" iconName="Box" status="primary" />
        <KPICard title="Pesanan Laundry" value="28 Order" description="Order cucian santri aktif" iconName="ShoppingBag" status="info" />
        <KPICard title="Setoran Laba" value="Dalam Proses" description="Setoran keuntungan ke Bendahara" iconName="Coins" status="warning" />
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
        <div className="border-b border-border/20 pb-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Unit Usaha Laundry & Depo Air</h4>
        </div>
        <div className="p-6 text-center text-muted-foreground text-xs rounded-lg border border-border bg-secondary/10">
          Simulasi: Layanan Laundry kiloan santri dan distribusi air galon isi ulang berjalan lancar dengan sistem kasir BUMP terpusat.
        </div>
      </div>
    </div>
  );
}
