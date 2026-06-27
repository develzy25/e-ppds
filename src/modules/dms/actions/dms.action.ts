'use server';

import { ActionResponse, successResponse } from '@/shared/utils/action-error';

export async function createDraftSuratAction(data: any): Promise<ActionResponse<any>> {
  // Placeholder logic
  console.log('Creating draft surat', data);
  return successResponse({ id: 'dummy' });
}
