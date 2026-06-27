import { z } from 'zod';

export const createJenisTagihanSchema = z.object({
  name: z.string().min(1, 'Nama Jenis Tagihan wajib diisi'),
  category: z.enum(['Bulanan', 'Tahunan', 'Insidental']),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
});

export const updateJenisTagihanSchema = createJenisTagihanSchema.extend({
  id: z.string().min(1, 'ID wajib diisi'),
});

export type CreateJenisTagihanDTO = z.infer<typeof createJenisTagihanSchema>;
export type UpdateJenisTagihanDTO = z.infer<typeof updateJenisTagihanSchema>;
