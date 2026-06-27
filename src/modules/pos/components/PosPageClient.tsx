'use client';

import React from 'react';
import { PageHeader } from '@/components/master';

export function PosPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Pos"
        description="Manajemen data pos."
        breadcrumbs={[{ label: 'Pos' }]}
      />
      <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground shadow-sm">
        Modul Pos belum diimplementasikan sepenuhnya.
      </div>
    </div>
  );
}
