'use client';

import React from 'react';
import { StandardDataTable } from '@/components/master/StandardDataTable';
import { ColumnDef } from '@tanstack/react-table';
import { PengurusEntity } from '../types/pengurus.type';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { StatusBadge } from '@/components/master';

interface PengurusTableProps {
  data: PengurusEntity[];
  onEdit: (pengurus: PengurusEntity) => void;
  onDelete: (pengurusId: string) => void;
}

export function PengurusTable({ data, onEdit, onDelete }: PengurusTableProps) {
  const columns: ColumnDef<PengurusEntity>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Pengurus',
      cell: ({ row }) => <span className="font-semibold">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      id: 'roles',
      header: 'Peran (Role)',
      cell: ({ row }) => {
        const roles = row.original.roles || [];
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map(r => (
              <span key={r.id} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full">
                {r.name}
              </span>
            ))}
          </div>
        );
      }
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
      accessorKey: 'createdAt',
      header: 'Terdaftar',
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
