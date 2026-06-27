import React from 'react';
import { StandardDataTable } from '@/components/master';
import { TarifWithRelationsEntity } from '../types/tarif.type';
import { Pencil, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

interface Props {
  data: TarifWithRelationsEntity[];
  onEdit: (item: TarifWithRelationsEntity) => void;
  onDelete: (id: string) => void;
}

export function TarifTable({ data, onEdit, onDelete }: Props) {
  const columns: ColumnDef<TarifWithRelationsEntity>[] = [
    {
      accessorKey: 'jenisTagihan.name',
      header: 'Jenis Tagihan',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.jenisTagihan?.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.jenisTagihan?.category}</p>
        </div>
      )
    },
    {
      accessorKey: 'academicYear.name',
      header: 'Tahun Ajaran',
    },
    {
      accessorKey: 'amount',
      header: 'Nominal Tarif',
      cell: ({ row }) => {
        const formatter = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        });
        return <span className="font-semibold text-emerald-600">{formatter.format(row.original.amount)}</span>;
      }
    },
    {
      accessorKey: 'description',
      header: 'Keterangan',
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

  return <StandardDataTable data={data} columns={columns} searchKey="jenisTagihan_name" />;
}
