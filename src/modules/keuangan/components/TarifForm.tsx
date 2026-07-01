import React from 'react';
import { TarifWithRelationsEntity } from '../types/tarif.type';
import { JenisTagihanEntity } from '../types/jenis-tagihan.type';
import { AcademicYearEntity } from '../types/tarif.type';

interface Props {
  initialData?: TarifWithRelationsEntity;
  jenisTagihans: JenisTagihanEntity[];
  academicYears: AcademicYearEntity[];
  onSubmit: (formData: FormData) => void;
}

export function TarifForm({ initialData, jenisTagihans, academicYears, onSubmit }: Props) {
  return (
    <form action={onSubmit} className="space-y-4">
      {initialData && <input type="hidden" name="id" value={initialData.id} />}
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Jenis Tagihan</label>
        <select 
          name="jenisTagihanId" 
          defaultValue={initialData?.jenisTagihanId || ''} 
          required 
          className="w-full p-2 border rounded-md bg-transparent"
        >
          <option value="" disabled>Pilih Jenis Tagihan</option>
          {jenisTagihans.filter(j => j.isActive).map(j => (
            <option key={j.id} value={j.id}>{j.name} ({j.category})</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tahun Ajaran</label>
        <select 
          name="academicYearId" 
          defaultValue={initialData?.academicYearId || ''} 
          required 
          className="w-full p-2 border rounded-md bg-transparent"
        >
          <option value="" disabled>Pilih Tahun Ajaran</option>
          {academicYears.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Nominal Tarif (Rp)</label>
        <input 
          type="number" 
          name="amount" 
          defaultValue={initialData?.amount} 
          required 
          min="0"
          className="w-full p-2 border rounded-md"
          placeholder="e.g. 150000"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Keterangan</label>
        <textarea 
          name="description" 
          defaultValue={initialData?.description || ''} 
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
          Simpan
        </button>
      </div>
    </form>
  );
}
