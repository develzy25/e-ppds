'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createJabatanSchema, updateJabatanSchema } from '../validators/jabatan.validator';
import { JabatanEntity } from '../types/jabatan.type';
import { DepartmentEntity } from '../../department/types/department.type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getDepartmentsForDropdown } from '../actions/jabatan.action';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JabatanFormProps {
  initialData?: JabatanEntity;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function JabatanForm({ initialData, onSubmit, isSubmitting }: JabatanFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updateJabatanSchema : createJabatanSchema;
  
  const [departments, setDepartments] = useState<DepartmentEntity[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialData?.id || '',
      name: initialData?.name || '',
      departmentId: initialData?.departmentId || '',
      pondokId: initialData?.pondokId || 'pondok-1', // Mock pondok
    }
  });

  const selectedDepartmentId = watch('departmentId');

  useEffect(() => {
    const fetchDepts = async () => {
      setLoadingDepts(true);
      const res = await getDepartmentsForDropdown();
      if (res.success) {
        setDepartments(res.data as DepartmentEntity[]);
      }
      setLoadingDepts(false);
    };
    fetchDepts();
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
        <Label htmlFor="name">Nama Jabatan <span className="text-rose-500">*</span></Label>
        <Input id="name" placeholder="Misal: Ketua, Anggota" {...register('name')} />
        {errors.name && <p className="text-xs text-rose-500">{errors.name.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Department / Seksi <span className="text-rose-500">*</span></Label>
        <Select 
          value={selectedDepartmentId} 
          onValueChange={(val) => setValue('departmentId', val)}
          disabled={loadingDepts}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingDepts ? "Memuat..." : "Pilih department"} />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dept => (
              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Register hidden input for Select component since it's custom UI */}
        <input type="hidden" {...register('departmentId')} />
        {errors.departmentId && <p className="text-xs text-rose-500">{errors.departmentId.message as string}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Jabatan' : 'Simpan Jabatan'}
        </Button>
      </div>
    </form>
  );
}
