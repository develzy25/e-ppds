"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, CornerDownLeft, FileText, Settings, Users, Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import { routes, RouteItem } from "@/config/routes";
import { useApp } from "@/context/AppContext";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { currentUser } = useApp();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const hasAccess = (item: RouteItem): boolean => {
    if (!item.permissions || item.permissions.length === 0) return true;
    return currentUser.permissions.some(p => item.permissions?.includes(p));
  };

  const flatRoutes = React.useMemo(() => {
    const flatten = (items: RouteItem[], prefix = ""): { title: string, path: string, icon: string }[] => {
      let result: { title: string, path: string, icon: string }[] = [];
      items.forEach(item => {
        if (!hasAccess(item)) return;
        const currentTitle = prefix ? `${prefix} > ${item.label}` : item.label;
        if (item.path !== '#') {
          result.push({ title: currentTitle, path: item.path, icon: item.icon || 'HelpCircle' });
        }
        if (item.children) {
          result = result.concat(flatten(item.children, currentTitle));
        }
      });
      return result;
    };
    return flatten(routes);
  }, [currentUser]);

  const filteredRoutes = flatRoutes.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false} className="p-0 overflow-hidden max-w-2xl bg-card/95 backdrop-blur-2xl shadow-[0_30px_70px_-10px_rgba(0,0,0,0.3)]">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
            placeholder="Ketik perintah atau cari menu (Ctrl+K)..."
            autoFocus
          />
          <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">ESC</span>
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2">
          {filteredRoutes.length === 0 ? (
            <div className="py-14 text-center text-sm">
              <Folder className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-medium">Tidak ada hasil ditemukan.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredRoutes.map((route, i) => (
                <button
                  key={i}
                  onClick={() => runCommand(() => router.push(route.path))}
                  className="relative flex cursor-default select-none items-center rounded-[calc(var(--radius)-4px)] px-3 py-2.5 text-sm outline-none hover:bg-primary/10 hover:text-primary aria-selected:bg-primary/10 aria-selected:text-primary data-disabled:pointer-events-none data-disabled:opacity-50 transition-colors w-full text-left"
                >
                  <FileText className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground/90">{route.title}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
                    Buka Menu <CornerDownLeft className="h-3 w-3" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
