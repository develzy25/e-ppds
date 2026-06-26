'use client';

import React, { useState } from 'react';
import { Plus, FilePlus, ShieldAlert, BadgePlus, UserPlus, Coins } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function QuickAction() {
  const { currentUser, addNotification } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // Filter actions based on current user permissions
  const actions = [
    {
      label: 'Pengajuan Anggaran',
      icon: Coins,
      permission: 'anggaran_create',
      onClick: () => {
        addNotification(
          'Aksi Cepat Berhasil',
          'Formulir Rencana Anggaran Belanja (RAB) seksi berhasil dibuka.',
          'anggaran'
        );
        alert('Simulasi: Dialog formulir pengajuan dana seksi dibuka!');
      }
    },
    {
      label: 'Input Pelanggaran',
      icon: ShieldAlert,
      permission: 'keamanan_pelanggaran_create',
      onClick: () => {
        addNotification(
          'Aksi Cepat Berhasil',
          'Buku catatan pelanggaran ketertiban santri dibuka.',
          'umum'
        );
        alert('Simulasi: Formulir input pelanggaran baru dibuka!');
      }
    },
    {
      label: 'Registrasi Barang',
      icon: BadgePlus,
      permission: 'keamanan_registrasi_motor_create',
      onClick: () => {
        alert('Simulasi: Form registrasi motor/laptop/kompor baru dibuka!');
      }
    },
    {
      label: 'Input Kunjungan Sakit',
      icon: UserPlus,
      permission: 'kesehatan_rekammedis_create',
      onClick: () => {
        alert('Simulasi: Form rekam medis berobat Poskestren dibuka!');
      }
    },
    {
      label: 'Mutasi Pengurus',
      icon: FilePlus,
      permission: 'mutasi_request_create',
      onClick: () => {
        alert('Simulasi: Pengajuan usulan mutasi staf pengurus dibuka!');
      }
    }
  ].filter(act => currentUser.permissions.includes(act.permission));

  if (actions.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Aksi Cepat</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-1 text-card-foreground shadow-lg shadow-black/10 ring-1 ring-border z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Aksi yang Diizinkan
            </div>
            <div className="h-px bg-border my-1" />
            <div className="space-y-0.5">
              {actions.map(act => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.label}
                    onClick={() => {
                      act.onClick();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium hover:bg-secondary/60 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
