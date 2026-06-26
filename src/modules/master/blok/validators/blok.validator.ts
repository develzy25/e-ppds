import { z } from 'zod';

export const createBlokSchema = z.object({
  name: z.string().min(1, 'Nama blok minimal 1 karakter').max(50, 'Nama blok maksimal 50 karakter'),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
});

export const updateBlokSchema = createBlokSchema.extend({
  id: z.string().min(1, 'ID Blok wajib diisi'),
});

export type CreateBlokInput = z.infer<typeof createBlokSchema>;
export type UpdateBlokInput = z.infer<typeof updateBlokSchema>;
