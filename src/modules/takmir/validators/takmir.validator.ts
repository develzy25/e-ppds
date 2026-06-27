import { z } from 'zod';

export const createTakmirSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  pondokId: z.string(),
});

export const updateTakmirSchema = createTakmirSchema.extend({
  id: z.string(),
});
