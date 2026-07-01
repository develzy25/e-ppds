import { z } from 'zod';

export const createKelasSchema = z.object({
  name: z.string().min(1, 'Nama kelas minimal 1 karakter').max(50, 'Nama kelas maksimal 50 karakter'),
  schoolId: z.string().min(1, 'Sekolah wajib dipilih'),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
});

export const updateKelasSchema = createKelasSchema.extend({
  id: z.string().min(1, 'ID Kelas wajib diisi'),
});

export type CreateKelasInput = z.infer<typeof createKelasSchema>;
export type UpdateKelasInput = z.infer<typeof updateKelasSchema>;
