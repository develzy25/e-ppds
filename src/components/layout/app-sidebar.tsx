'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { routes, RouteItem } from '@/config/routes';
import { useApp } from '@/context/AppContext';

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (!IconComponent) {
    const Fallback = Icons.HelpCircle;
    return <Fallback className={className} />;
  }
  return <IconComponent className={className} />;
}

export function AppSidebar() {
  const pathname = usePathname();
  const { currentUser, isSidebarOpen, setSidebarOpen, pondokProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Persist expanded menus in localStorage
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('sidebar:expanded');
    if (saved) {
      try {
        setExpandedMenus(JSON.parse(saved));
      } catch (e) {
        setExpandedMenus({ kesekretariatan: true });
      }
    } else {
      setExpandedMenus({ kesekretariatan: true });
    }

    const handleMobileClose = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('close-sidebar-mobile', handleMobileClose);
    return () => window.removeEventListener('close-sidebar-mobile', handleMobileClose);
  }, [setSidebarOpen]);

  const toggleExpand = (id: string) => {
    setExpandedMenus(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('sidebar:expanded', JSON.stringify(next));
      return next;
    });
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const hasAccess = (item: RouteItem): boolean => {
    if (!item.permissions || item.permissions.length === 0) return true;
    return currentUser.permissions.some(p => item.permissions?.includes(p));
  };

  const filterRoutes = (items: RouteItem[]): RouteItem[] => {
    return items
      .map(item => {
        const copy = { ...item };
        if (copy.children) copy.children = filterRoutes(copy.children);
        return copy;
      })
      .filter(item => {
        if (!hasAccess(item)) return false;
        if (
          item.children &&
          item.children.length === 0 &&
          routes.find(r => r.id === item.id)?.children
        ) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return item.label.toLowerCase().includes(q) || (item.children && item.children.length > 0);
        }
        return true;
      });
  };

  const filteredMenu = filterRoutes(routes);

  return (
    <aside
      className={`
        fixed top-0 bottom-0 left-0 z-50 flex flex-col
        transition-all duration-300
        ${isSidebarOpen ? 'w-64' : 'w-0 -translate-x-full md:w-16 md:translate-x-0'}
      `}
      style={{
        background: 'linear-gradient(180deg, color-mix(in oklch, var(--sidebar) 92%, transparent) 0%, color-mix(in oklch, var(--sidebar) 85%, transparent) 100%)',
        backdropFilter: 'blur(32px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(32px) saturate(1.5)',
        borderRight: '1px solid color-mix(in oklch, var(--sidebar-border) 50%, transparent)',
        boxShadow: '4px 0 32px -8px rgba(0,0,0,0.25), 1px 0 0 0 color-mix(in oklch, white 4%, transparent) inset',
      }}
    >
      {/* ─── Logo ─── */}
      <div
        className="flex h-14 items-center gap-2.5 px-4"
        style={{ borderBottom: '1px solid color-mix(in oklch, var(--sidebar-border) 40%, transparent)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-sidebar.png"
          alt="PPDS"
          className="h-8 w-8 shrink-0 rounded-lg object-contain shadow-md"
        />
        {isSidebarOpen && (
          <div className="flex flex-col leading-none overflow-hidden">
            <span className="text-xs font-black text-foreground tracking-tight">SIM-PPDS</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
              {pondokProfile?.name ? pondokProfile.name.replace('Pondok Pesantren ', '') : 'Pesantren'}
            </span>
          </div>
        )}
      </div>

      {/* ─── Search ─── */}
      {isSidebarOpen && (
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Icons.Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground/50" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border/40 bg-secondary/30 pl-8 pr-3 py-1.5 text-[11px] text-foreground placeholder-muted-foreground/40 focus:border-primary/40 focus:bg-secondary/50 focus:outline-none transition-all duration-200 backdrop-blur-sm"
            />
          </div>
        </div>
      )}

      {/* ─── Nav List ─── */}
      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
        <nav className="space-y-0.5">
          {filteredMenu.map(item => {
            const isExpanded = expandedMenus[item.id];
            const hasChildren = item.children && item.children.length > 0;
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');

            return (
              <div key={item.id} className="space-y-0.5">
                {/* ─ Level 1 Item ─ */}
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className={`
                      relative flex w-full items-center justify-between rounded-xl px-2.5 py-2
                      text-xs font-semibold transition-all duration-200 group
                      ${isActive
                        ? 'text-primary bg-primary/8'
                        : 'text-sidebar-foreground/70 hover:text-foreground hover:bg-sidebar-accent/60'}
                    `}
                  >
                    {/* Active indicator line */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                        style={{ background: 'var(--primary)', boxShadow: 'var(--glow-primary)' }}
                      />
                    )}
                    <div className="flex items-center gap-2.5 pl-1">
                      {item.icon && (
                        <DynamicIcon
                          name={item.icon}
                          className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
                        />
                      )}
                      {isSidebarOpen && <span>{item.label}</span>}
                    </div>
                    {isSidebarOpen && (
                      <Icons.ChevronRight
                        className={`h-3 w-3 text-muted-foreground/60 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.path}
                    onClick={handleNavClick}
                    className={`
                      relative flex items-center gap-2.5 rounded-xl px-2.5 py-2
                      text-xs font-semibold transition-all duration-200 group
                      ${pathname === item.path
                        ? 'text-primary-foreground'
                        : 'text-sidebar-foreground/70 hover:text-foreground hover:bg-sidebar-accent/60'}
                    `}
                    style={pathname === item.path ? {
                      background: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in oklch, var(--primary) 80%, var(--accent-foreground)) 100%)',
                      boxShadow: 'var(--glow-primary), 0 4px 12px -4px rgba(0,0,0,0.2)',
                    } : undefined}
                  >
                    {item.icon && (
                      <DynamicIcon
                        name={item.icon}
                        className={`h-4 w-4 shrink-0 pl-1 transition-colors ${pathname === item.path ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}
                      />
                    )}
                    {isSidebarOpen && <span className="pl-1">{item.label}</span>}
                  </Link>
                )}

                {/* ─ Level 2 Sub-menu ─ */}
                {isSidebarOpen && hasChildren && isExpanded && (
                  <div
                    className="ml-3 pl-3 space-y-0.5 animate-in slide-in-from-top-1 duration-200"
                    style={{ borderLeft: '1px solid color-mix(in oklch, var(--border) 40%, transparent)' }}
                  >
                    {item.children?.map(sub => {
                      const subHasChildren = sub.children && sub.children.length > 0;
                      const subIsExpanded = expandedMenus[sub.id];
                      const subIsActive = pathname === sub.path || pathname?.startsWith(sub.path + '/');

                      return (
                        <div key={sub.id} className="space-y-0.5">
                          {subHasChildren ? (
                            <button
                              onClick={() => toggleExpand(sub.id)}
                              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all ${subIsActive ? 'text-primary' : 'text-sidebar-foreground/60 hover:text-foreground hover:bg-sidebar-accent/40'}`}
                            >
                              <span>{sub.label}</span>
                              <Icons.ChevronRight className={`h-3 w-3 text-muted-foreground/50 transition-transform duration-200 ${subIsExpanded ? 'rotate-90' : ''}`} />
                            </button>
                          ) : (
                            <Link
                              href={sub.path}
                              onClick={handleNavClick}
                              className={`block rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all ${
                                pathname === sub.path
                                  ? 'text-primary bg-primary/8 font-semibold'
                                  : 'text-sidebar-foreground/60 hover:text-foreground hover:bg-sidebar-accent/40'
                              }`}
                            >
                              {sub.label}
                            </Link>
                          )}

                          {/* ─ Level 3 ─ */}
                          {subHasChildren && subIsExpanded && (
                            <div
                              className="ml-2 pl-2 space-y-0.5"
                              style={{ borderLeft: '1px solid color-mix(in oklch, var(--border) 25%, transparent)' }}
                            >
                              {sub.children?.map(leaf => (
                                <Link
                                  key={leaf.id}
                                  href={leaf.path}
                                  onClick={handleNavClick}
                                  className={`block rounded-lg px-2 py-1 text-[10px] font-medium transition-all ${
                                    pathname === leaf.path
                                      ? 'text-primary font-bold'
                                      : 'text-sidebar-foreground/50 hover:text-foreground'
                                  }`}
                                >
                                  {leaf.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ─── User Card ─── */}
      <div
        className="p-3"
        style={{ borderTop: '1px solid color-mix(in oklch, var(--sidebar-border) 40%, transparent)' }}
      >
        <div
          className="flex items-center gap-2.5 rounded-xl p-2 transition-colors duration-200 hover:bg-sidebar-accent/40 cursor-pointer group"
        >
          <div className="relative shrink-0">
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
            <span
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-emerald-500"
              style={{ boxShadow: 'var(--glow-success)' }}
            />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col overflow-hidden flex-1 min-w-0">
              <span className="text-[11px] font-bold text-foreground truncate">
                {currentUser.name}
              </span>
              <span className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wide truncate mt-0.5">
                {currentUser.primaryRole.replace(/_/g, ' ')}
              </span>
            </div>
          )}
          {isSidebarOpen && (
            <Icons.MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-muted-foreground shrink-0 transition-colors" />
          )}
        </div>
      </div>
    </aside>
  );
}
