import { z } from 'zod';

export const createPermissionSchema = z.object({
  name: z.string()
    .min(3, 'Nama permission minimal 3 karakter')
    .max(100, 'Nama permission maksimal 100 karakter')
    .regex(/^[a-z_]+(\.[a-z_]+)*$/, 'Format tidak valid. Gunakan format module.resource.action (contoh: keuangan.tagihan.view)'),
  description: z.string().max(255, 'Deskripsi maksimal 255 karakter').optional().nullable(),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
});

export const updatePermissionSchema = createPermissionSchema.extend({
  id: z.string().min(1, 'ID Permission wajib diisi'),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
