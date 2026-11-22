import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { globalMockCookieStore } from '../mock-headers.mjs';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as logoutHandler } from '@/app/api/auth/logout/route';
import { GET as meHandler } from '@/app/api/auth/me/route';
import { POST as forgotPasswordHandler } from '@/app/api/auth/forgot-password/route';
import { POST as resetPasswordHandler } from '@/app/api/auth/reset-password/route';
import { middleware } from '@/middleware';
import { sealData } from 'iron-session';
import { sessionOptions } from '@/lib/sessionConfig';

test('Integration: Task 15 — Complete Authentication & Authorization Suite', async (t) => {
  const ts = Date.now();
  const password = 'SecretPassword123!';
  const studentEmail = `student_${ts}@doubtbridge.test`;
  const helperEmail = `helper_${ts}@doubtbridge.test`;
  const adminEmail = `admin_${ts}@doubtbridge.test`;
  const suspendedEmail = `suspended_${ts}@doubtbridge.test`;

  let adminUser = null;
  let suspendedUser = null;
  const createdUserIds = [];

  t.before(async () => {
    // Clean slate
    globalMockCookieStore.clear();

    const passwordHash = await bcrypt.hash(password, 10);

    adminUser = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
        department: 'Administration',
      },
    });
    createdUserIds.push(adminUser.id);

    suspendedUser = await prisma.user.create({
      data: {
        name: 'Suspended Account',
        email: suspendedEmail,
        passwordHash,
        role: 'STUDENT',
        isActive: false,
        suspensionReason: 'Policy violation',
        department: 'Science',
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

  // ── 1. Student Registration ────────────────────────────────────────────────
  await t.test('1. Student Registration succeeds with valid data', async () => {
    globalMockCookieStore.clear();
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Student',
        email: studentEmail,
        password,
        confirmPassword: password,
        role: 'STUDENT',
        department: 'Computer Science',
        academicYear: '2nd Year',
      }),
    });

    const res = await registerHandler(req);
    assert.equal(res.status, 201, 'Registration should return 201 Created');
    const data = await res.json();

    assert.equal(data.success, true);
    assert.equal(data.user.email, studentEmail);
    assert.equal(data.user.role, 'STUDENT');
    assert.equal(data.redirectUrl, '/dashboard');
    assert.equal(data.user.passwordHash, undefined, 'passwordHash must never be returned');

    createdUserIds.push(data.user.id);

    // Verify user in DB
    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
      include: { helperProfile: true },
    });
    assert.ok(dbUser);
    assert.equal(dbUser.helperProfile, null, 'Student should not have a HelperProfile');
  });

  // ── 2. Helper Registration with HelperProfile creation ─────────────────────
  await t.test('2. Helper Registration creates User, HelperProfile, and returns /helper redirect', async () => {
    globalMockCookieStore.clear();
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Helper',
        email: helperEmail,
        password,
        confirmPassword: password,
        role: 'HELPER',
        department: 'Mathematics',
        academicYear: '4th Year',
      }),
    });

    const res = await registerHandler(req);
    assert.equal(res.status, 201);
    const data = await res.json();

    assert.equal(data.success, true);
    assert.equal(data.user.role, 'HELPER');
    assert.equal(data.redirectUrl, '/helper');

    createdUserIds.push(data.user.id);

    // Verify HelperProfile in DB
    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
      include: { helperProfile: true },
    });
    assert.ok(dbUser);
    assert.ok(dbUser.helperProfile, 'Helper must have an associated HelperProfile');
  });

  // ── 3. Duplicate Email Rejection (409) ──────────────────────────────────────
  await t.test('3. Register with duplicate email returns 409 Conflict', async () => {
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Student',
        email: studentEmail,
        password,
        role: 'STUDENT',
      }),
    });

    const res = await registerHandler(req);
    assert.equal(res.status, 409, 'Duplicate email must return 409 Conflict');
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.error.includes('already exists'));
  });

  // ── 4. Privilege Escalation Prevention ─────────────────────────────────────
  await t.test('4. Register with ADMIN role attempts is safely coerced to STUDENT', async () => {
    const maliciousEmail = `hack_${ts}@doubtbridge.test`;
    const req = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker Admin',
        email: maliciousEmail,
        password,
        role: 'ADMIN', // Unauthorized role attempt
      }),
    });

    const res = await registerHandler(req);
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.user.role, 'STUDENT', 'Public registration must never grant ADMIN role');
    assert.equal(data.redirectUrl, '/dashboard');
    createdUserIds.push(data.user.id);
  });

  // ── 5. Student Login ───────────────────────────────────────────────────────
  await t.test('5. Student Login succeeds and returns /dashboard redirect', async () => {
    globalMockCookieStore.clear();
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password }),
    });

    const res = await loginHandler(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.role, 'STUDENT');
    assert.equal(data.redirectUrl, '/dashboard');
  });

  // ── 6. Helper Login ────────────────────────────────────────────────────────
  await t.test('6. Helper Login succeeds and returns /helper redirect', async () => {
    globalMockCookieStore.clear();
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: helperEmail, password }),
    });

    const res = await loginHandler(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.role, 'HELPER');
    assert.equal(data.redirectUrl, '/helper');
  });

  // ── 7. Admin Login ─────────────────────────────────────────────────────────
  await t.test('7. Admin Login succeeds and returns /admin redirect', async () => {
    globalMockCookieStore.clear();
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password }),
    });

    const res = await loginHandler(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.role, 'ADMIN');
    assert.equal(data.redirectUrl, '/admin');
  });

  // ── 8. Suspended Account Login Rejection (403) ─────────────────────────────
  await t.test('8. Suspended user login returns 403 Forbidden with reason', async () => {
    globalMockCookieStore.clear();
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: suspendedEmail, password }),
    });

    const res = await loginHandler(req);
    assert.equal(res.status, 403, 'Suspended user must receive 403');
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(data.error.includes('suspended'));
    assert.ok(data.reason.includes('Policy violation'));
  });

  // ── 9. Current User Retrieval (/api/auth/me) ───────────────────────────────
  await t.test('9. GET /api/auth/me returns current session user', async () => {
    // Login as student first
    const loginReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password }),
    });
    await loginHandler(loginReq);

    const meRes = await meHandler();
    assert.equal(meRes.status, 200);
    const meData = await meRes.json();
    assert.equal(meData.success, true);
    assert.equal(meData.user.email, studentEmail);
    assert.equal(meData.user.passwordHash, undefined);
  });

  // ── 10. Logout (/api/auth/logout) ──────────────────────────────────────────
  await t.test('10. POST /api/auth/logout destroys session', async () => {
    const logoutRes = await logoutHandler();
    assert.equal(logoutRes.status, 200);
    const logoutData = await logoutRes.json();
    assert.equal(logoutData.success, true);

    const meResAfter = await meHandler();
    assert.equal(meResAfter.status, 401, 'After logout, /api/auth/me should return 401');
  });

  // ── 11. Password Recovery Flow ─────────────────────────────────────────────
  await t.test('11. Password recovery flow: request token, reset password, login with new password', async () => {
    // A. Request password reset token
    const forgotReq = new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail }),
    });
    const forgotRes = await forgotPasswordHandler(forgotReq);
    assert.equal(forgotRes.status, 200);
    const forgotData = await forgotRes.json();
    assert.equal(forgotData.success, true);
    assert.ok(forgotData.resetToken, 'Reset token should be present in dev/test mode');

    const resetToken = forgotData.resetToken;

    // B. Attempt reset with bad token
    const badResetReq = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'invalid_token_xyz',
        password: 'BrandNewPassword456!',
        confirmPassword: 'BrandNewPassword456!',
      }),
    });
    const badResetRes = await resetPasswordHandler(badResetReq);
    assert.equal(badResetRes.status, 400);

    // C. Perform valid reset
    const newPassword = 'BrandNewPassword456!';
    const validResetReq = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        password: newPassword,
        confirmPassword: newPassword,
      }),
    });
    const validResetRes = await resetPasswordHandler(validResetReq);
    assert.equal(validResetRes.status, 200);
    const validResetData = await validResetRes.json();
    assert.equal(validResetData.success, true);

    // D. Old password should now fail
    const oldLoginReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password }),
    });
    const oldLoginRes = await loginHandler(oldLoginReq);
    assert.equal(oldLoginRes.status, 401, 'Old password must no longer work');

    // E. New password should succeed
    const newLoginReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentEmail, password: newPassword }),
    });
    const newLoginRes = await loginHandler(newLoginReq);
    assert.equal(newLoginRes.status, 200, 'New password must succeed');

    // F. Reusing the same reset token should fail (single-use guaranteed)
    const reuseResetReq = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: resetToken,
        password: 'YetAnotherPassword789!',
        confirmPassword: 'YetAnotherPassword789!',
      }),
    });
    const reuseResetRes = await resetPasswordHandler(reuseResetReq);
    assert.equal(reuseResetRes.status, 400, 'Reused reset token must fail');
  });

  // ── 12. Middleware Route Protection & RBAC ──────────────────────────────────
  await t.test('12. Middleware enforces public paths and RBAC protection', async () => {
    // A. Public paths allow unauthenticated access
    const publicReq = new NextRequest('http://localhost:3000/login');
    const publicRes = await middleware(publicReq);
    assert.equal(publicRes.status, 200);

    const forgotPublicReq = new NextRequest('http://localhost:3000/forgot-password');
    const forgotPublicRes = await middleware(forgotPublicReq);
    assert.equal(forgotPublicRes.status, 200);

    // B. Unauthenticated user hitting protected page gets redirected to /login
    const unauthPageReq = new NextRequest('http://localhost:3000/dashboard');
    const unauthPageRes = await middleware(unauthPageReq);
    assert.equal(unauthPageRes.status, 307);
    assert.ok(unauthPageRes.headers.get('location').includes('/login'));

    // C. Student user cannot access /admin (redirected to /dashboard)
    const studentCookie = await sealData(
      { userId: createdUserIds[0], role: 'STUDENT', isActive: true },
      sessionOptions
    );
    const studentAdminReq = new NextRequest('http://localhost:3000/admin', {
      headers: { cookie: `doubtbridge_session=${studentCookie}` },
    });
    const studentAdminRes = await middleware(studentAdminReq);
    assert.equal(studentAdminRes.status, 307);
    assert.ok(studentAdminRes.headers.get('location').includes('/dashboard'));

    // D. Admin user can access /admin
    const adminCookie = await sealData(
      { userId: adminUser.id, role: 'ADMIN', isActive: true },
      sessionOptions
    );
    const adminReq = new NextRequest('http://localhost:3000/admin', {
      headers: { cookie: `doubtbridge_session=${adminCookie}` },
    });
    const adminRes = await middleware(adminReq);
    assert.equal(adminRes.status, 200);

    // E. Authenticated user visiting /login gets redirected to role dashboard
    const authLoginReq = new NextRequest('http://localhost:3000/login', {
      headers: { cookie: `doubtbridge_session=${adminCookie}` },
    });
    const authLoginRes = await middleware(authLoginReq);
    assert.equal(authLoginRes.status, 307);
    assert.ok(authLoginRes.headers.get('location').includes('/admin'));
  });
});
