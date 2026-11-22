import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { logAuthError } from '@/lib/diagnostics';
import { ROLES } from '@/lib/permissions';

// Login rate limit: 10 attempts per IP per 15 minutes (brute-force protection)
const LOGIN_MAX = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// Login validation schema with Zod
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .email('Please enter a valid email address.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

function getRoleRedirect(role) {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin';
    case ROLES.MODERATOR:
      return '/admin/moderation';
    case ROLES.HELPER:
      return '/helper';
    case ROLES.STUDENT:
    default:
      return '/dashboard';
  }
}

export async function POST(request) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────────
    const ip = getClientIp(request);
    if (!rateLimit('login', ip, LOGIN_MAX, LOGIN_WINDOW_MS)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please wait and try again.' },
        { status: 429 }
      );
    }

    // ── Parse body ─────────────────────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
    }

    // ── Validate with Zod ──────────────────────────────────────────────────────
    const validation = loginSchema.safeParse(body ?? {});
    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Email and password are required.';
      return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
    }

    const { email, password } = validation.data;
    const cleanEmail = email.toLowerCase();

    // ── Lookup user ────────────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        reputation: true,
        passwordHash: true,
        isActive: true,
        suspensionReason: true,
        department: true,
        academicYear: true,
        avatar: true,
        avatarUrl: true,
      },
    });

    // Generic error — do not reveal whether the email exists
    const INVALID_MSG = 'Invalid email or password.';

    if (!user || !user.passwordHash) {
      // Constant-time dummy compare to prevent timing attacks
      await bcrypt.compare(password, '$2a$12$dummyhashthatisnevermatched00000000000000000');
      return NextResponse.json({ success: false, error: INVALID_MSG }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: `Your account has been deactivated or suspended.${user.suspensionReason ? ` Reason: ${user.suspensionReason}` : ' Please contact administration.'}`,
          reason: user.suspensionReason || 'Account suspended',
        },
        { status: 403 }
      );
    }

    // ── Verify password ────────────────────────────────────────────────────────
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: INVALID_MSG }, { status: 401 });
    }

    // ── Create session ─────────────────────────────────────────────────────────
    const session = await getSession();
    session.userId = user.id;
    session.role = user.role;
    session.isActive = user.isActive;
    await session.save();

    // Strip passwordHash before returning
    const { passwordHash: _pw, ...safeUser } = user;
    const redirectUrl = getRoleRedirect(user.role);

    return NextResponse.json({
      success: true,
      user: safeUser,
      redirectUrl,
    });
  } catch (error) {
    const correlationId = logAuthError({ route: '/api/auth/login', error });
    return NextResponse.json(
      {
        success: false,
        error: 'Login failed. Please try again.',
        correlationId,
      },
      { status: 500 }
    );
  }
}
