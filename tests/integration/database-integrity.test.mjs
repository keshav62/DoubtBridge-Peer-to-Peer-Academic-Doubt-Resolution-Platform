import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '@/lib/prisma';

test('Integration: Database Constraints & Audit Retention', async (t) => {
  let tempAdmin = null;
  let auditLogId = null;

  t.before(async () => {
    const ts = Date.now();
    tempAdmin = await prisma.user.create({
      data: {
        name: 'Ephemeral Admin',
        email: `ephemeral_admin_${ts}@doubtbridge.test`,
        role: 'ADMIN',
      },
    });

    const log = await prisma.auditLog.create({
      data: {
        actorId: tempAdmin.id,
        actorEmail: tempAdmin.email,
        actorName: tempAdmin.name,
        actorRole: tempAdmin.role,
        action: 'RETENTION_TEST',
        targetType: 'SYSTEM',
        targetId: 'sys_test_1',
        metadata: JSON.stringify({ event: 'pre_deletion_test' }),
      },
    });
    auditLogId = log.id;
  });

  t.after(async () => {
    if (auditLogId) {
      await prisma.auditLog.deleteMany({ where: { id: auditLogId } });
    }
    if (tempAdmin) {
      await prisma.user.deleteMany({ where: { id: tempAdmin.id } });
    }
    await prisma.$disconnect();
  });

  await t.test('Deleting an administrator sets actorId to NULL and retains AuditLog with snapshot', async () => {
    // Delete the administrator account
    await prisma.user.delete({ where: { id: tempAdmin.id } });
    tempAdmin = null; // marked as deleted

    // Verify the audit log still exists in the database
    const survivingLog = await prisma.auditLog.findUnique({
      where: { id: auditLogId },
    });

    assert.ok(survivingLog !== null, 'AuditLog MUST NOT be deleted when administrator is deleted');
    assert.equal(survivingLog.actorId, null, 'actorId must be set to NULL via ON DELETE SET NULL');
    assert.ok(survivingLog.actorEmail.includes('ephemeral_admin'), 'actorEmail snapshot must be preserved');
    assert.equal(survivingLog.actorName, 'Ephemeral Admin', 'actorName snapshot must be preserved');
  });

  await t.test('Bookmark unique constraint prevents duplicate bookmarking', async () => {
    const ts = Date.now();
    const student = await prisma.user.create({
      data: {
        name: 'Bookmark Constraint Student',
        email: `bm_student_${ts}@doubtbridge.test`,
        role: 'STUDENT',
      },
    });

    const doubt = await prisma.doubt.create({
      data: {
        title: 'Constraint Test Doubt',
        description: 'Testing unique bookmark constraints',
        subject: 'General',
        studentId: student.id,
      },
    });

    // Create first bookmark
    const bm1 = await prisma.bookmark.create({
      data: {
        userId: student.id,
        doubtId: doubt.id,
      },
    });
    assert.ok(bm1.id);

    // Duplicate bookmark must be rejected by unique constraint
    await assert.rejects(
      async () => {
        await prisma.bookmark.create({
          data: {
            userId: student.id,
            doubtId: doubt.id,
          },
        });
      },
      (err) => err.code === 'P2002'
    );

    // Cleanup
    await prisma.doubt.delete({ where: { id: doubt.id } });
    await prisma.user.delete({ where: { id: student.id } });
  });
});

