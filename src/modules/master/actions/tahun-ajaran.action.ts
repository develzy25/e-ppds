'use server';

import { ForbiddenError } from '@/infrastructure/errors';
import { requirePermission } from '@/modules/auth/guards/permission.guard';


import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { TahunAjaranService } from '../services/tahun-ajaran.service';
import { createTahunAjaranSchema, updateTahunAjaranSchema } from '../validators/tahun-ajaran.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const tahunAjaranService = new TahunAjaranService(new UnitOfWork());

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

export async function getTahunAjarans() {
  try {
    await requirePermission('master.tahun-ajaran.read');
    const user = await getCurrentUser();
    const periodes = await tahunAjaranService.getAllTahunAjarans(user.pondokId, user.permissions);
    return successResponse(periodes);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getTahunAjaran(id: string) {
  try {
    await requirePermission('master.tahun-ajaran.read');
    const user = await getCurrentUser();
    const periode = await tahunAjaranService.getTahunAjaranById(id, user.pondokId, user.permissions);
    return successResponse(periode);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createTahunAjaran(formData: FormData) {
  try {
    await requirePermission('master.tahun-ajaran.create');
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      status: formData.get('status') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createTahunAjaranSchema.parse(payload);
    const newTahunAjaran = await tahunAjaranService.createTahunAjaran(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/tahun-ajaran');
    return successResponse(newTahunAjaran);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function updateTahunAjaran(formData: FormData) {
  try {
    await requirePermission('master.tahun-ajaran.update');
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      status: formData.get('status') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updateTahunAjaranSchema.parse(payload);
    const updatedTahunAjaran = await tahunAjaranService.updateTahunAjaran(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/tahun-ajaran');
    return successResponse(updatedTahunAjaran);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deleteTahunAjaran(id: string) {
  try {
    await requirePermission('master.tahun-ajaran.delete');
    const user = await getCurrentUser();
    const deletedTahunAjaran = await tahunAjaranService.deleteTahunAjaran(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/tahun-ajaran');
    return successResponse(deletedTahunAjaran);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
