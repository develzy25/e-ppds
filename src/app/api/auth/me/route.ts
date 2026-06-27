import { NextRequest } from 'next/server';
import { validateSession } from '@/lib/services/auth';
import { cookies } from 'next/headers';
import { ok, unauthorized, internalError } from '@/shared/utils/api-response';
import { getRequestMeta } from '@/shared/utils/request-meta';

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

    return ok({ user: userData }, { ...meta, cache: 'HIT' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return internalError('AUTH-500', errorMessage, meta);
  }
}
