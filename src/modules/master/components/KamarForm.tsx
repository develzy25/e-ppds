'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createKamarSchema, updateKamarSchema } from '../validators/kamar.validator';
import { KamarEntity } from '../types/kamar.type';
import { BlokEntity } from '../types/blok.type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getBloksForDropdown } from '../actions/kamar.action';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KamarFormProps {
  initialData?: KamarEntity;
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function KamarForm({ initialData, onSubmit, isSubmitting }: KamarFormProps) {
  const isEditing = !!initialData;
  const schema = isEditing ? updateKamarSchema : createKamarSchema;
  
  const [bloks, setBloks] = useState<BlokEntity[]>([]);
  const [loadingBloks, setLoadingBloks] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: initialData?.id || '',
      name: initialData?.name || '',
      capacity: initialData?.capacity || 10,
      blockId: initialData?.blockId || '',
      pondokId: initialData?.pondokId || '', // Server action override dari session
    }
  });

  const selectedBlockId = watch('blockId');

  useEffect(() => {
    const fetchBloks = async () => {
      setLoadingBloks(true);
      const res = await getBloksForDropdown();
      if (res.success) {
        setBloks(res.data as BlokEntity[]);
      }
      setLoadingBloks(false);
    };
    fetchBloks();
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
        <Label htmlFor="name">Nama Kamar <span className="text-rose-500">*</span></Label>
        <Input id="name" placeholder="Misal: Kamar A-01" {...register('name')} />
        {errors.name && <p className="text-xs text-rose-500">{errors.name.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Kapasitas (Orang) <span className="text-rose-500">*</span></Label>
        <Input id="capacity" type="number" placeholder="Misal: 10" {...register('capacity')} />
        {errors.capacity && <p className="text-xs text-rose-500">{errors.capacity.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label>Blok / Gedung <span className="text-rose-500">*</span></Label>
        <Select 
          value={selectedBlockId} 
          onValueChange={(val) => setValue('blockId', val)}
          disabled={loadingBloks}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingBloks ? "Memuat..." : "Pilih blok/gedung"} />
          </SelectTrigger>
          <SelectContent>
            {bloks.map(blok => (
              <SelectItem key={blok.id} value={blok.id}>{blok.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Register hidden input for Select component since it's custom UI */}
        <input type="hidden" {...register('blockId')} />
        {errors.blockId && <p className="text-xs text-rose-500">{errors.blockId.message as string}</p>}
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : isEditing ? 'Update Kamar' : 'Simpan Kamar'}
        </Button>
      </div>
    </form>
  );
}
