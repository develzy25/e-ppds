import { NextRequest } from 'next/server';
import { payTransaction } from '@/lib/services/laboratorium';
import { ok, badRequest, internalError } from '@/shared/utils/api-response';
import { getRequestMeta } from '@/shared/utils/request-meta';

export async function POST(req: NextRequest) {
  const meta = await getRequestMeta();
  try {
    const { transactionId, paymentMethod, amountPaid, cashierName, periodId, pondokId } = await req.json();

    if (!transactionId || !paymentMethod || amountPaid === undefined || !cashierName || !periodId || !pondokId) {
      return badRequest('LAB-400', 'Missing required parameters', meta);
    }

    const result = await payTransaction(transactionId, paymentMethod, amountPaid, cashierName, periodId, pondokId);
    return ok({ change: result.change }, meta);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return internalError('LAB-500', errorMessage, meta);
  }
}
