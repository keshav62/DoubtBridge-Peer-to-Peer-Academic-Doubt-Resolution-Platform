
import { prisma } from '@/lib/prisma';

// Common data included with every doubt
const doubtIncludes = {
  student: {
    select: { id: true, name: true, reputation: true, avatar: true },
  },
  helper: {
    select: { id: true, name: true, reputation: true, avatar: true },
  },
  _count: {
    select: { answers: true },
  },
};

// Get doubts with search, filters and pagination
export async function getDoubts({
  studentId,
  status,
  subject,
  search,
  sort,
  limit = 20,
  offset = 0,
} = {}) {
  const where = {};

  if (studentId) where.studentId = studentId;
  if (status) where.status = status;
  if (subject) where.subject = { contains: subject, mode: 'insensitive' };

  // Search in title, description and tags
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Set safe pagination values
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  // Determine sort order
  let orderBy = { createdAt: 'desc' };
  if (sort === 'oldest') {
    orderBy = { createdAt: 'asc' };
  } else if (sort === 'urgency') {
    orderBy = [{ urgency: 'desc' }, { createdAt: 'desc' }];
  }

  // Get doubts and total count together
  const [doubts, total] = await Promise.all([
    prisma.doubt.findMany({
      where,
      include: doubtIncludes,
      orderBy,
      take: safeLimit,
      skip: safeOffset,
    }),
    prisma.doubt.count({ where }),
  ]);

  return {
    doubts,
    total,
    limit: safeLimit,
    offset: safeOffset,
  };
}

// Get one doubt with its answers and visibility moderation rules
export async function getDoubtById(doubtId, currentUser = null) {
  if (!doubtId || typeof doubtId !== 'string') return null;

  const doubt = await prisma.doubt.findUnique({
    where: { id: doubtId },
    include: {
      ...doubtIncludes,
      answers: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
              reputation: true,
              avatar: true,
              avatarUrl: true,
              department: true,
            },
          },
          reviews: {
            select: {
              id: true,
              decision: true,
              feedback: true,
              reviewedAt: true,
              reviewer: {
                select: { id: true, name: true, role: true },
              },
            },
            orderBy: { reviewedAt: 'desc' },
          },
        },
        orderBy: [
          { isAccepted: 'desc' },
          { upvotes: 'desc' },
          { createdAt: 'asc' },
        ],
      },
    },
  });

  if (!doubt) return null;

  // Answer moderation visibility filtering
  const isModeratorOrAdmin =
    currentUser && (currentUser.role === 'MODERATOR' || currentUser.role === 'ADMIN');
  const isDoubtOwner = currentUser && currentUser.id === doubt.studentId;

  doubt.answers = doubt.answers.filter((ans) => {
    // 1. Approved answers are visible to all users
    if (ans.status === 'APPROVED') return true;

    // 2. Moderators and admins see all answers (to review pending/rejected)
    if (isModeratorOrAdmin) return true;

    // 3. Authors see their own answer regardless of moderation state
    if (currentUser && ans.authorId === currentUser.id) return true;

    // 4. Doubt owners see pending answers (so they know an answer arrived)
    if (isDoubtOwner && ans.status === 'PENDING') return true;

    // By default, hide unapproved answers
    return false;
  });

  return doubt;
}

// Create a new doubt
export async function createDoubtRecord(data, studentId) {
  return prisma.doubt.create({
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      subject: data.subject.trim(),
      tags: typeof data.tags === 'string' ? data.tags.trim() : '',
      urgency: data.urgency || 'MEDIUM',
      studentId,
    },
    include: doubtIncludes,
  });
}

// Update a doubt only if the user owns it and it is OPEN
export async function updateDoubtRecord(doubtId, studentId, data) {
  const allowedFields = ['title', 'description', 'subject', 'tags', 'urgency'];
  const updateData = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] =
        typeof data[field] === 'string'
          ? data[field].trim()
          : data[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return null;
  }

  const result = await prisma.doubt.updateMany({
    where: {
      id: doubtId,
      studentId,
      status: 'OPEN',
    },
    data: updateData,
  });

  if (result.count === 0) return null;

  return getDoubtById(doubtId);
}

// Delete a doubt only if the user owns it and it is OPEN
export async function deleteDoubtRecord(doubtId, studentId) {
  const result = await prisma.doubt.deleteMany({
    where: {
      id: doubtId,
      studentId,
      status: 'OPEN',
    },
  });

  return result.count > 0;
}

// Claim a doubt using an atomic update
export async function claimDoubtRecord(doubtId, helperId) {
  const result = await prisma.doubt.updateMany({
    where: {
      id: doubtId,
      status: 'OPEN',
      helperId: null,
    },
    data: {
      helperId,
      status: 'CLAIMED',
    },
  });

  if (result.count === 0) return null;

  return getDoubtById(doubtId);
}

// Resolve a doubt
export async function resolveDoubtRecord(doubtId) {
  return prisma.doubt.update({
    where: { id: doubtId },
    data: { status: 'RESOLVED' },
  });
}
