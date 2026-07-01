'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBlokSchema, updateBlokSchema } from '../validators/blok.validator';
import { BlokEntity } from '../types/blok.type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BlokFormProps {
  initialData?: BlokEntity;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function BlokForm({ initialData, onSubmit, isSubmitting }: BlokFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updateBlokSchema : createBlokSchema;
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialData?.id || '',
      name: initialData?.name || '',
      pondokId: initialData?.pondokId || '', // Server action override dari session
    }
  });

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
        <Label htmlFor="name">Nama Blok / Gedung <span className="text-rose-500">*</span></Label>
        <Input id="name" placeholder="Misal: Blok A, Gedung Nusantara" {...register('name')} />
        {errors.name && <p className="text-xs text-rose-500">{errors.name.message as string}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Blok' : 'Simpan Blok'}
        </Button>
      </div>
    </form>
  );
}
