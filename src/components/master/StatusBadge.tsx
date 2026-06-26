import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cva, type VariantProps } from 'class-variance-authority';

const statusBadgeVariants = cva(
  'font-semibold uppercase tracking-wider text-[10px]',
  {
    variants: {
      status: {
        active: 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-200 dark:border-emerald-800/30',
        inactive: 'bg-neutral-500/15 text-neutral-600 hover:bg-neutral-500/25 border-neutral-200 dark:border-neutral-800/30',
        warning: 'bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-200 dark:border-amber-800/30',
        danger: 'bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 border-rose-200 dark:border-rose-800/30',
        info: 'bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-200 dark:border-blue-800/30',
      },
    },
    defaultVariants: {
      status: 'active',
    },
  }
);

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof statusBadgeVariants> {
  label: string;
}

export function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={statusBadgeVariants({ status, className })} {...props}>
      {label}
    </Badge>
  );
}
