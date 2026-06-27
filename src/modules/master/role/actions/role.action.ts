'use server';

import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { RoleService } from '../services/role.service';
import { createRoleSchema, updateRoleSchema } from '../validators/role.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const roleService = new RoleService(new UnitOfWork());

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

export async function getRoles() {
  try {
    const user = await getCurrentUser();
    const roles = await roleService.getAllRoles(user.pondokId, user.permissions);
    return successResponse(roles);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getRole(id: string) {
  try {
    const user = await getCurrentUser();
    const role = await roleService.getRoleById(id, user.pondokId, user.permissions);
    return successResponse(role);
  } catch (error: unknown) {
    return errorResponse(error);
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
    return successResponse(newRole);
  } catch (error: unknown) {
    return errorResponse(error);
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
    return successResponse(updatedRole);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deleteRole(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedRole = await roleService.deleteRole(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/role');
    return successResponse(deletedRole);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
