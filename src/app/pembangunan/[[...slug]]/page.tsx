'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { HardHat, Compass, FileText, ShieldCheck } from 'lucide-react';

export default function PembangunanDashboard() {
  const { currentUser } = useApp();

  const isAuthorized = currentUser.permissions.includes('pembangunan_dashboard_view') || 
                       currentUser.primaryRole === 'ketua_umum'; // Ketua Umum has access

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul Pembangunan.
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
          Pembangunan Fisik & Aset Gedung
        </h1>
        <p className="text-xs text-muted-foreground">
          Monitoring progres konstruksi pembangunan sarana prasarana pondok (gedung baru), nota belanja material, dan RAB fisik.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Proyek Aktif" value="1 Proyek" description="Pembangunan Gedung Asrama Blok D" iconName="HardHat" status="primary" />
        <KPICard title="Progres Proyek" value="68% Selesai" description="Kurva S pembangunan fisik" iconName="Compass" status="success" />
        <KPICard title="Anggaran Fisik" value="Rp 850M" description="Nilai pagu anggaran konstruksi" iconName="DollarSign" status="warning" />
        <KPICard title="Pekerja Lapangan" value="12 Tukang" description="Jumlah tenaga kerja konstruksi" iconName="Users" status="info" />
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
        <div className="border-b border-border/20 pb-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Kurva S & Laporan Harian Konstruksi</h4>
        </div>
        <div className="p-6 text-center text-muted-foreground text-xs rounded-lg border border-border bg-secondary/10">
          Simulasi: Progres pengerjaan dak lantai 2 asrama Blok D selesai. Termin II kontraktor telah dibayarkan oleh Bendahara Utama.
        </div>
      </div>
    </div>
  );
}
