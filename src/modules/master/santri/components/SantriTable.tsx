'use client';

import React from 'react';
import { StandardDataTable, PaginationMeta } from '@/components/master/StandardDataTable';
import { ColumnDef } from '@tanstack/react-table';
import { SantriEntity } from '../types/santri.type';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/master';

interface SantriTableProps {
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  data: SantriEntity[];
  onEdit: (santri: SantriEntity) => void;
  onDelete: (santriId: string) => void;
}

export function SantriTable({ data, onEdit, onDelete, meta, onPageChange }: SantriTableProps) {
  const columns: ColumnDef<SantriEntity>[] = [
    {
      accessorKey: 'nis',
      header: 'NIS',
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('nis')}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Nama Santri',
      cell: ({ row }) => <span className="font-semibold">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'gender',
      header: 'L/P',
    },
    {
      accessorKey: 'kamar.name',
      header: 'Kamar',
      cell: ({ row }) => <span>{row.original.kamar?.name || '-'}</span>,
    },
    {
      accessorKey: 'classFormal.name',
      header: 'Kelas Formal',
      cell: ({ row }) => <span>{row.original.classFormal?.name || '-'}</span>,
    },
    {
      accessorKey: 'statusAktif',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('statusAktif') as string;
        return <StatusBadge label={status} status={status === 'Aktif' ? 'active' : 'inactive'} />;
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(row.original)} className="h-8 px-2">
            <Edit2 className="h-3.5 w-3.5 text-blue-500" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(row.original.id)} className="h-8 px-2 hover:bg-rose-50">
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ];

  return <StandardDataTable columns={columns} data={data} searchKey="name" meta={meta} onPageChange={onPageChange} />;
}
