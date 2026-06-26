'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { Compass, Calendar, Coins, ShieldCheck } from 'lucide-react';

export default function TakmirDashboard() {
  const { currentUser } = useApp();

  const isAuthorized = currentUser.permissions.includes('takmir_dashboard_view') || 
                       currentUser.primaryRole === 'ketua_umum'; // Ketua Umum has access

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul Takmir.
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
          Takmir Masjid Utama
        </h1>
        <p className="text-xs text-muted-foreground">
          Manajemen jadwal imam & khatib shalat jumat, shalat rawatib, kajian tafsir masjid, kas tromol, dan sarana masjid.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Jadwal Khatib" value="Ust. Jafar" description="Khatib Jumat terdekat" iconName="Compass" status="primary" />
        <KPICard title="Imam Rawatib" value="3 Ustadz" description="Piket shalat wajib berjamaah" iconName="Calendar" status="success" />
        <KPICard title="Kas Tromol Masjid" value="Rp 8.420.000" description="Kas terkumpul kotak amal" iconName="Coins" status="warning" />
        <KPICard title="Aset Perlengkapan" value="25 Aset" description="Karpet, sound masjid, dll" iconName="CheckSquare" status="info" />
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
        <div className="border-b border-border/20 pb-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Agenda Kegiatan & Kas Masjid</h4>
        </div>
        <div className="p-6 text-center text-muted-foreground text-xs rounded-lg border border-border bg-secondary/10">
          Simulasi: Jadwal kultum subuh dan kebersihan karpet masjid terjadwal berkala. Kas kotak amal masjid diaudit transparan.
        </div>
      </div>
    </div>
  );
}
