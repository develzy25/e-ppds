'use client';

import React from 'react';

interface LoadingStateProps {
  type?: 'kpi' | 'table' | 'card';
  count?: number;
}

export function LoadingState({ type = 'kpi', count = 3 }: LoadingStateProps) {
  const items = Array.from({ length: count });

  if (type === 'kpi') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((_, i) => (
          <div 
            key={i} 
            className="animate-pulse rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2 w-2/3">
                <div className="h-2 bg-secondary rounded w-1/2"></div>
                <div className="h-6 bg-secondary rounded w-3/4"></div>
              </div>
              <div className="h-8 w-8 rounded-lg bg-secondary"></div>
            </div>
            <div className="mt-4 h-2 bg-secondary rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full animate-pulse rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-10 bg-secondary/30 border-b border-border/80"></div>
        <div className="divide-y divide-border/30 px-4 py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between py-3">
              <div className="h-3 bg-secondary rounded w-1/4"></div>
              <div className="h-3 bg-secondary rounded w-1/6"></div>
              <div className="h-3 bg-secondary rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-3 p-4 border border-border bg-card rounded-xl">
      <div className="h-3 bg-secondary rounded w-1/3"></div>
      <div className="h-12 bg-secondary rounded w-full"></div>
      <div className="h-12 bg-secondary rounded w-full"></div>
    </div>
  );
}
