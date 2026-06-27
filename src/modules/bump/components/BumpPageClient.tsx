'use client';

import React from 'react';
import { PageHeader } from '@/components/master';

export function BumpPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Bump"
        description="Manajemen data bump."
        breadcrumbs={[{ label: 'Bump' }]}
      />
      <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground shadow-sm">
        Modul Bump belum diimplementasikan sepenuhnya.
      </div>
    </div>
  );
}
