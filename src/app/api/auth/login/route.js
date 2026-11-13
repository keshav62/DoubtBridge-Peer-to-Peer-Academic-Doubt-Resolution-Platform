import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Login rate limit: 10 attempts per IP per 15 minutes (brute-force protection)
const LOGIN_MAX = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

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

    const { email, password } = body ?? {};

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

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
        { success: false, error: 'Your account has been deactivated. Please contact support.' },
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
    await session.save();

    // Strip passwordHash before returning
    const { passwordHash: _pw, ...safeUser } = user;

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
