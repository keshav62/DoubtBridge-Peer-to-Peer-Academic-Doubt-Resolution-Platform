import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { logAuthError } from '@/lib/diagnostics';

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(100, 'Full name cannot exceed 100 characters.')
    .optional(),
  department: z.string().trim().max(100).nullable().optional(),
  academicYear: z.string().trim().max(50).nullable().optional(),
  avatarUrl: z.string().trim().nullable().optional(),
  avatar: z.string().trim().nullable().optional(),
  bio: z.string().trim().max(500, 'Bio cannot exceed 500 characters.').nullable().optional(),
  subjects: z.union([z.string(), z.array(z.string())]).optional(),
  isAvailable: z.boolean().optional(),
});

/**
 * Format user database record into safe profile structure (never exposing passwordHash).
 */
function formatSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    reputation: user.reputation,
    avatar: user.avatar,
    avatarUrl: user.avatarUrl,
    department: user.department,
    academicYear: user.academicYear,
    subjects: user.subjects || user.helperProfile?.subjects || '',
    bio: user.helperProfile?.bio || null,
    expertise: user.helperProfile?.expertise || null,
    isAvailable: user.isAvailable ?? user.helperProfile?.isAvailable ?? true,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    helperProfile: user.helperProfile || null,
  };
}

export async function GET() {
  try {
    const session = await getSession();
    const userId = session?.userId;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Not authenticated.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        reputation: true,
        avatar: true,
        avatarUrl: true,
        department: true,
        academicYear: true,
        subjects: true,
        isAvailable: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        helperProfile: {
          select: {
            bio: true,
            expertise: true,
            subjects: true,
            reputation: true,
            totalAnswers: true,
            acceptedAnswers: true,
            isAvailable: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User account not found.' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account suspended.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: formatSafeUser(user),
    });
  } catch (error) {
    const correlationId = logAuthError({ route: '/api/auth/me [GET]', error });
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve user profile.', correlationId },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    const userId = session?.userId;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Not authenticated.' },
        { status: 401 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User account not found.' },
        { status: 404 }
      );
    }

    if (!existingUser.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account suspended.' },
        { status: 403 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || 'Invalid profile data.',
          errors: validation.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Prepare User fields
    const userUpdate = {};
    if (data.name !== undefined) userUpdate.name = data.name;
    if (data.department !== undefined) userUpdate.department = data.department;
    if (data.academicYear !== undefined) userUpdate.academicYear = data.academicYear;
    if (data.avatarUrl !== undefined) {
      userUpdate.avatarUrl = data.avatarUrl;
      userUpdate.avatar = data.avatarUrl;
    } else if (data.avatar !== undefined) {
      userUpdate.avatar = data.avatar;
      userUpdate.avatarUrl = data.avatar;
    }
    if (data.isAvailable !== undefined) userUpdate.isAvailable = data.isAvailable;
    if (data.subjects !== undefined) {
      userUpdate.subjects = Array.isArray(data.subjects)
        ? data.subjects.filter(Boolean).join(', ')
        : data.subjects;
    }

    // Atomic transaction for User and HelperProfile
    const updatedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: userId },
        data: userUpdate,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          reputation: true,
          avatar: true,
          avatarUrl: true,
          department: true,
          academicYear: true,
          subjects: true,
          isAvailable: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          helperProfile: {
            select: {
              bio: true,
              expertise: true,
              subjects: true,
              reputation: true,
              totalAnswers: true,
              acceptedAnswers: true,
              isAvailable: true,
            },
          },
        },
      });

      // Update or upsert HelperProfile if bio, subjects, or availability were provided
      const helperNeedsUpdate =
        data.bio !== undefined ||
        data.subjects !== undefined ||
        data.isAvailable !== undefined ||
        existingUser.role === 'HELPER';

      if (helperNeedsUpdate) {
        const subjectsString =
          data.subjects !== undefined
            ? Array.isArray(data.subjects)
              ? data.subjects.filter(Boolean).join(', ')
              : data.subjects
            : undefined;

        const hp = await tx.helperProfile.upsert({
          where: { userId },
          create: {
            userId,
            bio: data.bio ?? null,
            subjects: subjectsString ?? u.subjects ?? null,
            isAvailable: data.isAvailable ?? u.isAvailable ?? true,
          },
          update: {
            ...(data.bio !== undefined && { bio: data.bio }),
            ...(subjectsString !== undefined && { subjects: subjectsString }),
            ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
          },
          select: {
            bio: true,
            expertise: true,
            subjects: true,
            reputation: true,
            totalAnswers: true,
            acceptedAnswers: true,
            isAvailable: true,
          },
        });

        u.helperProfile = hp;
      }

      return u;
    });

    // Update active session cookie if name changed
    if (data.name && session) {
      session.name = data.name;
      await session.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: formatSafeUser(updatedUser),
    });
  } catch (error) {
    const correlationId = logAuthError({ route: '/api/auth/me [PUT]', error });
    return NextResponse.json(
      { success: false, error: 'Failed to update profile.', correlationId },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  return PUT(request);
}
