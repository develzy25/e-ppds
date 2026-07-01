'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPermissionSchema, updatePermissionSchema } from '../validators/permission.validator';
import { PermissionEntity } from '../types/permission.type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PermissionFormProps {
  initialData?: PermissionEntity;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function PermissionForm({ initialData, onSubmit, isSubmitting }: PermissionFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updatePermissionSchema : createPermissionSchema;
  
  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialData?.id || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
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
        <Label htmlFor="name">Nama Permission <span className="text-rose-500">*</span></Label>
        <Input id="name" placeholder="Misal: keuangan.tagihan.view" {...register('name')} />
        <p className="text-[10px] text-muted-foreground">Gunakan format module.resource.action</p>
        {errors.name && <p className="text-xs text-rose-500">{errors.name.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Input id="description" placeholder="Deskripsi singkat permission..." {...register('description')} />
        {errors.description && <p className="text-xs text-rose-500">{errors.description.message as string}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Permission' : 'Simpan Permission'}
        </Button>
      </div>
    </form>
  );
}
