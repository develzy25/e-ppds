import { z } from 'zod';

export const createHumasySchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  pondokId: z.string(),
});

export const updateHumasySchema = createHumasySchema.extend({
  id: z.string(),
});
