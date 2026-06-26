'use server';

import { revalidatePath } from 'next/cache';
import { KelasService } from '../services/kelas.service';
import { SekolahService } from '../../sekolah/services/sekolah.service';
import { createKelasSchema, updateKelasSchema } from '../validators/kelas.validator';

const kelasService = new KelasService();
const sekolahService = new SekolahService();

// Mock function to get current user context
async function getCurrentUser() {
  return {
    id: 'u1',
    pondokId: 'pondok-1',
    permissions: ['master.kelas.view', 'master.kelas.create', 'master.kelas.update', 'master.kelas.delete', 'master.sekolah.view'],
  };
}

export async function getKelass() {
  try {
    const user = await getCurrentUser();
    const kelass = await kelasService.getAllKelass(user.pondokId, user.permissions);
    return { success: true, data: kelass };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSekolahsForDropdown() {
  try {
    const user = await getCurrentUser();
    const sekolahs = await sekolahService.getAllSekolahs(user.pondokId, user.permissions);
    return { success: true, data: sekolahs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createKelas(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const payload = {
      name: formData.get('name') as string,
      schoolId: formData.get('schoolId') as string,
      pondokId: user.pondokId,
    };

    const validatedData = createKelasSchema.parse(payload);
    const newKelas = await kelasService.createKelas(validatedData, user.id, user.permissions);
    
    revalidatePath('/master/kelas');
    return { success: true, data: newKelas };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateKelas(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const id = formData.get('id') as string;
    const payload = {
      id,
      name: formData.get('name') as string,
      schoolId: formData.get('schoolId') as string,
      pondokId: user.pondokId,
    };

    const validatedData = updateKelasSchema.parse(payload);
    const updatedKelas = await kelasService.updateKelas(id, validatedData, user.id, user.permissions);
    
    revalidatePath('/master/kelas');
    return { success: true, data: updatedKelas };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteKelas(id: string) {
  try {
    const user = await getCurrentUser();
    const deletedKelas = await kelasService.deleteKelas(id, user.pondokId, user.id, user.permissions);
    
    revalidatePath('/master/kelas');
    return { success: true, data: deletedKelas };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
