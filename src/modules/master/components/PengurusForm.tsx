'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPengurusSchema, updatePengurusSchema } from '../validators/pengurus.validator';
import { PengurusEntity } from '../types/pengurus.type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPengurusDropdownOptions } from '../actions/pengurus.action';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface PengurusFormProps {
  initialData?: PengurusEntity;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function PengurusForm({ initialData, onSubmit, isSubmitting }: PengurusFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updatePengurusSchema : createPengurusSchema;
  
  const [options, setOptions] = useState<any>({ roles: [], positions: [], periods: [] });
  const [loadingOptions, setLoadingOptions] = useState(false);

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialData?.id || '',
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: '',
      statusAktif: initialData?.statusAktif || 'Aktif',
      pondokId: initialData?.pondokId || 'pondok-1', // Mock pondok
      roleIds: initialData?.roles?.map(r => r.id) || [],
      positions: initialData?.positions?.map(p => ({ positionId: p.positionId, periodId: p.periodId })) || [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "positions"
  });

  const selectedStatus = watch('statusAktif');
  const selectedRoles = watch('roleIds');

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      const res = await getPengurusDropdownOptions();
      if (res.success) {
        setOptions(res.data);
      }
      setLoadingOptions(false);
    };
    fetchOptions();
  }, []);

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    const currentRoles = [...selectedRoles];
    if (checked) {
      setValue('roleIds', [...currentRoles, roleId]);
    } else {
      setValue('roleIds', currentRoles.filter(id => id !== roleId));
    }
  };

  const onFormSubmit = (data: any) => {
    const formData = new FormData();
    // Serialize object as JSON string to easily send nested arrays over FormData
    formData.append('data', JSON.stringify(data));
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto px-1 pb-1">
      {isEditing && <input type="hidden" {...register('id')} />}
      <input type="hidden" {...register('pondokId')} />

      <div className="space-y-4">
        <h4 className="font-semibold border-b pb-2">Data Pribadi</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap <span className="text-rose-500">*</span></Label>
            <Input id="name" placeholder="Nama lengkap" {...register('name')} />
            {errors.name && <p className="text-xs text-rose-500">{errors.name.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-rose-500">*</span></Label>
            <Input id="email" type="email" placeholder="email@contoh.com" {...register('email')} />
            {errors.email && <p className="text-xs text-rose-500">{errors.email.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password {isEditing ? '(Kosongkan jika tidak diubah)' : <span className="text-rose-500">*</span>}</Label>
            <Input id="password" type="password" placeholder="******" {...register('password')} />
            {errors.password && <p className="text-xs text-rose-500">{errors.password.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label>Status <span className="text-rose-500">*</span></Label>
            <Select 
              value={selectedStatus} 
              onValueChange={(val) => setValue('statusAktif', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" {...register('statusAktif')} />
            {errors.statusAktif && <p className="text-xs text-rose-500">{errors.statusAktif.message as string}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold border-b pb-2">Role Aplikasi (Akses Sistem) <span className="text-rose-500">*</span></h4>
        {loadingOptions ? (
          <p className="text-sm text-muted-foreground">Memuat roles...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {options.roles.map((role: any) => (
              <div key={role.id} className="flex flex-row items-start space-x-3 space-y-0 border p-3 rounded-md">
                <Checkbox
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={(checked) => handleRoleToggle(role.id, checked as boolean)}
                />
                <div className="space-y-1 leading-none">
                  <Label className="font-medium cursor-pointer" onClick={() => handleRoleToggle(role.id, !selectedRoles.includes(role.id))}>{role.name}</Label>
                </div>
              </div>
            ))}
          </div>
        )}
        {errors.roleIds && <p className="text-xs text-rose-500">{errors.roleIds.message as string}</p>}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="font-semibold">Jabatan Kepengurusan</h4>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => append({ positionId: '', periodId: '' })}
          >
            <Plus className="h-4 w-4 mr-1" /> Tambah Jabatan
          </Button>
        </div>
        
        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground italic text-center py-4 bg-muted rounded-md">Belum ada jabatan yang ditambahkan</p>
        )}

        {fields.map((field, index) => {
          // Track values manually for select inputs in field array since they don't map perfectly with Shadcn Select
          const posId = watch(`positions.${index}.positionId`);
          const perId = watch(`positions.${index}.periodId`);
          const posErrors = errors?.positions as any;

          return (
            <div key={field.id} className="flex items-end gap-3 p-3 border rounded-md bg-slate-50/50">
              <div className="flex-1 space-y-2">
                <Label>Jabatan <span className="text-rose-500">*</span></Label>
                <Select 
                  value={posId} 
                  onValueChange={(val) => setValue(`positions.${index}.positionId`, val)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Pilih jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.positions.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" {...register(`positions.${index}.positionId` as const)} />
                {posErrors?.[index]?.positionId && <p className="text-xs text-rose-500">{posErrors[index].positionId.message as string}</p>}
              </div>

              <div className="flex-1 space-y-2">
                <Label>Periode <span className="text-rose-500">*</span></Label>
                <Select 
                  value={perId} 
                  onValueChange={(val) => setValue(`positions.${index}.periodId`, val)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Pilih periode" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.periods.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" {...register(`positions.${index}.periodId` as const)} />
                {posErrors?.[index]?.periodId && <p className="text-xs text-rose-500">{posErrors[index].periodId.message as string}</p>}
              </div>

              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-6 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Pengurus' : 'Simpan Pengurus'}
        </Button>
      </div>
    </form>
  );
}
