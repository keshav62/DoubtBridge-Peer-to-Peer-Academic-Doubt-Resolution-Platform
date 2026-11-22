import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { globalMockCookieStore } from '../mock-headers.mjs';
import { GET as meGetHandler, PUT as mePutHandler } from '@/app/api/auth/me/route';
import { GET as userGetHandler, PUT as userPutHandler } from '@/app/api/user/route';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as logoutHandler } from '@/app/api/auth/logout/route';
import { sealData } from 'iron-session';
import { sessionOptions } from '@/lib/sessionConfig';

test('Integration: Settings Page & Authenticated User Profile Data Fetching (Task 16)', async (t) => {
  const ts = Date.now();
  const rawPassword = 'ProfilePassword123!';
  const studentEmail = `settings_student_${ts}@doubtbridge.test`;
  const helperEmail = `settings_helper_${ts}@doubtbridge.test`;
  const suspendedEmail = `settings_suspended_${ts}@doubtbridge.test`;

  let studentUser = null;
  let helperUser = null;
  let suspendedUser = null;
  let originalPasswordHash = null;
  const createdUserIds = [];

  t.before(async () => {
    globalMockCookieStore.clear();
    originalPasswordHash = await bcrypt.hash(rawPassword, 10);

    // 1. Create student
    studentUser = await prisma.user.create({
      data: {
        name: 'Jordan Student',
        email: studentEmail,
        passwordHash: originalPasswordHash,
        role: 'STUDENT',
        isActive: true,
        department: 'Computer Science',
        academicYear: '2nd Year',
        reputation: 50,
      },
    });
    createdUserIds.push(studentUser.id);

    // 2. Create helper with helperProfile
    helperUser = await prisma.user.create({
      data: {
        name: 'Taylor Helper',
        email: helperEmail,
        passwordHash: originalPasswordHash,
        role: 'HELPER',
        isActive: true,
        department: 'Mathematics',
        academicYear: '4th Year',
        subjects: 'Calculus, Linear Algebra',
        isAvailable: true,
        reputation: 300,
        helperProfile: {
          create: {
            bio: 'Passionate about pure math and calculus doubts.',
            subjects: 'Calculus, Linear Algebra',
            isAvailable: true,
            reputation: 300,
          },
        },
      },
      include: { helperProfile: true },
    });
    createdUserIds.push(helperUser.id);

    // 3. Create suspended user
    suspendedUser = await prisma.user.create({
      data: {
        name: 'Suspended Account',
        email: suspendedEmail,
        passwordHash: originalPasswordHash,
        role: 'STUDENT',
        isActive: false,
        suspensionReason: 'Academic violation',
      },
    });
    createdUserIds.push(suspendedUser.id);
  });

  t.after(async () => {
    if (createdUserIds.length > 0) {
      await prisma.helperProfile.deleteMany({
        where: { userId: { in: createdUserIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
    globalMockCookieStore.clear();
    await prisma.$disconnect();
  });

  // ── 1. Unauthenticated GET /api/auth/me returns 401 ─────────────────────────
  await t.test('1. Unauthenticated request to /api/auth/me returns 401', async () => {
    globalMockCookieStore.clear();
    const res = await meGetHandler();
    assert.equal(res.status, 401, 'Should return 401 when no session exists');
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error, 'Not authenticated.');
  });

  // ── 2. Authenticated GET /api/auth/me returns full profile ──────────────────
  await t.test('2. Authenticated GET /api/auth/me returns all safe profile fields', async () => {
    // Sign in as student
    const loginReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password: rawPassword }),
    });
    const loginRes = await loginHandler(loginReq);
    assert.equal(loginRes.status, 200);

    const res = await meGetHandler();
    assert.equal(res.status, 200, 'Must return 200 for authenticated user');
    const data = await res.json();

    assert.equal(data.success, true);
    assert.equal(data.user.id, studentUser.id);
    assert.equal(data.user.name, 'Jordan Student');
    assert.equal(data.user.email, studentEmail);
    assert.equal(data.user.role, 'STUDENT');
    assert.equal(data.user.department, 'Computer Science');
    assert.equal(data.user.academicYear, '2nd Year');
    assert.equal(data.user.reputation, 50);
    assert.ok(data.user.createdAt);
    assert.ok(data.user.updatedAt);
    assert.equal(data.user.passwordHash, undefined, 'passwordHash must never be exposed');
  });

  // ── 3. GET /api/user alias returns same profile data ────────────────────────
  await t.test('3. Backward-compatible /api/user returns identical safe profile', async () => {
    const res = await userGetHandler();
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.id, studentUser.id);
    assert.equal(data.user.email, studentEmail);
  });

  // ── 4. GET with deleted user returns 404 ───────────────────────────────────
  await t.test('4. Session with nonexistent user in DB returns 404', async () => {
    const fakeSessionCookie = await sealData(
      { userId: 'cmw_nonexistent_user_id_999999', role: 'STUDENT', isActive: true },
      sessionOptions
    );
    globalMockCookieStore.set('doubtbridge_session', fakeSessionCookie);

    const res = await meGetHandler();
    assert.equal(res.status, 404, 'Must return 404 if user no longer exists in database');
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error, 'User account not found.');
  });

  // ── 5. GET with suspended user returns 403 ─────────────────────────────────
  await t.test('5. Session with suspended user returns 403', async () => {
    const suspendedCookie = await sealData(
      { userId: suspendedUser.id, role: 'STUDENT', isActive: false },
      sessionOptions
    );
    globalMockCookieStore.set('doubtbridge_session', suspendedCookie);

    const res = await meGetHandler();
    assert.equal(res.status, 403, 'Must return 403 when user is suspended');
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error, 'Account suspended.');
  });

  // ── 6. PUT /api/auth/me updates profile fields ─────────────────────────────
  await t.test('6. PUT /api/auth/me updates name, department, academicYear, and bio', async () => {
    // Log back in as student
    const loginReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password: rawPassword }),
    });
    await loginHandler(loginReq);

    const updateReq = new Request('http://localhost:3000/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Alex Student',
        department: 'Software Engineering',
        academicYear: '3rd Year (Junior)',
        bio: 'Focusing on distributed systems and web security.',
      }),
    });

    const updateRes = await mePutHandler(updateReq);
    assert.equal(updateRes.status, 200, 'PUT /api/auth/me should return 200 OK');
    const data = await updateRes.json();

    assert.equal(data.success, true);
    assert.equal(data.user.name, 'Jordan Alex Student');
    assert.equal(data.user.department, 'Software Engineering');
    assert.equal(data.user.academicYear, '3rd Year (Junior)');
    assert.equal(data.user.bio, 'Focusing on distributed systems and web security.');

    // Verify DB
    const dbUser = await prisma.user.findUnique({
      where: { id: studentUser.id },
      include: { helperProfile: true },
    });
    assert.equal(dbUser.name, 'Jordan Alex Student');
    assert.equal(dbUser.department, 'Software Engineering');
    assert.equal(dbUser.academicYear, '3rd Year (Junior)');
    assert.equal(dbUser.passwordHash, originalPasswordHash, 'passwordHash must remain untouched');
  });

  // ── 7. PUT /api/auth/me updates helper availability and subjects ───────────
  await t.test('7. PUT /api/auth/me updates helper availability and subjects', async () => {
    // Log in as helper
    const loginReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: helperEmail, password: rawPassword }),
    });
    await loginHandler(loginReq);

    const updateReq = new Request('http://localhost:3000/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isAvailable: false,
        subjects: 'Calculus, Statistics, Discrete Mathematics',
      }),
    });

    const updateRes = await mePutHandler(updateReq);
    assert.equal(updateRes.status, 200);
    const data = await updateRes.json();

    assert.equal(data.success, true);
    assert.equal(data.user.isAvailable, false);
    assert.ok(data.user.subjects.includes('Discrete Mathematics'));

    // Verify DB
    const dbUser = await prisma.user.findUnique({
      where: { id: helperUser.id },
      include: { helperProfile: true },
    });
    assert.equal(dbUser.isAvailable, false);
    assert.equal(dbUser.helperProfile?.isAvailable, false);
    assert.ok(dbUser.helperProfile?.subjects.includes('Discrete Mathematics'));
  });

  // ── 8. PUT /api/auth/me validation rejection ───────────────────────────────
  await t.test('8. PUT /api/auth/me rejects name shorter than 2 characters with 400', async () => {
    const invalidReq = new Request('http://localhost:3000/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'J' }),
    });

    const res = await mePutHandler(invalidReq);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.error.includes('at least 2 characters'));
  });
});
