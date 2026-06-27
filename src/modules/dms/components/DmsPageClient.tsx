'use client';

import React from 'react';
import { PageHeader } from '@/components/master';

export function DmsPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Dms"
        description="Manajemen data dms."
        breadcrumbs={[{ label: 'Dms' }]}
      />
      <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground shadow-sm">
        Modul Dms belum diimplementasikan sepenuhnya.
      </div>
    </div>
  );
}
