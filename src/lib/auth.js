import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * Authentication helpers and session resolution.
 * In development, returns the active user session or defaults to the seeded student user.
 * Supports the `x-user-id` request header for role testing (Admin, Moderator, Helper, Student).
 */
export async function getCurrentUser() {
  try {
    const headersList = await headers();
    const impersonatedId = headersList.get('x-user-id');

    if (impersonatedId) {
      const user = await prisma.user.findUnique({
        where: { id: impersonatedId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          reputation: true,
          avatar: true,
          avatarUrl: true,
          department: true,
        },
      });
      if (user) return user;
    }
  } catch {
    // headers() throws if called outside a Next.js server request context (e.g. background script)
  }

  // Development fallback user from the seeded database
  return {
    id: 'seed-user-student-1',
    name: 'Alex Rivera',
    email: 'student1@example.com',
    role: 'STUDENT',
    reputation: 150,
  };
}

export function isAuthenticated(user) {
  return Boolean(user && user.id);
}
