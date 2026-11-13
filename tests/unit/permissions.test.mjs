import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROLES,
  isAdmin,
  isModerator,
  isHelper,
  isStudent,
  requireAuth,
  requireRole,
  requireOwnerOrAdmin,
  canClaimDoubt,
  canModerate,
  canResolveDoubt,
  canAcceptAnswer,
  canEditKnowledge,
  canDeleteKnowledge,
  canReviewKnowledge,
  sanitisePublicRole,
  canChangeUserRole,
} from '@/lib/permissions';

test('RBAC: Role primitive checks', async (t) => {
  await t.test('isAdmin identifies ADMIN role correctly', () => {
    assert.equal(isAdmin({ role: ROLES.ADMIN }), true);
    assert.equal(isAdmin({ role: ROLES.MODERATOR }), false);
    assert.equal(isAdmin({ role: ROLES.HELPER }), false);
    assert.equal(isAdmin({ role: ROLES.STUDENT }), false);
    assert.equal(isAdmin(null), false);
  });

  await t.test('isModerator permits MODERATOR and ADMIN', () => {
    assert.equal(isModerator({ role: ROLES.ADMIN }), true);
    assert.equal(isModerator({ role: ROLES.MODERATOR }), true);
    assert.equal(isModerator({ role: ROLES.HELPER }), false);
    assert.equal(isModerator({ role: ROLES.STUDENT }), false);
  });

  await t.test('isHelper permits HELPER and ADMIN', () => {
    assert.equal(isHelper({ role: ROLES.ADMIN }), true);
    assert.equal(isHelper({ role: ROLES.HELPER }), true);
    assert.equal(isHelper({ role: ROLES.STUDENT }), false);
  });
});

test('RBAC: Guard functions throw structured HTTP status errors', async (t) => {
  await t.test('requireAuth throws 401 when user is missing or invalid', () => {
    assert.throws(
      () => requireAuth(null),
      (err) => err.status === 401 && err.message.includes('Authentication required')
    );
    assert.throws(
      () => requireAuth({}),
      (err) => err.status === 401
    );
    const valid = { id: 'u1', role: 'STUDENT' };
    assert.equal(requireAuth(valid), valid);
  });

  await t.test('requireRole throws 403 on role mismatch', () => {
    const student = { id: 's1', role: ROLES.STUDENT };
    assert.throws(
      () => requireRole(student, [ROLES.ADMIN, ROLES.MODERATOR]),
      (err) => err.status === 403
    );
    assert.equal(requireRole(student, [ROLES.STUDENT]), student);
  });

  await t.test('requireOwnerOrAdmin prevents IDOR for non-owners and allows ADMIN', () => {
    const userA = { id: 'user_a', role: ROLES.STUDENT };
    const userB = { id: 'user_b', role: ROLES.STUDENT };
    const admin = { id: 'admin_1', role: ROLES.ADMIN };

    // Owner can access
    assert.equal(requireOwnerOrAdmin(userA, 'user_a'), userA);

    // Non-owner blocked with 403
    assert.throws(
      () => requireOwnerOrAdmin(userB, 'user_a'),
      (err) => err.status === 403
    );

    // Admin can access any owner
    assert.equal(requireOwnerOrAdmin(admin, 'user_a'), admin);
  });
});

test('RBAC: Domain operation rules', async (t) => {
  await t.test('canClaimDoubt permits only HELPER or ADMIN', () => {
    assert.equal(canClaimDoubt({ role: ROLES.STUDENT }), false);
    assert.equal(canClaimDoubt({ role: ROLES.HELPER }), true);
    assert.equal(canClaimDoubt({ role: ROLES.ADMIN }), true);
  });

  await t.test('canAcceptAnswer enforces accepted rules and blocks self-acceptance', () => {
    const student = { id: 'student_1', role: ROLES.STUDENT };
    const helper = { id: 'helper_1', role: ROLES.HELPER };
    const doubt = { studentId: 'student_1' };
    const answerApproved = { id: 'ans_1', authorId: 'helper_1', status: 'APPROVED' };
    const answerPending = { id: 'ans_2', authorId: 'helper_1', status: 'PENDING' };
    const answerSelf = { id: 'ans_3', authorId: 'student_1', status: 'APPROVED' };

    // Doubt owner can accept an approved answer from another user
    assert.equal(canAcceptAnswer(student, doubt, answerApproved), true);

    // Cannot accept pending answer
    assert.equal(canAcceptAnswer(student, doubt, answerPending), false);

    // Non-owner cannot accept
    assert.equal(canAcceptAnswer(helper, doubt, answerApproved), false);

    // Cannot accept own answer (self-accept prevention)
    assert.equal(canAcceptAnswer(student, doubt, answerSelf), false);
  });

  await t.test('canReviewKnowledge prevents authors from self-reviewing', () => {
    const modA = { id: 'mod_a', role: ROLES.MODERATOR };
    const modB = { id: 'mod_b', role: ROLES.MODERATOR };
    const student = { id: 'stu_1', role: ROLES.STUDENT };
    const admin = { id: 'admin_1', role: ROLES.ADMIN };

    const resourceByModA = { id: 'res_1', authorId: 'mod_a' };

    // Students cannot review
    assert.equal(canReviewKnowledge(student, resourceByModA), false);

    // Author cannot review their own submission
    assert.equal(canReviewKnowledge(modA, resourceByModA), false);

    // Another moderator can review
    assert.equal(canReviewKnowledge(modB, resourceByModA), true);

    // Admin can review any submission
    assert.equal(canReviewKnowledge(admin, resourceByModA), true);
  });

  await t.test('sanitisePublicRole prevents privilege escalation during registration', () => {
    assert.equal(sanitisePublicRole('ADMIN'), 'STUDENT');
    assert.equal(sanitisePublicRole('MODERATOR'), 'STUDENT');
    assert.equal(sanitisePublicRole('root'), 'STUDENT');
    assert.equal(sanitisePublicRole(undefined), 'STUDENT');
    assert.equal(sanitisePublicRole('HELPER'), 'HELPER');
    assert.equal(sanitisePublicRole('STUDENT'), 'STUDENT');
  });

  await t.test('canChangeUserRole allows only ADMIN and forbids self-role escalation', () => {
    const admin = { id: 'adm_1', role: ROLES.ADMIN };
    const helper = { id: 'hlp_1', role: ROLES.HELPER };

    assert.equal(canChangeUserRole(helper, 'target_user'), false);
    assert.equal(canChangeUserRole(admin, 'adm_1'), false); // self modification blocked
    assert.equal(canChangeUserRole(admin, 'target_user'), true);
  });
});

