'use server';

import { revalidatePath } from 'next/cache';
import { DepartmentService } from '../services/department.service';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/department.validator';

const departmentService = new DepartmentService();

// Mock function to get current user context
async function getCurrentUser() {
  return {
    id: 'u1',
    pondokId: 'pondok-1',
    permissions: ['master.department.view', 'master.department.create', 'master.department.update', 'master.department.delete'],
  };
}

export async function getDepartments() {
  try {
    const user = await getCurrentUser();
    const departments = await departmentService.getAllDepartments(user.pondokId, user.permissions);
    return { success: true, data: departments };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getDepartment(id: string) {
  try {
    const user = await getCurrentUser();
    const department = await departmentService.getDepartmentById(id, user.pondokId, user.permissions);
    return { success: true, data: department };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createDepartment(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createDepartmentSchema.parse(payload);
    const newDepartment = await departmentService.createDepartment(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/department');
    return { success: true, data: newDepartment };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateDepartment(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updateDepartmentSchema.parse(payload);
    const updatedDepartment = await departmentService.updateDepartment(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/department');
    return { success: true, data: updatedDepartment };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDepartment(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedDepartment = await departmentService.deleteDepartment(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/department');
    return { success: true, data: deletedDepartment };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
