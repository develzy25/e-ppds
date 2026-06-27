'use client';

import React from 'react';
import { PageHeader } from '@/components/master';

export function KesehatanPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Kesehatan"
        description="Manajemen data kesehatan."
        breadcrumbs={[{ label: 'Kesehatan' }]}
      />
      <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground shadow-sm">
        Modul Kesehatan belum diimplementasikan sepenuhnya.
      </div>
    </div>
  );
}
