import { z } from 'zod';

export const createPendidikanSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  pondokId: z.string(),
});

export const updatePendidikanSchema = createPendidikanSchema.extend({
  id: z.string(),
});
