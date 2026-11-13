import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '@/lib/prisma';
import { deleteNotification, markNotificationAsRead } from '@/features/notifications/service';
import { updateAssignmentStatus } from '@/features/helpers/service';
import { reviewKnowledgeResource } from '@/features/knowledge/service';
import { updateUserRole, updateUserStatus } from '@/features/admin/service';
import { requireOwnerOrAdmin } from '@/lib/permissions';

test('Security Audit: Cross-User IDOR Defense Verification', async (t) => {
  let victimUser = null;
  let attackerUser = null;
  let helperUser = null;
  let victimDoubt = null;
  let victimNotification = null;
  let assignment = null;
  let victimResource = null;

  t.before(async () => {
    const ts = Date.now();
    victimUser = await prisma.user.create({
      data: {
        name: 'Victim Student',
        email: `victim_${ts}@doubtbridge.test`,
        role: 'STUDENT',
      },
    });

    attackerUser = await prisma.user.create({
      data: {
        name: 'Attacker Student',
        email: `attacker_${ts}@doubtbridge.test`,
        role: 'STUDENT',
      },
    });

    helperUser = await prisma.user.create({
      data: {
        name: 'Assigned Helper',
        email: `assigned_hlp_${ts}@doubtbridge.test`,
        role: 'HELPER',
      },
    });

    victimDoubt = await prisma.doubt.create({
      data: {
        title: 'Victim Private Doubt',
        description: 'Should only be editable or deletable by victim.',
        subject: 'Cybersecurity',
        studentId: victimUser.id,
      },
    });

    victimNotification = await prisma.notification.create({
      data: {
        userId: victimUser.id,
        title: 'Private Alert',
        message: 'Victim notification details',
        type: 'SYSTEM',
      },
    });

    assignment = await prisma.doubtAssignment.create({
      data: {
        doubtId: victimDoubt.id,
        helperId: helperUser.id,
        status: 'ACTIVE',
      },
    });

    victimResource = await prisma.knowledgeResource.create({
      data: {
        title: 'Victim Unpublished Resource',
        content: 'Draft content',
        subject: 'Cybersecurity',
        authorId: victimUser.id,
        status: 'DRAFT',
      },
    });
  });

  t.after(async () => {
    if (assignment) {
      await prisma.doubtAssignment.deleteMany({ where: { id: assignment.id } });
    }
    if (victimDoubt) {
      await prisma.doubt.deleteMany({ where: { id: victimDoubt.id } });
    }
    if (victimResource) {
      await prisma.knowledgeResource.deleteMany({ where: { id: victimResource.id } });
    }
    const ids = [victimUser?.id, attackerUser?.id, helperUser?.id].filter(Boolean);
    if (ids.length > 0) {
      await prisma.notification.deleteMany({ where: { userId: { in: ids } } });
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.$disconnect();
  });

  await t.test('IDOR 1: Attacker cannot access or mutate victim doubt via requireOwnerOrAdmin', () => {
    assert.throws(
      () => requireOwnerOrAdmin(attackerUser, victimDoubt.studentId),
      (err) => err.status === 403,
      'Attacker must receive 403 when trying to access victim doubt'
    );
  });

  await t.test('IDOR 2: Attacker cannot mark victim notification as read', async () => {
    await assert.rejects(
      async () => {
        await markNotificationAsRead(victimNotification.id, attackerUser.id);
      },
      (err) => err.statusCode === 403,
      'Attacker must receive 403 when updating victim notification'
    );
  });

  await t.test('IDOR 3: Attacker cannot delete victim notification', async () => {
    await assert.rejects(
      async () => {
        await deleteNotification(victimNotification.id, attackerUser.id);
      },
      (err) => err.statusCode === 403,
      'Attacker must receive 403 when deleting victim notification'
    );
  });

  await t.test('IDOR 4: Attacker cannot cancel or complete another helper assignment', async () => {
    await assert.rejects(
      async () => {
        await updateAssignmentStatus(assignment.id, attackerUser, 'CANCEL');
      },
      (err) => err.status === 403,
      'Attacker must receive 403 when attempting to cancel another helper assignment'
    );
  });

  await t.test('IDOR 5: Attacker cannot review knowledge resources (non-moderator blocked)', async () => {
    await assert.rejects(
      async () => {
        await reviewKnowledgeResource(victimResource.id, { decision: 'APPROVED' }, attackerUser);
      },
      (err) => err.statusCode === 403,
      'Student attacker must receive 403 trying to review knowledge resources'
    );
  });

  await t.test('IDOR 6: Attacker cannot invoke admin APIs (updateUserRole / updateUserStatus)', async () => {
    await assert.rejects(
      async () => {
        await updateUserRole({
          actor: attackerUser,
          targetUserId: victimUser.id,
          newRole: 'ADMIN',
        });
      },
      (err) => err.status === 403,
      'Non-admin must receive 403 attempting role escalation'
    );

    await assert.rejects(
      async () => {
        await updateUserStatus({
          actor: attackerUser,
          targetUserId: victimUser.id,
          isActive: false,
        });
      },
      (err) => err.status === 403,
      'Non-admin must receive 403 attempting account suspension'
    );
  });
});

