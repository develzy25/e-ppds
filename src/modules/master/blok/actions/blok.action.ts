'use server';

import { revalidatePath } from 'next/cache';
import { BlokService } from '../services/blok.service';
import { createBlokSchema, updateBlokSchema } from '../validators/blok.validator';

const blokService = new BlokService();

// Mock function to get current user context
async function getCurrentUser() {
  return {
    id: 'u1',
    pondokId: 'pondok-1',
    permissions: ['master.blok.view', 'master.blok.create', 'master.blok.update', 'master.blok.delete'],
  };
}

export async function getBloks() {
  try {
    const user = await getCurrentUser();
    const bloks = await blokService.getAllBloks(user.pondokId, user.permissions);
    return { success: true, data: bloks };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBlok(id: string) {
  try {
    const user = await getCurrentUser();
    const blok = await blokService.getBlokById(id, user.pondokId, user.permissions);
    return { success: true, data: blok };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createBlok(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createBlokSchema.parse(payload);
    const newBlok = await blokService.createBlok(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/blok');
    return { success: true, data: newBlok };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBlok(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updateBlokSchema.parse(payload);
    const updatedBlok = await blokService.updateBlok(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/blok');
    return { success: true, data: updatedBlok };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBlok(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedBlok = await blokService.deleteBlok(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/blok');
    return { success: true, data: deletedBlok };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
