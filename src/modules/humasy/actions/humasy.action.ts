'use server';

import { ForbiddenError } from '@/infrastructure/errors';
import { requirePermission } from '@/modules/auth/guards/permission.guard';


import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { HumasyService } from '../services/humasy.service';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const service = new HumasyService(new UnitOfWork());

async function getCurrentUser() {
  const user = await getRealUser();
  if (!user) throw new ForbiddenError('Unauthorized');
  return { id: user.userId, pondokId: user.pondokId, permissions: user.permissions };
}

export async function getHumasys() {
  try {
    await requirePermission('humasy.humasy.read');
    const user = await getCurrentUser();
    const data = await service.getAllHumasys(user.pondokId, user.permissions);
    return successResponse(data);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
