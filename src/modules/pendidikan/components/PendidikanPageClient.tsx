'use client';

import React from 'react';
import { PageHeader } from '@/components/master';

export function PendidikanPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Pendidikan"
        description="Manajemen data pendidikan."
        breadcrumbs={[{ label: 'Pendidikan' }]}
      />
      <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground shadow-sm">
        Modul Pendidikan belum diimplementasikan sepenuhnya.
      </div>
    </div>
  );
}
