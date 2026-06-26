import { db } from '@/db';
import { kamars } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export async function getKamars(pondokId: string) {
  return db.select().from(kamars).where(eq(kamars.pondokId, pondokId));
}

export async function getKamarsByBlok(blokId: string, pondokId: string) {
  return db
    .select()
    .from(kamars)
    .where(and(eq(kamars.blokId, blokId), eq(kamars.pondokId, pondokId)));
}

export async function getKamarById(id: string, pondokId: string) {
  const result = await db
    .select()
    .from(kamars)
    .where(and(eq(kamars.id, id), eq(kamars.pondokId, pondokId)))
    .limit(1);
  return result[0] || null;
}

export async function createKamar(
  name: string,
  capacity: number,
  blokId: string,
  pondokId: string,
  customId?: string
) {
  const id = customId || `kam-${crypto.randomBytes(4).toString('hex')}`;
  await db.insert(kamars).values({
    id,
    name,
    capacity,
    blokId,
    pondokId,
  });
  return id;
}

export async function updateKamar(
  id: string,
  name: string,
  capacity: number,
  blokId: string,
  pondokId: string
) {
  await db
    .update(kamars)
    .set({ name, capacity, blokId })
    .where(and(eq(kamars.id, id), eq(kamars.pondokId, pondokId)));
}

export async function deleteKamar(id: string, pondokId: string) {
  await db
    .delete(kamars)
    .where(and(eq(kamars.id, id), eq(kamars.pondokId, pondokId)));
}
