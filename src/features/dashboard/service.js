import { prisma } from '@/lib/prisma';

/**
 * Returns role-tailored overview statistics, recent doubts, and recent platform activity.
 * All totals are computed using efficient database count/aggregation queries.
 */
export async function getDashboardOverview({ user }) {
  if (!user || !user.id) {
    throw new Error('Authenticated user context is required.');
  }

  const role = user.role || 'STUDENT';
  const userId = user.id;

  // 1. Compute Role-Tailored Statistics
  let stats = {};

  if (role === 'STUDENT') {
    const [
      totalDoubts,
      openDoubts,
      inProgressDoubts,
      answeredDoubts,
      resolvedDoubts,
      totalAnswersSubmitted,
      acceptedSolutionsReceived,
    ] = await Promise.all([
      prisma.doubt.count({ where: { studentId: userId } }),
      prisma.doubt.count({ where: { studentId: userId, status: 'OPEN' } }),
      prisma.doubt.count({
        where: {
          studentId: userId,
          status: { in: ['ASSIGNED', 'CLAIMED'] },
        },
      }),
      prisma.doubt.count({ where: { studentId: userId, status: 'ANSWERED' } }),
      prisma.doubt.count({ where: { studentId: userId, status: 'RESOLVED' } }),
      prisma.answer.count({ where: { authorId: userId } }),
      prisma.answer.count({
        where: { doubt: { studentId: userId }, isAccepted: true },
      }),
    ]);

    stats = {
      totalDoubts,
      openDoubts,
      inProgressDoubts,
      answeredDoubts,
      resolvedDoubts,
      totalAnswersSubmitted,
      acceptedSolutionsReceived,
      reputation: user.reputation || 0,
    };
  } else if (role === 'HELPER') {
    const [
      availableDoubts,
      claimedDoubts,
      activeAssignments,
      totalAnswers,
      approvedAnswers,
      acceptedSolutions,
    ] = await Promise.all([
      prisma.doubt.count({ where: { status: 'OPEN', helperId: null } }),
      prisma.doubt.count({ where: { helperId: userId } }),
      prisma.doubtAssignment.count({
        where: { helperId: userId, status: 'ACTIVE' },
      }),
      prisma.answer.count({ where: { authorId: userId } }),
      prisma.answer.count({ where: { authorId: userId, status: 'APPROVED' } }),
      prisma.answer.count({ where: { authorId: userId, isAccepted: true } }),
    ]);

    stats = {
      availableDoubts,
      claimedDoubts,
      activeAssignments,
      totalAnswers,
      approvedAnswers,
      acceptedSolutions,
      reputation: user.reputation || 0,
    };
  } else if (role === 'MODERATOR') {
    const [
      pendingAnswers,
      approvedAnswers,
      rejectedAnswers,
      pendingReports,
      reviewsByMe,
      totalReviews,
    ] = await Promise.all([
      prisma.answer.count({ where: { status: 'PENDING' } }),
      prisma.answer.count({ where: { status: 'APPROVED' } }),
      prisma.answer.count({ where: { status: 'REJECTED' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.moderationReview.count({ where: { reviewerId: userId } }),
      prisma.moderationReview.count(),
    ]);

    stats = {
      pendingAnswers,
      approvedAnswers,
      rejectedAnswers,
      pendingReports,
      reviewsByMe,
      totalReviews,
      reputation: user.reputation || 0,
    };
  } else if (role === 'ADMIN') {
    const [
      totalUsers,
      totalStudents,
      totalHelpers,
      totalModerators,
      totalAdmins,
      totalDoubts,
      totalAnswers,
      resolvedDoubts,
      pendingAnswers,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'HELPER' } }),
      prisma.user.count({ where: { role: 'MODERATOR' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.doubt.count(),
      prisma.answer.count(),
      prisma.doubt.count({ where: { status: 'RESOLVED' } }),
      prisma.answer.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    const resolutionRate =
      totalDoubts > 0 ? Math.round((resolvedDoubts / totalDoubts) * 100) : 0;

    stats = {
      totalUsers,
      totalStudents,
      totalHelpers,
      totalModerators,
      totalAdmins,
      totalDoubts,
      totalAnswers,
      resolvedDoubts,
      resolutionRate,
      pendingModeration: pendingAnswers + pendingReports,
      pendingAnswers,
      pendingReports,
      reputation: user.reputation || 0,
    };
  }

  // 2. Query Recent Doubts (role-prioritized)
  // For students: prefer doubts they asked; if none, show recent platform doubts
  let recentDoubtsWhere = {};
  if (role === 'STUDENT') {
    const ownCount = await prisma.doubt.count({ where: { studentId: userId } });
    if (ownCount > 0) {
      recentDoubtsWhere = { studentId: userId };
    }
  } else if (role === 'HELPER') {
    recentDoubtsWhere = {
      OR: [{ helperId: userId }, { status: 'OPEN' }],
    };
  }

  const recentDoubts = await prisma.doubt.findMany({
    where: recentDoubtsWhere,
    take: 6,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      subject: true,
      topic: true,
      status: true,
      urgency: true,
      difficulty: true,
      createdAt: true,
      student: {
        select: { id: true, name: true, avatar: true },
      },
      helper: {
        select: { id: true, name: true },
      },
      _count: {
        select: { answers: true },
      },
    },
  });

  // 3. Construct Live Chronological Activity Stream
  const [
    recentCreatedDoubts,
    recentAnswers,
    recentReviews,
    recentAssignments,
    recentResolutions,
  ] = await Promise.all([
    // Doubts created
    prisma.doubt.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        student: { select: { id: true, name: true } },
      },
    }),
    // Answers submitted
    prisma.answer.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        doubtId: true,
        createdAt: true,
        author: { select: { id: true, name: true, role: true } },
        doubt: { select: { title: true } },
      },
    }),
    // Moderation reviews
    prisma.moderationReview.findMany({
      take: 4,
      orderBy: { reviewedAt: 'desc' },
      select: {
        id: true,
        decision: true,
        reviewedAt: true,
        reviewer: { select: { id: true, name: true } },
        answer: {
          select: {
            doubtId: true,
            doubt: { select: { title: true } },
          },
        },
      },
    }),
    // Doubt assignments / claims
    prisma.doubtAssignment.findMany({
      take: 4,
      orderBy: { assignedAt: 'desc' },
      select: {
        id: true,
        assignedAt: true,
        helper: { select: { id: true, name: true } },
        doubt: { select: { id: true, title: true } },
      },
    }),
    // Resolved doubts
    prisma.doubt.findMany({
      where: { status: 'RESOLVED', resolvedAt: { not: null } },
      take: 4,
      orderBy: { resolvedAt: 'desc' },
      select: {
        id: true,
        title: true,
        resolvedAt: true,
        student: { select: { id: true, name: true } },
      },
    }),
  ]);

  const rawActivities = [];

  for (const d of recentCreatedDoubts) {
    rawActivities.push({
      id: `act-doubt-${d.id}`,
      type: 'DOUBT_CREATED',
      actor: d.student?.name || 'A student',
      message: `asked academic doubt: "${d.title}"`,
      timestamp: d.createdAt,
      link: `/doubts/${d.id}`,
      badgeColor: 'text-[#2563EB] bg-[#EFF6FF] border-blue-200',
    });
  }

  for (const a of recentAnswers) {
    rawActivities.push({
      id: `act-ans-${a.id}`,
      type: 'ANSWER_SUBMITTED',
      actor: a.author?.name || 'A peer',
      message: `contributed an explanation on: "${a.doubt?.title || 'a doubt'}"`,
      timestamp: a.createdAt,
      link: `/doubts/${a.doubtId}`,
      badgeColor: 'text-violet-700 bg-[#EDE9FE] border-violet-200',
    });
  }

  for (const r of recentReviews) {
    rawActivities.push({
      id: `act-rev-${r.id}`,
      type: 'MODERATION_REVIEW',
      actor: r.reviewer?.name || 'Moderator',
      message: `${r.decision.toLowerCase()} an answer on: "${r.answer?.doubt?.title || 'a doubt'}"`,
      timestamp: r.reviewedAt,
      link: r.answer?.doubtId ? `/doubts/${r.answer.doubtId}` : '/doubts',
      badgeColor:
        r.decision === 'APPROVED'
          ? 'text-emerald-700 bg-[#ECFDF5] border-emerald-200'
          : 'text-amber-700 bg-amber-50 border-amber-200',
    });
  }

  for (const asg of recentAssignments) {
    rawActivities.push({
      id: `act-asg-${asg.id}`,
      type: 'DOUBT_CLAIMED',
      actor: asg.helper?.name || 'A helper',
      message: `claimed to assist with: "${asg.doubt?.title || 'a doubt'}"`,
      timestamp: asg.assignedAt,
      link: `/doubts/${asg.doubt?.id}`,
      badgeColor: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    });
  }

  for (const res of recentResolutions) {
    if (res.resolvedAt) {
      rawActivities.push({
        id: `act-res-${res.id}`,
        type: 'DOUBT_RESOLVED',
        actor: res.student?.name || 'Student',
        message: `accepted solution and resolved: "${res.title}"`,
        timestamp: res.resolvedAt,
        link: `/doubts/${res.id}`,
        badgeColor: 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]',
      });
    }
  }

  // Sort activities chronologically (newest first) and limit to top 8
  const recentActivity = rawActivities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  return {
    role,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      reputation: user.reputation,
      avatar: user.avatarUrl || user.avatar,
      department: user.department,
    },
    stats,
    recentDoubts,
    recentActivity,
  };
}

/**
 * Returns aggregated analytics data for dashboard charts:
 * 1. Status distribution (Open, Claimed, Assigned, Answered, Resolved, Closed)
 * 2. Doubt creation trend (daily buckets over the specified range)
 * 3. Subject-wise distribution (counts & percentages)
 */
export async function getDashboardAnalytics({ days = 30, scope = 'global', user = null } = {}) {
  const safeDays = Math.min(Math.max(Number(days) || 30, 7), 90);
  const isStudentScoped = scope === 'mine' && user && user.id;

  const whereClause = isStudentScoped ? { studentId: user.id } : {};

  // 1. Status Distribution
  const statusGroups = await prisma.doubt.groupBy({
    by: ['status'],
    where: whereClause,
    _count: { id: true },
  });

  const statusMap = {
    OPEN: 0,
    CLAIMED: 0,
    ASSIGNED: 0,
    ANSWERED: 0,
    RESOLVED: 0,
    CLOSED: 0,
  };

  let totalCount = 0;
  for (const group of statusGroups) {
    if (statusMap[group.status] !== undefined) {
      statusMap[group.status] = group._count.id;
    }
    totalCount += group._count.id;
  }

  const statusDistribution = {
    ...statusMap,
    total: totalCount,
  };

  // 2. Subject Distribution (Top 8 subjects + percentages)
  const subjectGroups = await prisma.doubt.groupBy({
    by: ['subject'],
    where: whereClause,
    _count: { id: true },
    orderBy: {
      _count: { id: 'desc' },
    },
    take: 8,
  });

  const subjectDistribution = subjectGroups.map((group) => ({
    subject: group.subject,
    count: group._count.id,
    percentage: totalCount > 0 ? Math.round((group._count.id / totalCount) * 100) : 0,
  }));

  // 3. Doubt Creation Trend (over safeDays)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (safeDays - 1));
  startDate.setHours(0, 0, 0, 0);

  const doubtsInRange = await prisma.doubt.findMany({
    where: {
      ...whereClause,
      createdAt: { gte: startDate },
    },
    select: { createdAt: true },
  });

  // Group into daily buckets
  const dailyCounts = {};
  for (let i = 0; i < safeDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().split('T')[0];
    dailyCounts[dateKey] = 0;
  }

  for (const d of doubtsInRange) {
    const dateKey = new Date(d.createdAt).toISOString().split('T')[0];
    if (dailyCounts[dateKey] !== undefined) {
      dailyCounts[dateKey] += 1;
    }
  }

  const creationTrend = Object.keys(dailyCounts).map((dateKey) => {
    const dateObj = new Date(dateKey);
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const day = dateObj.getDate();
    return {
      date: dateKey,
      label: `${month} ${day}`,
      count: dailyCounts[dateKey],
    };
  });

  return {
    days: safeDays,
    scope: isStudentScoped ? 'mine' : 'global',
    totalDoubts: totalCount,
    statusDistribution,
    subjectDistribution,
    creationTrend,
  };
}

