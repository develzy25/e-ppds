'use server';

import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { TarifService } from '../services/tarif.service';
import { createTarifSchema, updateTarifSchema } from '../validators/tarif.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const uow = new UnitOfWork();
const tarifService = new TarifService(uow);

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

export async function getSemuaTarif() {
  try {
    const user = await getCurrentUser();
    const data = await tarifService.getAllTarif(user.pondokId, user.permissions);
    return successResponse(data);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getTarif(id: string) {
  try {
    const user = await getCurrentUser();
    const data = await tarifService.getTarifById(id, user.pondokId, user.permissions);
    return successResponse(data);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createTarif(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      jenisTagihanId: formData.get('jenisTagihanId') as string,
      academicYearId: formData.get('academicYearId') as string,
      amount: Number(formData.get('amount')),
      description: formData.get('description') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createTarifSchema.parse(payload);
    const newData = await tarifService.createTarif(validatedData, user.id, user.permissions);
    
    revalidatePath('/dashboard/keuangan/tarif');
    return successResponse(newData);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function updateTarif(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      jenisTagihanId: formData.get('jenisTagihanId') as string,
      academicYearId: formData.get('academicYearId') as string,
      amount: Number(formData.get('amount')),
      description: formData.get('description') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updateTarifSchema.parse(payload);
    const updatedData = await tarifService.updateTarif(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/dashboard/keuangan/tarif');
    return successResponse(updatedData);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deleteTarif(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedData = await tarifService.deleteTarif(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/dashboard/keuangan/tarif');
    return successResponse(deletedData);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
