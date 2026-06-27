'use client';

import React from 'react';
import { PageHeader } from '@/components/master';

export function PembangunanPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Pembangunan"
        description="Manajemen data pembangunan."
        breadcrumbs={[{ label: 'Pembangunan' }]}
      />
      <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground shadow-sm">
        Modul Pembangunan belum diimplementasikan sepenuhnya.
      </div>
    </div>
  );
}
