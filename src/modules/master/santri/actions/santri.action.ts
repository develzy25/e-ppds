'use server';

import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { SantriService } from '../services/santri.service';
import { createSantriSchema, updateSantriSchema } from '../validators/santri.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const santriService = new SantriService(new UnitOfWork());

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

export async function getSantris(page: number = 1, limit: number = 20, filters?: Record<string, string>) {
  try {
    const user = await getCurrentUser();
    const result = await santriService.getAllSantris(user.pondokId, user.permissions, page, limit, filters);
    return successResponse(result.data, result.meta);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getSantriDropdownOptions() {
  try {
    const user = await getCurrentUser();
    const options = await santriService.getDropdownOptions(user.pondokId, user.permissions);
    return successResponse(options);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createSantri(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payloadStr = formData.get('data') as string;
    if (!payloadStr) throw new Error('Data tidak ditemukan');

    const rawPayload = JSON.parse(payloadStr);
    const payload = {
      ...rawPayload,
      pondokId: user.pondokId,
    };

    const validatedData = createSantriSchema.parse(payload);
    const newSantri = await santriService.createSantri(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/santri');
    return successResponse(newSantri);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function updateSantri(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payloadStr = formData.get('data') as string;
    if (!payloadStr) throw new Error('Data tidak ditemukan');

    const rawPayload = JSON.parse(payloadStr);
    const payload = {
      ...rawPayload,
      pondokId: user.pondokId,
    };

    const validatedData = updateSantriSchema.parse(payload);
    const updatedSantri = await santriService.updateSantri(validatedData.id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/santri');
    return successResponse(updatedSantri);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deleteSantri(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedSantri = await santriService.deleteSantri(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/santri');
    return successResponse(deletedSantri);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
