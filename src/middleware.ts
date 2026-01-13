import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PW_COOKIE = process.env.PASSWORD_COOKIE_NAME || 'pw_gate';
const ORG_COOKIE = 'organizer_session';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow: Next internals, favicon, and auth/login pages + endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/password') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/password') ||
    pathname.startsWith('/api/login')
  ) {
    return NextResponse.next();
  }

  // 1) Password gate for /admin (and everything under it if you want)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const pw = req.cookies.get(PW_COOKIE)?.value;

    if (pw === 'ok') {
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = '/password';
    url.searchParams.set('next', pathname + (req.nextUrl.search || ''));
    return NextResponse.redirect(url);
  }

  // 2) Organizer gate for /organizer (and everything under it)
  if (pathname === '/organize' || pathname.startsWith('/organize/')) {
    const org = req.cookies.get(ORG_COOKIE)?.value;

    if (org) {
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname + (req.nextUrl.search || ''));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // password-protected admin area
    '/admin/:path*',

    // organizer-protected area
    '/organize/:path*',
  ],
};
