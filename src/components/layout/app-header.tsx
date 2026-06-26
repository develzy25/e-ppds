'use client';

import React, { useState } from 'react';
import { Menu, Bell, Sun, Moon, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { mockUsers } from '@/config/mock-data';
import { Breadcrumb } from './breadcrumb';
import { QuickAction } from './quick-action';

export function AppHeader() {
  const {
    currentUser,
    changeUser,
    notifications,
    markAsRead,
    markAllAsRead,
    isSidebarOpen,
    setSidebarOpen,
    theme,
    toggleTheme,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const NOTIF_ICONS: Record<string, string> = {
    anggaran: '💰',
    perizinan: '📝',
    mutasi: '🔄',
    umum: '📢',
  };

  return (
    <header
      className="aurora-border sticky top-0 z-40 flex h-14 items-center justify-between px-4 md:px-5"
      style={{
        background: 'linear-gradient(180deg, color-mix(in oklch, var(--card) 82%, transparent) 0%, color-mix(in oklch, var(--card) 70%, transparent) 100%)',
        backdropFilter: 'blur(28px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.5)',
        borderBottom: '1px solid color-mix(in oklch, var(--border) 45%, transparent)',
        boxShadow: '0 1px 0 0 color-mix(in oklch, white 5%, transparent) inset, 0 4px 24px -8px rgba(0,0,0,0.15)',
      }}
    >
      {/* ── LEFT ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/50 hover:bg-secondary/70 text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-200"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <Menu className="h-4 w-4" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-header.png" alt="Logo" className="h-6 w-6 object-contain md:hidden" />
        <div className="hidden md:block">
          <Breadcrumb />
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="flex items-center gap-2">

        {/* Role Switcher */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all duration-200"
          style={{
            background: 'color-mix(in oklch, var(--primary) 8%, transparent)',
            borderColor: 'color-mix(in oklch, var(--primary) 25%, transparent)',
            color: 'var(--primary)',
            boxShadow: '0 0 12px color-mix(in oklch, var(--primary) 12%, transparent)',
          }}
        >
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          <span>Simulasi:</span>
          <select
            value={currentUser.id}
            onChange={e => changeUser(e.target.value)}
            className="bg-transparent border-none text-[11px] font-bold focus:ring-0 cursor-pointer outline-none"
            style={{ color: 'var(--primary)' }}
          >
            {mockUsers.map(u => (
              <option key={u.id} value={u.id} className="bg-card text-foreground font-semibold">
                {u.name.split(' ').slice(0, 2).join(' ')} ({u.primaryRole.replace(/_/g, ' ')})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Actions */}
        <QuickAction />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Ganti Tema"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/50 hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95"
        >
          {theme === 'dark'
            ? <Sun className="h-4 w-4 text-amber-400" />
            : <Moon className="h-4 w-4" />
          }
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-border/50 hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-black text-white pulse-dot"
                style={{
                  background: 'var(--destructive)',
                  boxShadow: 'var(--glow-danger)',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
              <div
                className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                style={{
                  background: 'color-mix(in oklch, var(--card) 85%, transparent)',
                  backdropFilter: 'blur(32px) saturate(1.5)',
                  WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
                  boxShadow: 'var(--shadow-deep), 0 0 0 1px color-mix(in oklch, white 6%, transparent) inset',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid color-mix(in oklch, var(--border) 40%, transparent)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-foreground">Notifikasi</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black text-primary-foreground" style={{ background: 'var(--primary)', boxShadow: 'var(--glow-primary)' }}>
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-[10px] font-semibold text-primary hover:underline">
                      Tandai semua
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Tidak ada notifikasi</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => { markAsRead(n.id); setIsNotifOpen(false); }}
                        className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-secondary/30 ${!n.isRead ? 'bg-primary/4' : ''}`}
                        style={{ borderBottom: '1px solid color-mix(in oklch, var(--border) 25%, transparent)' }}
                      >
                        <span className="text-base shrink-0 mt-0.5">{NOTIF_ICONS[n.category] || 'ℹ️'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-xs font-bold leading-tight ${!n.isRead ? 'text-primary' : 'text-foreground'}`}>
                              {n.title}
                            </span>
                            <span className="text-[9px] text-muted-foreground shrink-0 mt-0.5">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">{n.message}</p>
                        </div>
                        {!n.isRead && (
                          <span className="shrink-0 mt-2 h-1.5 w-1.5 rounded-full" style={{ background: 'var(--primary)', boxShadow: 'var(--glow-primary)' }} />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-xl border border-border/50 p-1 pr-2.5 hover:bg-secondary/60 transition-all duration-200"
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser.avatar || '/avatar-default.png'}
                alt={currentUser.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/avatar-default.png';
                }}
                className="h-6 w-6 rounded-full object-cover"
                style={{
                  border: '1.5px solid color-mix(in oklch, var(--primary) 50%, transparent)',
                  boxShadow: 'var(--glow-primary)',
                }}
              />
            </div>
            <span className="hidden md:block text-xs font-bold text-foreground truncate max-w-[70px]">
              {currentUser.name.split(' ')[0]}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div
                className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border/50 p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                style={{
                  background: 'color-mix(in oklch, var(--card) 88%, transparent)',
                  backdropFilter: 'blur(32px) saturate(1.5)',
                  WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
                  boxShadow: 'var(--shadow-deep), 0 0 0 1px color-mix(in oklch, white 6%, transparent) inset',
                }}
              >
                {/* User Info */}
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-secondary/20 mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentUser.avatar || '/avatar-default.png'}
                    alt={currentUser.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/avatar-default.png';
                    }}
                    className="h-8 w-8 rounded-full object-cover"
                    style={{
                      border: '2px solid color-mix(in oklch, var(--primary) 50%, transparent)',
                      boxShadow: 'var(--glow-primary)',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">{currentUser.name}</div>
                    <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide truncate">
                      {currentUser.primaryRole.replace(/_/g, ' ')}
                    </div>
                    {currentUser.additionalRoles.length > 0 && (
                      <div className="text-[9px] font-medium mt-0.5" style={{ color: 'var(--primary)' }}>
                        + {currentUser.additionalRoles.length} jabatan rangkap
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-px bg-border/40 my-1" />

                <button
                  onClick={() => {
                    alert('Logout dinonaktifkan di versi simulasi frontend.');
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
