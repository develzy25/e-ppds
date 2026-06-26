import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {item.href ? (
            <a href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <span className="mx-2 text-muted-foreground/50">/</span>
          )}
        </div>
      ))}
    </nav>
  );
}
