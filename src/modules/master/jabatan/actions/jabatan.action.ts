'use server';

import { revalidatePath } from 'next/cache';
import { JabatanService } from '../services/jabatan.service';
import { DepartmentService } from '../../department/services/department.service';
import { createJabatanSchema, updateJabatanSchema } from '../validators/jabatan.validator';

const jabatanService = new JabatanService();
const departmentService = new DepartmentService();

// Mock function to get current user context
async function getCurrentUser() {
  return {
    id: 'u1',
    pondokId: 'pondok-1',
    permissions: ['master.jabatan.view', 'master.jabatan.create', 'master.jabatan.update', 'master.jabatan.delete', 'master.department.view'],
  };
}

export async function getJabatans() {
  try {
    const user = await getCurrentUser();
    const jabatans = await jabatanService.getAllJabatans(user.pondokId, user.permissions);
    return { success: true, data: jabatans };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getDepartmentsForDropdown() {
  try {
    const user = await getCurrentUser();
    const departments = await departmentService.getAllDepartments(user.pondokId, user.permissions);
    return { success: true, data: departments };
  } catch (error: any) {
    return { success: false, error: error.message };
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
    return { success: true, data: newJabatan };
  } catch (error: any) {
    return { success: false, error: error.message };
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
    return { success: true, data: updatedJabatan };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteJabatan(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedJabatan = await jabatanService.deleteJabatan(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/jabatan');
    return { success: true, data: deletedJabatan };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
