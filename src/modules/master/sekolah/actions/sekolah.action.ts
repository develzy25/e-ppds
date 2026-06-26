'use server';

import { revalidatePath } from 'next/cache';
import { SekolahService } from '../services/sekolah.service';
import { createSekolahSchema, updateSekolahSchema } from '../validators/sekolah.validator';

const sekolahService = new SekolahService();

// Mock function to get current user context
async function getCurrentUser() {
  return {
    id: 'u1',
    pondokId: 'pondok-1',
    permissions: ['master.sekolah.view', 'master.sekolah.create', 'master.sekolah.update', 'master.sekolah.delete'],
  };
}

export async function getSekolahs() {
  try {
    const user = await getCurrentUser();
    const sekolahs = await sekolahService.getAllSekolahs(user.pondokId, user.permissions);
    return { success: true, data: sekolahs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSekolah(id: string) {
  try {
    const user = await getCurrentUser();
    const sekolah = await sekolahService.getSekolahById(id, user.pondokId, user.permissions);
    return { success: true, data: sekolah };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSekolah(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createSekolahSchema.parse(payload);
    const newSekolah = await sekolahService.createSekolah(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/sekolah');
    return { success: true, data: newSekolah };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSekolah(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updateSekolahSchema.parse(payload);
    const updatedSekolah = await sekolahService.updateSekolah(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/sekolah');
    return { success: true, data: updatedSekolah };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSekolah(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedSekolah = await sekolahService.deleteSekolah(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/sekolah');
    return { success: true, data: deletedSekolah };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
