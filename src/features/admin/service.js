import { prisma } from '@/lib/prisma';
import { ROLES } from '@/lib/permissions';

/**
 * Record an append-only administrative audit log.
 * Never stores passwords, tokens, or private secrets.
 */
export async function recordAuditLog({ actorId, action, targetType, targetId, metadata = null }) {
  try {
    const metaStr = metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null;
    return await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId: String(targetId),
        metadata: metaStr,
      },
    });
  } catch (err) {
    console.error('Failed to record audit log:', err);
    return null;
  }
}

/**
 * Platform overview statistics and recent operational events for the Admin Control Center.
 */
export async function getAdminOverview() {
  const [
    totalUsers,
    totalStudents,
    totalHelpers,
    totalModerators,
    totalAdmins,
    activeHelpers,
    suspendedUsers,
    totalDoubts,
    openDoubts,
    resolvedDoubts,
    totalAnswers,
    pendingAnswers,
    pendingResources,
    pendingReports,
    recentRegistrations,
    recentAuditLogs,
    recentDoubts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: ROLES.STUDENT } }),
    prisma.user.count({ where: { role: ROLES.HELPER } }),
    prisma.user.count({ where: { role: ROLES.MODERATOR } }),
    prisma.user.count({ where: { role: ROLES.ADMIN } }),
    prisma.helperProfile.count({ where: { isAvailable: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.doubt.count(),
    prisma.doubt.count({ where: { status: 'OPEN' } }),
    prisma.doubt.count({ where: { status: 'RESOLVED' } }),
    prisma.answer.count(),
    prisma.answer.count({ where: { status: 'PENDING' } }),
    prisma.knowledgeResource.count({ where: { status: 'PENDING' } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        reputation: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        actor: {
          select: { id: true, name: true, role: true, email: true },
        },
      },
    }),
    prisma.doubt.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        subject: true,
        status: true,
        createdAt: true,
        student: { select: { id: true, name: true } },
      },
    }),
  ]);

  const resolutionRate = totalDoubts > 0 ? Math.round((resolvedDoubts / totalDoubts) * 100) : 0;

  return {
    metrics: {
      users: {
        total: totalUsers,
        students: totalStudents,
        helpers: totalHelpers,
        moderators: totalModerators,
        admins: totalAdmins,
        activeHelpers,
        suspended: suspendedUsers,
      },
      content: {
        totalDoubts,
        openDoubts,
        resolvedDoubts,
        resolutionRate,
        totalAnswers,
      },
      pendingQueue: {
        pendingAnswers,
        pendingResources,
        pendingReports,
        totalPending: pendingAnswers + pendingResources + pendingReports,
      },
    },
    recentRegistrations,
    recentAuditLogs,
    recentDoubts,
  };
}

/**
 * Filtered, paginated user management list for administrators.
 */
export async function getAdminUsers({
  search = '',
  role,
  status,
  sort = 'newest',
  page = 1,
  limit = 10,
} = {}) {
  const take = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  const where = {};

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { department: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (role && Object.values(ROLES).includes(role)) {
    where.role = role;
  }

  if (status === 'ACTIVE') {
    where.isActive = true;
  } else if (status === 'SUSPENDED') {
    where.isActive = false;
  }

  let orderBy = { createdAt: 'desc' };
  if (sort === 'oldest') orderBy = { createdAt: 'asc' };
  if (sort === 'reputation') orderBy = { reputation: 'desc' };
  if (sort === 'name') orderBy = { name: 'asc' };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        academicYear: true,
        reputation: true,
        isActive: true,
        suspensionReason: true,
        createdAt: true,
        helperProfile: {
          select: {
            isAvailable: true,
            totalAnswers: true,
            acceptedAnswers: true,
            subjects: true,
          },
        },
        _count: {
          select: {
            askedDoubts: true,
            answers: true,
            doubtAssignments: true,
          },
        },
      },
    }),
  ]);

  return {
    users,
    pagination: {
      page: Math.max(parseInt(page, 10) || 1, 1),
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    },
  };
}

/**
 * Detailed user profile inspection for administrators.
 */
export async function getAdminUserDetail(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      academicYear: true,
      reputation: true,
      isActive: true,
      suspensionReason: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      helperProfile: true,
      _count: {
        select: {
          askedDoubts: true,
          answers: true,
          doubtAssignments: true,
          knowledgeResources: true,
          reportsSubmitted: true,
        },
      },
      askedDoubts: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          subject: true,
          status: true,
          urgency: true,
          createdAt: true,
        },
      },
      answers: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          doubtId: true,
          status: true,
          isAccepted: true,
          upvotes: true,
          createdAt: true,
          doubt: { select: { title: true, subject: true } },
        },
      },
      doubtAssignments: {
        orderBy: { assignedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          doubtId: true,
          status: true,
          assignedAt: true,
          completedAt: true,
          doubt: { select: { title: true, subject: true } },
        },
      },
    },
  });

  if (!user) return null;

  // Retrieve audit logs related to this user (as target)
  const auditLogs = await prisma.auditLog.findMany({
    where: { targetId: userId, targetType: 'USER' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      actor: { select: { id: true, name: true, role: true } },
    },
  });

  return { user, auditLogs };
}

/**
 * Change a user's role and record an administrative audit log.
 */
export async function updateUserRole({ actor, targetUserId, newRole }) {
  if (!actor || actor.role !== ROLES.ADMIN) {
    const err = new Error('Forbidden: Only administrators can change user roles.');
    err.status = 403;
    throw err;
  }

  if (actor.id === targetUserId) {
    const err = new Error('Forbidden: Administrators cannot modify their own role.');
    err.status = 403;
    throw err;
  }

  if (!Object.values(ROLES).includes(newRole)) {
    const err = new Error(`Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}`);
    err.status = 400;
    throw err;
  }

  const existing = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true, name: true, email: true },
  });

  if (!existing) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  const oldRole = existing.role;

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    // If upgraded to HELPER and has no HelperProfile, initialize one
    if (newRole === ROLES.HELPER) {
      const hp = await tx.helperProfile.findUnique({ where: { userId: targetUserId } });
      if (!hp) {
        await tx.helperProfile.create({
          data: {
            userId: targetUserId,
            isAvailable: true,
            subjects: u.department || 'General',
          },
        });
      }
    }

    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: 'USER_ROLE_CHANGE',
        targetType: 'USER',
        targetId: targetUserId,
        metadata: JSON.stringify({ oldRole, newRole, targetEmail: existing.email }),
      },
    });

    return u;
  });

  return updated;
}

/**
 * Suspend or activate a user account and record an audit log.
 */
export async function updateUserStatus({ actor, targetUserId, isActive, suspensionReason = '' }) {
  if (!actor || actor.role !== ROLES.ADMIN) {
    const err = new Error('Forbidden: Only administrators can modify account status.');
    err.status = 403;
    throw err;
  }

  if (actor.id === targetUserId) {
    const err = new Error('Forbidden: Administrators cannot suspend their own account.');
    err.status = 403;
    throw err;
  }

  const existing = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, isActive: true, email: true, role: true },
  });

  if (!existing) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  const reason = !isActive ? (suspensionReason?.trim() || 'Suspended by administrator.') : null;

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: targetUserId },
      data: {
        isActive,
        suspensionReason: reason,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        suspensionReason: true,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: isActive ? 'USER_ACTIVATE' : 'USER_SUSPEND',
        targetType: 'USER',
        targetId: targetUserId,
        metadata: JSON.stringify({
          previousState: existing.isActive ? 'ACTIVE' : 'SUSPENDED',
          newState: isActive ? 'ACTIVE' : 'SUSPENDED',
          reason,
          targetEmail: existing.email,
        }),
      },
    });

    return u;
  });

  return updated;
}

/**
 * Unified administrative moderation overview combining pending answers,
 * pending knowledge resources, and pending reports.
 */
export async function getAdminModerationOverview({ type = 'all', page = 1, limit = 10 } = {}) {
  const take = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  const [
    pendingAnswersCount,
    pendingResourcesCount,
    pendingReportsCount,
  ] = await Promise.all([
    prisma.answer.count({ where: { status: 'PENDING' } }),
    prisma.knowledgeResource.count({ where: { status: 'PENDING' } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
  ]);

  let answers = [];
  let resources = [];
  let reports = [];

  if (type === 'all' || type === 'answers') {
    answers = await prisma.answer.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: type === 'answers' ? take : 5,
      skip: type === 'answers' ? skip : 0,
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
        doubt: { select: { id: true, title: true, subject: true } },
      },
    });
  }

  if (type === 'all' || type === 'resources') {
    resources = await prisma.knowledgeResource.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: type === 'resources' ? take : 5,
      skip: type === 'resources' ? skip : 0,
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  if (type === 'all' || type === 'reports') {
    reports = await prisma.report.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: type === 'reports' ? take : 5,
      skip: type === 'reports' ? skip : 0,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        doubt: { select: { id: true, title: true, studentId: true } },
        answer: { select: { id: true, content: true, authorId: true } },
      },
    });
  }

  return {
    counts: {
      answers: pendingAnswersCount,
      resources: pendingResourcesCount,
      reports: pendingReportsCount,
      total: pendingAnswersCount + pendingResourcesCount + pendingReportsCount,
    },
    answers,
    resources,
    reports,
  };
}

/**
 * Filtered, paginated user reports for administrators.
 */
export async function getAdminReports({ status = 'PENDING', page = 1, limit = 10 } = {}) {
  const take = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  const where = {};
  if (status && ['PENDING', 'REVIEWED', 'DISMISSED'].includes(status)) {
    where.status = status;
  }

  const [total, reports] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        reporter: { select: { id: true, name: true, email: true, role: true } },
        doubt: { select: { id: true, title: true, subject: true, studentId: true } },
        answer: { select: { id: true, content: true, doubtId: true, authorId: true } },
      },
    }),
  ]);

  return {
    reports,
    pagination: {
      page: Math.max(parseInt(page, 10) || 1, 1),
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    },
  };
}

/**
 * Mark a report as REVIEWED or DISMISSED with admin resolution notes.
 */
export async function reviewAdminReport({ actor, reportId, status, resolutionNotes = '' }) {
  if (!actor || actor.role !== ROLES.ADMIN) {
    const err = new Error('Forbidden: Only administrators can review user reports.');
    err.status = 403;
    throw err;
  }

  if (!['REVIEWED', 'DISMISSED'].includes(status)) {
    const err = new Error('Invalid status. Status must be REVIEWED or DISMISSED.');
    err.status = 400;
    throw err;
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, status: true, reason: true },
  });

  if (!report) {
    const err = new Error('Report not found.');
    err.status = 404;
    throw err;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const r = await tx.report.update({
      where: { id: reportId },
      data: {
        status,
        resolutionNotes: resolutionNotes?.trim() || null,
        reviewedAt: new Date(),
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: 'REPORT_REVIEW',
        targetType: 'REPORT',
        targetId: reportId,
        metadata: JSON.stringify({
          status,
          notes: resolutionNotes?.trim() || null,
          reportReason: report.reason,
        }),
      },
    });

    return r;
  });

  return updated;
}

/**
 * Filtered, paginated audit logs for administrators.
 */
export async function getAdminAuditLogs({
  action,
  targetType,
  actorId,
  page = 1,
  limit = 20,
} = {}) {
  const take = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  const where = {};
  if (action && action.trim()) where.action = action.trim();
  if (targetType && targetType.trim()) where.targetType = targetType.trim();
  if (actorId && actorId.trim()) where.actorId = actorId.trim();

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        actor: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    }),
  ]);

  return {
    logs,
    pagination: {
      page: Math.max(parseInt(page, 10) || 1, 1),
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    },
  };
}
