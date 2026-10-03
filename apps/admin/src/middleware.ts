import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from './lib/admin-session';

const PUBLIC_PREFIXES = ['/login', '/api/admin/auth'];

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function nextWithPathname(request: NextRequest, pathname: string) {
  const requestHeaders = new Headers(request.headers);
  // Must be on the *request* so RootLayout's headers() can see /login and skip /auth/me.
  requestHeaders.set('x-middleware-pathname', pathname);
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set('x-middleware-pathname', pathname);
  return res;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (isPublicPath(pathname)) {
    return nextWithPathname(request, pathname);
  }

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: { message: 'Not authenticated. Sign in again, then retry.' } },
        { status: 401 },
      );
    }
    const login = new URL('/login', request.url);
    const path = pathname + request.nextUrl.search;
    if (path && path !== '/') login.searchParams.set('returnTo', path);
    // 303 so a form POST is not replayed onto /login as a Server Action.
    return NextResponse.redirect(login, 303);
  }

  return nextWithPathname(request, pathname);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
