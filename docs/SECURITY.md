# DoubtBridge Security Architecture & Audit Report

This document details the threat model, authentication mechanisms, authorization boundaries, cryptographic controls, and security hardening measures implemented in DoubtBridge.

---

## 1. Threat Model & Defense In Depth

| Threat Vector | Potential Impact | Implemented Mitigation | Verification Status |
| :--- | :--- | :--- | :--- |
| **Session Forgery & Tampering** | Unauthorized impersonation | AES-256-GCM stateless sealed cookie sessions via `iron-session` v9.1. Signed and encrypted with `SESSION_SECRET`. | Verified (Unit & Integration tests) |
| **Credential Stuffing / Brute Force** | Account takeover | In-memory sliding window rate limiter on `/api/auth/login` (10 req/min) and `/api/auth/register` (5 req/15 min). | Verified (Unit tests) |
| **Weak Password Storage** | Offline dictionary attacks | `bcryptjs` password hashing with work factor 12. Password hashes never returned across any API. | Verified (Integration tests) |
| **Privilege Escalation** | Student claiming ADMIN / MODERATOR | Public registration strictly filters requested roles (`sanitisePublicRole`). Admins cannot modify their own role. | Verified (Unit & Integration tests) |
| **Insecure Direct Object Reference (IDOR)** | Cross-user data mutation | Server-side ownership verification in all mutation handlers (`requireOwnerOrAdmin`, doubt author check, assignment helper check, notification user check). | Verified (Integration tests) |
| **Audit Record Eradication** | Loss of forensic history upon admin deletion | `AuditLog.actorId` is nullable with `onDelete: SetNull`. Actor snapshots (`actorEmail`, `actorName`, `actorRole`) permanently retained in the audit record. | Verified (Integration tests) |
| **Secret Leakage in Logs** | Credential exposure in logs / audit data | Automated recursive secret scrubber in `recordAuditLog` replaces keys matching `password`, `token`, `secret`, `cookie`, `session`, `apiKey` with `[REDACTED]`. | Verified (Integration tests) |
| **Clickjacking / MIME Sniffing** | UI redress / XSS execution | Full HTTP security headers in `next.config.mjs`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `CSP`, and `HSTS`. | Verified (Production build) |

---

## 2. Session Management & Secret Enforcement

### Stateless Sealed Cookie Sessions
DoubtBridge uses `iron-session` v9.1 to encrypt session state directly into a secure client cookie:
- **Cookie Name**: `doubtbridge_session`
- **Encryption**: AES-256-GCM (symmetric authenticated encryption)
- **Cookie Flags**:
  - `httpOnly: true` (prevents JavaScript access via XSS)
  - `secure: true` (enforced when `NODE_ENV === 'production'`)
  - `sameSite: 'lax'` (protects against Cross-Site Request Forgery for state-changing requests)
  - `maxAge: 7 days` (automatic expiration)

### Production Secret Validation Guard
In `src/lib/session.js` and `src/middleware.js`, the session secret is strictly validated:
```javascript
export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (!secret || secret.length < 32 || secret.includes('changeme') || secret.includes('replace_this')) {
      throw new Error(
        'CRITICAL CONFIGURATION ERROR: SESSION_SECRET is unset, shorter than 32 characters, or using an insecure placeholder in production.'
      );
    }
    return secret;
  }
  return secret || 'development_fallback_secret_must_be_at_least_32_chars_long!';
}
```
If an operator deploys to production without setting `SESSION_SECRET` or leaves the development placeholder, the server throws an unhandled startup exception rather than operating with an insecure key.

---

## 3. Role-Based Access Control (RBAC) Matrix

Server-side authorization rules are centralized in `src/lib/permissions.js` and enforced across all routes:

| Feature / Action | STUDENT | HELPER | MODERATOR | ADMIN | Enforcing Guard |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Browse Doubt Feed** | Allowed | Allowed | Allowed | Allowed | `isPublicPath` or authenticated |
| **Ask Academic Doubt** | Allowed | Allowed | Allowed | Allowed | `requireAuth` |
| **Edit / Delete Doubt** | Owner Only | Owner Only | Owner Only | Allowed | Owner check (`studentId === user.id`) |
| **Submit Answer** | Allowed | Allowed | Allowed | Allowed | `requireAuth` (starts `PENDING`) |
| **Moderate Answer** | Denied (403) | Denied (403) | Allowed | Allowed | `isModerator` (no self-review) |
| **Accept Solution** | Owner Only | Owner Only | Owner Only | Allowed | `canAcceptAnswer` (no self-accept) |
| **Claim Doubt** | Denied (403) | Allowed | Denied (403) | Allowed | `canClaimDoubt` + Workload $\le 5$ |
| **Cancel Assignment** | Denied (403) | Owner Only | Denied (403) | Allowed | Helper check (`helperId === user.id`) |
| **Review Knowledge Resource** | Denied (403) | Denied (403) | Allowed | Allowed | `canReviewKnowledge` (no self-review) |
| **View Notifications** | Owner Only | Owner Only | Owner Only | Owner Only | Recipient check (`userId === user.id`) |
| **Admin Control Center** | Denied (403) | Denied (403) | Denied (403) | Allowed | `requireRole([ROLES.ADMIN])` |
| **Modify User Roles** | Denied (403) | Denied (403) | Denied (403) | Allowed | `canChangeUserRole` (no self-edit) |
| **Suspend Account** | Denied (403) | Denied (403) | Denied (403) | Allowed | Admin check (no self-suspend) |
| **Inspect Audit Logs** | Denied (403) | Denied (403) | Denied (403) | Allowed | `requireRole([ROLES.ADMIN])` |

---

## 4. IDOR Defense Implementation

To prevent Insecure Direct Object Reference (IDOR) vulnerabilities, resource access never trusts the authenticated user's claimed identity without verifying database ownership:

1. **Doubts (`/api/doubts/[doubtId]`)**:
   - `PATCH`: Confirms `existing.studentId === user.id` and `existing.status === 'OPEN'`.
   - `DELETE`: Confirms `existing.studentId === user.id` and `existing.status === 'OPEN'`.
2. **Assignments (`/api/helpers/assignments/[assignmentId]`)**:
   - Confirms `assignment.helperId === user.id || user.role === 'ADMIN'`. Non-owners receive `403 Forbidden`.
3. **Notifications (`/api/notifications/[notificationId]`)**:
   - Both `GET`, `PATCH /read`, and `DELETE` verify `notification.userId === user.id`. Foreign access receives `403 Forbidden`.
4. **Knowledge Resources (`/api/knowledge/[articleId]`)**:
   - Reviews require `MODERATOR` or `ADMIN`, and prohibit author self-review: `authorId !== user.id`.
5. **Admin User Governance (`/api/admin/users/[userId]/*`)**:
   - Self-role modification (`actor.id === targetUserId`) returns `403 Forbidden`.
   - Self-account suspension (`actor.id === targetUserId`) returns `403 Forbidden`.

---

## 5. Audit Log Retention & Secret Redaction

Audit records provide non-repudiation for administrative actions (`USER_ROLE_CHANGE`, `USER_SUSPEND`, `USER_ACTIVATE`, `REPORT_REVIEW`).

### Forensic Retention Architecture
- The `AuditLog` table maintains an optional foreign key `actorId String?` configured with `onDelete: SetNull`.
- When an administrator account is deleted or pruned, the database automatically nullifies `actorId` without cascading deletion.
- In addition, the snapshot columns `actorEmail`, `actorName`, and `actorRole` preserve the exact actor identity at the time of the event.

### Automated Metadata Scrubber
Before inserting into `AuditLog.metadata`, payload objects pass through `sanitizeAuditMetadata`:
```javascript
const redactKeys = ['password', 'passwordhash', 'token', 'secret', 'cookie', 'session', 'apikey', 'auth'];
```
Any matching key is replaced with `'[REDACTED]'`, ensuring that accidental exposure of password hashes or session tokens in audit tables is prevented.

---

## 6. HTTP Security Headers

Configured in `next.config.mjs` and applied to all incoming routes:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'
```

---

## 7. Rate Limiting Considerations

The current rate limiter in `src/lib/rateLimit.js` implements an in-memory sliding window algorithm suitable for single-instance Node.js deployments. 

> [!IMPORTANT]
> **Multi-Instance / Serverless Scaling Note**:
> When deploying across multiple serverless instances (e.g. AWS Lambda, Vercel Serverless Functions) where process memory is not shared, a distributed key-value store (such as Upstash Redis or AWS ElastiCache) should be integrated to enforce global rate limits across instances.
