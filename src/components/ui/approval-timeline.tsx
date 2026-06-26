'use client';

import React from 'react';
import { Check, Clock, Info, ShieldAlert } from 'lucide-react';

// ==========================================
// 1. APPROVAL TIMELINE
// ==========================================

export interface TimelineItem {
  title: string;
  subtitle: string;
  date: string;
  status: 'completed' | 'current' | 'pending';
  userName?: string;
}

interface ApprovalTimelineProps {
  items: TimelineItem[];
}

export function ApprovalTimeline({ items }: ApprovalTimelineProps) {
  return (
    <div className="relative border-l border-border/80 ml-3 pl-5 space-y-5">
      {items.map((item, index) => {
        const isCompleted = item.status === 'completed';
        const isCurrent = item.status === 'current';

        return (
          <div key={index} className="relative group">
            {/* Indikator Titik */}
            <div
              className={`absolute left-[-27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-300 ${
                isCompleted
                  ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/10'
                  : isCurrent
                  ? 'bg-card border-primary text-primary ring-2 ring-primary/15 scale-105'
                  : 'bg-card border-border text-muted-foreground'
              }`}
            >
              {isCompleted ? (
                <Check className="h-2 w-2" />
              ) : (
                <div className={`h-1.5 w-1.5 rounded-full ${isCurrent ? 'bg-primary' : 'bg-muted-foreground/45'}`} />
              )}
            </div>

            {/* Konten Timeline */}
            <div className="flex flex-col gap-0.5 text-xs text-left">
              <div className="flex items-center justify-between gap-4">
                <span className={`font-bold ${isCompleted ? 'text-foreground/90' : isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.title}
                </span>
                <span className="text-[9px] text-muted-foreground/70">{item.date}</span>
              </div>
              <div className="text-[10px] text-muted-foreground leading-normal">
                {item.subtitle} {item.userName && <span className="font-semibold text-foreground/80">({item.userName})</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// 2. ACTIVITY FEED
// ==========================================

export interface FeedItem {
  id: string;
  label: string;
  details: string;
  date: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

interface ActivityFeedProps {
  items: FeedItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  const iconColors = {
    info: 'bg-sky-500/10 border-sky-500/30 text-sky-500',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
    danger: 'bg-rose-500/10 border-rose-500/30 text-rose-500'
  };

  const icons = {
    info: Info,
    success: Check,
    warning: Clock,
    danger: ShieldAlert
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const Icon = icons[item.type];
        return (
          <div key={item.id} className="flex gap-3 text-left">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border shadow-sm ${iconColors[item.type]}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col gap-0.5 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-foreground/90">{item.label}</span>
                <span className="text-[9px] text-muted-foreground">{item.date}</span>
              </div>
              <p className="text-[10px] text-muted-foreground/85 leading-normal">{item.details}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
