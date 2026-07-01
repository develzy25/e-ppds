'use client';

import React from 'react';
import { UnderDevelopment } from '@/components/ui/under-development';

export default function Page() {
  const moduleName = "Laboratorium";
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-foreground">{moduleName}</h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Dashboard manajemen {moduleName.toLowerCase()}
        </p>
      </div>
      <UnderDevelopment moduleName={moduleName} />
    </div>
  );
}
