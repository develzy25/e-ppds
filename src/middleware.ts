import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from './lib/utils/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'ppds-erp-fallback-secret-key-123456';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Extract token from cookie or Auth header
  let token = request.cookies.get('session_token')?.value;
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // Protect specific routes
  const isProtectedPath =
    path.startsWith('/keuangan') ||
    path.startsWith('/laboratorium') ||
    path.startsWith('/bump') ||
    path.startsWith('/dashboard') ||
    path.startsWith('/api/keuangan') ||
    path.startsWith('/api/lab') ||
    path.startsWith('/api/bump') ||
    path.startsWith('/api/dashboard');

  if (isProtectedPath) {
    if (!token) {
      if (path.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Session missing' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const payload = await verifyJwt(token, JWT_SECRET);
      if (!payload) {
        if (path.startsWith('/api')) {
          return NextResponse.json({ success: false, error: 'Unauthorized: Session invalid' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Inject details into headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId || '');
      requestHeaders.set('x-pondok-id', payload.pondokId || '');
      requestHeaders.set('x-period-id', payload.periodId || '');
      requestHeaders.set('x-user-permissions', JSON.stringify(payload.permissions || []));
      requestHeaders.set('x-session-version', String(payload.sessionVersion || 1));
      requestHeaders.set('x-permission-version', String(payload.permissionVersion || 1));

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Middleware JWT verify error:', error);
      if (path.startsWith('/api')) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Verification failed' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: [
    '/keuangan/:path*',
    '/laboratorium/:path*',
    '/bump/:path*',
    '/dashboard/:path*',
    '/api/keuangan/:path*',
    '/api/lab/:path*',
    '/api/bump/:path*',
    '/api/dashboard/:path*',
  ],
};
