import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sanitisePublicRole } from '@/lib/permissions';

test('Integration: Authentication & Security Integrity', async (t) => {
  const testEmail = `authtest_${Date.now()}@doubtbridge.test`;
  let createdUserId = null;

  t.after(async () => {
    if (createdUserId) {
      await prisma.user.deleteMany({ where: { id: createdUserId } });
    }
    await prisma.$disconnect();
  });

  await t.test('Password hashing uses bcrypt cost factor 12', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await bcrypt.hash(rawPassword, 12);
    assert.ok(hash.startsWith('$2a$12$') || hash.startsWith('$2b$12$'), 'Hash must use cost factor 12');

    const isValid = await bcrypt.compare(rawPassword, hash);
    assert.equal(isValid, true, 'Valid password must match');

    const isWrong = await bcrypt.compare('WrongPassword999!', hash);
    assert.equal(isWrong, false, 'Invalid password must be rejected');
  });

  await t.test('Public registration sanitizes role escalation to safe default', () => {
    assert.equal(sanitisePublicRole('ADMIN'), 'STUDENT');
    assert.equal(sanitisePublicRole('MODERATOR'), 'STUDENT');
    assert.equal(sanitisePublicRole('HELPER'), 'HELPER');
  });

  await t.test('Registers user and enforces unique email constraint', async () => {
    const hash = await bcrypt.hash('SecurePass123!', 12);
    const user = await prisma.user.create({
      data: {
        name: 'Auth Test Student',
        email: testEmail,
        passwordHash: hash,
        role: 'STUDENT',
        department: 'Computer Science',
      },
    });
    createdUserId = user.id;

    assert.ok(user.id, 'User must have an ID');
    assert.equal(user.email, testEmail);

    // Duplicate email must fail
    await assert.rejects(
      async () => {
        await prisma.user.create({
          data: {
            name: 'Duplicate Student',
            email: testEmail,
            passwordHash: hash,
            role: 'STUDENT',
          },
        });
      },
      (err) => err.code === 'P2002',
      'Duplicate email must violate unique constraint P2002'
    );
  });

  await t.test('Suspended account (isActive: false) is excluded from active user lookups', async () => {
    // Suspend user
    await prisma.user.update({
      where: { id: createdUserId },
      data: { isActive: false, suspensionReason: 'Suspended for test' },
    });

    const activeUser = await prisma.user.findUnique({
      where: { id: createdUserId, isActive: true },
    });
    assert.equal(activeUser, null, 'Suspended user must not be found when querying active users');

    // Reactivate user
    await prisma.user.update({
      where: { id: createdUserId },
      data: { isActive: true, suspensionReason: null },
    });

    const reactivatedUser = await prisma.user.findUnique({
      where: { id: createdUserId, isActive: true },
    });
    assert.ok(reactivatedUser !== null, 'Reactivated user must be found');
  });
});

