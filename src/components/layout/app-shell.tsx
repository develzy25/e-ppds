'use client';

import React, { useState, useEffect } from 'react';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { AppContent } from './app-content';
import { BackgroundScene } from '@/components/ui/background-scene';
import { useApp } from '@/context/AppContext';
import { usePathname } from 'next/navigation';
import { CommandPalette } from './command-palette';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSidebarOpen, isLoadingUser, currentUser, pondokProfile } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Remove the artificial delay, let it render as soon as user is loaded
    setIsLoading(false);
  }, []);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (isLoading || isLoadingUser || !currentUser) {
    return (
      <div className="relative flex h-screen w-screen flex-col items-center justify-center bg-background overflow-hidden text-foreground">
        {/* Ambient Gradient Background */}
        <BackgroundScene />
        
        {/* Splash Container */}
        <div className="relative z-10 flex flex-col items-center gap-6 text-center animate-in fade-in zoom-in-95 duration-700 ease-out">
          <div className="relative">
            {/* Glowing Backdrop for logo */}
            <div className="absolute inset-0 -m-6 rounded-full bg-primary/20 blur-3xl" />
            
            {/* Logo Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo-splash.png" 
              alt="Logo" 
              className="h-24 w-24 object-contain float-anim" 
            />
          </div>
          
          <div className="space-y-1.5 mt-2">
            <h1 className="text-base font-black tracking-tight text-foreground">{pondokProfile?.name ? pondokProfile.name.replace('Pondok Pesantren ', 'PPDS ') : 'PPDS Enterprise'}</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Pondok Pesantren Digital System
            </p>
          </div>
          
          {/* Custom progress bar */}
          <div className="relative h-1 w-44 overflow-hidden rounded-full bg-secondary/50 border border-border/20">
            <div className="h-full w-full bg-primary loading-bar absolute left-0 top-0" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground relative">
      {/* Background Layer */}
      <BackgroundScene />
      
      {/* Sidebar (Fixed position) */}
      <AppSidebar />
      
      {/* Command Palette (Global Ctrl+K Search) */}
      <CommandPalette />
      
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            // Triggered from anywhere in AppContext
            const contextEvent = new CustomEvent('close-sidebar-mobile');
            window.dispatchEvent(contextEvent);
          }}
        />
      )}
      
      {/* Konten area di sebelah kanan sidebar pada desktop */}
      <div 
        className={`flex flex-col flex-1 h-full overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
        }`}
      >
        {/* Header Global */}
        <AppHeader />
        
        {/* Konten Halaman */}
        <AppContent>
          {children}
        </AppContent>
      </div>
    </div>
  );
}
