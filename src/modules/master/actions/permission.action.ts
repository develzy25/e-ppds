'use server';

import { ForbiddenError } from '@/infrastructure/errors';
import { requirePermission } from '@/modules/auth/guards/permission.guard';


import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { PermissionService } from '../services/permission.service';
import { createPermissionSchema, updatePermissionSchema } from '../validators/permission.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const permissionService = new PermissionService(new UnitOfWork());

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

export async function getPermissions() {
  try {
    await requirePermission('master.permission.read');
    const user = await getCurrentUser();
    const permissions = await permissionService.getAllPermissions(user.pondokId, user.permissions);
    return successResponse(permissions);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getPermission(id: string) {
  try {
    await requirePermission('master.permission.read');
    const user = await getCurrentUser();
    const permission = await permissionService.getPermissionById(id, user.pondokId, user.permissions);
    return successResponse(permission);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createPermission(formData: FormData) {
  try {
    await requirePermission('master.permission.create');
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createPermissionSchema.parse(payload);
    const newPermission = await permissionService.createPermission(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/permission');
    return successResponse(newPermission);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function updatePermission(formData: FormData) {
  try {
    await requirePermission('master.permission.update');
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
    return successResponse(updatedPermission);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deletePermission(id: string) {
  try {
    await requirePermission('master.permission.delete');
    const user = await getCurrentUser();
    const deletedPermission = await permissionService.deletePermission(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/permission');
    return successResponse(deletedPermission);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
