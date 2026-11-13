import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '@/lib/prisma';
import {
  getAdminOverview,
  updateUserRole,
  updateUserStatus,
  reviewAdminReport,
  getAdminAuditLogs,
  recordAuditLog,
} from '@/features/admin/service';

test('Integration: Admin Control Center & Audit Log Integrity', async (t) => {
  let adminUser = null;
  let targetUser = null;
  let report = null;

  t.before(async () => {
    const ts = Date.now();
    adminUser = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: `admin_${ts}@doubtbridge.test`,
        role: 'ADMIN',
      },
    });

    targetUser = await prisma.user.create({
      data: {
        name: 'Target Student',
        email: `target_${ts}@doubtbridge.test`,
        role: 'STUDENT',
        department: 'Physics',
      },
    });

    report = await prisma.report.create({
      data: {
        reason: 'Inappropriate academic comment',
        status: 'PENDING',
        reporterId: targetUser.id,
      },
    });
  });

  t.after(async () => {
    if (report) {
      await prisma.report.deleteMany({ where: { id: report.id } });
    }
    const userIds = [adminUser?.id, targetUser?.id].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.auditLog.deleteMany({
        where: {
          OR: [{ actorId: { in: userIds } }, { targetId: { in: userIds } }],
        },
      });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await prisma.$disconnect();
  });

  await t.test('Admin Overview returns platform metrics without error', async () => {
    const overview = await getAdminOverview();
    assert.ok(overview.metrics);
    assert.ok(overview.metrics.users.total >= 2);
    assert.ok(typeof overview.metrics.users.students === 'number');
    assert.ok(typeof overview.metrics.users.admins === 'number');
    assert.ok(Array.isArray(overview.recentAuditLogs));
  });

  await t.test('Admin promotes student to HELPER and creates audit log with actor snapshot', async () => {
    const updated = await updateUserRole({
      actor: adminUser,
      targetUserId: targetUser.id,
      newRole: 'HELPER',
    });

    assert.equal(updated.role, 'HELPER');

    // Verify HelperProfile was provisioned
    const hp = await prisma.helperProfile.findUnique({ where: { userId: targetUser.id } });
    assert.ok(hp !== null, 'HelperProfile must be created on promotion to HELPER');

    // Verify AuditLog record
    const logs = await prisma.auditLog.findMany({
      where: { action: 'USER_ROLE_CHANGE', targetId: targetUser.id },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    assert.equal(logs.length, 1);
    assert.equal(logs[0].actorEmail, adminUser.email);
    assert.equal(logs[0].actorRole, 'ADMIN');
  });

  await t.test('Self role modification is strictly blocked with 403', async () => {
    await assert.rejects(
      async () => {
        await updateUserRole({
          actor: adminUser,
          targetUserId: adminUser.id,
          newRole: 'STUDENT',
        });
      },
      (err) => err.status === 403 && err.message.includes('cannot modify their own role')
    );
  });

  await t.test('Admin suspends user account and verifies audit record', async () => {
    const suspended = await updateUserStatus({
      actor: adminUser,
      targetUserId: targetUser.id,
      isActive: false,
      suspensionReason: 'Academic policy violation.',
    });

    assert.equal(suspended.isActive, false);
    assert.equal(suspended.suspensionReason, 'Academic policy violation.');

    const logs = await prisma.auditLog.findMany({
      where: { action: 'USER_SUSPEND', targetId: targetUser.id },
      take: 1,
    });
    assert.equal(logs.length, 1);
    assert.equal(logs[0].actorEmail, adminUser.email);
  });

  await t.test('Self account suspension is strictly blocked with 403', async () => {
    await assert.rejects(
      async () => {
        await updateUserStatus({
          actor: adminUser,
          targetUserId: adminUser.id,
          isActive: false,
        });
      },
      (err) => err.status === 403 && err.message.includes('cannot suspend their own account')
    );
  });

  await t.test('Admin reviews community report with resolution notes', async () => {
    const reviewed = await reviewAdminReport({
      actor: adminUser,
      reportId: report.id,
      status: 'REVIEWED',
      resolutionNotes: 'Verified and action taken.',
    });

    assert.equal(reviewed.status, 'REVIEWED');
    assert.equal(reviewed.resolutionNotes, 'Verified and action taken.');
    assert.ok(reviewed.reviewedAt !== null);
  });

  await t.test('Audit log secret scrubber redacts sensitive passwords and tokens', async () => {
    const log = await recordAuditLog({
      actor: adminUser,
      action: 'SYSTEM_AUDIT_TEST',
      targetType: 'SYSTEM',
      targetId: 'sys_1',
      metadata: {
        safeField: 'audit_event',
        password: 'TopSecretPassword!',
        passwordHash: '$2b$12$fakeHashHere...',
        sessionToken: 'xyz123token',
      },
    });

    assert.ok(log);
    const parsed = JSON.parse(log.metadata);
    assert.equal(parsed.safeField, 'audit_event');
    assert.equal(parsed.password, '[REDACTED]');
    assert.equal(parsed.passwordHash, '[REDACTED]');
    assert.equal(parsed.sessionToken, '[REDACTED]');
  });
});

