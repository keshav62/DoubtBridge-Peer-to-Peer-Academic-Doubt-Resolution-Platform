import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '@/lib/prisma';
import { calculateMatchScore, WORKLOAD_LIMIT } from '@/features/helpers/matching';
import {
  toggleHelperAvailability,
  claimDoubtRecord,
  updateAssignmentStatus,
} from '@/features/helpers/service';

test('Integration: Helper Profiles, Matching & Atomic Claims', async (t) => {
  let student = null;
  let helperA = null;
  let helperB = null;
  let doubt = null;
  let assignmentId = null;

  t.before(async () => {
    const ts = Date.now();
    student = await prisma.user.create({
      data: {
        name: 'Matching Student',
        email: `student_match_${ts}@doubtbridge.test`,
        role: 'STUDENT',
      },
    });

    helperA = await prisma.user.create({
      data: {
        name: 'Expert Math Helper',
        email: `helper_a_${ts}@doubtbridge.test`,
        role: 'HELPER',
        subjects: 'Calculus, Linear Algebra',
        isAvailable: true,
        helperProfile: {
          create: {
            subjects: 'Calculus, Linear Algebra',
            expertise: 'Matrix Decomposition, Integration',
            isAvailable: true,
            reputation: 80,
          },
        },
      },
      include: {
        helperProfile: true,
      },
    });

    helperB = await prisma.user.create({
      data: {
        name: 'Chemistry Helper',
        email: `helper_b_${ts}@doubtbridge.test`,
        role: 'HELPER',
        subjects: 'Organic Chemistry',
        isAvailable: false,
        helperProfile: {
          create: {
            subjects: 'Organic Chemistry',
            isAvailable: false,
          },
        },
      },
      include: {
        helperProfile: true,
      },
    });

    doubt = await prisma.doubt.create({
      data: {
        title: 'How to evaluate double integral in polar coordinates?',
        description: 'Need help changing variables to polar coordinates.',
        subject: 'Calculus',
        topic: 'Integration',
        studentId: student.id,
        status: 'OPEN',
      },
    });
  });

  t.after(async () => {
    if (doubt) {
      await prisma.doubtAssignment.deleteMany({ where: { doubtId: doubt.id } });
      await prisma.doubt.deleteMany({ where: { id: doubt.id } });
    }
    const userIds = [student?.id, helperA?.id, helperB?.id].filter(Boolean);
    if (userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await prisma.$disconnect();
  });

  await t.test('100-Point Matching Engine calculates scores correctly', () => {
    // Helper A has Calculus (+30), Integration (+50), Available (+20) = 100 points
    const scoreA = calculateMatchScore(doubt, helperA, 0);
    assert.equal(scoreA.isEligible, true);
    assert.equal(scoreA.score, 100);

    // Helper B is unavailable -> score 0 and ineligible
    const scoreB = calculateMatchScore(doubt, helperB, 0);
    assert.equal(scoreB.isEligible, false);
    assert.equal(scoreB.score, 0);

    // Workload limit: If active assignments >= 5, ineligible
    const scoreOverloaded = calculateMatchScore(doubt, helperA, WORKLOAD_LIMIT);
    assert.equal(scoreOverloaded.isEligible, false);
  });

  await t.test('Toggle helper availability toggles state in DB and HelperProfile', async () => {
    const updated = await toggleHelperAvailability(helperA);
    assert.equal(updated.isAvailable, false);

    // Toggle back
    const toggledBack = await toggleHelperAvailability(helperA);
    assert.equal(toggledBack.isAvailable, true);
  });

  await t.test('Helper A atomically claims the open doubt', async () => {
    const claimResult = await claimDoubtRecord(doubt.id, helperA);
    assert.ok(claimResult.assignment);
    assert.equal(claimResult.assignment.status, 'ACTIVE');
    assert.equal(claimResult.doubt.status, 'CLAIMED');
    assignmentId = claimResult.assignment.id;

    // Verify database record
    const dbDoubt = await prisma.doubt.findUnique({ where: { id: doubt.id } });
    assert.equal(dbDoubt.status, 'CLAIMED');
    assert.equal(dbDoubt.helperId, helperA.id);
  });

  await t.test('Reject duplicate concurrent claim on already claimed doubt', async () => {
    await assert.rejects(
      async () => {
        await claimDoubtRecord(doubt.id, helperA);
      },
      (err) => err.message.includes('CONFLICT')
    );
  });

  await t.test('Helper cancels assignment and doubt returns to OPEN', async () => {
    const result = await updateAssignmentStatus(assignmentId, helperA, 'CANCEL');
    assert.equal(result.assignment.status, 'CANCELLED');

    const dbDoubt = await prisma.doubt.findUnique({ where: { id: doubt.id } });
    assert.equal(dbDoubt.status, 'OPEN');
    assert.equal(dbDoubt.helperId, null);
  });
});
