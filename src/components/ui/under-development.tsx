import React from 'react';
import { Construction } from 'lucide-react';

export function UnderDevelopment({ moduleName }: { moduleName?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-card rounded-xl border border-border shadow-sm">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <Construction className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-xl font-bold mb-2">Sedang Dalam Pengembangan</h2>
      <p className="text-muted-foreground text-sm max-w-md">
        {moduleName 
          ? `Modul ${moduleName} sedang dalam tahap pengembangan dan belum siap digunakan untuk production.`
          : 'Halaman ini sedang dalam tahap pengembangan dan belum siap digunakan untuk production.'}
      </p>
    </div>
  );
}
