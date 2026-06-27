'use server';

import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { BlokService } from '../services/blok.service';
import { createBlokSchema, updateBlokSchema } from '../validators/blok.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const blokService = new BlokService(new UnitOfWork());

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

export async function getBloks() {
  try {
    const user = await getCurrentUser();
    const bloks = await blokService.getAllBloks(user.pondokId, user.permissions);
    return successResponse(bloks);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getBlok(id: string) {
  try {
    const user = await getCurrentUser();
    const blok = await blokService.getBlokById(id, user.pondokId, user.permissions);
    return successResponse(blok);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createBlok(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createBlokSchema.parse(payload);
    const newBlok = await blokService.createBlok(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/blok');
    return successResponse(newBlok);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function updateBlok(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updateBlokSchema.parse(payload);
    const updatedBlok = await blokService.updateBlok(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/blok');
    return successResponse(updatedBlok);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deleteBlok(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedBlok = await blokService.deleteBlok(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/blok');
    return successResponse(deletedBlok);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
