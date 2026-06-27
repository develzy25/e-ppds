'use client';

import React from 'react';
import { PageHeader } from '@/components/master';

export function KeamananPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master Keamanan"
        description="Manajemen data keamanan."
        breadcrumbs={[{ label: 'Keamanan' }]}
      />
      <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground shadow-sm">
        Modul Keamanan belum diimplementasikan sepenuhnya.
      </div>
    </div>
  );
}
