'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTahunAjaranSchema, updateTahunAjaranSchema, UpdateTahunAjaranInput } from '../validators/tahun-ajaran.validator';
import { z } from 'zod';
import { TahunAjaranEntity } from '../types/tahun-ajaran.type';
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

interface TahunAjaranFormProps {
  initialData?: TahunAjaranEntity;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function TahunAjaranForm({ initialData, onSubmit, isSubmitting }: TahunAjaranFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updateTahunAjaranSchema : createTahunAjaranSchema;
  
   
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UpdateTahunAjaranInput>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      id: initialData?.id || '',
      name: initialData?.name || '',
      status: (initialData?.status as 'Aktif' | 'Tidak Aktif') || 'Aktif',
      pondokId: initialData?.pondokId || 'pondok-1', // Default for now
    }
  });

  const selectedStatus = watch('status');

  const onFormSubmit = (data: Record<string, string>) => {
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
        <Label htmlFor="name">Tahun Ajaran <span className="text-rose-500">*</span></Label>
        <Input id="name" placeholder="Misal: 2026/2027" {...register('name')} />
        {errors.name && <p className="text-xs text-rose-500">{errors.name.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Status <span className="text-rose-500">*</span></Label>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant={selectedStatus === 'Aktif' ? 'default' : 'outline'}
              onClick={() => setValue('status', 'Aktif')}
              className="flex-1"
            >
              Aktif
            </Button>
            <Button
              type="button"
              variant={selectedStatus === 'Tidak Aktif' ? 'default' : 'outline'}
              onClick={() => setValue('status', 'Tidak Aktif')}
              className="flex-1"
            >
              Tidak Aktif
            </Button>
          </div>
        {/* Register hidden input for Select component since it's custom UI */}
        <input type="hidden" {...register('status')} />
        {errors.status && <p className="text-xs text-rose-500">{errors.status.message as string}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Tahun Ajaran' : 'Simpan Tahun Ajaran'}
        </Button>
      </div>
    </form>
  );
}
