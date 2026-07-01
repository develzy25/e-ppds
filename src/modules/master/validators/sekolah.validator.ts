import { z } from 'zod';

export const createSekolahSchema = z.object({
  name: z.string().min(1, 'Nama sekolah minimal 1 karakter').max(50, 'Nama sekolah maksimal 50 karakter'),
  type: z.enum(['Formal', 'Diniyah']),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
});

export const updateSekolahSchema = createSekolahSchema.extend({
  id: z.string().min(1, 'ID Sekolah wajib diisi'),
});

export type CreateSekolahInput = z.infer<typeof createSekolahSchema>;
export type UpdateSekolahInput = z.infer<typeof updateSekolahSchema>;
