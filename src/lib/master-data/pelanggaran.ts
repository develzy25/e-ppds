import { db } from '@/db';
import { pelanggarans } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export interface PelanggaranInput {
  santriId: string;
  category: string; // "Ringan" | "Sedang" | "Berat"
  description: string;
  points: number;
  penalty: string;
  status: string; // "Dilaporkan" | "Selesai"
  reportedBy: string;
  periodId: string;
  pondokId: string;
}

export async function getPelanggarans(pondokId: string, periodId: string) {
  return db
    .select()
    .from(pelanggarans)
    .where(and(eq(pelanggarans.pondokId, pondokId), eq(pelanggarans.periodId, periodId)));
}

export async function getPelanggaransBySantri(santriId: string, pondokId: string, periodId: string) {
  return db
    .select()
    .from(pelanggarans)
    .where(
      and(
        eq(pelanggarans.santriId, santriId),
        eq(pelanggarans.pondokId, pondokId),
        eq(pelanggarans.periodId, periodId)
      )
    );
}

export async function getPelanggaranById(id: string, pondokId: string, periodId: string) {
  const result = await db
    .select()
    .from(pelanggarans)
    .where(
      and(
        eq(pelanggarans.id, id),
        eq(pelanggarans.pondokId, pondokId),
        eq(pelanggarans.periodId, periodId)
      )
    )
    .limit(1);
  return result[0] || null;
}

export async function reportPelanggaran(input: PelanggaranInput, customId?: string) {
  const id = customId || `pel-${crypto.randomBytes(8).toString('hex')}`;
  await db.insert(pelanggarans).values({
    id,
    ...input,
  });
  return id;
}

export async function updatePelanggaranStatus(
  id: string,
  status: string,
  pondokId: string,
  periodId: string
) {
  await db
    .update(pelanggarans)
    .set({ status })
    .where(
      and(
        eq(pelanggarans.id, id),
        eq(pelanggarans.pondokId, pondokId),
        eq(pelanggarans.periodId, periodId)
      )
    );
}

export async function deletePelanggaran(id: string, pondokId: string, periodId: string) {
  await db
    .delete(pelanggarans)
    .where(
      and(
        eq(pelanggarans.id, id),
        eq(pelanggarans.pondokId, pondokId),
        eq(pelanggarans.periodId, periodId)
      )
    );
}
