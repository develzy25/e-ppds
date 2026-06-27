'use client';

import React from 'react';
import { PageHeader } from '@/components/master';

export function MediaPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Media"
        description="Manajemen data media."
        breadcrumbs={[{ label: 'Media' }]}
      />
      <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground shadow-sm">
        Modul Media belum diimplementasikan sepenuhnya.
      </div>
    </div>
  );
}
