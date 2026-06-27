import { NextRequest } from 'next/server';
import { recordExpense } from '@/lib/services/laboratorium';
import { ok, badRequest, internalError } from '@/shared/utils/api-response';
import { getRequestMeta } from '@/shared/utils/request-meta';

export async function POST(req: NextRequest) {
  const meta = await getRequestMeta();
  try {
    const { amount, description, periodId, pondokId } = await req.json();

    if (amount === undefined || !description || !periodId || !pondokId) {
      return badRequest('LAB-400', 'Missing required parameters', meta);
    }

    await recordExpense(amount, description, periodId, pondokId);
    return ok({ message: 'Expense recorded successfully' }, meta);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return internalError('LAB-500', errorMessage, meta);
  }
}
