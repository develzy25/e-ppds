import { z } from 'zod';

export const createLaboratoriumSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  pondokId: z.string(),
});

export const updateLaboratoriumSchema = createLaboratoriumSchema.extend({
  id: z.string(),
});
