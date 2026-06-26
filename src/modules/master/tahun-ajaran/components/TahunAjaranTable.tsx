'use client';

import React from 'react';
import { StandardDataTable } from '@/components/master/StandardDataTable';
import { ColumnDef } from '@tanstack/react-table';
import { TahunAjaranEntity } from '../types/tahun-ajaran.type';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { StatusBadge } from '@/components/master';

interface TahunAjaranTableProps {
  data: TahunAjaranEntity[];
  onEdit: (tahunAjaran: TahunAjaranEntity) => void;
  onDelete: (tahunAjaranId: string) => void;
}

export function TahunAjaranTable({ data, onEdit, onDelete }: TahunAjaranTableProps) {
  const columns: ColumnDef<TahunAjaranEntity>[] = [
    {
      accessorKey: 'name',
      header: 'Tahun Ajaran',
      cell: ({ row }) => <span className="font-semibold">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return <StatusBadge label={status} status={status === 'Aktif' ? 'active' : 'inactive'} />;
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Dibuat Pada',
      cell: ({ row }) => format(new Date(row.getValue('createdAt')), 'dd MMM yyyy', { locale: id }),
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

  return <StandardDataTable columns={columns} data={data} searchKey="name" />;
}
