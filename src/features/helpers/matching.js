import { prisma } from '@/lib/prisma';

/**
 * Helper matching algorithm based on subject expertise,
 * active availability, and peer reputation score.
 *
 * Matches subjects exactly (after trimming and case normalization)
 * to avoid false matches (e.g., "Math" matching "Mathematics").
 */
export async function matchHelpersForDoubt(doubtSubject) {
  const normalizedSubject = doubtSubject.trim();

  const helpers = await prisma.user.findMany({
    where: {
      role: 'HELPER',
      isAvailable: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      reputation: true,
      subjects: true,
      avatar: true,
    },
  });

  const normalizedHelpers = helpers.filter((helper) => {
    if (!helper.subjects) return false;
    const subjectList = helper.subjects.split(',').map((s) => s.trim().toLowerCase());
    return subjectList.includes(normalizedSubject.toLowerCase());
  });

  normalizedHelpers.sort((a, b) => b.reputation - a.reputation);

  return normalizedHelpers.slice(0, 5);
}
