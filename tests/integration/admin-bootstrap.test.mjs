import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const execFileAsync = promisify(execFile);

test('Integration: Admin Bootstrap CLI (scripts/create-admin.js)', async (t) => {
  const ts = Date.now();
  const rawPassword = 'SecurePassword987!';
  const studentEmail = `student_bootstrap_${ts}@doubtbridge.test`;
  const suspendedEmail = `suspended_bootstrap_${ts}@doubtbridge.test`;
  const adminEmail = `admin_bootstrap_${ts}@doubtbridge.test`;

  let studentUser = null;
  let suspendedUser = null;
  let adminUser = null;
  let originalPasswordHash = null;

  t.before(async () => {
    originalPasswordHash = await bcrypt.hash(rawPassword, 10);

    // 1. Create standard active student
    studentUser = await prisma.user.create({
      data: {
        name: 'Bootstrap Candidate',
        email: studentEmail,
        passwordHash: originalPasswordHash,
        role: 'STUDENT',
        isActive: true,
        department: 'Computer Science',
        academicYear: '3rd Year',
      },
    });

    // 2. Create suspended student
    suspendedUser = await prisma.user.create({
      data: {
        name: 'Suspended Candidate',
        email: suspendedEmail,
        passwordHash: originalPasswordHash,
        role: 'STUDENT',
        isActive: false,
        suspensionReason: 'Violation of academic code',
      },
    });

    // 3. Create existing admin
    adminUser = await prisma.user.create({
      data: {
        name: 'Existing Admin',
        email: adminEmail,
        passwordHash: originalPasswordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });
  });

  t.after(async () => {
    const userIds = [studentUser?.id, suspendedUser?.id, adminUser?.id].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.auditLog.deleteMany({
        where: { targetId: { in: userIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
    }
    await prisma.$disconnect();
  });

  // ── 1. Nonexistent user rejection ──────────────────────────────────────────
  await t.test('1. Fails when user email does not exist in database', async () => {
    try {
      await execFileAsync(process.execPath, [
        'scripts/create-admin.js',
        `nonexistent_${ts}@nowhere.test`,
        '--yes',
      ]);
      assert.fail('Should have failed with exit code 1');
    } catch (err) {
      assert.equal(err.code, 1);
      assert.ok(
        err.stderr.includes('No user account found'),
        `stderr should indicate missing user: ${err.stderr}`
      );
    }
  });

  // ── 2. Inactive/suspended user rejection ────────────────────────────────────
  await t.test('2. Refuses to promote inactive or suspended account', async () => {
    try {
      await execFileAsync(process.execPath, [
        'scripts/create-admin.js',
        suspendedEmail,
        '--yes',
      ]);
      assert.fail('Should have failed with exit code 1');
    } catch (err) {
      assert.equal(err.code, 1);
      assert.ok(
        err.stderr.includes('deactivated or suspended'),
        `stderr should indicate suspended account: ${err.stderr}`
      );
    }
  });

  // ── 3. Already admin notice ────────────────────────────────────────────────
  await t.test('3. Returns clean notice if user is already an ADMIN', async () => {
    const { stdout } = await execFileAsync(process.execPath, [
      'scripts/create-admin.js',
      adminEmail,
      '--yes',
    ]);

    assert.ok(
      stdout.includes('ALREADY an ADMIN'),
      `stdout should report user is already admin: ${stdout}`
    );
  });

  // ── 4. Successful promotion with email normalization ───────────────────────
  await t.test('4. Successfully promotes active user with email normalization and creates audit log', async () => {
    // Pass email with mixed casing and extra whitespace
    const unnormalizedEmail = `  ${studentEmail.toUpperCase()}  `;

    const { stdout } = await execFileAsync(process.execPath, [
      'scripts/create-admin.js',
      unnormalizedEmail,
      '--yes',
    ]);

    assert.ok(
      stdout.includes('successfully promoted') && stdout.includes('ADMIN'),
      `stdout should report success: ${stdout}`
    );

    // Verify database record
    const updatedUser = await prisma.user.findUnique({
      where: { id: studentUser.id },
    });

    assert.equal(updatedUser.role, 'ADMIN', 'Role must now be ADMIN');
    assert.equal(
      updatedUser.passwordHash,
      originalPasswordHash,
      'Password hash must NEVER be modified or touched'
    );

    // Verify AuditLog record
    const auditRecord = await prisma.auditLog.findFirst({
      where: {
        targetId: studentUser.id,
        action: 'USER_ROLE_CHANGE',
      },
      orderBy: { createdAt: 'desc' },
    });

    assert.ok(auditRecord, 'AuditLog record must exist');
    assert.equal(auditRecord.targetType, 'USER');
    assert.equal(auditRecord.actorRole, 'SYSTEM');

    const meta = JSON.parse(auditRecord.metadata);
    assert.equal(meta.previousRole, 'STUDENT');
    assert.equal(meta.newRole, 'ADMIN');
  });
});
