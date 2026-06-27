import { NextRequest } from 'next/server';
import { createJasaTransaction } from '@/lib/services/laboratorium';
import { ok, badRequest, internalError } from '@/shared/utils/api-response';
import { getRequestMeta } from '@/shared/utils/request-meta';

export async function POST(req: NextRequest) {
  const meta = await getRequestMeta();
  try {
    const { items, cashierName, periodId, pondokId } = await req.json();

    if (!items || !Array.isArray(items) || !cashierName || !periodId || !pondokId) {
      return badRequest('LAB-400', 'Missing required parameters', meta);
    }

    const transactionId = await createJasaTransaction(items, cashierName, periodId, pondokId);
    return ok({ transactionId }, meta);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return internalError('LAB-500', errorMessage, meta);
  }
}
