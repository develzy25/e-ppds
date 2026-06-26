import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(3, 'Nama department minimal 3 karakter').max(100, 'Nama department maksimal 100 karakter'),
  type: z.enum(['Divisi', 'Seksi']),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().min(1, 'ID Department wajib diisi'),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
