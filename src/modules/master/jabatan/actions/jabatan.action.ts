'use server';

import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { JabatanService } from '../services/jabatan.service';
import { DepartmentService } from '../../department/services/department.service';
import { createJabatanSchema, updateJabatanSchema } from '../validators/jabatan.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const jabatanService = new JabatanService(new UnitOfWork());
const departmentService = new DepartmentService(new UnitOfWork());

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

export async function getJabatans() {
  try {
    const user = await getCurrentUser();
    const jabatans = await jabatanService.getAllJabatans(user.pondokId, user.permissions);
    return successResponse(jabatans);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getDepartmentsForDropdown() {
  try {
    const user = await getCurrentUser();
    const departments = await departmentService.getAllDepartments(user.pondokId, user.permissions);
    return successResponse(departments);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createJabatan(formData: FormData) {
  try {
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
    const user = await getCurrentUser();
    const deletedJabatan = await jabatanService.deleteJabatan(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/jabatan');
    return successResponse(deletedJabatan);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
