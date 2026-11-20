import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/leaderboard
 * Returns ranked users by reputation + accepted answers + resolved doubts.
 * Auth is optional — if authenticated, also returns the current user's rank.
 * Query params: period=all|month|week, page, limit
 * Never exposes email addresses.
 */
export async function GET(request) {
  try {
    const user = await getCurrentUser(); // may be null — public leaderboard
    const { searchParams } = new URL(request.url);

    const period = searchParams.get('period') || 'all'; // all | month | week
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    // Date filter for time-based periods
    let dateFilter = undefined;
    if (period === 'month') {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      dateFilter = start;
    } else if (period === 'week') {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay()); // Sunday
      start.setHours(0, 0, 0, 0);
      dateFilter = start;
    }

    const userWhere = { isActive: true };

    // For time-based periods, we need to filter based on answer/doubt activity
    // For "all time", we sort by the stored reputation field directly
    // For periods, we aggregate answers/doubts in that period and rank by those

    if (!dateFilter) {
      // All-time: fast path using stored reputation
      const [total, users] = await Promise.all([
        prisma.user.count({ where: userWhere }),
        prisma.user.findMany({
          where: userWhere,
          orderBy: [{ reputation: 'desc' }, { createdAt: 'asc' }],
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            avatar: true,
            avatarUrl: true,
            role: true,
            department: true,
            academicYear: true,
            reputation: true,
            createdAt: true,
            _count: {
              select: {
                answers: true,
                authoredDoubts: true,
              },
            },
          },
        }),
      ]);

      // Get accepted answers count per user
      const userIds = users.map((u) => u.id);
      const acceptedCounts = await prisma.answer.groupBy({
        by: ['authorId'],
        where: { authorId: { in: userIds }, isAccepted: true },
        _count: { id: true },
      });
      const acceptedMap = Object.fromEntries(
        acceptedCounts.map((a) => [a.authorId, a._count.id])
      );

      const resolvedCounts = await prisma.doubt.groupBy({
        by: ['studentId'],
        where: { studentId: { in: userIds }, status: 'RESOLVED' },
        _count: { id: true },
      });
      const resolvedMap = Object.fromEntries(
        resolvedCounts.map((d) => [d.studentId, d._count.id])
      );

      const ranked = users.map((u, i) => ({
        rank: skip + i + 1,
        id: u.id,
        name: u.name,
        avatar: u.avatar || u.avatarUrl,
        role: u.role,
        department: u.department,
        academicYear: u.academicYear,
        reputation: u.reputation,
        totalAnswers: u._count.answers,
        acceptedAnswers: acceptedMap[u.id] || 0,
        resolvedDoubts: resolvedMap[u.id] || 0,
        isCurrentUser: user ? u.id === user.id : false,
      }));

      // Current user's rank if authenticated and not in page
      let currentUserRank = null;
      if (user && !ranked.some((r) => r.isCurrentUser)) {
        currentUserRank = await getUserRank(user.id, null, prisma);
      } else if (user) {
        currentUserRank = ranked.find((r) => r.isCurrentUser) || null;
      }

      return NextResponse.json({
        success: true,
        leaderboard: ranked,
        currentUserRank,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + users.length < total,
        },
        period,
      });
    } else {
      // Period-based: rank by accepted answers + reputation in that window
      const periodAnswers = await prisma.answer.groupBy({
        by: ['authorId'],
        where: {
          isAccepted: true,
          createdAt: { gte: dateFilter },
        },
        _count: { id: true },
        _sum: { upvotes: true },
        orderBy: { _count: { id: 'desc' } },
      });

      const periodUserIds = periodAnswers.map((a) => a.authorId);

      // Fall back to all active users if no period answers exist
      const userIds = periodUserIds.length > 0 ? periodUserIds : [];

      const usersData = await prisma.user.findMany({
        where: userIds.length > 0 ? { id: { in: userIds }, isActive: true } : userWhere,
        select: {
          id: true,
          name: true,
          avatar: true,
          avatarUrl: true,
          role: true,
          department: true,
          academicYear: true,
          reputation: true,
          createdAt: true,
        },
        take: 100,
      });

      const answerMap = Object.fromEntries(
        periodAnswers.map((a) => [a.authorId, { accepted: a._count.id, upvotes: a._sum.upvotes || 0 }])
      );

      const scored = usersData.map((u) => {
        const stats = answerMap[u.id] || { accepted: 0, upvotes: 0 };
        return {
          id: u.id,
          name: u.name,
          avatar: u.avatar || u.avatarUrl,
          role: u.role,
          department: u.department,
          academicYear: u.academicYear,
          reputation: u.reputation,
          acceptedAnswers: stats.accepted,
          upvotes: stats.upvotes,
          score: stats.accepted * 10 + stats.upvotes + u.reputation,
        };
      });

      scored.sort((a, b) => b.score - a.score || b.reputation - a.reputation);

      const total = scored.length;
      const paginated = scored.slice(skip, skip + limit);

      const ranked = paginated.map((u, i) => ({
        rank: skip + i + 1,
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        role: u.role,
        department: u.department,
        academicYear: u.academicYear,
        reputation: u.reputation,
        acceptedAnswers: u.acceptedAnswers,
        isCurrentUser: user ? u.id === user.id : false,
      }));

      let currentUserRank = null;
      if (user) {
        const myRankIndex = scored.findIndex((u) => u.id === user.id);
        if (myRankIndex === -1) {
          currentUserRank = null;
        } else {
          currentUserRank = {
            rank: myRankIndex + 1,
            ...scored[myRankIndex],
            isCurrentUser: true,
          };
        }
      }

      return NextResponse.json({
        success: true,
        leaderboard: ranked,
        currentUserRank,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + paginated.length < total,
        },
        period,
      });
    }
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load leaderboard' },
      { status: 500 }
    );
  }
}

async function getUserRank(userId, dateFilter, prisma) {
  if (!dateFilter) {
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { reputation: true },
    });
    if (!userRecord) return null;
    const rank = await prisma.user.count({
      where: { isActive: true, reputation: { gt: userRecord.reputation } },
    });
    const acceptedCount = await prisma.answer.count({ where: { authorId: userId, isAccepted: true } });
    return {
      rank: rank + 1,
      id: userId,
      reputation: userRecord.reputation,
      acceptedAnswers: acceptedCount,
      isCurrentUser: true,
    };
  }
  return null;
}
