'use client';

import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender
} from '@tanstack/react-table';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumnKey?: string;
}

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = 'Cari data...',
  searchColumnKey
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState('');

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5
      }
    }
  });

  return (
    <div className="space-y-4">
      {/* Header Tabel: Search Bar */}
      {searchColumnKey && (
        <div className="relative max-w-sm">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground focus:border-primary/50 focus:outline-none transition-all shadow-sm"
          />
        </div>
      )}

      {/* Kontainer Tabel */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-premium glass">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-secondary/40 border-b border-border/80 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 font-semibold select-none">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/40">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-secondary/25 transition-colors duration-150"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 font-medium text-foreground">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Tabel: Pagination */}
        <div className="flex items-center justify-between border-t border-border/60 bg-secondary/10 px-4 py-2.5">
          <div className="text-[11px] text-muted-foreground">
            Halaman{' '}
            <span className="font-semibold text-foreground">
              {table.getState().pagination.pageIndex + 1}
            </span>{' '}
            dari{' '}
            <span className="font-semibold text-foreground">
              {table.getPageCount() || 1}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border/80 bg-card hover:bg-secondary disabled:opacity-50 text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border/80 bg-card hover:bg-secondary disabled:opacity-50 text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
