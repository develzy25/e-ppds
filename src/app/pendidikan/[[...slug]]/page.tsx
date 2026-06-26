'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { GraduationCap, BookOpen, Scroll, Users, ShieldCheck } from 'lucide-react';

export default function PendidikanDashboard() {
  const { currentUser } = useApp();

  const isAuthorized = currentUser.permissions.includes('pendidikan_dashboard_view');

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul Pendidikan.
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
          Pendidikan Diniyah & LBM
        </h1>
        <p className="text-xs text-muted-foreground">
          Manajemen kurikulum madrasah diniyah, kajian bahtsul masail (LBM), sorogan hafalan, konseling, dan raport santri.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Kurikulum Diniyah" value="12 Kitab" description="Fathul Mu'in, Alfiyah, dll" iconName="GraduationCap" status="primary" />
        <KPICard title="Kelas Diniyah" value="6 Tingkat" description="Ula 1 s/d Wustho 3" iconName="Users" status="success" />
        <KPICard title="Agenda LBM" value="2 Pertemuan" description="Lajnah Bahtsul Masa'il aktif" iconName="BookOpen" status="info" />
        <KPICard title="Ustadz Pengajar" value="18 Asatidz" description="Pendidik terdaftar aktif" iconName="Scroll" status="warning" />
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
        <div className="border-b border-border/20 pb-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Silabus & Jadwal Pelajaran Diniyah</h4>
        </div>
        <div className="p-6 text-center text-muted-foreground text-xs rounded-lg border border-border bg-secondary/10">
          Simulasi: Silabus kurikulum terstruktur. Jadwal mengaji kitab kuning aktif setiap Sabtu - Kamis malam.
        </div>
      </div>
    </div>
  );
}
