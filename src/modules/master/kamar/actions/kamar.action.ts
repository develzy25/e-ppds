'use server';

import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { KamarService } from '../services/kamar.service';
import { BlokService } from '../../blok/services/blok.service';
import { createKamarSchema, updateKamarSchema } from '../validators/kamar.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const kamarService = new KamarService(new UnitOfWork());
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

export async function getKamars() {
  try {
    const user = await getCurrentUser();
    const kamars = await kamarService.getAllKamars(user.pondokId, user.permissions);
    return successResponse(kamars);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getBloksForDropdown() {
  try {
    const user = await getCurrentUser();
    const bloks = await blokService.getAllBloks(user.pondokId, user.permissions);
    return successResponse(bloks);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createKamar(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      blokId: formData.get('blokId') as string,
      capacity: Number(formData.get('capacity')),
      pondokId: user.pondokId,
    };

    const validatedData = createKamarSchema.parse(payload);
    const newKamar = await kamarService.createKamar(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/kamar');
    return successResponse(newKamar);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function updateKamar(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      blokId: formData.get('blokId') as string,
      capacity: Number(formData.get('capacity')),
      pondokId: user.pondokId,
    };

    const validatedData = updateKamarSchema.parse(payload);
    const updatedKamar = await kamarService.updateKamar(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/kamar');
    return successResponse(updatedKamar);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deleteKamar(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedKamar = await kamarService.deleteKamar(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/kamar');
    return successResponse(deletedKamar);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
