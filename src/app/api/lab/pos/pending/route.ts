import { NextRequest } from 'next/server';
import { db } from '@/db';
import { posTransactions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { ok, badRequest, internalError } from '@/shared/utils/api-response';
import { getRequestMeta } from '@/shared/utils/request-meta';

export async function GET(req: NextRequest) {
  const meta = await getRequestMeta();
  try {
    const { searchParams } = new URL(req.url);
    const pondokId = searchParams.get('pondokId');

    if (!pondokId) {
      return badRequest('LAB-400', 'Pondok ID is required', meta);
    }

    const pending = await db
      .select()
      .from(posTransactions)
      .where(
        and(
          eq(posTransactions.status, 'Menunggu Pembayaran'),
          eq(posTransactions.pondokId, pondokId)
        )
      );

    return ok({ pending }, meta);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return internalError('LAB-500', errorMessage, meta);
  }
}
