'use server';

import { ForbiddenError } from '@/infrastructure/errors';
import { requirePermission } from '@/modules/auth/guards/permission.guard';


import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { PeriodeService } from '../services/periode.service';
import { createPeriodeSchema, updatePeriodeSchema } from '../validators/periode.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const periodeService = new PeriodeService(new UnitOfWork());

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

export async function getPeriodes() {
  try {
    await requirePermission('master.periode.read');
    const user = await getCurrentUser();
    const periodes = await periodeService.getAllPeriodes(user.pondokId, user.permissions);
    return successResponse(periodes);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getPeriode(id: string) {
  try {
    await requirePermission('master.periode.read');
    const user = await getCurrentUser();
    const periode = await periodeService.getPeriodeById(id, user.pondokId, user.permissions);
    return successResponse(periode);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createPeriode(formData: FormData) {
  try {
    await requirePermission('master.periode.create');
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      status: formData.get('status') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createPeriodeSchema.parse(payload);
    const newPeriode = await periodeService.createPeriode(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/periode');
    return successResponse(newPeriode);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function updatePeriode(formData: FormData) {
  try {
    await requirePermission('master.periode.update');
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      status: formData.get('status') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updatePeriodeSchema.parse(payload);
    const updatedPeriode = await periodeService.updatePeriode(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/periode');
    return successResponse(updatedPeriode);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deletePeriode(id: string) {
  try {
    await requirePermission('master.periode.delete');
    const user = await getCurrentUser();
    const deletedPeriode = await periodeService.deletePeriode(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/periode');
    return successResponse(deletedPeriode);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
