'use client';

import React from 'react';
import { UnderDevelopment } from '@/components/ui/under-development';

export default function Page() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4 text-left">
        <h1 className="text-xl font-black text-foreground">Modul</h1>
        <p className="text-xs text-muted-foreground">Anda tidak memiliki izin akses modul Wajar / Murottil.
          Silakan gunakan simulasi switcher role di Header untuk berganti peran menjadi M. Lulu Khulaluddin (Sekretaris Umum).</p>
      </div>

      <div className="pt-4">
        <UnderDevelopment moduleName="Modul" />
      </div>
    </div>
  );
}
