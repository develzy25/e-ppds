import { z } from 'zod';

export const createKamarSchema = z.object({
  name: z.string().min(1, 'Nama kamar minimal 1 karakter').max(50, 'Nama kamar maksimal 50 karakter'),
  capacity: z.coerce.number().min(1, 'Kapasitas minimal 1'),
  blockId: z.string().min(1, 'Blok wajib dipilih'),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
});

export const updateKamarSchema = createKamarSchema.extend({
  id: z.string().min(1, 'ID Kamar wajib diisi'),
});

export type CreateKamarInput = z.infer<typeof createKamarSchema>;
export type UpdateKamarInput = z.infer<typeof updateKamarSchema>;
