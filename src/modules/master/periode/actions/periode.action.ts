'use server';

import { revalidatePath } from 'next/cache';
import { PeriodeService } from '../services/periode.service';
import { createPeriodeSchema, updatePeriodeSchema } from '../validators/periode.validator';

const periodeService = new PeriodeService();

// Mock function to get current user context
async function getCurrentUser() {
  return {
    id: 'u1',
    pondokId: 'pondok-1',
    permissions: ['master.periode.view', 'master.periode.create', 'master.periode.update', 'master.periode.delete'],
  };
}

export async function getPeriodes() {
  try {
    const user = await getCurrentUser();
    const periodes = await periodeService.getAllPeriodes(user.pondokId, user.permissions);
    return { success: true, data: periodes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPeriode(id: string) {
  try {
    const user = await getCurrentUser();
    const periode = await periodeService.getPeriodeById(id, user.pondokId, user.permissions);
    return { success: true, data: periode };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createPeriode(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      status: formData.get('status') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createPeriodeSchema.parse(payload);
    const newPeriode = await periodeService.createPeriode(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/periode');
    return { success: true, data: newPeriode };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePeriode(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      status: formData.get('status') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updatePeriodeSchema.parse(payload);
    const updatedPeriode = await periodeService.updatePeriode(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/periode');
    return { success: true, data: updatedPeriode };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePeriode(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedPeriode = await periodeService.deletePeriode(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/periode');
    return { success: true, data: deletedPeriode };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
