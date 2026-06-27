import { z } from 'zod';

export const createDmsSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  pondokId: z.string(),
});

export const updateDmsSchema = createDmsSchema.extend({
  id: z.string(),
});
