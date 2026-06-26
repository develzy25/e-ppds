import React from 'react';
import { History, User } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export interface AuditLogItem {
  id: string;
  action: string;
  performedBy: string;
  performedAt: string;
  remarks?: string;
}

interface AuditTimelineProps {
  logs: AuditLogItem[];
}

export function AuditTimeline({ logs }: AuditTimelineProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Belum ada riwayat perubahan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log, index) => (
        <div key={log.id} className="relative pl-6 pb-4 border-l border-border last:border-0 last:pb-0">
          <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary"></div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground capitalize">
                {log.action.toLowerCase()}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(log.performedAt), 'dd MMM yyyy, HH:mm', { locale: id })}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <User className="h-3.5 w-3.5" />
              <span>Oleh: {log.performedBy}</span>
            </div>

            {log.remarks && (
              <p className="text-xs text-foreground mt-2 bg-muted/50 p-2 rounded-md border border-border/50">
                {log.remarks}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
