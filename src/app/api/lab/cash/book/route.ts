import { NextRequest } from 'next/server';
import { db } from '@/db';
import { cashBooks, cashMovements } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { ok, badRequest, internalError } from '@/shared/utils/api-response';
import { getRequestMeta } from '@/shared/utils/request-meta';

export async function GET(req: NextRequest) {
  const meta = await getRequestMeta();
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const pondokId = searchParams.get('pondokId');

    if (!date || !pondokId) {
      return badRequest('LAB-400', 'Date and Pondok ID are required', meta);
    }

    const cashBook = await db
      .select()
      .from(cashBooks)
      .where(
        and(
          eq(cashBooks.date, date),
          eq(cashBooks.pondokId, pondokId)
        )
      )
      .then((res: Record<string, unknown>[]) => res[0] || null);

    const movements = await db
      .select()
      .from(cashMovements)
      .where(
        and(
          eq(cashMovements.date, date),
          eq(cashMovements.pondokId, pondokId)
        )
      );

    return ok({ cashBook, movements }, meta);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return internalError('LAB-500', errorMessage, meta);
  }
}
