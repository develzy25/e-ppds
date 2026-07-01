'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { Truck, Users, Gift, ShieldCheck } from 'lucide-react';

export default function HumasyDashboard() {
  const { currentUser } = useApp();

  const isAuthorized = currentUser.permissions.includes('humasy.dashboard.view');

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul Humasy.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran menjadi M. Lulu Khulaluddin (Sekretaris Umum).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4">
        <h1 className="text-xl font-black text-foreground flex items-center gap-2">
          Humasy & Logistik Pangan
        </h1>
        <p className="text-xs text-muted-foreground">
          Pusat hubungan eksternal wali santri/donatur dan manajemen pasokan sembako logistik dapur umum pesantren.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Buku Tamu Bulan Ini" value="38 Kunjungan" description="Wali santri / kunjungan luar" iconName="Users" status="primary" />
        <KPICard title="Stok Beras Dapur" value="450 kg" description="Persediaan logistik pangan" iconName="Truck" status="success" />
        <KPICard title="Donatur Terdaftar" value="12 Donatur" description="Sumbangan donasi teratur" iconName="Gift" status="info" />
        <KPICard title="Operasional Dapur" value="Normal" description="Sirkulasi koki & menu makan" iconName="CheckSquare" status="warning" />
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
        <div className="border-b border-border/20 pb-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Log Distribusi Pangan & Konsumsi Santri</h4>
        </div>
        <div className="p-6 text-center text-muted-foreground text-xs rounded-lg border border-border bg-secondary/10">
          Simulasi: Log bahan pokok beras, minyak goreng, dan telur untuk makan pagi & sore santri terkontrol aman.
        </div>
      </div>
    </div>
  );
}
