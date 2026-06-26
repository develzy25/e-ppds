import { z } from 'zod';

export const createSantriSchema = z.object({
  nis: z.string().min(1, 'NIS wajib diisi'),
  name: z.string().min(1, 'Nama santri minimal 1 karakter').max(100, 'Nama santri maksimal 100 karakter'),
  gender: z.enum(['L', 'P']),
  statusAktif: z.enum(['Aktif', 'Alumni']),
  roomId: z.string().optional().nullable(),
  classFormalId: z.string().optional().nullable(),
  classDiniyahId: z.string().optional().nullable(),
  academicYearId: z.string().min(1, 'Tahun Ajaran wajib dipilih'),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
});

export const updateSantriSchema = createSantriSchema.extend({
  id: z.string().min(1, 'ID Santri wajib diisi'),
});

export type CreateSantriInput = z.infer<typeof createSantriSchema>;
export type UpdateSantriInput = z.infer<typeof updateSantriSchema>;
