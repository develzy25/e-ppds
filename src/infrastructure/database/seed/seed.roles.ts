import { db } from '@/db';
import { masterRoles, userRoles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { userSeeds } from './seed.users';

export const rolesList = [
  { id: 'role-super', name: 'Super Admin', description: 'Otoritas tertinggi sistem' },
  { id: 'role-ketum', name: 'Ketua Umum', description: 'Dewan harian / Pimpinan pondok' },
  { id: 'role-sekr', name: 'Sekretaris', description: 'Kesekretariatan & Persuratan' },
  { id: 'role-bend', name: 'Bendahara', description: 'Keuangan & Anggaran' },
  { id: 'role-keam', name: 'Keamanan', description: 'Ketertiban & Perizinan' },
  { id: 'role-pend', name: 'Pendidikan', description: 'Diniyah & Wajib Belajar' },
  { id: 'role-huma', name: 'Humas', description: 'Logistik & Hubungan Wali' },
];

export async function seedRoles(pondokId: string) {
  for (const role of rolesList) {
    const roleExists = await db.select().from(masterRoles).where(eq(masterRoles.id, role.id));
    if (roleExists.length === 0) {
      await db.insert(masterRoles).values({
        ...role,
        pondokId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

export async function seedUserRoles(periodId: string) {
  for (const u of userSeeds) {
    const userRoleExists = await db.select().from(userRoles).where(eq(userRoles.userId, u.id));
    if (userRoleExists.length === 0) {
      await db.insert(userRoles).values({
        id: `ur-${crypto.randomBytes(8).toString('hex')}`,
        userId: u.id,
        roleId: u.roleId,
        periodId,
        status: 'Aktif',
        appointedAt: new Date().toISOString(),
      });
    }
  }
}
