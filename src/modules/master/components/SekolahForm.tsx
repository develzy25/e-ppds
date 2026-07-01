'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSekolahSchema, updateSekolahSchema } from '../validators/sekolah.validator';
import { SekolahEntity } from '../types/sekolah.type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SekolahFormProps {
  initialData?: SekolahEntity;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function SekolahForm({ initialData, onSubmit, isSubmitting }: SekolahFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updateSekolahSchema : createSekolahSchema;
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialData?.id || '',
      name: initialData?.name || '',
      type: initialData?.type || 'Formal',
      pondokId: initialData?.pondokId || '', // Server action override dari session
    }
  });

  const selectedType = watch('type');

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
        <Label htmlFor="name">Nama Sekolah / Madrasah <span className="text-rose-500">*</span></Label>
        <Input id="name" placeholder="Misal: MTs PPDS" {...register('name')} />
        {errors.name && <p className="text-xs text-rose-500">{errors.name.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Tipe Pendidikan <span className="text-rose-500">*</span></Label>
        <Select 
          value={selectedType} 
          onValueChange={(val) => setValue('type', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih tipe pendidikan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Formal">Formal</SelectItem>
            <SelectItem value="Diniyah">Diniyah</SelectItem>
          </SelectContent>
        </Select>
        {/* Register hidden input for Select component since it's custom UI */}
        <input type="hidden" {...register('type')} />
        {errors.type && <p className="text-xs text-rose-500">{errors.type.message as string}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Sekolah' : 'Simpan Sekolah'}
        </Button>
      </div>
    </form>
  );
}
