import { db } from '@/db';
import { bloks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export async function getBloks(pondokId: string) {
  return db.select().from(bloks).where(eq(bloks.pondokId, pondokId));
}

export async function getBlokById(id: string, pondokId: string) {
  const result = await db
    .select()
    .from(bloks)
    .where(and(eq(bloks.id, id), eq(bloks.pondokId, pondokId)))
    .limit(1);
  return result[0] || null;
}

export async function createBlok(name: string, pondokId: string, customId?: string) {
  const id = customId || `blok-${crypto.randomBytes(4).toString('hex')}`;
  await db.insert(bloks).values({
    id,
    name,
    pondokId,
  });
  return id;
}

export async function updateBlok(id: string, name: string, pondokId: string) {
  await db
    .update(bloks)
    .set({ name })
    .where(and(eq(bloks.id, id), eq(bloks.pondokId, pondokId)));
}

export async function deleteBlok(id: string, pondokId: string) {
  await db
    .delete(bloks)
    .where(and(eq(bloks.id, id), eq(bloks.pondokId, pondokId)));
}
