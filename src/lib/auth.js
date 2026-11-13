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
      where: { id: userId, isActive: true },
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
        isAvailable: true,
        isActive: true,
        createdAt: true,
        // passwordHash is intentionally excluded
      },
    });

    return user ?? null;
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
