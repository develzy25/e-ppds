'use server';

import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { KeamananService } from '../services/keamanan.service';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const service = new KeamananService(new UnitOfWork());

async function getCurrentUser() {
  const user = await getRealUser();
  if (!user) throw new Error('Unauthorized');
  return { id: user.userId, pondokId: user.pondokId, permissions: user.permissions };
}

export async function getKeamanans() {
  try {
    const user = await getCurrentUser();
    const data = await service.getAllKeamanans(user.pondokId, user.permissions);
    return successResponse(data);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
