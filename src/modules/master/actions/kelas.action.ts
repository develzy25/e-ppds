'use server';

import { ForbiddenError } from '@/infrastructure/errors';
import { requirePermission } from '@/modules/auth/guards/permission.guard';


import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { KelasService } from '../services/kelas.service';
import { SekolahService } from '../services/sekolah.service';
import { createKelasSchema, updateKelasSchema } from '../validators/kelas.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const kelasService = new KelasService(new UnitOfWork());
const sekolahService = new SekolahService(new UnitOfWork());

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

export async function getKelass() {
  try {
    await requirePermission('master.kelas.read');
    const user = await getCurrentUser();
    const kelass = await kelasService.getAllKelass(user.pondokId, user.permissions);
    return successResponse(kelass);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getSekolahsForDropdown() {
  try {
    await requirePermission('master.kelas.read');
    const user = await getCurrentUser();
    const sekolahs = await sekolahService.getAllSekolahs(user.pondokId, user.permissions);
    return successResponse(sekolahs);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createKelas(formData: FormData) {
  try {
    await requirePermission('master.kelas.create');
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      schoolId: formData.get('schoolId') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createKelasSchema.parse(payload);
    const newKelas = await kelasService.createKelas(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/kelas');
    return successResponse(newKelas);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function updateKelas(formData: FormData) {
  try {
    await requirePermission('master.kelas.update');
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      schoolId: formData.get('schoolId') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updateKelasSchema.parse(payload);
    const updatedKelas = await kelasService.updateKelas(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/kelas');
    return successResponse(updatedKelas);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deleteKelas(id: string) {
  try {
    await requirePermission('master.kelas.delete');
    const user = await getCurrentUser();
    const deletedKelas = await kelasService.deleteKelas(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/kelas');
    return successResponse(deletedKelas);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
