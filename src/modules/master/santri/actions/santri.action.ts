'use server';

import { revalidatePath } from 'next/cache';
import { SantriService } from '../services/santri.service';
import { createSantriSchema, updateSantriSchema } from '../validators/santri.validator';
import { db } from '@/db';
import { masterRoom, masterClass, masterAcademicYear } from '../../schemas/master.schema';
import { eq, and, isNull } from 'drizzle-orm';

const santriService = new SantriService();

// Mock function to get current user context
async function getCurrentUser() {
  return {
    id: 'u1',
    pondokId: 'pondok-1',
    permissions: ['master.santri.view', 'master.santri.create', 'master.santri.update', 'master.santri.delete'],
  };
}

export async function getSantris() {
  try {
    const user = await getCurrentUser();
    const santris = await santriService.getAllSantris(user.pondokId, user.permissions);
    return { success: true, data: santris };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSantriDropdownOptions() {
  try {
    const user = await getCurrentUser();
    
    const kamars = await db.select().from(masterRoom).where(and(eq(masterRoom.pondokId, user.pondokId), isNull(masterRoom.deletedAt)));
    const classes = await db.select().from(masterClass).where(and(eq(masterClass.pondokId, user.pondokId), isNull(masterClass.deletedAt)));
    const academicYears = await db.select().from(masterAcademicYear).where(and(eq(masterAcademicYear.pondokId, user.pondokId), isNull(masterAcademicYear.deletedAt), eq(masterAcademicYear.status, 'Aktif')));

    return { 
      success: true, 
      data: {
        kamars,
        classes,
        academicYears
      } 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSantri(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payloadStr = formData.get('data') as string;
    if (!payloadStr) throw new Error('Data tidak ditemukan');

    const rawPayload = JSON.parse(payloadStr);
    const payload = {
      ...rawPayload,
      pondokId: user.pondokId,
    };

    const validatedData = createSantriSchema.parse(payload);
    const newSantri = await santriService.createSantri(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/santri');
    return { success: true, data: newSantri };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSantri(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payloadStr = formData.get('data') as string;
    if (!payloadStr) throw new Error('Data tidak ditemukan');

    const rawPayload = JSON.parse(payloadStr);
    const payload = {
      ...rawPayload,
      pondokId: user.pondokId,
    };

    const validatedData = updateSantriSchema.parse(payload);
    const updatedSantri = await santriService.updateSantri(validatedData.id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/santri');
    return { success: true, data: updatedSantri };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSantri(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedSantri = await santriService.deleteSantri(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/santri');
    return { success: true, data: deletedSantri };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
