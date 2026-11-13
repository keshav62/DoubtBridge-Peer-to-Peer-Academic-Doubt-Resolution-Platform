import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';

/**
 * Next.js Route Middleware — Authentication Guard
 * ─────────────────────────────────────────────────
 * Protects dashboard pages and API routes.
 * Uses iron-session to verify the signed session cookie server-side.
 */

function getSessionPassword() {
  const secret = process.env.SESSION_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (!secret || secret.length < 32 || secret.includes('changeme') || secret.includes('replace_this')) {
      throw new Error(
        'CRITICAL CONFIGURATION ERROR: SESSION_SECRET is unset or insecure in production middleware.'
      );
    }
    return secret;
  }

  return secret || 'development_fallback_secret_must_be_at_least_32_chars_long!';
}

const SESSION_OPTIONS = {
  cookieName: 'doubtbridge_session',
  get password() {
    return getSessionPassword();
  },
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  },
};

// Routes that do NOT require authentication
const PUBLIC_PATHS = ['/', '/login', '/register'];

// Path prefixes that are always public
const ALWAYS_PUBLIC_PREFIXES = [
  '/_next/',
  '/favicon',
  '/images/',
  '/public/',
  '/api/auth/',   // login, register, logout, me
  '/api/health/', // health check
];

function isPublicPath(pathname) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return ALWAYS_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function loginRedirect(request, pathname) {
  const url = new URL('/login', request.url);
  // Only preserve relative destinations
  if (pathname.startsWith('/') && pathname !== '/login') {
    url.searchParams.set('callbackUrl', pathname);
  }
  return NextResponse.redirect(url);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  try {
    // iron-session in middleware: pass the request cookies object
    const res = NextResponse.next();
    const session = await getIronSession(request.cookies, SESSION_OPTIONS);
    const userId = session?.userId;

    if (!userId) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Authentication required.' },
          { status: 401 }
        );
      }
      return loginRedirect(request, pathname);
    }

    return res;
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }
    return loginRedirect(request, pathname);
  }
}

export const config = {
  // Run on all paths except Next.js internals and static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
