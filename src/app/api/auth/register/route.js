import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { sanitisePublicRole, ROLES } from '@/lib/permissions';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { logAuthError } from '@/lib/diagnostics';

// Registration rate limit: 5 registrations per IP per 15 minutes
const REGISTER_MAX = 5;
const REGISTER_WINDOW_MS = 15 * 60 * 1000;

// Registration validation schema with Zod
const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Full name is required.' })
      .trim()
      .min(2, 'Name must be at least 2 characters.')
      .max(100, 'Name cannot exceed 100 characters.'),
    email: z
      .string({ required_error: 'Email address is required.' })
      .trim()
      .email('A valid academic email address is required.')
      .max(255, 'Email cannot exceed 255 characters.'),
    password: z
      .string({ required_error: 'Password is required.' })
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password cannot exceed 128 characters.')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.'),
    confirmPassword: z.string().optional(),
    role: z.enum(['STUDENT', 'HELPER', 'MODERATOR', 'ADMIN']).optional(),
    department: z.string().trim().max(100).optional().nullable(),
    academicYear: z.string().trim().max(50).optional().nullable(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

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

    // ── Validate with Zod ──────────────────────────────────────────────────────
    const validation = registerSchema.safeParse(body ?? {});
    if (!validation.success) {
      const errorMessages = validation.error.issues.map((issue) => issue.message);
      return NextResponse.json({ success: false, errors: errorMessages }, { status: 400 });
    }

    const { name, email, password, role: rawRole, department, academicYear } = validation.data;

    const cleanEmail = email.toLowerCase();
    const cleanName = name;

    // ── Duplicate email check ──────────────────────────────────────────────────
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this email already exists.',
          errors: ['An account with this email already exists.'],
        },
        { status: 409 }
      );
    }

    // ── Hash password ──────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    // ── Sanitise role (Never allow public registration of ADMIN/MODERATOR) ────
    const role = sanitisePublicRole(rawRole);

    // ── Create user and helper profile inside transaction ──────────────────────
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          passwordHash,
          role,
          department: department || null,
          academicYear: academicYear || null,
          isActive: true,
          isAvailable: true,
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

      // If user registered as HELPER, provision their initial HelperProfile
      if (role === ROLES.HELPER) {
        await tx.helperProfile.create({
          data: {
            userId: createdUser.id,
            isAvailable: true,
            subjects: department || 'General',
          },
        });
      }

      return createdUser;
    });

    // ── Create session ─────────────────────────────────────────────────────────
    const session = await getSession();
    session.userId = user.id;
    session.role = user.role;
    session.isActive = true;
    await session.save();

    const redirectUrl = user.role === ROLES.HELPER ? '/helper' : '/dashboard';

    return NextResponse.json(
      {
        success: true,
        user,
        redirectUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, errors: ['An account with this email already exists.'] },
        { status: 409 }
      );
    }

    const correlationId = logAuthError({ route: '/api/auth/register', error });
    return NextResponse.json(
      {
        success: false,
        error: 'Registration failed. Please try again.',
        correlationId,
      },
      { status: 500 }
    );
  }
}
