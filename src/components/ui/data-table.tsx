'use client';

import React, { useState, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, ChevronLeft, ChevronRight, Download, Printer, Settings2 } from 'lucide-react';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { ExportEngine } from '@/shared/utils/export-engine';
import { usePrint } from '../print/print-provider';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumnKey?: string;
  enableExport?: boolean;
  exportFileName?: string;
}

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = 'Cari data...',
  searchColumnKey,
  enableExport = true,
  exportFileName = 'data-export'
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const { print } = usePrint();

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 50 // Increased for virtual scrolling
      }
    }
  });

  const { rows } = table.getRowModel();

  // Virtualizer for rows
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 44, // Estimated row height
    overscan: 10,
  });

  const handleExportCSV = () => {
    ExportEngine.downloadCSV(data as any[], { fileName: exportFileName });
  };

  const handleExportExcel = () => {
    ExportEngine.downloadExcel(data as any[], { fileName: exportFileName });
  };
  
  const handleExportJSON = () => {
    ExportEngine.downloadJSON(data as any[], { fileName: exportFileName });
  };

  const handlePrint = () => {
    print(
      <div className="p-8 w-full">
        <h1 className="text-2xl font-bold mb-6">{exportFileName.toUpperCase()}</h1>
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="border-b-2 border-black">
                {hg.headers.map(h => (
                  <th key={h.id} className="py-2 pr-4">{flexRender(h.column.columnDef.header, h.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-b border-gray-300">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="py-2 pr-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
      { documentTitle: exportFileName }
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Tabel: Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {searchColumnKey ? (
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full rounded-(--radius) border border-input bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
            />
          </div>
        ) : <div />}

        {enableExport && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-9"><Download className="mr-2 h-4 w-4" /> Export</Button>} />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportExcel}>Excel (.xlsx)</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJSON}>JSON</DropdownMenuItem>
                <DropdownMenuItem onClick={() => ExportEngine.copyToClipboard(data as any[])}>Copy to Clipboard</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" className="h-9" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
        )}
      </div>

      {/* Kontainer Tabel */}
      <div className="overflow-hidden rounded-(--radius) border border-border bg-card shadow-sm">
        {/* Desktop / Tablet View (Table) */}
        <div 
          ref={tableContainerRef} 
          className="hidden md:block overflow-auto max-h-[600px] relative scrollbar-thin"
        >
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-secondary/70 border-b border-border/80 text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 font-semibold select-none cursor-pointer" onClick={header.column.getToggleSortingHandler()}>
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody 
              className="divide-y divide-border/40"
              style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}
            >
              {rowVirtualizer.getVirtualItems().length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  return (
                    <tr 
                      key={row.id} 
                      className="hover:bg-secondary/30 transition-colors duration-150 absolute top-0 left-0 w-full"
                      style={{
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 font-medium text-foreground">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Card Transform) */}
        <div className="md:hidden flex flex-col divide-y divide-border/40 max-h-[600px] overflow-y-auto">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Data tidak ditemukan.</div>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="p-4 space-y-3">
                {row.getVisibleCells().map((cell) => {
                  // Skip action column on cards if needed, or render them distinctly
                  return (
                    <div key={cell.id} className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                        {typeof cell.column.columnDef.header === 'string' ? cell.column.columnDef.header : cell.column.id}
                      </span>
                      <div className="text-sm font-medium text-foreground">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer Tabel: Pagination */}
        <div className="flex items-center justify-between border-t border-border/60 bg-secondary/10 px-4 py-3">
          <div className="text-xs text-muted-foreground">
            Halaman{' '}
            <span className="font-semibold text-foreground">
              {table.getState().pagination.pageIndex + 1}
            </span>{' '}
            dari{' '}
            <span className="font-semibold text-foreground">
              {table.getPageCount() || 1}
            </span>
            {' '} ({data.length} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
