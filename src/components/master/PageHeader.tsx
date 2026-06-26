import React from 'react';
import { Breadcrumb } from './Breadcrumb';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs: { label: string; href?: string }[];
  action?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
      <div>
        <Breadcrumb items={breadcrumbs} />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {action && (
        <div className="flex shrink-0 items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}
