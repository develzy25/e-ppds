import { z } from 'zod';

export const createMusyawarahSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  pondokId: z.string(),
});

export const updateMusyawarahSchema = createMusyawarahSchema.extend({
  id: z.string(),
});
