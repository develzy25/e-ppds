import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(3, 'Nama role minimal 3 karakter').max(50, 'Nama role maksimal 50 karakter'),
  description: z.string().max(255, 'Deskripsi maksimal 255 karakter').optional().nullable(),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
});

export const updateRoleSchema = createRoleSchema.extend({
  id: z.string().min(1, 'ID Role wajib diisi'),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
