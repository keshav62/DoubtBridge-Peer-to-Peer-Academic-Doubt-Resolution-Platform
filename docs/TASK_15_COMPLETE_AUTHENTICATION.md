# Task 15 — Complete Authentication System for DoubtBridge

## 1. Overview & Objectives

Task 15 delivers a complete, secure, and production-ready authentication and authorization architecture for the **DoubtBridge Peer-to-Peer Academic Doubt Resolution Platform**.

The system supports all three primary user roles:
1. **Student Dashboard** (`/dashboard`)
2. **Helper Dashboard** (`/helper`)
3. **Admin Dashboard** (`/admin`, `/admin/moderation`, `/admin/users`, `/admin/audit-logs`)

It unites client-side UX, strict API validation, encrypted iron-session cookies, bcrypt password hashing, privilege escalation protection, role-based dashboard redirection, and a cryptographically signed HMAC-SHA256 password recovery foundation.

---

## 2. Technology Stack & Key Libraries

- **Framework**: Next.js 15 App Router (`next: ^15.0.0`)
- **UI Library**: React 19 (`react: ^19.0.0`, `react-dom: ^19.0.0`)
- **Styling**: Tailwind CSS 4 (`tailwindcss: ^4.3.3`)
- **ORM & Database**: Prisma ORM 6 (`@prisma/client: ^6.0.0`, `prisma: ^6.0.0`) with Supabase PostgreSQL
- **Session Management**: `iron-session` (v9.1.0)
- **Password Hashing**: `bcryptjs` (v3.0.3, cost factor 12)
- **Input Validation**: `zod` (v4.6.7)
- **Icons**: `lucide-react` (v1.16.0)

---

## 3. Architecture & Data Flow

```
+-----------------------------------------------------------------------------------+
|                                  Client Browser                                   |
|   /register (Student/Helper)    /login (All Roles)   /forgot-password   /reset-pw |
+------------------------------------------+----------------------------------------+
                                           | HTTP Requests (JSON)
                                           v
+-----------------------------------------------------------------------------------+
|                     Route Middleware (src/middleware.js)                          |
|  - Checks public paths whitelist (/, /login, /register, /forgot-password, etc.)   |
|  - Redirects logged-in users away from /login & /register to their role dashboard  |
|  - Blocks unauthenticated / suspended users from protected pages & APIs          |
|  - Enforces RBAC for /admin, /admin/users, /admin/audit-logs, /helper             |
+------------------------------------------+----------------------------------------+
                                           | NextRequest / Route Handlers
                                           v
+-----------------------------------------------------------------------------------+
|                        Authentication API Route Handlers                          |
|                                                                                   |
|  [POST /api/auth/register]                                                        |
|  - Zod validation (name, email, password, confirmPassword, role, dept, year)      |
|  - Duplicate email check (HTTP 409 Conflict)                                      |
|  - Role sanitization (blocks public registration of ADMIN/MODERATOR)              |
|  - Prisma Transaction: creates User + HelperProfile (if role === HELPER)          |
|  - Creates iron-session cookie & returns { success, user, redirectUrl }           |
|                                                                                   |
|  [POST /api/auth/login]                                                           |
|  - Zod validation (email, password) & sliding-window rate limiting                |
|  - Constant-time dummy hash compare if user not found (mitigates timing attacks)  |
|  - Active status verification (HTTP 403 Forbidden with suspension reason)         |
|  - bcrypt password verification                                                   |
|  - Computes role-specific redirectUrl:                                            |
|      ADMIN      -> /admin                                                         |
|      MODERATOR  -> /admin/moderation                                              |
|      HELPER     -> /helper                                                        |
|      STUDENT    -> /dashboard                                                     |
|                                                                                   |
|  [POST /api/auth/logout]                                                          |
|  - Destroys active iron-session cookie                                            |
|                                                                                   |
|  [GET /api/auth/me]                                                               |
|  - Resolves current session and returns user profile without passwordHash         |
|                                                                                   |
|  [POST /api/auth/forgot-password] & [POST /api/auth/reset-password]               |
|  - Cryptographically signed HMAC-SHA256 stateless tokens                          |
|  - 15-minute expiration window + hash snapshot validation (single-use guarantee)  |
+-----------------------------------------------------------------------------------+
```

---

## 4. Implemented Features

### 4.1. Student & Helper Registration
- **URL**: `/register`
- **API**: `POST /api/auth/register`
- **Fields**:
  - Full Name (required, min 2 chars)
  - Academic Email (required, valid email syntax)
  - Primary Role (Student or Peer Helper)
  - Department (optional or searchable selection)
  - Academic Year (optional selection)
  - Password & Confirm Password (required, min 8 chars, letter + number)
- **Security & Validation**:
  - Strict Zod schema verification.
  - Duplicate email returns HTTP 409 Conflict.
  - Role escalation prevention: Attempting to submit `ADMIN` or `MODERATOR` via public registration is automatically coerced to `STUDENT`.
  - Transactional provisioning: When `HELPER` registers, a linked `HelperProfile` row is created within the same database transaction.
  - Automatically establishes an authenticated session upon registration and redirects to the user's appropriate dashboard.

### 4.2. Unified Login
- **URL**: `/login`
- **API**: `POST /api/auth/login`
- **Features**:
  - Authenticates Students, Helpers, Moderators, and Admins via a single interface.
  - Constant-time dummy hash comparison against invalid/nonexistent accounts to thwart user enumeration timing attacks.
  - Account suspension checks: Inactive or suspended accounts receive HTTP 403 Forbidden with the administrator's reason.
  - Dynamic role-based redirection based on the authenticated user's role.
  - Handles `callbackUrl` preservation for seamless post-login redirects.
  - Displays user alerts for password reset success (`?reset=success`) or account creation (`?registered=true`).

### 4.3. Password Recovery Foundation
- **Request URL**: `/forgot-password` (`POST /api/auth/forgot-password`)
- **Reset URL**: `/reset-password` (`POST /api/auth/reset-password`)
- **Cryptographic Token Architecture** (`src/lib/passwordReset.js`):
  - Tokens use HMAC-SHA256 signatures derived from `SESSION_SECRET` (compatible with Edge and Node.js Web Crypto APIs).
  - Encodes user ID, lowercase email, expiration timestamp (`exp: 15 minutes`), and a snapshot of the current `passwordHash` (`hs: passwordHash.slice(0, 10)`).
  - **Single-Use Guarantee**: As soon as a user completes a password reset, the database updates `passwordHash`. Consequently, the hash snapshot no longer matches, permanently invalidating the token without needing an extra database table.
  - **Zero Email Enumeration**: `POST /api/auth/forgot-password` always returns a generic success response even if the email does not exist.
  - In local and test environments, `resetUrl` and `resetToken` are returned in the API response to allow end-to-end automated testing without mock mailers.

### 4.4. Route Middleware & Role-Based Access Control
- **Path**: `src/middleware.js`
- **Public Routes Whitelist**: `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/_next/*`, `/images/*`, `/api/auth/*`, `/api/health/*`.
- **Authenticated User Handling**:
  - If an authenticated user navigates to `/login`, `/register`, or `/forgot-password`, middleware redirects them directly to their role's dashboard.
- **RBAC Enforcement**:
  - `/admin` & `/admin/moderation`: accessible by `ADMIN` and `MODERATOR`.
  - `/admin/users` & `/admin/audit-logs`: strictly accessible by `ADMIN`. Non-admins are redirected or receive HTTP 403.
  - `/helper`: accessible by `HELPER` and `ADMIN`. Students are redirected to `/dashboard`.
  - Suspended users (`isActive === false`): Blocked from all protected routes and APIs with HTTP 403 or redirect to `/login?error=AccountSuspended`.

---

## 5. Verification & Test Results

### 5.1. Comprehensive Integration Test Suite
Implemented in `tests/integration/complete-auth.test.mjs`:

| # | Test Scenario | Expected Result | Status |
|---|---------------|-----------------|:------:|
| 1 | Student Registration | 201 Created, session cookie set, `redirectUrl: /dashboard` | PASS |
| 2 | Helper Registration | 201 Created, `HelperProfile` auto-created, `redirectUrl: /helper` | PASS |
| 3 | Duplicate Email Registration | 409 Conflict with informative error message | PASS |
| 4 | Privilege Escalation via Registration | Role coerced to `STUDENT`, no admin grant | PASS |
| 5 | Student Login | 200 OK, `redirectUrl: /dashboard` | PASS |
| 6 | Helper Login | 200 OK, `redirectUrl: /helper` | PASS |
| 7 | Admin Login | 200 OK, `redirectUrl: /admin` | PASS |
| 8 | Suspended User Login | 403 Forbidden with suspension reason | PASS |
| 9 | Current User Retrieval (`/api/auth/me`) | 200 OK, session user profile, `passwordHash` omitted | PASS |
| 10 | Logout (`/api/auth/logout`) | 200 OK, session destroyed, subsequent `/me` returns 401 | PASS |
| 11 | Password Recovery Flow | Generates token, rejects bad token, resets password, invalidates old password, rejects token reuse | PASS |
| 12 | Middleware RBAC & Route Guard | Whitelists public paths, redirects authenticated users from `/login`, blocks students from `/admin` | PASS |

### 5.2. Regression & Security Suites
- `tests/integration/auth-regression.test.mjs`: **14/14 tests passing**
- `tests/integration/auth-security.test.mjs`: **4/4 tests passing**
- `tests/integration/admin-answer-verification.test.mjs`: **10/10 tests passing**

### 5.3. Linting & Production Build
- `npm run lint`: **0 errors, 0 warnings**
- `npm run build`: **Compiled successfully in 24.0s (64/64 static & dynamic routes generated)**

---

## 6. Production Deployment & Environment Configuration

### Required Environment Variables on Vercel
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase pooled connection string (port 6543) |
| `DIRECT_URL` | Supabase direct connection string (port 5432) |
| `SESSION_SECRET` | 32+ character random string for iron-session cookie encryption and reset tokens |
| `NEXT_PUBLIC_APP_URL` | Base application URL (e.g. `https://doubt-bridge-peer-to-peer-academic.vercel.app`) |

### Integrating External Transactional Email (e.g. Resend / Sendgrid)
To deliver password recovery emails in production:
1. Install an email client: `npm install resend`
2. Add `RESEND_API_KEY` to Vercel environment variables.
3. In `src/app/api/auth/forgot-password/route.js`, uncomment and connect `resend.emails.send({ from: 'noreply@doubtbridge.com', to: user.email, subject: 'Reset Your Password', html: ... })`.
