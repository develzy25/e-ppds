import { z } from 'zod';

export const createJabatanSchema = z.object({
  name: z.string().min(3, 'Nama jabatan minimal 3 karakter').max(100, 'Nama jabatan maksimal 100 karakter'),
  departmentId: z.string().min(1, 'Department wajib dipilih'),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
});

export const updateJabatanSchema = createJabatanSchema.extend({
  id: z.string().min(1, 'ID Jabatan wajib diisi'),
});

export type CreateJabatanInput = z.infer<typeof createJabatanSchema>;
export type UpdateJabatanInput = z.infer<typeof updateJabatanSchema>;
