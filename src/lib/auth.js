import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

/**
 * Resolves the authenticated user from the iron-session cookie.
 *
 * Returns the full User record (minus passwordHash) or null.
 * Never falls back to a hardcoded user — if no valid session exists
 * the caller receives null and must return 401.
 *
 * Usage: const user = await getCurrentUser();
 */
export async function getCurrentUser() {
  try {
    const session = await getSession();
    const userId = session?.userId;

    if (!userId || typeof userId !== 'string') {
      return null;
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
        // passwordHash is intentionally excluded
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    // Merge helperProfile fields into top-level user object for clean client usage
    const safeUser = {
      ...user,
      bio: user.helperProfile?.bio || null,
      expertise: user.helperProfile?.expertise || null,
      subjects: user.subjects || user.helperProfile?.subjects || '',
      isAvailable: user.isAvailable ?? user.helperProfile?.isAvailable ?? true,
    };

    return safeUser;
  } catch {
    return null;
  }
}

/**
 * Convenience: Returns getCurrentUser() result.
 * Legacy alias used by existing API route files.
 */
export async function resolveSessionUser() {
  return getCurrentUser();
}

/**
 * Returns true when the passed user object is a real authenticated user.
 */
export function isAuthenticated(user) {
  return Boolean(user && user.id);
}
