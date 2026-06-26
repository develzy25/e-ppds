import React from 'react';
import { Download, Upload, Printer, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ImportExportToolsProps {
  onImport?: () => void;
  onExportExcel?: () => void;
  onExportCsv?: () => void;
  onPrint?: () => void;
}

export function ImportExportTools({ onImport, onExportExcel, onExportCsv, onPrint }: ImportExportToolsProps) {
  return (
    <div className="flex items-center gap-2">
      {onImport && (
        <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={onImport}>
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Import</span>
        </Button>
      )}
      
      {(onExportExcel || onExportCsv) && (
        <DropdownMenu>
          {/* @ts-expect-error React 19 type mismatch with Radix UI asChild */}
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onExportExcel && (
              <DropdownMenuItem onClick={onExportExcel} className="cursor-pointer gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                Excel (.xlsx)
              </DropdownMenuItem>
            )}
            {onExportCsv && (
              <DropdownMenuItem onClick={onExportCsv} className="cursor-pointer gap-2">
                <FileSpreadsheet className="h-4 w-4 text-sky-500" />
                CSV (.csv)
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {onPrint && (
        <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={onPrint}>
          <Printer className="h-4 w-4" />
          <span className="hidden sm:inline">Print</span>
        </Button>
      )}
    </div>
  );
}
