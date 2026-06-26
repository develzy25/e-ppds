import React from 'react';

export function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 scrollbar-thin">
      <div className="mx-auto max-w-7xl flex flex-col min-h-[calc(100vh-6.5rem)] animate-in fade-in duration-300">
        <div className="flex-1 pb-8">
          {children}
        </div>
        
        {/* Premium Subtle Footer */}
        <footer className="pt-6 pb-2 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-muted-foreground text-[10px] font-bold">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-footer.png" alt="PPDS" className="h-4.5 w-4.5 object-contain opacity-60" />
            <span>SIM-PPDS © 2026. Hak Cipta Dilindungi.</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
            <span className="text-border/40">•</span>
            <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
            <span className="text-border/40">•</span>
            <span className="text-primary/70">v1.3 Premium</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
