'use client';

import React from 'react';
import { UnderDevelopment } from '@/components/ui/under-development';

export default function Page() {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-border/30 pb-4 text-left">
        <h1 className="text-xl font-black text-foreground">Kesekretariatan</h1>
        <p className="text-xs text-muted-foreground">Pusat Administrasi PPDS. Navigasikan ke masing-masing divisi kesekretariatan untuk mengelola data operasional.</p>
      </div>

      <div className="pt-4">
        <UnderDevelopment moduleName="Kesekretariatan" />
      </div>
    </div>
  );
}
