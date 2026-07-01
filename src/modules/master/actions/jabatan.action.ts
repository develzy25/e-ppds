'use server';

import { ForbiddenError } from '@/infrastructure/errors';
import { requirePermission } from '@/modules/auth/guards/permission.guard';


import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { JabatanService } from '../services/jabatan.service';
import { DepartmentService } from '../services/department.service';
import { createJabatanSchema, updateJabatanSchema } from '../validators/jabatan.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const jabatanService = new JabatanService(new UnitOfWork());
const departmentService = new DepartmentService(new UnitOfWork());

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

export async function getJabatans() {
  try {
    await requirePermission('master.jabatan.read');
    const user = await getCurrentUser();
    const jabatans = await jabatanService.getAllJabatans(user.pondokId, user.permissions);
    return successResponse(jabatans);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getDepartmentsForDropdown() {
  try {
    await requirePermission('master.jabatan.read');
    const user = await getCurrentUser();
    const departments = await departmentService.getAllDepartments(user.pondokId, user.permissions);
    return successResponse(departments);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createJabatan(formData: FormData) {
  try {
    await requirePermission('master.jabatan.create');
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      departmentId: formData.get('departmentId') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createJabatanSchema.parse(payload);
    const newJabatan = await jabatanService.createJabatan(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/jabatan');
    return successResponse(newJabatan);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function updateJabatan(formData: FormData) {
  try {
    await requirePermission('master.jabatan.update');
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      departmentId: formData.get('departmentId') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updateJabatanSchema.parse(payload);
    const updatedJabatan = await jabatanService.updateJabatan(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/jabatan');
    return successResponse(updatedJabatan);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deleteJabatan(id: string) {
  try {
    await requirePermission('master.jabatan.delete');
    const user = await getCurrentUser();
    const deletedJabatan = await jabatanService.deleteJabatan(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/jabatan');
    return successResponse(deletedJabatan);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
