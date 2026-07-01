'use server';

import { ForbiddenError } from '@/infrastructure/errors';
import { requirePermission } from '@/modules/auth/guards/permission.guard';


import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { PendidikanService } from '../services/pendidikan.service';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const service = new PendidikanService(new UnitOfWork());

async function getCurrentUser() {
  const user = await getRealUser();
  if (!user) throw new ForbiddenError('Unauthorized');
  return { id: user.userId, pondokId: user.pondokId, permissions: user.permissions };
}

export async function getPendidikans() {
  try {
    await requirePermission('pendidikan.pendidikan.read');
    const user = await getCurrentUser();
    const data = await service.getAllPendidikans(user.pondokId, user.permissions);
    return successResponse(data);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
