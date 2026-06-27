import React from 'react';
import { StandardDataTable } from '@/components/master';
import { JenisTagihanEntity } from '../types/jenis-tagihan.type';
import { Pencil, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

interface Props {
  data: JenisTagihanEntity[];
  onEdit: (item: JenisTagihanEntity) => void;
  onDelete: (id: string) => void;
}

export function JenisTagihanTable({ data, onEdit, onDelete }: Props) {
  const columns: ColumnDef<JenisTagihanEntity>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Tagihan',
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: ({ row }) => {
        const val = row.original.category;
        const color = val === 'Bulanan' ? 'bg-blue-100 text-blue-700' : val === 'Tahunan' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700';
        return <span className={`px-2 py-1 text-xs rounded-full font-medium ${color}`}>{val}</span>;
      }
    },
    {
      accessorKey: 'description',
      header: 'Keterangan',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        return row.original.isActive ? (
          <span className="px-2 py-1 text-xs rounded-full font-medium bg-emerald-100 text-emerald-700">Aktif</span>
        ) : (
          <span className="px-2 py-1 text-xs rounded-full font-medium bg-slate-100 text-slate-700">Nonaktif</span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(row.original)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(row.original.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-md">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }
  ];

  return <StandardDataTable data={data} columns={columns} searchKey="name" />;
}
