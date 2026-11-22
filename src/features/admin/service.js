import { prisma } from '@/lib/prisma';
import { ROLES } from '@/lib/permissions';
import {
  notifyAnswerApproved,
  notifyAnswerRejected,
  notifyAnswerChangesRequested,
} from '@/features/notifications/service';

/**
 * Redacts any sensitive keys (passwords, tokens, cookies, secrets) from metadata before storing.
 */
function sanitizeAuditMetadata(metadata) {
  if (!metadata) return null;
  let parsed = metadata;
  if (typeof metadata === 'string') {
    try {
      parsed = JSON.parse(metadata);
    } catch {
      return metadata;
    }
  }
  if (typeof parsed !== 'object' || parsed === null) return JSON.stringify(parsed);

  const redactKeys = ['password', 'passwordhash', 'token', 'secret', 'cookie', 'session', 'apikey', 'auth'];
  const sanitized = Array.isArray(parsed) ? [...parsed] : { ...parsed };

  for (const key of Object.keys(sanitized)) {
    if (redactKeys.some((k) => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = JSON.parse(sanitizeAuditMetadata(sanitized[key]));
    }
  }
  return JSON.stringify(sanitized);
}

/**
 * Record an append-only administrative audit log.
 * Never stores passwords, tokens, or private secrets.
 * Retains actor identity snapshot (email, name, role) for audit survival.
 */
export async function recordAuditLog({
  actorId = null,
  actor = null,
  action,
  targetType,
  targetId,
  metadata = null,
}) {
  try {
    const finalActorId = actorId || actor?.id || null;
    let actorEmail = actor?.email || null;
    let actorName = actor?.name || null;
    let actorRole = actor?.role || null;

    if (!actorEmail && finalActorId) {
      const u = await prisma.user.findUnique({
        where: { id: finalActorId },
        select: { email: true, name: true, role: true },
      });
      if (u) {
        actorEmail = u.email;
        actorName = u.name;
        actorRole = u.role;
      }
    }

    const metaStr = sanitizeAuditMetadata(metadata);
    return await prisma.auditLog.create({
      data: {
        actorId: finalActorId,
        actorEmail,
        actorName,
        actorRole,
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
    approvedAnswers,
    rejectedAnswers,
    needsChangesAnswers,
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
    prisma.answer.count({ where: { status: 'APPROVED' } }),
    prisma.answer.count({ where: { status: 'REJECTED' } }),
    prisma.moderationReview.count({ where: { decision: 'NEEDS_CHANGES' } }),
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
        approvedAnswers,
        rejectedAnswers,
        needsChangesAnswers,
      },
      answers: {
        total: totalAnswers,
        pending: pendingAnswers,
        approved: approvedAnswers,
        rejected: rejectedAnswers,
        needsChanges: needsChangesAnswers,
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
        actorEmail: actor.email,
        actorName: actor.name,
        actorRole: actor.role,
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
        actorEmail: actor.email,
        actorName: actor.name,
        actorRole: actor.role,
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
        actorEmail: actor.email,
        actorName: actor.name,
        actorRole: actor.role,
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

/**
 * Filtered, paginated answer verification list for administrators and moderators.
 */
export async function getAdminAnswers({
  status,
  subject,
  search,
  queue = 'all',
  sort = 'newest',
  page = 1,
  limit = 10,
} = {}) {
  const take = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  const where = {};

  // Status & queue filtering
  if (queue === 'pending') {
    where.status = 'PENDING';
  } else if (queue === 'urgent') {
    where.status = 'PENDING';
    where.doubt = { priority: { in: ['HIGH', 'URGENT'] } };
  } else if (queue === 'needs_changes') {
    where.reviews = { some: { decision: 'NEEDS_CHANGES' } };
  } else if (queue === 'approved') {
    where.status = 'APPROVED';
  } else if (queue === 'rejected') {
    where.status = 'REJECTED';
  } else if (status) {
    const s = status.toUpperCase();
    if (s === 'NEEDS_CHANGES') {
      where.reviews = { some: { decision: 'NEEDS_CHANGES' } };
    } else if (['PENDING', 'APPROVED', 'REJECTED'].includes(s)) {
      where.status = s;
    }
  }

  // Subject filtering
  if (subject && subject !== 'All') {
    where.doubt = {
      ...(where.doubt || {}),
      subject: { equals: subject, mode: 'insensitive' },
    };
  }

  // Search filtering
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { content: { contains: q, mode: 'insensitive' } },
      { author: { name: { contains: q, mode: 'insensitive' } } },
      { doubt: { title: { contains: q, mode: 'insensitive' } } },
    ];
  }

  // Sorting
  let orderBy = { createdAt: 'desc' };
  if (sort === 'oldest' || queue === 'oldest') {
    orderBy = { createdAt: 'asc' };
  }

  const [total, answers] = await Promise.all([
    prisma.answer.count({ where }),
    prisma.answer.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        author: {
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
            helperProfile: {
              select: {
                expertise: true,
                subjects: true,
                reputation: true,
                totalAnswers: true,
                acceptedAnswers: true,
              },
            },
          },
        },
        doubt: {
          select: {
            id: true,
            title: true,
            description: true,
            subject: true,
            topic: true,
            priority: true,
            status: true,
            tags: true,
            createdAt: true,
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
                academicYear: true,
              },
            },
          },
        },
        reviews: {
          orderBy: { reviewedAt: 'desc' },
          select: {
            id: true,
            decision: true,
            feedback: true,
            reviewedAt: true,
            reviewer: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    answers,
    pagination: {
      page: Math.max(parseInt(page, 10) || 1, 1),
      limit: take,
      total,
      totalPages: Math.ceil(total / take) || 1,
    },
  };
}

/**
 * Detailed answer inspection for verification and review panel.
 */
export async function getAdminAnswerDetail(answerId) {
  if (!answerId) return null;

  return prisma.answer.findUnique({
    where: { id: answerId },
    include: {
      author: {
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
      },
      doubt: {
        select: {
          id: true,
          title: true,
          description: true,
          subject: true,
          topic: true,
          difficulty: true,
          priority: true,
          status: true,
          tags: true,
          createdAt: true,
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              academicYear: true,
              reputation: true,
            },
          },
        },
      },
      reviews: {
        orderBy: { reviewedAt: 'desc' },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              role: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Perform an atomic administrative moderation action on an answer.
 * Approves, rejects, or requests changes, notifies the author, and writes an audit log.
 */
export async function moderateAnswerAdmin({ answerId, reviewer, decision, feedback }) {
  if (!reviewer || (reviewer.role !== ROLES.ADMIN && reviewer.role !== ROLES.MODERATOR)) {
    const err = new Error('Forbidden: Only administrators and moderators can review answers.');
    err.status = 403;
    throw err;
  }

  if (!answerId) {
    const err = new Error('Answer ID is required.');
    err.status = 400;
    throw err;
  }

  const validDecisions = ['APPROVED', 'REJECTED', 'NEEDS_CHANGES'];
  if (!validDecisions.includes(decision)) {
    const err = new Error(`Invalid decision. Must be one of: ${validDecisions.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const trimmedFeedback = typeof feedback === 'string' ? feedback.trim() : '';

  if (decision === 'REJECTED' && trimmedFeedback.length < 5) {
    const err = new Error('A rejection reason of at least 5 characters is required.');
    err.status = 400;
    throw err;
  }

  if (decision === 'NEEDS_CHANGES' && trimmedFeedback.length < 5) {
    const err = new Error('Constructive feedback of at least 5 characters is required when requesting changes.');
    err.status = 400;
    throw err;
  }

  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    include: {
      doubt: { select: { id: true, title: true, status: true, studentId: true } },
      author: { select: { id: true, name: true, email: true } },
    },
  });

  if (!answer) {
    const err = new Error('Answer not found.');
    err.status = 404;
    throw err;
  }

  // Prevent self-moderation
  if (answer.authorId === reviewer.id) {
    const err = new Error('Forbidden: You cannot moderate your own submitted answer.');
    err.status = 403;
    throw err;
  }

  let targetStatus = 'PENDING';
  if (decision === 'APPROVED') targetStatus = 'APPROVED';
  if (decision === 'REJECTED') targetStatus = 'REJECTED';
  // If NEEDS_CHANGES, targetStatus remains PENDING

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create ModerationReview
    const review = await tx.moderationReview.create({
      data: {
        answerId,
        reviewerId: reviewer.id,
        decision,
        feedback: trimmedFeedback || null,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // 2. Update Answer
    const updatedAnswer = await tx.answer.update({
      where: { id: answerId },
      data: { status: targetStatus },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            reputation: true,
          },
        },
        reviews: {
          orderBy: { reviewedAt: 'desc' },
          include: {
            reviewer: { select: { id: true, name: true, role: true } },
          },
        },
      },
    });

    // 3. If approved, transition doubt to ANSWERED if it is currently OPEN, ASSIGNED, or CLAIMED
    if (decision === 'APPROVED') {
      await tx.doubt.updateMany({
        where: {
          id: answer.doubtId,
          status: { in: ['OPEN', 'ASSIGNED', 'CLAIMED'] },
        },
        data: { status: 'ANSWERED' },
      });
    }

    // 4. Record AuditLog
    await tx.auditLog.create({
      data: {
        actorId: reviewer.id,
        actorEmail: reviewer.email,
        actorName: reviewer.name,
        actorRole: reviewer.role,
        action: 'ANSWER_MODERATION',
        targetType: 'ANSWER',
        targetId: answerId,
        metadata: JSON.stringify({
          decision,
          feedback: trimmedFeedback || null,
          previousStatus: answer.status,
          newStatus: targetStatus,
          doubtId: answer.doubtId,
          doubtTitle: answer.doubt?.title,
          authorId: answer.authorId,
          authorName: answer.author?.name,
        }),
      },
    });

    // 5. Dispatch notification to author
    if (decision === 'APPROVED') {
      await notifyAnswerApproved(
        {
          answer,
          doubtTitle: answer.doubt?.title,
          doubtId: answer.doubtId,
          actorId: reviewer.id,
        },
        tx
      );
    } else if (decision === 'REJECTED') {
      await notifyAnswerRejected(
        {
          answer,
          doubtTitle: answer.doubt?.title,
          doubtId: answer.doubtId,
          feedback: trimmedFeedback,
          actorId: reviewer.id,
        },
        tx
      );
    } else if (decision === 'NEEDS_CHANGES') {
      await notifyAnswerChangesRequested(
        {
          answer,
          doubtTitle: answer.doubt?.title,
          doubtId: answer.doubtId,
          feedback: trimmedFeedback,
          actorId: reviewer.id,
        },
        tx
      );
    }

    return { answer: updatedAnswer, review };
  });

  return result;
}

/**
 * Comprehensive Moderation Analytics for administrative reporting.
 */
export async function getAdminModerationAnalytics() {
  const [
    totalReviews,
    approvedReviews,
    rejectedReviews,
    needsChangesReviews,
    allReviewsWithDates,
    moderatorsGrouped,
    subjectsGrouped,
  ] = await Promise.all([
    prisma.moderationReview.count(),
    prisma.moderationReview.count({ where: { decision: 'APPROVED' } }),
    prisma.moderationReview.count({ where: { decision: 'REJECTED' } }),
    prisma.moderationReview.count({ where: { decision: 'NEEDS_CHANGES' } }),
    prisma.moderationReview.findMany({
      select: {
        reviewedAt: true,
        decision: true,
        answer: {
          select: {
            createdAt: true,
            doubt: { select: { subject: true } },
          },
        },
      },
      orderBy: { reviewedAt: 'desc' },
      take: 200,
    }),
    prisma.moderationReview.groupBy({
      by: ['reviewerId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.moderationReview.findMany({
      select: {
        decision: true,
        answer: {
          select: {
            doubt: { select: { subject: true } },
          },
        },
      },
      take: 500,
    }),
  ]);

  const approvalRate = totalReviews > 0 ? Math.round((approvedReviews / totalReviews) * 100) : 0;
  const rejectionRate = totalReviews > 0 ? Math.round((rejectedReviews / totalReviews) * 100) : 0;
  const needsChangesRate = totalReviews > 0 ? Math.round((needsChangesReviews / totalReviews) * 100) : 0;

  // Calculate average review turnaround time in minutes
  let totalTurnaroundMinutes = 0;
  let turnaroundCount = 0;
  for (const r of allReviewsWithDates) {
    if (r.answer?.createdAt && r.reviewedAt) {
      const diffMs = new Date(r.reviewedAt).getTime() - new Date(r.answer.createdAt).getTime();
      if (diffMs > 0) {
        totalTurnaroundMinutes += diffMs / (1000 * 60);
        turnaroundCount++;
      }
    }
  }
  const avgTurnaroundMinutes = turnaroundCount > 0 ? Math.round(totalTurnaroundMinutes / turnaroundCount) : 0;

  // Daily reviews for past 14 days
  const dailyMap = new Map();
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    dailyMap.set(dateStr, { date: dateStr, count: 0, approved: 0, rejected: 0, needsChanges: 0 });
  }

  for (const r of allReviewsWithDates) {
    if (r.reviewedAt) {
      const dateStr = new Date(r.reviewedAt).toISOString().split('T')[0];
      if (dailyMap.has(dateStr)) {
        const item = dailyMap.get(dateStr);
        item.count++;
        if (r.decision === 'APPROVED') item.approved++;
        if (r.decision === 'REJECTED') item.rejected++;
        if (r.decision === 'NEEDS_CHANGES') item.needsChanges++;
      }
    }
  }

  // Moderator activity details
  const reviewerIds = moderatorsGrouped.map((m) => m.reviewerId);
  const reviewers = await prisma.user.findMany({
    where: { id: { in: reviewerIds } },
    select: { id: true, name: true, role: true, email: true },
  });
  const reviewerMap = new Map(reviewers.map((u) => [u.id, u]));

  const moderatorActivity = moderatorsGrouped.map((m) => {
    const u = reviewerMap.get(m.reviewerId);
    return {
      reviewerId: m.reviewerId,
      name: u?.name || 'Unknown',
      role: u?.role || 'MODERATOR',
      totalReviews: m._count.id,
    };
  });

  // Subject quality breakdown
  const subjectMap = new Map();
  for (const item of subjectsGrouped) {
    const sub = item.answer?.doubt?.subject || 'General';
    if (!subjectMap.has(sub)) {
      subjectMap.set(sub, { subject: sub, total: 0, approved: 0, rejected: 0, needsChanges: 0 });
    }
    const entry = subjectMap.get(sub);
    entry.total++;
    if (item.decision === 'APPROVED') entry.approved++;
    if (item.decision === 'REJECTED') entry.rejected++;
    if (item.decision === 'NEEDS_CHANGES') entry.needsChanges++;
  }
  const subjectDistribution = Array.from(subjectMap.values()).sort((a, b) => b.total - a.total);

  return {
    summary: {
      totalReviews,
      approvedReviews,
      rejectedReviews,
      needsChangesReviews,
      approvalRate,
      rejectionRate,
      needsChangesRate,
      avgTurnaroundMinutes,
    },
    dailyReviews: Array.from(dailyMap.values()),
    moderatorActivity,
    subjectDistribution,
  };
}

