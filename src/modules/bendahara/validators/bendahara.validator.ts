import { z } from 'zod';

export const createBendaharaSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  pondokId: z.string(),
});

export const updateBendaharaSchema = createBendaharaSchema.extend({
  id: z.string(),
});
