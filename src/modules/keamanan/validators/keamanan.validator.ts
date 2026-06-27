import { z } from 'zod';

export const createKeamananSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  pondokId: z.string(),
});

export const updateKeamananSchema = createKeamananSchema.extend({
  id: z.string(),
});
