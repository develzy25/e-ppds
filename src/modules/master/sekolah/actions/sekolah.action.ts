'use server';

import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { SekolahService } from '../services/sekolah.service';
import { createSekolahSchema, updateSekolahSchema } from '../validators/sekolah.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const sekolahService = new SekolahService(new UnitOfWork());

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

export async function getSekolahs() {
  try {
    const user = await getCurrentUser();
    const sekolahs = await sekolahService.getAllSekolahs(user.pondokId, user.permissions);
    return successResponse(sekolahs);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getSekolah(id: string) {
  try {
    const user = await getCurrentUser();
    const sekolah = await sekolahService.getSekolahById(id, user.pondokId, user.permissions);
    return successResponse(sekolah);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createSekolah(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createSekolahSchema.parse(payload);
    const newSekolah = await sekolahService.createSekolah(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/sekolah');
    return successResponse(newSekolah);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function updateSekolah(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updateSekolahSchema.parse(payload);
    const updatedSekolah = await sekolahService.updateSekolah(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/sekolah');
    return successResponse(updatedSekolah);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deleteSekolah(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedSekolah = await sekolahService.deleteSekolah(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/sekolah');
    return successResponse(deletedSekolah);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
