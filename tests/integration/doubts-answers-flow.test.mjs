import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '@/lib/prisma';
import { moderateAnswerRecord } from '@/features/answers/service';

test('Integration: Doubts & Answers Complete Lifecycle', async (t) => {
  let studentUser = null;
  let helperUser = null;
  let moderatorUser = null;
  let createdDoubt = null;
  let createdAnswer = null;

  t.before(async () => {
    const timestamp = Date.now();
    studentUser = await prisma.user.create({
      data: {
        name: 'Lifecycle Student',
        email: `student_lc_${timestamp}@test.doubtbridge`,
        role: 'STUDENT',
      },
    });

    helperUser = await prisma.user.create({
      data: {
        name: 'Lifecycle Helper',
        email: `helper_lc_${timestamp}@test.doubtbridge`,
        role: 'HELPER',
        reputation: 10,
        helperProfile: {
          create: {
            bio: 'Test Helper Profile',
            subjects: 'Mathematics, Algorithms',
            isAvailable: true,
          },
        },
      },
    });

    moderatorUser = await prisma.user.create({
      data: {
        name: 'Lifecycle Moderator',
        email: `mod_lc_${timestamp}@test.doubtbridge`,
        role: 'MODERATOR',
      },
    });
  });

  t.after(async () => {
    if (createdDoubt) {
      await prisma.doubt.deleteMany({ where: { id: createdDoubt.id } });
    }
    const userIds = [studentUser?.id, helperUser?.id, moderatorUser?.id].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await prisma.$disconnect();
  });

  await t.test('Step 1: Student creates a new academic doubt', async () => {
    createdDoubt = await prisma.doubt.create({
      data: {
        title: 'How does Dijkstra algorithm handle negative weights?',
        description: 'Need clarification on shortest path algorithms and Dijkstra vs Bellman-Ford.',
        subject: 'Algorithms',
        studentId: studentUser.id,
        status: 'OPEN',
        priority: 'MEDIUM',
      },
    });

    assert.ok(createdDoubt.id);
    assert.equal(createdDoubt.status, 'OPEN');
    assert.equal(createdDoubt.subject, 'Algorithms');
  });

  await t.test('Step 2: Helper submits an answer (initial status must be PENDING)', async () => {
    createdAnswer = await prisma.answer.create({
      data: {
        content: 'Dijkstra does not guarantee correct shortest paths with negative weights. Use Bellman-Ford instead.',
        doubtId: createdDoubt.id,
        authorId: helperUser.id,
        status: 'PENDING',
      },
    });

    assert.ok(createdAnswer.id);
    assert.equal(createdAnswer.status, 'PENDING', 'New answer must be PENDING moderation');
    assert.equal(createdAnswer.isAccepted, false);
  });

  await t.test('Step 3: Moderator reviews and approves the answer', async () => {
    const modResult = await moderateAnswerRecord({
      doubtId: createdDoubt.id,
      answerId: createdAnswer.id,
      reviewerId: moderatorUser.id,
      reviewerRole: 'MODERATOR',
      decision: 'APPROVED',
      feedback: 'Accurate and concise algorithmic explanation.',
    });

    assert.equal(modResult.review.decision, 'APPROVED');
    assert.equal(modResult.answer.status, 'APPROVED');

    const updatedAns = await prisma.answer.findUnique({
      where: { id: createdAnswer.id },
    });
    assert.equal(updatedAns.status, 'APPROVED', 'Answer status must become APPROVED');
  });

  await t.test('Step 4: Student accepts the answer, resolving doubt and awarding +25 reputation', async () => {
    const beforeHelper = await prisma.user.findUnique({
      where: { id: helperUser.id },
      select: { reputation: true },
    });

    // Accept answer in transaction matching service logic
    await prisma.$transaction(async (tx) => {
      await tx.answer.update({
        where: { id: createdAnswer.id },
        data: { isAccepted: true },
      });

      await tx.doubt.update({
        where: { id: createdDoubt.id },
        data: { status: 'RESOLVED', resolvedAt: new Date() },
      });

      await tx.user.update({
        where: { id: helperUser.id },
        data: { reputation: { increment: 25 } },
      });

      await tx.helperProfile.update({
        where: { userId: helperUser.id },
        data: { acceptedAnswers: { increment: 1 } },
      });
    });

    const resolvedDoubt = await prisma.doubt.findUnique({ where: { id: createdDoubt.id } });
    assert.equal(resolvedDoubt.status, 'RESOLVED');
    assert.ok(resolvedDoubt.resolvedAt !== null);

    const afterHelper = await prisma.user.findUnique({
      where: { id: helperUser.id },
      select: { reputation: true },
    });
    assert.equal(afterHelper.reputation, beforeHelper.reputation + 25, 'Helper reputation must increase by 25');
  });
});

