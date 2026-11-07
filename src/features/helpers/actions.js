import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { canManageHelperProfile } from '@/lib/permissions';

export async function toggleHelperAvailability() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  if (!canManageHelperProfile(user)) throw new Error('Forbidden: Only helpers can manage their profile');

  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isAvailable: true },
  });

  if (!current) throw new Error('User not found');

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { isAvailable: !current.isAvailable },
    select: {
      id: true,
      name: true,
      isAvailable: true,
    },
  });

  return { success: true, isAvailable: updated.isAvailable };
}

export async function updateHelperSubjects(subjectsList) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  if (!canManageHelperProfile(user)) throw new Error('Forbidden: Only helpers can manage their profile');

  if (!Array.isArray(subjectsList)) {
    throw new Error('Subjects must be an array');
  }

  if (subjectsList.length === 0) {
    throw new Error('At least one subject is required');
  }

  const validSubjects = [];
  const normalizedSet = new Set();

  for (const subject of subjectsList) {
    if (typeof subject !== 'string') {
      throw new Error('Each subject must be a string');
    }
    const trimmed = subject.trim();
    if (trimmed.length === 0) {
      throw new Error('Subjects cannot be empty strings');
    }
    const normalized = trimmed.toLowerCase();
    if (normalizedSet.has(normalized)) {
      throw new Error('Duplicate subject detected');
    }
    normalizedSet.add(normalized);
    validSubjects.push(trimmed);
  }

  const formatted = validSubjects.join(',');

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { subjects: formatted },
    select: {
      id: true,
      name: true,
      subjects: true,
    },
  });

  return { success: true, user: updated };
}
