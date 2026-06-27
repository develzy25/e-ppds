import { z } from 'zod';

export const createBumpSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  pondokId: z.string(),
});

export const updateBumpSchema = createBumpSchema.extend({
  id: z.string(),
});
