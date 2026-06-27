import { z } from 'zod';

export const createPembangunanSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  pondokId: z.string(),
});

export const updatePembangunanSchema = createPembangunanSchema.extend({
  id: z.string(),
});
