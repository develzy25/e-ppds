import { NextRequest } from 'next/server';
import { recordDepositToTreasurer } from '@/lib/services/laboratorium';
import { ok, badRequest, internalError } from '@/shared/utils/api-response';
import { getRequestMeta } from '@/shared/utils/request-meta';

export async function POST(req: NextRequest) {
  const meta = await getRequestMeta();
  try {
    const { amountToDeposit, keterangan, verifiedBy, periodId, pondokId } = await req.json();

    if (amountToDeposit === undefined || !periodId || !pondokId) {
      return badRequest('LAB-400', 'Missing required parameters', meta);
    }

    const depositId = await recordDepositToTreasurer(amountToDeposit, keterangan || '', verifiedBy || null, periodId, pondokId);
    return ok({ depositId }, meta);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return internalError('LAB-500', errorMessage, meta);
  }
}
