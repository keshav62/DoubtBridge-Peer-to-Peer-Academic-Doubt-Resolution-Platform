import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '@/lib/prisma';
import {
  getAdminAnswers,
  getAdminAnswerDetail,
  moderateAnswerAdmin,
  getAdminModerationAnalytics,
} from '@/features/admin/service';
import { globalMockCookieStore } from '../mock-headers.mjs';

function makeRequest(url, opts = {}) {
  return new Request(`http://localhost${url}`, opts);
}

function clearSession() {
  globalMockCookieStore.clear();
}

test('Integration: Admin Answer Verification & Moderation Center', async (t) => {
  let adminUser = null;
  let moderatorUser = null;
  let helperUser = null;
  let studentUser = null;
  let testDoubt = null;
  let testAnswer = null;

  t.before(async () => {
    const ts = Date.now();

    // 1. Create test users with distinct roles
    adminUser = await prisma.user.create({
      data: {
        name: 'Verification Admin',
        email: `verif_admin_${ts}@doubtbridge.test`,
        role: 'ADMIN',
      },
    });

    moderatorUser = await prisma.user.create({
      data: {
        name: 'Verification Moderator',
        email: `verif_mod_${ts}@doubtbridge.test`,
        role: 'MODERATOR',
      },
    });

    helperUser = await prisma.user.create({
      data: {
        name: 'Peer Helper Dave',
        email: `verif_helper_${ts}@doubtbridge.test`,
        role: 'HELPER',
        department: 'Physics',
      },
    });

    studentUser = await prisma.user.create({
      data: {
        name: 'Student Alice',
        email: `verif_student_${ts}@doubtbridge.test`,
        role: 'STUDENT',
        department: 'Physics',
      },
    });

    // 2. Create test doubt
    testDoubt = await prisma.doubt.create({
      data: {
        title: 'How to calculate kinetic energy in relativistic mechanics?',
        description: 'Need derivation of E_k = (gamma - 1)mc^2 for Physics exam.',
        subject: 'Physics',
        topic: 'Relativity',
        status: 'OPEN',
        priority: 'HIGH',
        studentId: studentUser.id,
      },
    });

    // 3. Create test answer awaiting moderation
    testAnswer = await prisma.answer.create({
      data: {
        doubtId: testDoubt.id,
        authorId: helperUser.id,
        content: 'Relativistic kinetic energy is obtained by integrating F*dx from rest to velocity v, which gives E_k = (gamma - 1) * m * c^2.',
        status: 'PENDING',
      },
    });
  });

  t.after(async () => {
    // Cleanup created records
    if (testAnswer) {
      await prisma.moderationReview.deleteMany({ where: { answerId: testAnswer.id } });
      await prisma.auditLog.deleteMany({ where: { targetId: testAnswer.id } });
      await prisma.answer.deleteMany({ where: { id: testAnswer.id } });
    }
    if (testDoubt) {
      await prisma.doubt.deleteMany({ where: { id: testDoubt.id } });
    }
    const userIds = [adminUser?.id, moderatorUser?.id, helperUser?.id, studentUser?.id].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.auditLog.deleteMany({ where: { actorId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await prisma.$disconnect();
  });

  await t.test('1. getAdminAnswers returns answers list with queue filtering', async () => {
    const res = await getAdminAnswers({ queue: 'pending', limit: 10 });
    assert.ok(res.answers, 'Must return answers array');
    assert.ok(res.pagination.total >= 1);
    const found = res.answers.find((a) => a.id === testAnswer.id);
    assert.ok(found, 'Test answer must be present in pending queue');
    assert.equal(found.status, 'PENDING');
    assert.equal(found.doubt.title, testDoubt.title);
    assert.equal(found.author.name, helperUser.name);
  });

  await t.test('2. getAdminAnswerDetail returns complete context including doubt and helper', async () => {
    const detail = await getAdminAnswerDetail(testAnswer.id);
    assert.ok(detail, 'Answer detail must exist');
    assert.equal(detail.id, testAnswer.id);
    assert.equal(detail.author.email, helperUser.email);
    assert.equal(detail.doubt.student.name, studentUser.name);
    assert.ok(Array.isArray(detail.reviews));
  });

  await t.test('3. Non-privileged roles (STUDENT, HELPER) cannot execute moderation', async () => {
    await assert.rejects(
      async () => {
        await moderateAnswerAdmin({
          answerId: testAnswer.id,
          reviewer: studentUser,
          decision: 'APPROVED',
          feedback: 'Self-approval attempt',
        });
      },
      (err) => err.status === 403 && err.message.includes('Only administrators and moderators')
    );

    await assert.rejects(
      async () => {
        await moderateAnswerAdmin({
          answerId: testAnswer.id,
          reviewer: helperUser,
          decision: 'APPROVED',
          feedback: 'Helper approval attempt',
        });
      },
      (err) => err.status === 403
    );
  });

  await t.test('4. Self-moderation is blocked even if reviewer has MODERATOR role', async () => {
    // If a moderator wrote the answer, they cannot approve their own answer
    const modAnswer = await prisma.answer.create({
      data: {
        doubtId: testDoubt.id,
        authorId: moderatorUser.id,
        content: 'Alternative solution by moderator user.',
        status: 'PENDING',
      },
    });

    await assert.rejects(
      async () => {
        await moderateAnswerAdmin({
          answerId: modAnswer.id,
          reviewer: moderatorUser,
          decision: 'APPROVED',
          feedback: 'Approve own answer',
        });
      },
      (err) => err.status === 403 && err.message.includes('cannot moderate your own submitted answer')
    );

    await prisma.answer.delete({ where: { id: modAnswer.id } });
  });

  await t.test('5. Rejection requires a reason of at least 5 characters', async () => {
    await assert.rejects(
      async () => {
        await moderateAnswerAdmin({
          answerId: testAnswer.id,
          reviewer: moderatorUser,
          decision: 'REJECTED',
          feedback: '',
        });
      },
      (err) => err.status === 400 && err.message.includes('rejection reason')
    );
  });

  await t.test('6. Needs Changes requires constructive feedback of at least 5 characters', async () => {
    await assert.rejects(
      async () => {
        await moderateAnswerAdmin({
          answerId: testAnswer.id,
          reviewer: moderatorUser,
          decision: 'NEEDS_CHANGES',
          feedback: 'bad',
        });
      },
      (err) => err.status === 400 && err.message.includes('Constructive feedback')
    );
  });

  await t.test('7. MODERATOR can request changes, dispatches notification and audit log', async () => {
    const result = await moderateAnswerAdmin({
      answerId: testAnswer.id,
      reviewer: moderatorUser,
      decision: 'NEEDS_CHANGES',
      feedback: 'Please explain the integration bounds from 0 to v.',
    });

    assert.equal(result.answer.status, 'PENDING', 'Answer should remain PENDING awaiting revisions');
    assert.equal(result.review.decision, 'NEEDS_CHANGES');
    assert.equal(result.review.reviewer.name, moderatorUser.name);

    // Verify Notification sent to helper
    const notif = await prisma.notification.findFirst({
      where: { userId: helperUser.id, type: 'MODERATION_DECISION' },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(notif, 'Helper must receive moderation notification');
    assert.ok(notif.title.includes('Changes Requested'));

    // Verify AuditLog record
    const audit = await prisma.auditLog.findFirst({
      where: { targetId: testAnswer.id, action: 'ANSWER_MODERATION' },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(audit, 'Audit log must be created');
    assert.equal(audit.actorEmail, moderatorUser.email);
  });

  await t.test('8. ADMIN approves answer: transitions status to APPROVED, doubt to ANSWERED', async () => {
    const result = await moderateAnswerAdmin({
      answerId: testAnswer.id,
      reviewer: adminUser,
      decision: 'APPROVED',
      feedback: 'Excellent and rigorous derivation.',
    });

    assert.equal(result.answer.status, 'APPROVED');

    // Verify Doubt transitioned to ANSWERED
    const updatedDoubt = await prisma.doubt.findUnique({ where: { id: testDoubt.id } });
    assert.equal(updatedDoubt.status, 'ANSWERED');

    // Verify Helper Notification
    const notif = await prisma.notification.findFirst({
      where: { userId: helperUser.id, title: 'Answer Approved' },
      orderBy: { createdAt: 'desc' },
    });
    assert.ok(notif, 'Helper must receive approval notification');
  });

  await t.test('9. getAdminModerationAnalytics returns computed quality rates', async () => {
    const analytics = await getAdminModerationAnalytics();
    assert.ok(analytics.summary);
    assert.ok(analytics.summary.totalReviews >= 2);
    assert.ok(typeof analytics.summary.approvalRate === 'number');
    assert.ok(typeof analytics.summary.needsChangesRate === 'number');
    assert.ok(Array.isArray(analytics.dailyReviews));
    assert.ok(Array.isArray(analytics.moderatorActivity));
    assert.ok(Array.isArray(analytics.subjectDistribution));
  });

  await t.test('10. Unauthenticated API access returns 401', async () => {
    clearSession();
    const { GET: getAnswers } = await import('@/app/api/admin/answers/route.js');
    const { GET: getAnalytics } = await import('@/app/api/admin/analytics/moderation/route.js');

    const res1 = await getAnswers(makeRequest('/api/admin/answers'));
    assert.equal(res1.status, 401);

    const res2 = await getAnalytics(makeRequest('/api/admin/analytics/moderation'));
    assert.equal(res2.status, 401);
  });
});
