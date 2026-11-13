import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '@/lib/prisma';
import { getDashboardOverview } from '@/features/dashboard/service';

test('Integration: Multi-Role Dashboard & Analytics Service', async (t) => {
  let student = null;
  let helper = null;
  let moderator = null;
  let admin = null;

  t.before(async () => {
    const ts = Date.now();
    student = await prisma.user.create({
      data: {
        name: 'Dash Student',
        email: `dash_s_${ts}@doubtbridge.test`,
        role: 'STUDENT',
      },
    });

    helper = await prisma.user.create({
      data: {
        name: 'Dash Helper',
        email: `dash_h_${ts}@doubtbridge.test`,
        role: 'HELPER',
        helperProfile: {
          create: {
            isAvailable: true,
            subjects: 'Computer Science',
          },
        },
      },
    });

    moderator = await prisma.user.create({
      data: {
        name: 'Dash Moderator',
        email: `dash_m_${ts}@doubtbridge.test`,
        role: 'MODERATOR',
      },
    });

    admin = await prisma.user.create({
      data: {
        name: 'Dash Admin',
        email: `dash_a_${ts}@doubtbridge.test`,
        role: 'ADMIN',
      },
    });
  });

  t.after(async () => {
    const ids = [student?.id, helper?.id, moderator?.id, admin?.id].filter(Boolean);
    if (ids.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.$disconnect();
  });

  await t.test('STUDENT receives student-specific metrics and doubts', async () => {
    const data = await getDashboardOverview({ user: student });
    assert.ok(data.stats);
    assert.ok(typeof data.stats.totalDoubts === 'number');
    assert.ok(typeof data.stats.openDoubts === 'number');
    assert.ok(Array.isArray(data.recentDoubts));
  });

  await t.test('HELPER receives helper-specific metrics and workload statistics', async () => {
    const data = await getDashboardOverview({ user: helper });
    assert.ok(data.stats);
    assert.ok(typeof data.stats.activeAssignments === 'number');
    assert.ok(typeof data.stats.acceptedSolutions === 'number');
    assert.ok(typeof data.stats.totalAnswers === 'number');
  });

  await t.test('MODERATOR receives moderation queue metrics', async () => {
    const data = await getDashboardOverview({ user: moderator });
    assert.ok(data.stats);
    assert.ok(typeof data.stats.pendingAnswers === 'number');
    assert.ok(typeof data.stats.reviewsByMe === 'number');
  });

  await t.test('ADMIN receives system-wide platform statistics', async () => {
    const data = await getDashboardOverview({ user: admin });
    assert.ok(data.stats);
    assert.ok(typeof data.stats.totalUsers === 'number');
    assert.ok(typeof data.stats.totalDoubts === 'number');
    assert.ok(typeof data.stats.totalAnswers === 'number');
  });
});
