"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Check, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const themes = [
  { name: "Ivory", value: "ivory", color: "bg-zinc-100 border-zinc-200" },
  { name: "Deep Space", value: "deep-space", color: "bg-slate-900 border-slate-700" },
  { name: "Emerald", value: "emerald", color: "bg-emerald-50 border-emerald-200" },
  { name: "Ocean", value: "ocean", color: "bg-blue-50 border-blue-200" },
  { name: "Corporate", value: "corporate", color: "bg-neutral-100 border-neutral-300" },
  { name: "Pondok Classic", value: "pondok-classic", color: "bg-stone-100 border-stone-200" },
];

export function ThemeSwitcher() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full opacity-50" disabled>
        <Palette className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full relative overflow-hidden group">
            <Palette className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="sr-only">Pilih Tema</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-premium border-border/40">
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tampilan Aplikasi
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/40" />
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`
              flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg text-sm transition-all
              ${theme === t.value ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/80 hover:bg-secondary'}
            `}
          >
            <div className={`w-4 h-4 rounded-full border shadow-sm ${t.color}`} />
            <span className="flex-1">{t.name}</span>
            {theme === t.value && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
