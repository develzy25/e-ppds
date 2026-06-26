import React from 'react';
import { Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  name: string;
  options: FilterOption[];
}

interface FilterToolbarProps {
  groups: FilterGroup[];
  onFilterChange: (groupName: string, value: string) => void;
}

export function FilterToolbar({ groups, onFilterChange }: FilterToolbarProps) {
  if (!groups || groups.length === 0) return null;

  return (
    <DropdownMenu>
      {/* @ts-expect-error React 19 type mismatch with Radix UI asChild */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {groups.map((group, index) => (
          <React.Fragment key={group.name}>
            <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">{group.name}</DropdownMenuLabel>
            {group.options.map((opt) => (
              <DropdownMenuItem 
                key={opt.value} 
                onClick={() => onFilterChange(group.name, opt.value)}
                className="cursor-pointer"
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
            {index < groups.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
