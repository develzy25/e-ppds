import { z } from 'zod';

export const createPosSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  pondokId: z.string(),
});

export const updatePosSchema = createPosSchema.extend({
  id: z.string(),
});
