import { db } from '@/db';
import { masterPermissions, rolePermissions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const permissionsList = [
  // Santri
  { id: 'perm-s-v', name: 'santri.view', description: 'Melihat data santri' },
  { id: 'perm-s-c', name: 'santri.create', description: 'Membuat data santri baru' },
  { id: 'perm-s-u', name: 'santri.update', description: 'Memperbarui data santri' },
  { id: 'perm-s-d', name: 'santri.delete', description: 'Menghapus data santri' },
  // Perizinan
  { id: 'perm-p-v', name: 'perizinan.view', description: 'Melihat perizinan' },
  { id: 'perm-p-c', name: 'perizinan.create', description: 'Mengajukan izin baru' },
  { id: 'perm-p-a', name: 'perizinan.approve', description: 'Menyetujui izin keluar' },
  // Persuratan
  { id: 'perm-l-v', name: 'surat.view', description: 'Melihat surat menyurat' },
  { id: 'perm-l-c', name: 'surat.create', description: 'Membuat draft surat baru' },
  { id: 'perm-l-a', name: 'surat.approve', description: 'Menyetujui / menandatangani surat' },
  // Keuangan
  { id: 'perm-f-v', name: 'keuangan.view', description: 'Melihat kas & billing' },
  { id: 'perm-f-c', name: 'keuangan.create', description: 'Mencatat transaksi keuangan' },
  { id: 'perm-f-m', name: 'keuangan.manage', description: 'Mengelola alokasi anggaran' },
  // Inventaris
  { id: 'perm-i-v', name: 'inventaris.view', description: 'Melihat inventaris barang' },
  { id: 'perm-i-m', name: 'inventaris.manage', description: 'Mutasi & penyesuaian barang' },
];

export async function seedPermissions(pondokId: string) {
  for (const perm of permissionsList) {
    const permExists = await db.select().from(masterPermissions).where(eq(masterPermissions.id, perm.id));
    if (permExists.length === 0) {
      await db.insert(masterPermissions).values({
        ...perm,
        pondokId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

export async function seedRolePermissions() {
  const mappingList: { roleId: string; permissionId: string }[] = [];

  for (const perm of permissionsList) {
    mappingList.push({ roleId: 'role-super', permissionId: perm.id });
  }

  mappingList.push(
    { roleId: 'role-ketum', permissionId: 'perm-s-v' },
    { roleId: 'role-ketum', permissionId: 'perm-p-v' },
    { roleId: 'role-ketum', permissionId: 'perm-p-a' },
    { roleId: 'role-ketum', permissionId: 'perm-l-v' },
    { roleId: 'role-ketum', permissionId: 'perm-l-a' },
    { roleId: 'role-ketum', permissionId: 'perm-f-v' },
    { roleId: 'role-ketum', permissionId: 'perm-f-m' },
    { roleId: 'role-sekr', permissionId: 'perm-s-v' },
    { roleId: 'role-sekr', permissionId: 'perm-s-c' },
    { roleId: 'role-sekr', permissionId: 'perm-s-u' },
    { roleId: 'role-sekr', permissionId: 'perm-l-v' },
    { roleId: 'role-sekr', permissionId: 'perm-l-c' },
    { roleId: 'role-bend', permissionId: 'perm-f-v' },
    { roleId: 'role-bend', permissionId: 'perm-f-c' },
    { roleId: 'role-bend', permissionId: 'perm-f-m' },
    { roleId: 'role-keam', permissionId: 'perm-s-v' },
    { roleId: 'role-keam', permissionId: 'perm-p-v' },
    { roleId: 'role-keam', permissionId: 'perm-p-c' },
    { roleId: 'role-keam', permissionId: 'perm-p-a' }
  );

  const existingMappings = await db.select().from(rolePermissions);
  if (existingMappings.length === 0) {
    const inserts = mappingList.map((m) => ({
      id: `map-${crypto.randomBytes(8).toString('hex')}`,
      roleId: m.roleId,
      permissionId: m.permissionId,
    }));
    await db.insert(rolePermissions).values(inserts);
  }
}
