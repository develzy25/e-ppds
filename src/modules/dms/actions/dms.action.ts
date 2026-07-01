'use server';

import { requirePermission } from '@/modules/auth/guards/permission.guard';
import { ActionResponse, successResponse, errorResponse } from '@/shared/utils/action-error';
import { createDraftSurat, getAllSurats, getSuratById } from '../services/dms.service';
import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { ForbiddenError } from '@/infrastructure/errors';

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

import { dmsSurats } from '../schemas/dms.schema';

export async function createDraftSuratAction(data: {
  title: string;
  sender: string;
  recipient: string;
  templateId?: string;
  contentData?: string;
}): Promise<ActionResponse<{ id: string; letterNumber: string; }>> {
  try {
    await requirePermission('dms.surat.create');
    const user = await getCurrentUser();
    const result = await createDraftSurat(data, user.id, user.permissions);
    return successResponse(result);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getSuratsAction(): Promise<ActionResponse<typeof dmsSurats.$inferSelect[]>> {
  try {
    await requirePermission('dms.surat.read');
    const user = await getCurrentUser();
    const result = await getAllSurats(user.permissions);
    return successResponse(result);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getSuratByIdAction(id: string): Promise<ActionResponse<typeof dmsSurats.$inferSelect | null>> {
  try {
    await requirePermission('dms.surat.read');
    const user = await getCurrentUser();
    const result = await getSuratById(id, user.permissions);
    return successResponse(result);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}


