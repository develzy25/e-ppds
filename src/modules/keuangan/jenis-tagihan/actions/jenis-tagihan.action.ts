'use server';

import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { JenisTagihanService } from '../services/jenis-tagihan.service';
import { createJenisTagihanSchema, updateJenisTagihanSchema } from '../validators/jenis-tagihan.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const uow = new UnitOfWork();
const jenisTagihanService = new JenisTagihanService(uow);

async function getCurrentUser() {
  const user = await getRealUser();
  if (!user) {
    throw new Error('Unauthorized: Sesi tidak ditemukan atau kedaluwarsa');
  }
  return {
    id: user.userId,
    pondokId: user.pondokId,
    permissions: user.permissions,
  };
}

export async function getSemuaJenisTagihan() {
  try {
    const user = await getCurrentUser();
    const data = await jenisTagihanService.getAllJenisTagihan(user.pondokId, user.permissions);
    return successResponse(data);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getJenisTagihan(id: string) {
  try {
    const user = await getCurrentUser();
    const data = await jenisTagihanService.getJenisTagihanById(id, user.pondokId, user.permissions);
    return successResponse(data);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createJenisTagihan(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      isActive: formData.get('isActive') === 'true',
      pondokId: user.pondokId,
    };

    const validatedData = createJenisTagihanSchema.parse(payload);
    const newData = await jenisTagihanService.createJenisTagihan(validatedData, user.id, user.permissions);
    
    revalidatePath('/dashboard/keuangan/jenis-tagihan');
    return successResponse(newData);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function updateJenisTagihan(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      isActive: formData.get('isActive') === 'true',
      pondokId: user.pondokId,
    };

    const validatedData = updateJenisTagihanSchema.parse(payload);
    const updatedData = await jenisTagihanService.updateJenisTagihan(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/dashboard/keuangan/jenis-tagihan');
    return successResponse(updatedData);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deleteJenisTagihan(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedData = await jenisTagihanService.deleteJenisTagihan(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/dashboard/keuangan/jenis-tagihan');
    return successResponse(deletedData);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
