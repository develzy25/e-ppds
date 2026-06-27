'use client';

import React from 'react';
import { PageHeader } from '@/components/master';

export function TakmirPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Takmir"
        description="Manajemen data takmir."
        breadcrumbs={[{ label: 'Takmir' }]}
      />
      <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground shadow-sm">
        Modul Takmir belum diimplementasikan sepenuhnya.
      </div>
    </div>
  );
}
