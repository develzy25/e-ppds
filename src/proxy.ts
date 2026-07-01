import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Daftar route yang tidak memerlukan autentikasi
const publicRoutes = ['/login', '/'];
const publicApiPrefixes = ['/api/auth/login']; // Endpoint yang boleh diakses publik

export function proxy(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;

  // Izinkan request ke file statis Next.js atau API yang tidak perlu diproteksi middleware (terlindungi di dalam endpoint route)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/manifest.json')
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(pathname);
  const isPublicApi = publicApiPrefixes.some(prefix => pathname.startsWith(prefix));

  if (!token && !isPublicRoute && !isPublicApi) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, code: 'AUTH-401', message: 'Unauthorized' }, { status: 401 });
    }
    // Redirect ke login jika mencoba mengakses halaman terproteksi tanpa session_token
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && pathname === '/login') {
    // Redirect ke dashboard jika sudah login namun mencoba mengakses halaman login
    return NextResponse.redirect(new URL('/dashboard/personal', request.url));
  }

  const response = NextResponse.next();
  // Basic security headers
  const headers = response.headers;
  headers.set('X-DNS-Prefetch-Control', 'on');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth/login (public API endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
