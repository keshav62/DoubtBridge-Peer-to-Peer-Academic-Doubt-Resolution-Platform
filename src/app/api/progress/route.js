import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/progress
 * Returns personal progress statistics for the authenticated user.
 * Never accepts userId from query params — always uses the session user.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Run all aggregation queries in parallel
    const [
      totalDoubts,
      resolvedDoubts,
      totalAnswers,
      approvedAnswers,
      acceptedAnswers,
      upvotesAgg,
      recentDoubts,
      recentAnswers,
      weeklyDoubts,
      weeklyAnswers,
      subjectStats,
    ] = await Promise.all([
      // Total doubts created
      prisma.doubt.count({ where: { studentId: userId } }),

      // Resolved doubts
      prisma.doubt.count({ where: { studentId: userId, status: 'RESOLVED' } }),

      // Total answers submitted
      prisma.answer.count({ where: { authorId: userId } }),

      // Approved answers
      prisma.answer.count({ where: { authorId: userId, status: 'APPROVED' } }),

      // Accepted answers (isAccepted = true)
      prisma.answer.count({ where: { authorId: userId, isAccepted: true } }),

      // Total upvotes received
      prisma.answer.aggregate({
        where: { authorId: userId },
        _sum: { upvotes: true },
      }),

      // Recent doubts (last 10)
      prisma.doubt.findMany({
        where: { studentId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          subject: true,
          status: true,
          createdAt: true,
          resolvedAt: true,
        },
      }),

      // Recent answers (last 10)
      prisma.answer.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          content: true,
          status: true,
          isAccepted: true,
          upvotes: true,
          createdAt: true,
          doubt: {
            select: { id: true, title: true, subject: true },
          },
        },
      }),

      // Weekly doubts — last 7 days grouped by day
      prisma.doubt.findMany({
        where: {
          studentId: userId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { createdAt: true },
      }),

      // Weekly answers — last 7 days
      prisma.answer.findMany({
        where: {
          authorId: userId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { createdAt: true, status: true },
      }),

      // Subject distribution for doubts
      prisma.doubt.groupBy({
        by: ['subject'],
        where: { studentId: userId },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 8,
      }),
    ]);

    const totalUpvotes = upvotesAgg._sum.upvotes || 0;

    // Build 7-day activity arrays (Mon–Sun labels)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const weeklyDoubtCounts = Array(7).fill(0);
    const weeklyAnswerCounts = Array(7).fill(0);

    weeklyDoubts.forEach((d) => {
      const dayIndex = new Date(d.createdAt).getDay();
      weeklyDoubtCounts[dayIndex]++;
    });
    weeklyAnswers.forEach((a) => {
      const dayIndex = new Date(a.createdAt).getDay();
      weeklyAnswerCounts[dayIndex]++;
    });

    // Rotate so today is last
    const todayIndex = now.getDay();
    const rotatedDays = [];
    const rotatedDoubtCounts = [];
    const rotatedAnswerCounts = [];
    for (let i = 0; i < 7; i++) {
      const idx = (todayIndex - 6 + i + 7) % 7;
      rotatedDays.push(days[idx]);
      rotatedDoubtCounts.push(weeklyDoubtCounts[idx]);
      rotatedAnswerCounts.push(weeklyAnswerCounts[idx]);
    }

    // Build activity timeline (merge doubts + answers, sort by createdAt desc)
    const timeline = [
      ...recentDoubts.map((d) => ({
        type: 'DOUBT_CREATED',
        id: d.id,
        title: d.title,
        subject: d.subject,
        status: d.status,
        createdAt: d.createdAt,
        resolvedAt: d.resolvedAt,
      })),
      ...recentAnswers.map((a) => ({
        type: a.isAccepted ? 'ANSWER_ACCEPTED' : a.status === 'APPROVED' ? 'ANSWER_APPROVED' : 'ANSWER_SUBMITTED',
        id: a.id,
        content: a.content.slice(0, 100),
        doubtId: a.doubt?.id,
        doubtTitle: a.doubt?.title,
        subject: a.doubt?.subject,
        status: a.status,
        isAccepted: a.isAccepted,
        upvotes: a.upvotes,
        createdAt: a.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    // Compute achievements
    const achievements = computeAchievements({
      totalDoubts,
      resolvedDoubts,
      totalAnswers,
      approvedAnswers,
      acceptedAnswers,
      totalUpvotes,
      reputation: user.reputation || 0,
    });

    // Subject data for chart
    const subjectData = subjectStats.map((s) => ({
      subject: s.subject,
      count: s._count.id,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalDoubts,
        resolvedDoubts,
        totalAnswers,
        approvedAnswers,
        acceptedAnswers,
        totalUpvotes,
        reputation: user.reputation || 0,
        approvalRate: totalAnswers > 0 ? Math.round((approvedAnswers / totalAnswers) * 100) : 0,
        acceptanceRate: approvedAnswers > 0 ? Math.round((acceptedAnswers / approvedAnswers) * 100) : 0,
      },
      weeklyActivity: {
        days: rotatedDays,
        doubts: rotatedDoubtCounts,
        answers: rotatedAnswerCounts,
      },
      subjectData,
      timeline,
      achievements,
    });
  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load progress data' },
      { status: 500 }
    );
  }
}

function computeAchievements({ totalDoubts, resolvedDoubts, totalAnswers, approvedAnswers, acceptedAnswers, totalUpvotes, reputation }) {
  const list = [
    {
      id: 'first-doubt',
      title: 'First Doubt',
      description: 'Created your first doubt',
      icon: '❓',
      earned: totalDoubts >= 1,
      progress: Math.min(totalDoubts, 1),
      target: 1,
    },
    {
      id: 'first-answer',
      title: 'First Answer',
      description: 'Submitted your first answer',
      icon: '✍️',
      earned: totalAnswers >= 1,
      progress: Math.min(totalAnswers, 1),
      target: 1,
    },
    {
      id: 'problem-solver',
      title: 'Problem Solver',
      description: 'Had an answer accepted',
      icon: '🎯',
      earned: acceptedAnswers >= 1,
      progress: Math.min(acceptedAnswers, 1),
      target: 1,
    },
    {
      id: 'knowledge-sharer',
      title: 'Knowledge Sharer',
      description: 'Got 5 answers approved',
      icon: '📚',
      earned: approvedAnswers >= 5,
      progress: Math.min(approvedAnswers, 5),
      target: 5,
    },
    {
      id: 'helpful-peer',
      title: 'Helpful Peer',
      description: 'Answered 10 doubts',
      icon: '🤝',
      earned: totalAnswers >= 10,
      progress: Math.min(totalAnswers, 10),
      target: 10,
    },
    {
      id: 'doubt-resolver',
      title: 'Doubt Resolver',
      description: 'Resolved 5 of your doubts',
      icon: '✅',
      earned: resolvedDoubts >= 5,
      progress: Math.min(resolvedDoubts, 5),
      target: 5,
    },
    {
      id: 'upvote-magnet',
      title: 'Upvote Magnet',
      description: 'Received 25 upvotes on answers',
      icon: '⬆️',
      earned: totalUpvotes >= 25,
      progress: Math.min(totalUpvotes, 25),
      target: 25,
    },
    {
      id: 'reputation-builder',
      title: 'Reputation Builder',
      description: 'Earned 100 reputation points',
      icon: '⭐',
      earned: reputation >= 100,
      progress: Math.min(reputation, 100),
      target: 100,
    },
  ];
  return list;
}
