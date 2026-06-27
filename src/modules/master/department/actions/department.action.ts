'use server';

import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { DepartmentService } from '../services/department.service';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/department.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

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

export async function getDepartments() {
  try {
    const user = await getCurrentUser();
    const departments = await departmentService.getAllDepartments(user.pondokId, user.permissions);
    return successResponse(departments);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createDepartment(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createDepartmentSchema.parse(payload);
    const newDepartment = await departmentService.createDepartment(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/department');
    return successResponse(newDepartment);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function updateDepartment(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updateDepartmentSchema.parse(payload);
    const updatedDepartment = await departmentService.updateDepartment(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/department');
    return successResponse(updatedDepartment);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deleteDepartment(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedDepartment = await departmentService.deleteDepartment(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/department');
    return successResponse(deletedDepartment);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
