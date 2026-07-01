import React from 'react';
import { JenisTagihanEntity } from '../types/jenis-tagihan.type';

interface Props {
  initialData?: JenisTagihanEntity;
  onSubmit: (formData: FormData) => void;
}

export function JenisTagihanForm({ initialData, onSubmit }: Props) {
  return (
    <form action={onSubmit} className="space-y-4">
      {initialData && <input type="hidden" name="id" value={initialData.id} />}
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Nama Jenis Tagihan</label>
        <input 
          type="text" 
          name="name" 
          defaultValue={initialData?.name} 
          required 
          className="w-full p-2 border rounded-md"
          placeholder="e.g. SPP, Daftar Ulang, Ekstrakurikuler"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Kategori</label>
        <select 
          name="category" 
          defaultValue={initialData?.category || 'Bulanan'} 
          required 
          className="w-full p-2 border rounded-md bg-transparent"
        >
          <option value="Bulanan">Bulanan</option>
          <option value="Tahunan">Tahunan</option>
          <option value="Insidental">Insidental</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Keterangan</label>
        <textarea 
          name="description" 
          defaultValue={initialData?.description || ''} 
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          name="isActive" 
          value="true" 
          defaultChecked={initialData ? initialData.isActive : true} 
          id="isActive"
        />
        <label htmlFor="isActive" className="text-sm font-medium">Status Aktif</label>
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
          Simpan
        </button>
      </div>
    </form>
  );
}
