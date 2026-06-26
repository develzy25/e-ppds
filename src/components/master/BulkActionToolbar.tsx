import React from 'react';
import { Trash2, Archive, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface BulkAction {
  label: string;
  icon?: 'trash' | 'archive' | 'check';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onClick: (selectedIds: string[]) => void;
}

interface BulkActionToolbarProps {
  selectedIds: string[];
  actions: BulkAction[];
}

export function BulkActionToolbar({ selectedIds, actions }: BulkActionToolbarProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="flex items-center gap-4 bg-muted/50 p-2 px-4 rounded-lg border border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <span className="text-sm font-medium text-muted-foreground">
        {selectedIds.length} baris terpilih
      </span>
      <div className="h-4 w-px bg-border"></div>
      <div className="flex items-center gap-2">
        {actions.map((action, index) => {
          let Icon = null;
          if (action.icon === 'trash') Icon = Trash2;
          else if (action.icon === 'archive') Icon = Archive;
          else if (action.icon === 'check') Icon = CheckCircle;

          return (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => action.onClick(selectedIds)}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
