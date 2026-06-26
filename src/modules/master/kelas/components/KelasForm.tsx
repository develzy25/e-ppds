'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createKelasSchema, updateKelasSchema } from '../validators/kelas.validator';
import { KelasEntity } from '../types/kelas.type';
import { SekolahEntity } from '../../sekolah/types/sekolah.type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSekolahsForDropdown } from '../actions/kelas.action';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KelasFormProps {
  initialData?: KelasEntity;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function KelasForm({ initialData, onSubmit, isSubmitting }: KelasFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updateKelasSchema : createKelasSchema;
  
  const [sekolahs, setSekolahs] = useState<SekolahEntity[]>([]);
  const [loadingSekolahs, setLoadingSekolahs] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialData?.id || '',
      name: initialData?.name || '',
      schoolId: initialData?.schoolId || '',
      pondokId: initialData?.pondokId || 'pondok-1', // Mock pondok
    }
  });

  const selectedSchoolId = watch('schoolId');

  useEffect(() => {
    const fetchSekolahs = async () => {
      setLoadingSekolahs(true);
      const res = await getSekolahsForDropdown();
      if (res.success) {
        setSekolahs(res.data as SekolahEntity[]);
      }
      setLoadingSekolahs(false);
    };
    fetchSekolahs();
  }, []);

  const onFormSubmit = (data: any) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {isEditing && <input type="hidden" {...register('id')} />}
      <input type="hidden" {...register('pondokId')} />

      <div className="space-y-2">
        <Label htmlFor="name">Nama Kelas / Ruang <span className="text-rose-500">*</span></Label>
        <Input id="name" placeholder="Misal: Kelas 7A" {...register('name')} />
        {errors.name && <p className="text-xs text-rose-500">{errors.name.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Sekolah / Madrasah <span className="text-rose-500">*</span></Label>
        <Select 
          value={selectedSchoolId} 
          onValueChange={(val) => setValue('schoolId', val)}
          disabled={loadingSekolahs}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingSekolahs ? "Memuat..." : "Pilih sekolah/madrasah"} />
          </SelectTrigger>
          <SelectContent>
            {sekolahs.map(sekolah => (
              <SelectItem key={sekolah.id} value={sekolah.id}>{sekolah.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Register hidden input for Select component since it's custom UI */}
        <input type="hidden" {...register('schoolId')} />
        {errors.schoolId && <p className="text-xs text-rose-500">{errors.schoolId.message as string}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Kelas' : 'Simpan Kelas'}
        </Button>
      </div>
    </form>
  );
}
