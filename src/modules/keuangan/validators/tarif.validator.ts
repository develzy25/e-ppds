import { z } from 'zod';

export const createTarifSchema = z.object({
  jenisTagihanId: z.string().min(1, 'Jenis Tagihan wajib dipilih'),
  academicYearId: z.string().min(1, 'Tahun Ajaran wajib dipilih'),
  amount: z.coerce.number().min(0, 'Nominal tarif tidak valid'),
  description: z.string().optional(),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
});

export const updateTarifSchema = createTarifSchema.extend({
  id: z.string().min(1, 'ID wajib diisi'),
});

export type CreateTarifDTO = z.infer<typeof createTarifSchema>;
export type UpdateTarifDTO = z.infer<typeof updateTarifSchema>;
