import { prisma } from '@/lib/prisma';

export const WORKLOAD_LIMIT = 5;

/**
 * Normalizes a comma-separated string or array into an array of lowercase trimmed strings.
 */
function normalizeList(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  }
  return String(val)
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Calculates a rule-based match score between a doubt and a helper.
 *
 * Scoring Rubric (Max 100):
 * - Subject expertise match: +30
 * - Topic expertise match:   +50
 * - Helper is available:     +20
 *
 * Returns: { score: number, reasons: string[], isEligible: boolean, ineligibleReason?: string }
 */
export function calculateMatchScore(doubt, helper, activeAssignmentsCount = 0) {
  const reasons = [];
  let score = 0;

  // 1. Exclusion: Self-claim prevention (cannot help own question)
  if (helper.id === doubt.studentId || helper.id === doubt.authorId) {
    return {
      score: 0,
      reasons: ['Cannot claim own question'],
      isEligible: false,
      ineligibleReason: 'Doubt was asked by this user.',
    };
  }

  // 2. Exclusion: Availability
  const isAvailable = helper.isAvailable !== false && helper.helperProfile?.isAvailable !== false;
  if (!isAvailable) {
    return {
      score: 0,
      reasons: ['Helper is currently marked as unavailable'],
      isEligible: false,
      ineligibleReason: 'Helper availability is paused.',
    };
  }

  // 3. Exclusion: Workload limit
  if (activeAssignmentsCount >= WORKLOAD_LIMIT) {
    return {
      score: 0,
      reasons: [`Workload limit of ${WORKLOAD_LIMIT} active assignments reached`],
      isEligible: false,
      ineligibleReason: `Active workload limit (${WORKLOAD_LIMIT}) reached.`,
    };
  }

  // Helper is available (+20)
  score += 20;
  reasons.push('Helper is available (+20)');

  // Extract helper subjects and expertise
  const helperSubjects = [
    ...normalizeList(helper.subjects),
    ...normalizeList(helper.helperProfile?.subjects),
  ];
  const helperExpertise = [
    ...helperSubjects,
    ...normalizeList(helper.helperProfile?.expertise),
  ];

  // Subject matching (+30)
  const doubtSubject = (doubt.subject || '').trim().toLowerCase();
  const subjectMatches =
    doubtSubject &&
    helperSubjects.some(
      (sub) => sub === doubtSubject || doubtSubject.includes(sub) || sub.includes(doubtSubject)
    );

  if (subjectMatches) {
    score += 30;
    reasons.push(`Subject match: "${doubt.subject}" (+30)`);
  }

  // Topic matching (+50)
  const doubtTopic = (doubt.topic || '').trim().toLowerCase();
  let topicMatches = false;

  if (doubtTopic) {
    topicMatches = helperExpertise.some(
      (exp) => exp === doubtTopic || doubtTopic.includes(exp) || exp.includes(doubtTopic)
    );
  } else {
    // If doubt has no specific topic, check if any expertise keyword appears in doubt's title or description
    const textCorpus = `${doubt.title || ''} ${doubt.description || ''}`.toLowerCase();
    topicMatches = helperExpertise.some((exp) => exp.length > 2 && textCorpus.includes(exp));
  }

  if (topicMatches) {
    score += 50;
    reasons.push(
      doubt.topic
        ? `Topic match: "${doubt.topic}" (+50)`
        : 'Keyword match in question text (+50)'
    );
  }

  return {
    score: Math.min(score, 100),
    reasons,
    isEligible: true,
  };
}

/**
 * Finds and ranks open doubts tailored for a specific helper.
 * Strictly excludes:
 * - Already claimed doubts (status !== 'OPEN' or helperId !== null)
 * - Doubts created by the helper
 * - Resolved or closed doubts
 */
export async function getRecommendedDoubtsForHelper(
  helperUser,
  {
    limit = 20,
    offset = 0,
    subject = '',
    topic = '',
    urgency = '',
    difficulty = '',
    sort = 'best_match',
  } = {}
) {
  if (!helperUser || !helperUser.id) {
    throw new Error('Helper context is required.');
  }

  // Count helper's current active assignments
  const activeCount = await prisma.doubtAssignment.count({
    where: { helperId: helperUser.id, status: 'ACTIVE' },
  });

  // Base query for claimable open doubts
  const where = {
    status: 'OPEN',
    helperId: null,
    studentId: { not: helperUser.id },
  };

  if (subject) {
    where.subject = { contains: subject, mode: 'insensitive' };
  }
  if (topic) {
    where.topic = { contains: topic, mode: 'insensitive' };
  }
  if (urgency) {
    where.urgency = urgency;
  }
  if (difficulty) {
    where.difficulty = { equals: difficulty, mode: 'insensitive' };
  }

  const openDoubts = await prisma.doubt.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          avatar: true,
          department: true,
        },
      },
      _count: {
        select: { answers: true },
      },
    },
    take: 100, // Fetch pool to compute scores and rank
    orderBy: { createdAt: 'desc' },
  });

  // Score each doubt
  const scoredDoubts = openDoubts.map((doubt) => {
    const match = calculateMatchScore(doubt, helperUser, activeCount);
    return {
      ...doubt,
      matchScore: match.score,
      matchReasons: match.reasons,
      isEligible: match.isEligible,
      ineligibleReason: match.ineligibleReason,
    };
  });

  // Sort based on requested option
  scoredDoubts.sort((a, b) => {
    if (sort === 'best_match') {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      // Tie breaker: newer first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sort === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sort === 'urgency') {
      const urgencyRank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const diff = (urgencyRank[b.urgency] || 2) - (urgencyRank[a.urgency] || 2);
      if (diff !== 0) return diff;
      return b.matchScore - a.matchScore;
    }
    // Default newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const total = scoredDoubts.length;
  const paginated = scoredDoubts.slice(offset, offset + limit);

  return {
    total,
    limit,
    offset,
    doubts: paginated,
    activeAssignmentsCount: activeCount,
    workloadLimit: WORKLOAD_LIMIT,
  };
}

/**
 * Finds top matching helpers for a given doubt.
 * Used for suggesting helpers on the doubt detail page or admin view.
 */
export async function matchHelpersForDoubt(doubtIdOrSubject) {
  let doubt = null;
  if (typeof doubtIdOrSubject === 'string' && doubtIdOrSubject.startsWith('seed-doubt')) {
    doubt = await prisma.doubt.findUnique({
      where: { id: doubtIdOrSubject },
    });
  } else if (typeof doubtIdOrSubject === 'object') {
    doubt = doubtIdOrSubject;
  }

  const subject = doubt ? doubt.subject : doubtIdOrSubject;

  const helpers = await prisma.user.findMany({
    where: {
      role: { in: ['HELPER', 'ADMIN'] },
      isActive: true,
      isAvailable: true,
    },
    include: {
      helperProfile: true,
      doubtAssignments: {
        where: { status: 'ACTIVE' },
        select: { id: true },
      },
    },
  });

  const results = helpers
    .map((helper) => {
      const activeAssignmentsCount = helper.doubtAssignments.length;
      const match = doubt
        ? calculateMatchScore(doubt, helper, activeAssignmentsCount)
        : {
            score: (helper.subjects || '').toLowerCase().includes(String(subject).toLowerCase()) ? 50 : 20,
            reasons: ['General subject match'],
            isEligible: activeAssignmentsCount < WORKLOAD_LIMIT,
          };

      return {
        id: helper.id,
        name: helper.name,
        email: helper.email,
        reputation: helper.reputation,
        subjects: helper.subjects,
        expertise: helper.helperProfile?.expertise || null,
        avatar: helper.avatarUrl || helper.avatar,
        department: helper.department,
        activeAssignmentsCount,
        matchScore: match.score,
        matchReasons: match.reasons,
        isEligible: match.isEligible,
      };
    })
    .filter((h) => h.isEligible)
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return b.reputation - a.reputation;
    })
    .slice(0, 5);

  return results;
}
