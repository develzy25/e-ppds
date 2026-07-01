'use server';

import { ForbiddenError, NotFoundError } from '@/infrastructure/errors';
import { requirePermission } from '@/modules/auth/guards/permission.guard';


import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { revalidatePath } from 'next/cache';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { SantriService } from '../services/santri.service';
import { createSantriSchema, updateSantriSchema, CreateSantriInput } from '../validators/santri.validator';
import { errorResponse, successResponse } from '@/shared/utils/action-error';
import { db } from '@/db';
import { systemSettings } from '@/modules/core/schemas/core.schema';
import { eq, and } from 'drizzle-orm';

const santriService = new SantriService(new UnitOfWork());

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

export async function getSantris(page: number = 1, limit: number = 20, filters?: Record<string, string>) {
  try {
    await requirePermission('master.santri.read');
    const user = await getCurrentUser();
    const result = await santriService.getAllSantris(user.pondokId, user.permissions, page, limit, filters);
    return successResponse(result.data, result.meta);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getSantriDropdownOptions() {
  try {
    await requirePermission('master.santri.read');
    const user = await getCurrentUser();
    const options = await santriService.getDropdownOptions(user.pondokId, user.permissions);
    return successResponse(options);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function createSantri(formData: FormData) {
  try {
    await requirePermission('master.santri.create');
    const user = await getCurrentUser();
    
    const payloadStr = formData.get('data') as string;
    if (!payloadStr) throw new NotFoundError('Data tidak ditemukan');

    const rawPayload = JSON.parse(payloadStr);
    const payload = {
      ...rawPayload,
      pondokId: user.pondokId,
    };

    const validatedData = createSantriSchema.parse(payload);
    const newSantri = await santriService.createSantri(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/santri');
    return successResponse(newSantri);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function updateSantri(formData: FormData) {
  try {
    await requirePermission('master.santri.update');
    const user = await getCurrentUser();
    
    const payloadStr = formData.get('data') as string;
    if (!payloadStr) throw new NotFoundError('Data tidak ditemukan');

    const rawPayload = JSON.parse(payloadStr);
    const payload = {
      ...rawPayload,
      pondokId: user.pondokId,
    };

    const validatedData = updateSantriSchema.parse(payload);
    const updatedSantri = await santriService.updateSantri(validatedData.id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/santri');
    return successResponse(updatedSantri);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function deleteSantri(id: string) {
  try {
    await requirePermission('master.santri.delete');
    const user = await getCurrentUser();
    const deletedSantri = await santriService.deleteSantri(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/santri');
    return successResponse(deletedSantri);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function importSantrisBulk(data: CreateSantriInput[]) {
  try {
    await requirePermission('master.santri.import');
    const user = await getCurrentUser();
    const result = await santriService.importSantriBulk(data, user.id, user.pondokId);
    revalidatePath('/master/santri');
    return successResponse(result);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function getLetterhead() {
  try {
    await requirePermission('master.santri.read');
    const user = await getCurrentUser();
    const setting = await db
      .select()
      .from(systemSettings)
      .where(
        and(
          eq(systemSettings.pondokId, user.pondokId),
          eq(systemSettings.key, 'kop_surat')
        )
      )
      .limit(1);
    
    return successResponse(setting[0]?.value || null);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function saveLetterhead(base64Image: string) {
  try {
    await requirePermission('master.santri.create');
    const user = await getCurrentUser();
    const existing = await db
      .select()
      .from(systemSettings)
      .where(
        and(
          eq(systemSettings.pondokId, user.pondokId),
          eq(systemSettings.key, 'kop_surat')
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(systemSettings)
        .set({ value: base64Image })
        .where(
          and(
            eq(systemSettings.pondokId, user.pondokId),
            eq(systemSettings.key, 'kop_surat')
          )
        );
    } else {
      await db.insert(systemSettings).values({
        id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        key: 'kop_surat',
        value: base64Image,
        description: 'Kop Surat Base64 Image untuk Laporan PDF',
        pondokId: user.pondokId
      });
    }

    return successResponse(true);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
