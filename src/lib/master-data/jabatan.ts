import { db } from '@/db';
import { masterRoles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export async function getJabatans(pondokId: string) {
  return db.select().from(masterRoles).where(eq(masterRoles.pondokId, pondokId));
}

export async function getJabatanById(id: string, pondokId: string) {
  const result = await db
    .select()
    .from(masterRoles)
    .where(and(eq(masterRoles.id, id), eq(masterRoles.pondokId, pondokId)))
    .limit(1);
  return result[0] || null;
}

export async function createJabatan(
  name: string,
  description: string | null,
  pondokId: string,
  customId?: string
) {
  const id = customId || `role-${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();
  await db.insert(masterRoles).values({
    id,
    name,
    description,
    pondokId,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updateJabatan(
  id: string,
  name: string,
  description: string | null,
  pondokId: string
) {
  const now = new Date().toISOString();
  await db
    .update(masterRoles)
    .set({ name, description, updatedAt: now })
    .where(and(eq(masterRoles.id, id), eq(masterRoles.pondokId, pondokId)));
}

export async function deleteJabatan(id: string, pondokId: string) {
  await db
    .delete(masterRoles)
    .where(and(eq(masterRoles.id, id), eq(masterRoles.pondokId, pondokId)));
}
