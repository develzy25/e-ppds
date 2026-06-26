'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { ShieldCheck } from 'lucide-react';

export default function JamiyyahDashboard() {
  const { currentUser } = useApp();

  const isAuthorized = currentUser.permissions.includes('jamiyyah_dashboard_view');

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul Jam&apos;iyyah.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran menjadi M. Lulu Khulaluddin (Sekretaris Umum).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4">
        <h1 className="text-xl font-black text-foreground">Seksi Jam&apos;iyyah Santri</h1>
        <p className="text-xs text-muted-foreground">
          Pusat kegiatan ekstrakurikuler Jam&apos;iyyah santri (malam Jumat), latihan khitobah (pidato), sholawat rebana, dan agenda PHBI.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Kelompok Jam'iyyah" value="6 Kelompok" description="Terbagi berdasarkan blok santri" iconName="Users" status="primary" />
        <KPICard title="Agenda PHBI/PHBN" value="1 Agenda" description="Persiapan Idul Adha 1447 H" iconName="Calendar" status="success" />
        <KPICard title="Unit Rebana" value="2 Grup" description="Hadroh putra dan rebana putri" iconName="Music" status="info" />
        <KPICard title="Iuran Kegiatan" value="Rp 240.000" description="Kas terkumpul bulan ini" iconName="Coins" status="warning" />
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
        <div className="border-b border-border/20 pb-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Aktivitas Mingguan & Khitobah</h4>
        </div>
        <div className="p-6 text-center text-muted-foreground text-xs rounded-lg border border-border bg-secondary/10">
          Simulasi: Agenda sholawatan Al-Barzanji dan latihan pidato (muhadharah) rutin berjalan setiap malam Jumat.
        </div>
      </div>
    </div>
  );
}
