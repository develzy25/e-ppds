import { NextRequest } from 'next/server';
import { LaboratoriumService } from '@/modules/laboratorium/services/laboratorium.service';
import { uow } from '@/lib/database/unit-of-work';
import { ok, badRequest, internalError } from '@/shared/utils/api-response';
import { getRequestMeta } from '@/shared/utils/request-meta';

export async function POST(req: NextRequest) {
  const meta = await getRequestMeta();
  try {
    const { pondokId } = await req.json();

    if (!pondokId) {
      return badRequest('LAB-400', 'Missing required parameters', meta);
    }

    const service = new LaboratoriumService(uow);
    const affected = await service.handlePowerOutage(pondokId);
    return ok({ affected }, meta);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return internalError('LAB-500', errorMessage, meta);
  }
}
