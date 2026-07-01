import { db } from '@/db';
import { documentSequences } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export async function generateReceiptNumber(
  name: string,
  prefix: string,
  suffix: string | null,
  periodId: string,
  pondokId: string
): Promise<string> {
  const result = await db
    .select()
    .from(documentSequences)
    .where(
      and(
        eq(documentSequences.name, name),
        eq(documentSequences.periodId, periodId),
        eq(documentSequences.pondokId, pondokId)
      )
    )
    .limit(1);

  let nextVal = 1;
  if (result.length === 0) {
    const id = `seq-${crypto.randomBytes(8).toString('hex')}`;
    await db.insert(documentSequences).values({
      id,
      name,
      prefix,
      suffix: suffix || null,
      currentValue: 1,
      periodId,
      pondokId,
    });
  } else {
    const seq = result[0];
    nextVal = seq.currentValue + 1;
    await db
      .update(documentSequences)
      .set({ currentValue: nextVal })
      .where(eq(documentSequences.id, seq.id));
  }

  const formattedVal = String(nextVal).padStart(5, '0');
  const suff = suffix ? suffix : '';
  return `${prefix}${formattedVal}${suff}`;
}
