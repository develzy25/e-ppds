'use server';

import { ForbiddenError, NotFoundError } from '@/infrastructure/errors';
import { requirePermission } from '@/modules/auth/guards/permission.guard';


import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { PengurusService } from '../services/pengurus.service';
import { createPengurusSchema, updatePengurusSchema } from '../validators/pengurus.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const pengurusService = new PengurusService(new UnitOfWork());

async function getCurrentUser() {
  const user = await getRealUser();
  if (!user) {
    throw new ForbiddenError('Unauthorized: Sesi tidak ditemukan atau kedaluwarsa');
  }
  return {
    id: user.userId,
    pondokId: user.pondokId,
    permissions: user.permissions,
  };
}

export async function getPenguruss() {
  try {
    await requirePermission('master.pengurus.read');
    const user = await getCurrentUser();
    const penguruss = await pengurusService.getAllPenguruss(user.pondokId, user.permissions);
    return successResponse(penguruss);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getPengurusDropdownOptions() {
  try {
    await requirePermission('master.pengurus.read');
    const user = await getCurrentUser();
    const options = await pengurusService.getDropdownOptions(user.pondokId, user.permissions);
    return successResponse(options);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createPengurus(formData: FormData) {
  try {
    await requirePermission('master.pengurus.create');
    const user = await getCurrentUser();
    
    const payloadStr = formData.get('data') as string;
    if (!payloadStr) throw new NotFoundError('Data tidak ditemukan');

    const rawPayload = JSON.parse(payloadStr);
    const payload = {
      ...rawPayload,
      pondokId: user.pondokId,
    };

    const validatedData = createPengurusSchema.parse(payload);
    const newPengurus = await pengurusService.createPengurus(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/pengurus');
    return successResponse(newPengurus);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function updatePengurus(formData: FormData) {
  try {
    await requirePermission('master.pengurus.update');
    const user = await getCurrentUser();
    
    const payloadStr = formData.get('data') as string;
    if (!payloadStr) throw new NotFoundError('Data tidak ditemukan');

    const rawPayload = JSON.parse(payloadStr);
    const payload = {
      ...rawPayload,
      pondokId: user.pondokId,
    };

    const validatedData = updatePengurusSchema.parse(payload);
    const updatedPengurus = await pengurusService.updatePengurus(validatedData.id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/pengurus');
    return successResponse(updatedPengurus);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deletePengurus(id: string) {
  try {
    await requirePermission('master.pengurus.delete');
    const user = await getCurrentUser();
    const deletedPengurus = await pengurusService.deletePengurus(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/pengurus');
    return successResponse(deletedPengurus);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
