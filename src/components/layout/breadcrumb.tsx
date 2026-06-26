'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { routes, RouteItem } from '@/config/routes';

export function Breadcrumb() {
  const pathname = usePathname();
  
  if (pathname === '/' || pathname === '/dashboard/personal') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium">
        <Home className="h-3.5 w-3.5" />
        <ChevronRight className="h-3 w-3" />
        <span>Dashboard Personal</span>
      </div>
    );
  }

  // Find labels recursively
  const findRouteLabel = (path: string, items: RouteItem[]): string | null => {
    for (const item of items) {
      if (item.path === path) return item.label;
      if (item.children) {
        const found = findRouteLabel(path, item.children);
        if (found) return found;
      }
    }
    return null;
  };

  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const url = '/' + pathSegments.slice(0, index + 1).join('/');
    
    // Look up label from registry or fallback to capitalized segment name
    let label = findRouteLabel(url, routes);
    if (!label) {
      // Clean up dynamic IDs or subpaths
      label = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
    
    return {
      label,
      url,
      isLast: index === pathSegments.length - 1
    };
  });

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium select-none">
      <Link 
        href="/dashboard/personal" 
        className="flex items-center gap-1.5 hover:text-foreground transition-colors duration-200"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.url}>
          <ChevronRight className="h-3 w-3 text-muted-foreground/55" />
          {item.isLast ? (
            <span className="text-foreground font-semibold truncate max-w-[120px] md:max-w-xs">
              {item.label}
            </span>
          ) : (
            <Link 
              href={item.url} 
              className="hover:text-foreground transition-colors duration-200 truncate max-w-[100px] md:max-w-[150px]"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
