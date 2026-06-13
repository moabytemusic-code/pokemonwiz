import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { SessionData } from '@/lib/auth';

const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET || 'change-this-to-a-secure-random-string-at-least-32-chars',
  cookieName: 'pokemon-wiz-session',
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Protect all admin routes
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname === '/') {
    const session = await getIronSession<SessionData>(req, res, SESSION_OPTIONS);
    if (!session.isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Redirect logged-in users away from login page
  if (req.nextUrl.pathname === '/login') {
    const session = await getIronSession<SessionData>(req, res, SESSION_OPTIONS);
    if (session.isLoggedIn) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/', '/admin/:path*', '/login'],
};
