import { prisma } from '@/lib/prisma';
import {
  notifyDoubtClaimed,
  notifyAssignmentCancelled,
  notifyAssignmentCompleted,
} from '@/features/notifications/service';
import { WORKLOAD_LIMIT } from './matching';
import { validateHelperProfileInput, validateAssignmentAction } from './validation';

/**
 * Retrieves the helper profile and assignment statistics for a user.
 */
export async function getHelperProfile(userId) {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      avatarUrl: true,
      department: true,
      academicYear: true,
      reputation: true,
      isAvailable: true,
      subjects: true,
      helperProfile: true,
    },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  const [activeAssignmentsCount, completedAssignmentsCount, totalAnswers, acceptedAnswers] =
    await Promise.all([
      prisma.doubtAssignment.count({
        where: { helperId: userId, status: 'ACTIVE' },
      }),
      prisma.doubtAssignment.count({
        where: { helperId: userId, status: 'COMPLETED' },
      }),
      prisma.answer.count({
        where: { authorId: userId },
      }),
      prisma.answer.count({
        where: { authorId: userId, isAccepted: true },
      }),
    ]);

  const hasProfile = Boolean(user.helperProfile);
  const isAvailable = user.helperProfile
    ? user.helperProfile.isAvailable
    : user.isAvailable;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatarUrl || user.avatar,
      department: user.department,
      academicYear: user.academicYear,
      reputation: user.reputation,
    },
    profile: user.helperProfile || null,
    hasProfile,
    isAvailable,
    subjects: user.helperProfile?.subjects || user.subjects || '',
    expertise: user.helperProfile?.expertise || '',
    bio: user.helperProfile?.bio || '',
    stats: {
      reputation: user.reputation,
      activeAssignmentsCount,
      completedAssignmentsCount,
      totalAnswers,
      acceptedAnswers,
      workloadLimit: WORKLOAD_LIMIT,
      isAtWorkloadLimit: activeAssignmentsCount >= WORKLOAD_LIMIT,
    },
  };
}

/**
 * Creates or updates the helper profile for the authenticated user.
 * If a STUDENT activates a helper profile, their role is upgraded to HELPER.
 */
export async function updateHelperProfile(user, rawData) {
  if (!user || !user.id) {
    throw new Error('Authenticated user context is required.');
  }

  const validation = validateHelperProfileInput(rawData);
  if (!validation.isValid) {
    const errorMsg = Object.values(validation.errors).join(' ');
    throw new Error(errorMsg || 'Invalid profile input.');
  }

  const { bio, subjects, expertise, isAvailable } = validation.data;

  return prisma.$transaction(
    async (tx) => {
      // 1. If user is STUDENT and is setting up helper profile, upgrade role to HELPER
      const updateUserData = {};
      if (user.role === 'STUDENT') {
        updateUserData.role = 'HELPER';
      }
      if (subjects !== undefined) {
        updateUserData.subjects = subjects;
      }
      if (isAvailable !== undefined) {
        updateUserData.isAvailable = isAvailable;
      }

      if (Object.keys(updateUserData).length > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: updateUserData,
        });
      }

      // 2. Upsert HelperProfile
      const helperProfile = await tx.helperProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          bio: bio || '',
          subjects: subjects || '',
          expertise: expertise || '',
          isAvailable: isAvailable !== undefined ? isAvailable : true,
          reputation: user.reputation || 0,
        },
        update: {
          ...(bio !== undefined ? { bio } : {}),
          ...(subjects !== undefined ? { subjects } : {}),
          ...(expertise !== undefined ? { expertise } : {}),
          ...(isAvailable !== undefined ? { isAvailable } : {}),
        },
      });

      return helperProfile;
    },
    { maxWait: 10000, timeout: 20000 }
  );
}

/**
 * Toggles availability between available and paused.
 */
export async function toggleHelperAvailability(user) {
  if (!user || !user.id) {
    throw new Error('Authenticated user context is required.');
  }

  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isAvailable: true, helperProfile: { select: { isAvailable: true } } },
  });

  const nextState = current?.helperProfile
    ? !current.helperProfile.isAvailable
    : !current?.isAvailable;

  await prisma.$transaction(
    async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { isAvailable: nextState },
      });

      await tx.helperProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          isAvailable: nextState,
        },
        update: {
          isAvailable: nextState,
        },
      });
    },
    { maxWait: 10000, timeout: 20000 }
  );

  return { isAvailable: nextState };
}

/**
 * Fetches the peer helpers directory with real database metrics.
 */
export async function getHelpersDirectory({
  subject = '',
  availableOnly = false,
  search = '',
  limit = 30,
  offset = 0,
} = {}) {
  const where = {
    role: { in: ['HELPER', 'ADMIN'] },
    isActive: true,
  };

  if (availableOnly) {
    where.isAvailable = true;
  }

  if (subject) {
    where.OR = [
      { subjects: { contains: subject, mode: 'insensitive' } },
      { helperProfile: { subjects: { contains: subject, mode: 'insensitive' } } },
    ];
  }

  if (search) {
    where.AND = [
      {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { department: { contains: search, mode: 'insensitive' } },
          { subjects: { contains: search, mode: 'insensitive' } },
          { helperProfile: { expertise: { contains: search, mode: 'insensitive' } } },
        ],
      },
    ];
  }

  const [total, helpers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        avatar: true,
        department: true,
        academicYear: true,
        reputation: true,
        isAvailable: true,
        subjects: true,
        helperProfile: true,
        doubtAssignments: {
          where: { status: 'ACTIVE' },
          select: { id: true },
        },
        _count: {
          select: { answers: true },
        },
      },
      orderBy: { reputation: 'desc' },
      skip: offset,
      take: limit,
    }),
  ]);

  const sanitized = helpers.map((h) => ({
    id: h.id,
    name: h.name,
    avatar: h.avatarUrl || h.avatar,
    department: h.department,
    academicYear: h.academicYear,
    reputation: h.reputation,
    isAvailable: h.helperProfile ? h.helperProfile.isAvailable : h.isAvailable,
    subjects: h.helperProfile?.subjects || h.subjects || '',
    expertise: h.helperProfile?.expertise || '',
    bio: h.helperProfile?.bio || '',
    totalAnswers: h._count.answers,
    acceptedAnswers: h.helperProfile?.acceptedAnswers ?? 0,
    activeAssignmentsCount: h.doubtAssignments.length,
  }));

  return {
    total,
    limit,
    offset,
    helpers: sanitized,
  };
}

/**
 * Concurrency-safe atomic doubt claim workflow.
 *
 * Invariants enforced:
 * 1. User must be HELPER or ADMIN
 * 2. Helper must be available
 * 3. Helper cannot claim own doubt
 * 4. Helper cannot exceed WORKLOAD_LIMIT
 * 5. Doubt must be OPEN and unclaimed (conditional update prevents race conditions)
 * 6. Active assignment is created atomically
 */
export async function claimDoubtRecord(doubtId, user) {
  if (!doubtId) {
    throw new Error('Doubt ID is required.');
  }
  if (!user || !user.id) {
    throw new Error('Authentication is required.');
  }

  // 1. Role verification
  if (user.role !== 'HELPER' && user.role !== 'ADMIN') {
    const err = new Error('FORBIDDEN: Only authorized peer helpers or administrators can claim doubts.');
    err.status = 403;
    throw err;
  }

  // 2. Fetch helper profile and check availability
  const helperUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { helperProfile: true },
  });

  const isAvailable = helperUser?.helperProfile
    ? helperUser.helperProfile.isAvailable
    : helperUser?.isAvailable;

  if (isAvailable === false) {
    const err = new Error('UNAVAILABLE: Cannot claim doubts while availability is paused. Please resume availability in your profile.');
    err.status = 400;
    throw err;
  }

  // 3. Workload limit check
  const activeCount = await prisma.doubtAssignment.count({
    where: { helperId: user.id, status: 'ACTIVE' },
  });

  if (activeCount >= WORKLOAD_LIMIT) {
    const err = new Error(`WORKLOAD_LIMIT: You have reached the maximum limit of ${WORKLOAD_LIMIT} active assignments. Please resolve or cancel existing assignments first.`);
    err.status = 400;
    throw err;
  }

  // 4. Doubt inspection
  const doubt = await prisma.doubt.findUnique({
    where: { id: doubtId },
    select: { id: true, studentId: true, authorId: true, status: true, helperId: true },
  });

  if (!doubt) {
    const err = new Error('NOT_FOUND: The requested academic doubt does not exist.');
    err.status = 404;
    throw err;
  }

  // 5. Self-claim check
  if (doubt.studentId === user.id || doubt.authorId === user.id) {
    const err = new Error('SELF_CLAIM_FORBIDDEN: You cannot claim your own academic doubt.');
    err.status = 400;
    throw err;
  }

  // 6. Status check
  if (doubt.status !== 'OPEN' || doubt.helperId !== null) {
    const err = new Error('CONFLICT: This doubt has already been claimed by another helper or is no longer open.');
    err.status = 409;
    throw err;
  }

  // 7. Atomic transaction with conditional update (prevents two helpers claiming simultaneously)
  return prisma.$transaction(
    async (tx) => {
      const updateResult = await tx.doubt.updateMany({
        where: {
          id: doubtId,
          status: 'OPEN',
          helperId: null,
        },
        data: {
          helperId: user.id,
          status: 'CLAIMED',
        },
      });

      if (updateResult.count === 0) {
        const err = new Error('CONFLICT: This doubt was just claimed by another peer helper.');
        err.status = 409;
        throw err;
      }

      // Create assignment record
      const assignment = await tx.doubtAssignment.create({
        data: {
          doubtId,
          helperId: user.id,
          status: 'ACTIVE',
        },
      });

      // Fetch fresh doubt details to return
      const updatedDoubt = await tx.doubt.findUnique({
        where: { id: doubtId },
        include: {
          student: { select: { id: true, name: true, avatar: true } },
          helper: { select: { id: true, name: true } },
          _count: { select: { answers: true } },
        },
      });

      // Atomically notify the student doubt owner
      await notifyDoubtClaimed(
        { doubt: updatedDoubt, helperName: user.name, helperId: user.id, actorId: user.id },
        tx
      );

      return {
        doubt: updatedDoubt,
        assignment,
      };
    },
    { maxWait: 10000, timeout: 20000 }
  );
}

/**
 * Retrieves assignments for the authenticated helper.
 */
export async function getHelperAssignments(user, { status = 'ALL', limit = 30, offset = 0 } = {}) {
  if (!user || !user.id) {
    throw new Error('Authentication is required.');
  }

  const where = {};
  if (user.role !== 'ADMIN') {
    where.helperId = user.id;
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  const [total, assignments] = await Promise.all([
    prisma.doubtAssignment.count({ where }),
    prisma.doubtAssignment.findMany({
      where,
      include: {
        doubt: {
          select: {
            id: true,
            title: true,
            subject: true,
            topic: true,
            urgency: true,
            difficulty: true,
            status: true,
            createdAt: true,
            student: {
              select: { id: true, name: true, avatar: true, department: true },
            },
            _count: {
              select: { answers: true },
            },
          },
        },
        helper: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
      skip: offset,
      take: limit,
    }),
  ]);

  return {
    total,
    limit,
    offset,
    assignments,
  };
}

/**
 * Lifecycle updates for assignments (CANCEL or COMPLETE).
 *
 * Invariants:
 * - CANCEL: Only allowed on ACTIVE assignments by owner or admin.
 *   Resets doubt to OPEN and clears helperId if doubt is not resolved/closed.
 * - COMPLETE: Marks assignment COMPLETED.
 */
export async function updateAssignmentStatus(assignmentId, user, action) {
  if (!assignmentId) {
    throw new Error('Assignment ID is required.');
  }
  if (!user || !user.id) {
    throw new Error('Authentication is required.');
  }

  const validation = validateAssignmentAction(action);
  if (!validation.isValid) {
    const err = new Error(validation.error);
    err.status = 400;
    throw err;
  }

  const assignment = await prisma.doubtAssignment.findUnique({
    where: { id: assignmentId },
    include: { doubt: true },
  });

  if (!assignment) {
    const err = new Error('NOT_FOUND: Assignment not found.');
    err.status = 404;
    throw err;
  }

  // Ownership verification
  if (assignment.helperId !== user.id && user.role !== 'ADMIN') {
    const err = new Error('FORBIDDEN: You do not have permission to modify this assignment.');
    err.status = 403;
    throw err;
  }

  if (assignment.status !== 'ACTIVE') {
    const err = new Error(`BAD_REQUEST: Assignment is already ${assignment.status} and cannot be modified.`);
    err.status = 400;
    throw err;
  }

  return prisma.$transaction(
    async (tx) => {
      if (validation.action === 'CANCEL') {
        const updatedAssignment = await tx.doubtAssignment.update({
          where: { id: assignmentId },
          data: { status: 'CANCELLED' },
        });

        // Reopen doubt if it is currently CLAIMED/ASSIGNED and not RESOLVED or CLOSED
        if (
          assignment.doubt.status === 'CLAIMED' ||
          assignment.doubt.status === 'ASSIGNED'
        ) {
          await tx.doubt.update({
            where: { id: assignment.doubtId },
            data: {
              status: 'OPEN',
              helperId: null,
            },
          });
        }

        // Atomically notify the doubt owner that assignment was cancelled
        await notifyAssignmentCancelled(
          { doubt: assignment.doubt, helperName: user.name, actorId: user.id },
          tx
        );

        return {
          assignment: updatedAssignment,
          message: 'Assignment cancelled. The doubt has been returned to the open pool for other helpers.',
        };
      }

      if (validation.action === 'COMPLETE') {
        const updatedAssignment = await tx.doubtAssignment.update({
          where: { id: assignmentId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        // Atomically notify the doubt owner that assignment was completed
        await notifyAssignmentCompleted(
          { doubt: assignment.doubt, helperName: user.name, actorId: user.id },
          tx
        );

        return {
          assignment: updatedAssignment,
          message: 'Assignment marked as completed.',
        };
      }
    },
    { maxWait: 10000, timeout: 20000 }
  );
}

