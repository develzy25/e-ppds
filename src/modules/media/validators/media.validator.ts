import { z } from 'zod';

export const createMediaSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  pondokId: z.string(),
});

export const updateMediaSchema = createMediaSchema.extend({
  id: z.string(),
});
