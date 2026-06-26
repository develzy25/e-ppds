'use server';

import { revalidatePath } from 'next/cache';
import { TahunAjaranService } from '../services/tahun-ajaran.service';
import { createTahunAjaranSchema, updateTahunAjaranSchema } from '../validators/tahun-ajaran.validator';

const tahunAjaranService = new TahunAjaranService();

// Mock function to get current user context
async function getCurrentUser() {
  return {
    id: 'u1',
    pondokId: 'pondok-1',
    permissions: ['master.tahun_ajaran.view', 'master.tahun_ajaran.create', 'master.tahun_ajaran.update', 'master.tahun_ajaran.delete'],
  };
}

export async function getTahunAjarans() {
  try {
    const user = await getCurrentUser();
    const periodes = await tahunAjaranService.getAllTahunAjarans(user.pondokId, user.permissions);
    return { success: true, data: periodes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTahunAjaran(id: string) {
  try {
    const user = await getCurrentUser();
    const periode = await tahunAjaranService.getTahunAjaranById(id, user.pondokId, user.permissions);
    return { success: true, data: periode };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createTahunAjaran(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      status: formData.get('status') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createTahunAjaranSchema.parse(payload);
    const newTahunAjaran = await tahunAjaranService.createTahunAjaran(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/tahun-ajaran');
    return { success: true, data: newTahunAjaran };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTahunAjaran(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      status: formData.get('status') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updateTahunAjaranSchema.parse(payload);
    const updatedTahunAjaran = await tahunAjaranService.updateTahunAjaran(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/tahun-ajaran');
    return { success: true, data: updatedTahunAjaran };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTahunAjaran(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedTahunAjaran = await tahunAjaranService.deleteTahunAjaran(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/tahun-ajaran');
    return { success: true, data: deletedTahunAjaran };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
