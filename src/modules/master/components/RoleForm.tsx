'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoleSchema, updateRoleSchema, CreateRoleInput, UpdateRoleInput } from '../validators/role.validator';
import { RoleEntity } from '../types/role.type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RoleFormProps {
  initialData?: RoleEntity;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function RoleForm({ initialData, onSubmit, isSubmitting }: RoleFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updateRoleSchema : createRoleSchema;
  
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
        <Label htmlFor="name">Nama Role <span className="text-rose-500">*</span></Label>
        <Input id="name" placeholder="Misal: KETUA_UMUM" {...register('name')} />
        {errors.name && <p className="text-xs text-rose-500">{errors.name.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Input id="description" placeholder="Deskripsi singkat role..." {...register('description')} />
        {errors.description && <p className="text-xs text-rose-500">{errors.description.message as string}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Role' : 'Simpan Role'}
        </Button>
      </div>
    </form>
  );
}
