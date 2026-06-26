'use client';

import React from 'react';
import * as Icons from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  iconName?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  iconName = 'Inbox',
  actionLabel,
  onAction
}: EmptyStateProps) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName] || Icons.Inbox;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 p-8 text-center glass shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/80 border border-border/30 text-muted-foreground shadow-sm mb-4">
        <IconComponent className="h-5.5 w-5.5 text-muted-foreground/60" />
      </div>
      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{title}</h3>
      <p className="mt-1.5 max-w-[260px] text-[11px] text-muted-foreground/95 leading-normal">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
