import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatisticsCard({ title, value, icon: Icon, description, trend }: StatisticsCardProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend && (
              <span className={trend.isPositive ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
            )}
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
