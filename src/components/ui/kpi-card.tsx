'use client';

import React, { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  iconName?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  status?: 'success' | 'warning' | 'danger' | 'info' | 'primary';
  is3d?: boolean;
  delay?: number;
}

const STATUS_CONFIG = {
  primary: {
    border: 'border-l-[var(--primary)]',
    icon: 'bg-primary/15 text-primary border-primary/20',
    glow: 'hover:shadow-[var(--glow-primary)]',
    badge: 'bg-primary/10 text-primary',
    bar: 'bg-primary',
  },
  success: {
    border: 'border-l-emerald-500',
    icon: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
    glow: 'hover:shadow-[var(--glow-success)]',
    badge: 'bg-emerald-500/10 text-emerald-500',
    bar: 'bg-emerald-500',
  },
  warning: {
    border: 'border-l-amber-500',
    icon: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
    glow: 'hover:shadow-[var(--glow-warning)]',
    badge: 'bg-amber-500/10 text-amber-500',
    bar: 'bg-amber-500',
  },
  danger: {
    border: 'border-l-rose-500',
    icon: 'bg-rose-500/15 text-rose-500 border-rose-500/20',
    glow: 'hover:shadow-[var(--glow-danger)]',
    badge: 'bg-rose-500/10 text-rose-500',
    bar: 'bg-rose-500',
  },
  info: {
    border: 'border-l-sky-500',
    icon: 'bg-sky-500/15 text-sky-500 border-sky-500/20',
    glow: 'hover:shadow-[var(--glow-info)]',
    badge: 'bg-sky-500/10 text-sky-500',
    bar: 'bg-sky-500',
  },
};

export function KPICard({
  title,
  value,
  description,
  iconName,
  trend,
  status = 'primary',
  is3d = true,
  delay = 0,
}: KPICardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const cfg = STATUS_CONFIG[status];

  const IconComponent = iconName
    ? (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName]
    : null;

  // Mouse-tracking 3D tilt
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3d || !cardRef.current || !glowRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -8;
    const rotY = ((x - cx) / cx) * 8;

    cardRef.current.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;

    // Move inner shimmer glow to follow cursor
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    glowRef.current.style.background = `radial-gradient(circle at ${px}% ${py}%, color-mix(in oklch, var(--primary) 20%, transparent) 0%, transparent 60%)`;
    glowRef.current.style.opacity = '1';
  }, [is3d]);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current || !glowRef.current) return;
    cardRef.current.style.transform =
      'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    glowRef.current.style.opacity = '0';
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      className="perspective-container"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`
          relative overflow-hidden rounded-2xl border border-border/70
          glass-premium shadow-premium border-l-4
          ${cfg.border} ${cfg.glow}
          transition-all duration-500 ease-out cursor-default
          ${is3d ? 'will-change-transform' : ''}
        `}
        style={{ transformStyle: 'preserve-3d', transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease' }}
      >
        {/* Inner shimmer glow — follows mouse */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{ opacity: 0, zIndex: 0 }}
        />

        {/* Accent bar top */}
        <div className={`absolute top-0 left-4 right-4 h-[2px] rounded-b-full ${cfg.bar} opacity-40`} />

        {/* Content */}
        <div className="relative z-10 p-5">
          <div className="flex items-start justify-between gap-3">
            {/* Text */}
            <div className="space-y-2 flex-1 min-w-0">
              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                {title}
              </span>
              <div className="text-2xl md:text-3xl font-black text-foreground tracking-tight leading-none">
                {value}
              </div>
            </div>

            {/* Icon Badge — 3D floating */}
            {IconComponent && (
              <div
                className={`
                  flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl
                  border ${cfg.icon} shadow-sm
                  transition-transform duration-300 group-hover:scale-110
                `}
                style={{ transform: 'translateZ(12px)' }}
              >
                <IconComponent className="h-5 w-5" />
              </div>
            )}
          </div>

          {/* Footer */}
          {(description || trend) && (
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/20 pt-3">
              {description && (
                <span className="text-[11px] text-muted-foreground truncate leading-tight">
                  {description}
                </span>
              )}
              {trend && (
                <span
                  className={`
                    flex items-center gap-0.5 text-[11px] font-bold shrink-0
                    px-2 py-0.5 rounded-full
                    ${trend.isPositive
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-rose-500/10 text-rose-500'}
                  `}
                >
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
