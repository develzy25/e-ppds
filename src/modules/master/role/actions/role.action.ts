'use server';

import { revalidatePath } from 'next/cache';
import { RoleService } from '../services/role.service';
import { createRoleSchema, updateRoleSchema } from '../validators/role.validator';

const roleService = new RoleService();

// Mock function to get current user context
// In real app, this comes from next-auth session or JWT middleware
async function getCurrentUser() {
  return {
    id: 'u1',
    pondokId: 'pondok-1',
    permissions: ['master.role.view', 'master.role.create', 'master.role.update', 'master.role.delete'], // Super Admin Mock
  };
}

export async function getRoles() {
  try {
    const user = await getCurrentUser();
    const roles = await roleService.getAllRoles(user.pondokId, user.permissions);
    return { success: true, data: roles };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRole(id: string) {
  try {
    const user = await getCurrentUser();
    const role = await roleService.getRoleById(id, user.pondokId, user.permissions);
    return { success: true, data: role };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createRole(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createRoleSchema.parse(payload);
    const newRole = await roleService.createRole(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/role');
    return { success: true, data: newRole };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRole(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updateRoleSchema.parse(payload);
    const updatedRole = await roleService.updateRole(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/role');
    return { success: true, data: updatedRole };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteRole(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedRole = await roleService.deleteRole(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/role');
    return { success: true, data: deletedRole };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
