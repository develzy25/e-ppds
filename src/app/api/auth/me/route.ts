import { NextRequest } from 'next/server';
import { validateSession } from '@/lib/services/auth';
import { cookies } from 'next/headers';
import { ok, unauthorized, internalError } from '@/shared/utils/api-response';
import { getRequestMeta } from '@/shared/utils/request-meta';
import { db } from '@/db';
import { pondoks } from '@/modules/core/schemas/core.schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const meta = await getRequestMeta();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return unauthorized('AUTH-401', 'Tidak diizinkan, session tidak ditemukan', meta);
    }

    const userData = await validateSession(token);

    if (!userData) {
      return unauthorized('AUTH-401', 'Sesi tidak valid atau telah kedaluwarsa', meta);
    }

    // Ambil detail pondok
    const pondokResult = await db.select().from(pondoks).where(eq(pondoks.id, userData.pondokId)).limit(1);
    const pondokProfile = pondokResult.length > 0 ? pondokResult[0] : null;

    return ok({ user: userData, pondok: pondokProfile }, { ...meta, cache: 'HIT' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return internalError('AUTH-500', errorMessage, meta);
  }
}
