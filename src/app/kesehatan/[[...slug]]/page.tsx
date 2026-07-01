'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { KPICard } from '@/components/ui/kpi-card';
import { mockHealthRecords } from '@/config/mock-data';
import { HeartPulse, Plus, CheckCircle, ShieldCheck } from 'lucide-react';

export default function KesehatanDashboard() {
  const { currentUser, addNotification } = useApp();
  const [healthLogs, setHealthLogs] = useState(mockHealthRecords);

  const isAuthorized = currentUser.permissions.includes('kesehatan.dashboard.view');

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border bg-card rounded-xl text-center">
        <ShieldCheck className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Anda tidak memiliki izin akses modul Kesehatan.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran menjadi M. Lulu Khulaluddin (Sekretaris Umum).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4">
        <h1 className="text-xl font-black text-foreground">Kesehatan Santri (Poskestren)</h1>
        <p className="text-xs text-muted-foreground">
          Pusat pencatatan rekam medis kunjungan berobat santri, stok apotek obat, dan rujukan ke instansi kesehatan luar.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Kunjungan Hari Ini" value={healthLogs.length} description="Santri berobat ke Poskestren" iconName="HeartPulse" status="primary" />
        <KPICard title="Stok Obat Aman" value="45 Item" description="Paracetamol, Amoxicillin, dll" iconName="ShieldCheck" status="success" />
        <KPICard title="Santri Dirawat" value="0 Santri" description="Santri mukim rawat inap" iconName="Home" status="info" />
        <KPICard title="Rekomendasi Rujukan" value="0 Santri" description="Rujukan aktif ke RS/Puskesmas" iconName="FileText" status="warning" />
      </div>

      {/* Logs Rekam Medis */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-premium glass space-y-4">
        <div className="flex justify-between items-center border-b border-border/20 pb-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Log Kunjungan Pasien Berobat</h4>
          <button 
            onClick={() => alert('Form input rekam medis kunjungan baru dibuka!')}
            className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-bold"
          >
            Catat Kunjungan Sakit
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          {healthLogs.map((log) => (
            <div key={log.id} className="p-3.5 rounded-xl border border-border bg-secondary/15 space-y-2">
              <div className="flex justify-between items-center border-b border-border/25 pb-1.5">
                <span className="font-bold text-foreground">{log.santriName}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(log.date).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 text-[11px] text-muted-foreground">
                <p>• Keluhan: <strong className="text-foreground/80">{log.complaint}</strong></p>
                <p>• Diagnosis: <strong className="text-foreground/80">{log.diagnosis}</strong></p>
                <p>• Tensi: <strong className="text-foreground/80">{log.tension}</strong></p>
                <p>• Tindakan: <strong className="text-foreground/80">{log.treatment}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
