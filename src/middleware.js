import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/sessionConfig';

/**
 * Next.js Route Middleware — Unified Authentication & RBAC Guard
 * ─────────────────────────────────────────────────────────────
 * Protects dashboard pages, role-specific views, and authenticated APIs.
 * Uses iron-session to verify the encrypted cookie server-side.
 */

// Routes that do NOT require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Path prefixes that are always public
const ALWAYS_PUBLIC_PREFIXES = [
  '/_next/',
  '/favicon',
  '/images/',
  '/public/',
  '/api/auth/',   // login, register, logout, me, forgot-password, reset-password
  '/api/health/', // health check
];

function isPublicPath(pathname) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return ALWAYS_PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getRoleDashboard(role) {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'MODERATOR':
      return '/admin/moderation';
    case 'HELPER':
      return '/helper';
    case 'STUDENT':
    default:
      return '/dashboard';
  }
}

function loginRedirect(request, pathname, errorReason) {
  const url = new URL('/login', request.url);
  if (pathname.startsWith('/') && pathname !== '/login') {
    url.searchParams.set('callbackUrl', pathname);
  }
  if (errorReason) {
    url.searchParams.set('error', errorReason);
  }
  return NextResponse.redirect(url);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  try {
    const res = NextResponse.next();
    const session = await getIronSession(request.cookies, sessionOptions);
    const userId = session?.userId;
    const isActive = session?.isActive;
    const role = session?.role;
    const isAuthenticated = Boolean(userId && isActive !== false);

    // 1. If authenticated user visits login, register, or forgot-password,
    // redirect them to their respective role dashboard.
    if (isAuthenticated && (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password')) {
      const redirectUrl = new URL(getRoleDashboard(role), request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // 2. Allow access to public routes
    if (isPublicPath(pathname)) {
      return res;
    }

    // 3. Unauthenticated or suspended user checks
    if (!isAuthenticated) {
      const isSuspended = Boolean(userId && isActive === false);
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            success: false,
            error: isSuspended ? 'Account suspended.' : 'Authentication required.',
          },
          { status: isSuspended ? 403 : 401 }
        );
      }
      return loginRedirect(request, pathname, isSuspended ? 'AccountSuspended' : null);
    }

    // 4. Role-based Route Protection
    // A. Admin & Moderation Routes (/admin and /admin/...)
    if (pathname.startsWith('/admin')) {
      // Sensitive management areas strictly reserved for full ADMINs
      const isSuperAdminOnly =
        pathname.startsWith('/admin/users') || pathname.startsWith('/admin/audit-logs');

      if (isSuperAdminOnly && role !== 'ADMIN') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { success: false, error: 'Administrator access required.' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      // General /admin & moderation paths allow ADMIN or MODERATOR
      if (role !== 'ADMIN' && role !== 'MODERATOR') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { success: false, error: 'Administrative privileges required.' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
      }
    }

    // B. Helper-specific route protection (/helper and /helper/...)
    if (pathname.startsWith('/helper')) {
      if (role !== 'HELPER' && role !== 'ADMIN') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { success: false, error: 'Helper privileges required.' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
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
