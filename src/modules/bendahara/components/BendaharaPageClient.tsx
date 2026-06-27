'use client';

import React from 'react';
import { PageHeader } from '@/components/master';

export function BendaharaPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Bendahara"
        description="Manajemen data bendahara."
        breadcrumbs={[{ label: 'Bendahara' }]}
      />
      <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground shadow-sm">
        Modul Bendahara belum diimplementasikan sepenuhnya.
      </div>
    </div>
  );
}
