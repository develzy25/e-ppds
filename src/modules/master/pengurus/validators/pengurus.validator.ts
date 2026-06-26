import { z } from 'zod';

export const createPengurusSchema = z.object({
  name: z.string().min(1, 'Nama pengurus minimal 1 karakter').max(100, 'Nama pengurus maksimal 100 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  statusAktif: z.enum(['Aktif', 'Nonaktif']),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
  roleIds: z.array(z.string()).min(1, 'Minimal pilih 1 peran'),
  positions: z.array(z.object({
    positionId: z.string().min(1, 'Jabatan wajib diisi'),
    periodId: z.string().min(1, 'Periode wajib diisi')
  })).optional(),
});

export const updatePengurusSchema = z.object({
  id: z.string().min(1, 'ID Pengurus wajib diisi'),
  name: z.string().min(1, 'Nama pengurus minimal 1 karakter').max(100, 'Nama pengurus maksimal 100 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().optional().refine(val => !val || val.length >= 6, {
    message: 'Password minimal 6 karakter',
  }),
  statusAktif: z.enum(['Aktif', 'Nonaktif']),
  pondokId: z.string().min(1, 'Pondok ID wajib diisi'),
  roleIds: z.array(z.string()).min(1, 'Minimal pilih 1 peran'),
  positions: z.array(z.object({
    positionId: z.string().min(1, 'Jabatan wajib diisi'),
    periodId: z.string().min(1, 'Periode wajib diisi')
  })).optional(),
});

export type CreatePengurusInput = z.infer<typeof createPengurusSchema>;
export type UpdatePengurusInput = z.infer<typeof updatePengurusSchema>;
