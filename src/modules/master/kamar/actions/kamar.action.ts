'use server';

import { revalidatePath } from 'next/cache';
import { KamarService } from '../services/kamar.service';
import { BlokService } from '../../blok/services/blok.service';
import { createKamarSchema, updateKamarSchema } from '../validators/kamar.validator';

const kamarService = new KamarService();
const blokService = new BlokService();

// Mock function to get current user context
async function getCurrentUser() {
  return {
    id: 'u1',
    pondokId: 'pondok-1',
    permissions: ['master.kamar.view', 'master.kamar.create', 'master.kamar.update', 'master.kamar.delete', 'master.blok.view'],
  };
}

export async function getKamars() {
  try {
    const user = await getCurrentUser();
    const kamars = await kamarService.getAllKamars(user.pondokId, user.permissions);
    return { success: true, data: kamars };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBloksForDropdown() {
  try {
    const user = await getCurrentUser();
    const bloks = await blokService.getAllBloks(user.pondokId, user.permissions);
    return { success: true, data: bloks };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createKamar(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      capacity: formData.get('capacity'),
      blockId: formData.get('blockId') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createKamarSchema.parse(payload);
    const newKamar = await kamarService.createKamar(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/kamar');
    return { success: true, data: newKamar };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateKamar(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      capacity: formData.get('capacity'),
      blockId: formData.get('blockId') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updateKamarSchema.parse(payload);
    const updatedKamar = await kamarService.updateKamar(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/kamar');
    return { success: true, data: updatedKamar };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteKamar(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedKamar = await kamarService.deleteKamar(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/kamar');
    return { success: true, data: deletedKamar };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
