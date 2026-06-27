import { z } from 'zod';

export const createKesehatanSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  pondokId: z.string(),
});

export const updateKesehatanSchema = createKesehatanSchema.extend({
  id: z.string(),
});
