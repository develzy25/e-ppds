'use server';

import { revalidatePath } from 'next/cache';
import { PengurusService } from '../services/pengurus.service';
import { createPengurusSchema, updatePengurusSchema } from '../validators/pengurus.validator';
import { db } from '@/db';
import { masterRole, masterPosition, masterPeriod } from '../../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';

const pengurusService = new PengurusService();

// Mock function to get current user context
async function getCurrentUser() {
  return {
    id: 'u1',
    pondokId: 'pondok-1',
    permissions: ['master.pengurus.view', 'master.pengurus.create', 'master.pengurus.update', 'master.pengurus.delete'],
  };
}

export async function getPenguruss() {
  try {
    const user = await getCurrentUser();
    const penguruss = await pengurusService.getAllPenguruss(user.pondokId, user.permissions);
    return { success: true, data: penguruss };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPengurusDropdownOptions() {
  try {
    const user = await getCurrentUser();
    
    // Fetch Roles
    const roles = await db.select().from(masterRole).where(and(eq(masterRole.pondokId, user.pondokId), isNull(masterRole.deletedAt)));
    
    // Fetch Positions
    const positions = await db.select().from(masterPosition).where(and(eq(masterPosition.pondokId, user.pondokId), isNull(masterPosition.deletedAt)));
    
    // Fetch Periods
    const periods = await db.select().from(masterPeriod).where(and(eq(masterPeriod.pondokId, user.pondokId), isNull(masterPeriod.deletedAt), eq(masterPeriod.status, 'Aktif')));

    return { 
      success: true, 
      data: {
        roles,
        positions,
        periods
      } 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createPengurus(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    // Parsing nested arrays from formData is tricky.
    // Assuming formData has a field 'data' which is a JSON string of the payload
    const payloadStr = formData.get('data') as string;
    if (!payloadStr) throw new Error('Data tidak ditemukan');

    const rawPayload = JSON.parse(payloadStr);
    const payload = {
      ...rawPayload,
      pondokId: user.pondokId,
    };

    const validatedData = createPengurusSchema.parse(payload);
    const newPengurus = await pengurusService.createPengurus(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/pengurus');
    return { success: true, data: newPengurus };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePengurus(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payloadStr = formData.get('data') as string;
    if (!payloadStr) throw new Error('Data tidak ditemukan');

    const rawPayload = JSON.parse(payloadStr);
    const payload = {
      ...rawPayload,
      pondokId: user.pondokId,
    };

    const validatedData = updatePengurusSchema.parse(payload);
    const updatedPengurus = await pengurusService.updatePengurus(validatedData.id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/pengurus');
    return { success: true, data: updatedPengurus };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePengurus(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedPengurus = await pengurusService.deletePengurus(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/pengurus');
    return { success: true, data: deletedPengurus };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
