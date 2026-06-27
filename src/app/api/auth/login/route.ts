import { NextRequest } from 'next/server';
import { loginUserByPin } from '@/lib/services/auth';
import { cookies } from 'next/headers';
import { ok, badRequest, unauthorized, internalError } from '@/shared/utils/api-response';
import { getRequestMeta } from '@/shared/utils/request-meta';

// Simple in-memory IP rate limiter for brute-force protection
const rateLimit = new Map<string, { count: number, resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimit.get(ip);
  
  if (record && record.resetTime > now) {
    if (record.count >= 5) {
      return { allowed: false, remaining: Math.ceil((record.resetTime - now) / 60000) };
    }
    record.count++;
    return { allowed: true, remaining: 5 - record.count };
  } else {
    rateLimit.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 }); // 15 mins block
    return { allowed: true, remaining: 4 };
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const meta = await getRequestMeta();
  const rate = checkRateLimit(ip);

  if (!rate.allowed) {
    return unauthorized(
      'AUTH-429',
      `Terlalu banyak percobaan login gagal dari IP Anda. Coba lagi dalam ${rate.remaining} menit.`,
      meta
    );
  }

  try {
    const body = await req.json();
    const { pin, pondokId = 'pon-1' } = body;

    if (!pin) {
      return badRequest('AUTH-400', 'PIN 6-digit wajib diisi', meta);
    }

    const userAgent = req.headers.get('user-agent') || 'unknown';
    const authResult = await loginUserByPin(pin, pondokId, userAgent, ip);

    if (!authResult.success || !authResult.token) {
      const code = authResult.code || 'AUTH-401';
      return unauthorized(code, authResult.error || 'PIN yang dimasukkan salah.', meta);
    }

    // Set HttpOnly secure session cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours (1 day)
      path: '/',
    });

    return ok({ token: authResult.token }, meta);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return internalError('AUTH-500', errorMessage, meta);
  }
}
