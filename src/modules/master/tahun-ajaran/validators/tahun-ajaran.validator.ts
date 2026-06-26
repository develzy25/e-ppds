import { z } from 'zod';

export const createTahunAjaranSchema = z.object({
  name: z.string().min(3, 'Nama tahun ajaran minimal 3 karakter').max(100, 'Nama tahun ajaran maksimal 100 karakter'),
  status: z.enum(['Aktif', 'Tidak Aktif']),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
});

export const updateTahunAjaranSchema = createTahunAjaranSchema.extend({
  id: z.string().min(1, 'ID Tahun Ajaran wajib diisi'),
});

export type CreateTahunAjaranInput = z.infer<typeof createTahunAjaranSchema>;
export type UpdateTahunAjaranInput = z.infer<typeof updateTahunAjaranSchema>;
