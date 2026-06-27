import { NextRequest } from 'next/server';
import { logoutUser, validateSession, logSecurityEvent } from '@/lib/services/auth';
import { cookies } from 'next/headers';
import { ok, internalError } from '@/shared/utils/api-response';
import { getRequestMeta } from '@/shared/utils/request-meta';

export async function POST(req: NextRequest) {
  const meta = await getRequestMeta();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (token) {
      const user = await validateSession(token);
      if (user) {
        const userAgent = req.headers.get('user-agent') || 'unknown';
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        
        // Log logout audit log
        await logSecurityEvent({
          userId: user.userId,
          action: 'LOGOUT',
          remarks: `User: ${user.name} logged out. IP: ${ip}`,
          userAgent,
          ipAddress: ip,
        });
      }
      
      await logoutUser(token);
    }

    // Delete session cookie
    cookieStore.delete('session_token');

    return ok({ message: 'Logout berhasil' }, meta);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return internalError('AUTH-500', errorMessage, meta);
  }
}
