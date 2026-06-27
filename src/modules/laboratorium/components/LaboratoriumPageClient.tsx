'use client';

import React from 'react';
import { PageHeader } from '@/components/master';

export function LaboratoriumPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Laboratorium"
        description="Manajemen data laboratorium."
        breadcrumbs={[{ label: 'Laboratorium' }]}
      />
      <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground shadow-sm">
        Modul Laboratorium belum diimplementasikan sepenuhnya.
      </div>
    </div>
  );
}
