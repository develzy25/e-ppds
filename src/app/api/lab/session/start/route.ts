import { NextRequest } from 'next/server';
import { LaboratoriumService } from '@/modules/laboratorium/services/laboratorium.service';
import { uow } from '@/lib/database/unit-of-work';
import { ok, badRequest, internalError } from '@/shared/utils/api-response';
import { getRequestMeta } from '@/shared/utils/request-meta';

export async function POST(req: NextRequest) {
  const meta = await getRequestMeta();
  try {
    const { clientId, santriId, tarifId, periodId, pondokId } = await req.json();

    if (!clientId || !tarifId || !periodId || !pondokId) {
      return badRequest('LAB-400', 'Missing required parameters', meta);
    }

    const service = new LaboratoriumService(uow);
    const sessionId = await service.startBillingSession(clientId, santriId, tarifId);
    return ok({ sessionId }, meta);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return internalError('LAB-500', errorMessage, meta);
  }
}
