'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPeriodeSchema, updatePeriodeSchema } from '../validators/periode.validator';
import { PeriodeEntity } from '../types/periode.type';
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

interface PeriodeFormProps {
  initialData?: PeriodeEntity;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function PeriodeForm({ initialData, onSubmit, isSubmitting }: PeriodeFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updatePeriodeSchema : createPeriodeSchema;
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialData?.id || '',
      name: initialData?.name || '',
      status: initialData?.status || 'Aktif',
      pondokId: initialData?.pondokId || 'pondok-1', // Mock pondok
    }
  });

  const selectedStatus = watch('status');

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
        <Label htmlFor="name">Nama Periode <span className="text-rose-500">*</span></Label>
        <Input id="name" placeholder="Misal: Periode Kepengurusan 2026-2029" {...register('name')} />
        {errors.name && <p className="text-xs text-rose-500">{errors.name.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Status <span className="text-rose-500">*</span></Label>
        <Select 
          value={selectedStatus} 
          onValueChange={(val) => setValue('status', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Aktif">Aktif</SelectItem>
            <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>
        {/* Register hidden input for Select component since it's custom UI */}
        <input type="hidden" {...register('status')} />
        {errors.status && <p className="text-xs text-rose-500">{errors.status.message as string}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Periode' : 'Simpan Periode'}
        </Button>
      </div>
    </form>
  );
}
