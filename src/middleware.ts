import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PW_COOKIE = 'pw_gate';
const ORG_COOKIE = 'organizer_session';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
  matcher: ['/admin/:path*', '/organize/:path*'],
};
