import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { sanitisePublicRole } from '@/lib/permissions';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Registration rate limit: 5 registrations per IP per 15 minutes
const REGISTER_MAX = 5;
const REGISTER_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request) {
  try {
    // ── Rate limiting ──────────────────────────────────────────────────────────
    const ip = getClientIp(request);
    if (!rateLimit('register', ip, REGISTER_MAX, REGISTER_WINDOW_MS)) {
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Please try again later.' },
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

    const { name, email, password, role: rawRole, department, academicYear } = body ?? {};

    // ── Input validation ───────────────────────────────────────────────────────
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters.');
    }
    if (name && name.trim().length > 100) {
      errors.push('Name cannot exceed 100 characters.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      errors.push('A valid email address is required.');
    }

    if (!password || typeof password !== 'string') {
      errors.push('Password is required.');
    } else {
      if (password.length < 8) errors.push('Password must be at least 8 characters.');
      if (password.length > 128) errors.push('Password cannot exceed 128 characters.');
      if (!/[A-Za-z]/.test(password)) errors.push('Password must contain at least one letter.');
      if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number.');
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // ── Duplicate email check ──────────────────────────────────────────────────
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail }, select: { id: true } });
    if (existing) {
      return NextResponse.json(
        { success: false, errors: ['An account with this email already exists.'] },
        { status: 409 }
      );
    }

    // ── Hash password ──────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    // ── Sanitise role (never allow ADMIN/MODERATOR via registration) ───────────
    const role = sanitisePublicRole(rawRole);

    // ── Create user ────────────────────────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        role,
        department: department?.trim() || null,
        academicYear: academicYear?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        reputation: true,
        department: true,
        academicYear: true,
        createdAt: true,
      },
    });

    // ── Create session ─────────────────────────────────────────────────────────
    const session = await getSession();
    session.userId = user.id;
    await session.save();

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
