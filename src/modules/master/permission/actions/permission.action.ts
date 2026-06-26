'use server';

import { revalidatePath } from 'next/cache';
import { PermissionService } from '../services/permission.service';
import { createPermissionSchema, updatePermissionSchema } from '../validators/permission.validator';

const permissionService = new PermissionService();

// Mock function to get current user context
async function getCurrentUser() {
  return {
    id: 'u1',
    pondokId: 'pondok-1',
    permissions: ['master.permission.view', 'master.permission.create', 'master.permission.update', 'master.permission.delete'],
  };
}

export async function getPermissions() {
  try {
    const user = await getCurrentUser();
    const permissions = await permissionService.getAllPermissions(user.pondokId, user.permissions);
    return { success: true, data: permissions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPermission(id: string) {
  try {
    const user = await getCurrentUser();
    const permission = await permissionService.getPermissionById(id, user.pondokId, user.permissions);
    return { success: true, data: permission };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createPermission(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createPermissionSchema.parse(payload);
    const newPermission = await permissionService.createPermission(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/permission');
    return { success: true, data: newPermission };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePermission(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updatePermissionSchema.parse(payload);
    const updatedPermission = await permissionService.updatePermission(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/permission');
    return { success: true, data: updatedPermission };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePermission(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedPermission = await permissionService.deletePermission(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/permission');
    return { success: true, data: deletedPermission };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
