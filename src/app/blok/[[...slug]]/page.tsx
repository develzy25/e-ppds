'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { ShieldCheck } from 'lucide-react';

export default function BlokDashboard() {
  const { currentUser } = useApp();

  const isAuthorized = currentUser.permissions.includes('blok_dashboard_view');

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul Blok.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran menjadi M. Lulu Khulaluddin (Sekretaris Umum yang merangkap Ketua Blok).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4">
        <h1 className="text-xl font-black text-foreground flex items-center gap-2">
          Pembinaan Blok & Kamar ({currentUser.blokId?.replace(/_/g, ' ') || 'Blok A'})
        </h1>
        <p className="text-xs text-muted-foreground">
          Pusat pemantauan kebersihan kamar santri, absensi jamaah, pembinaan akhlak, dan persetujuan awal izin santri.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Kamar Aktif Blok" value="12 Kamar" description="Kamar terdata di Blok Anda" iconName="Home" status="primary" />
        <KPICard title="Santri Terdaftar" value="65 Santri" description="Jumlah mukim di Blok Anda" iconName="Users" status="success" />
        <KPICard title="Nilai Kebersihan Rerata" value="88/100" description="Skor evaluasi kamar mingguan" iconName="CheckCircle" status="info" />
        <KPICard title="Rekomendasi Izin" value="1 Santri" description="Pengajuan menunggu review Blok" iconName="Clock" status="warning" />
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
        <div className="border-b border-border/20 pb-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Log Pembinaan Blok & Nilai Kebersihan</h4>
        </div>
        <div className="p-6 text-center text-muted-foreground text-xs rounded-lg border border-border bg-secondary/10">
          Simulasi: Evaluasi kebersihan kamar A-01 s/d A-12 terinput. Agenda ta&apos;zir denda pelanggaran ringan blok dikontrol.
        </div>
      </div>
    </div>
  );
}
