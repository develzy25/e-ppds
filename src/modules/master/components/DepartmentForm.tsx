'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/department.validator';
import { DepartmentEntity } from '../types/department.type';
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

interface DepartmentFormProps {
  initialData?: DepartmentEntity;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function DepartmentForm({ initialData, onSubmit, isSubmitting }: DepartmentFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updateDepartmentSchema : createDepartmentSchema;
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialData?.id || '',
      name: initialData?.name || '',
      type: initialData?.type || 'Divisi',
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
        <Label htmlFor="name">Nama Department / Seksi <span className="text-rose-500">*</span></Label>
        <Input id="name" placeholder="Misal: Keamanan" {...register('name')} />
        {errors.name && <p className="text-xs text-rose-500">{errors.name.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Tipe <span className="text-rose-500">*</span></Label>
        <Select 
          value={selectedType} 
          onValueChange={(val) => setValue('type', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih tipe department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Divisi">Divisi</SelectItem>
            <SelectItem value="Seksi">Seksi</SelectItem>
          </SelectContent>
        </Select>
        {/* Register hidden input for Select component since it's custom UI */}
        <input type="hidden" {...register('type')} />
        {errors.type && <p className="text-xs text-rose-500">{errors.type.message as string}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Department' : 'Simpan Department'}
        </Button>
      </div>
    </form>
  );
}
