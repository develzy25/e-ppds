import { z } from 'zod';

export const createPeriodeSchema = z.object({
  name: z.string().min(3, 'Nama periode minimal 3 karakter').max(100, 'Nama periode maksimal 100 karakter'),
  status: z.enum(['Aktif', 'Tidak Aktif']),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
});

export const updatePeriodeSchema = createPeriodeSchema.extend({
  id: z.string().min(1, 'ID Periode wajib diisi'),
});

export type CreatePeriodeInput = z.infer<typeof createPeriodeSchema>;
export type UpdatePeriodeInput = z.infer<typeof updatePeriodeSchema>;
