# Admin Bootstrap Guide — DoubtBridge

This guide explains how to safely bootstrap the initial **ADMIN** account for the **DoubtBridge Peer-to-Peer Academic Doubt Resolution Platform**.

---

## 1. Security Philosophy & Principles

In accordance with DoubtBridge security design:
1. **No Public Admin Registration**: The public registration interface (`/register` and `POST /api/auth/register`) strictly prohibits self-assigning `ADMIN` or `MODERATOR` roles. Any attempt to supply privileged roles in registration payloads is automatically coerced to `STUDENT`.
2. **Zero In-Band Elevation**: There is no public API or frontend view that allows a non-admin to become an admin.
3. **Controlled Out-of-Band Promotion**: Bootstrapping an administrator is performed as an intentional, controlled CLI operation executed directly on the host or terminal with access to the configured database.
4. **Credential Safety**:
   - The bootstrap script **never modifies passwords** or invalidates existing credentials.
   - The script **never prints password hashes or secrets** to stdout or logs.
   - The script **never creates duplicate user accounts**; the target user must have already created their account through the standard `/register` portal.
5. **Audit Trail**: Every administrative role change creates an immutable record in the `AuditLog` table.

---

## 2. Prerequisites

Before running the bootstrap script:
1. Ensure the target user has registered an account via the application interface (`/register`).
2. Verify that the account is active (`isActive: true`).
3. Ensure the `DATABASE_URL` environment variable is accessible in the execution environment.

---

## 3. Bootstrap CLI Script Overview

- **Script Path**: `scripts/create-admin.js`
- **Engine**: Node.js + Prisma ORM 6
- **Safety Checks**:
  - Validates email format and normalizes to lowercase (`email.trim().toLowerCase()`).
  - Queries database to ensure user exists.
  - Verifies user status is active.
  - Checks if the user is already an `ADMIN`.
  - Displays user profile summary and asks for explicit interactive confirmation (`yes`) before committing changes.
  - Atomic database transaction updating `role: 'ADMIN'` and recording an `AuditLog` entry.

---

## 4. Execution Procedures

### 4.1. Local Development Execution

```bash
# Interactive mode (prompts for confirmation)
node scripts/create-admin.js admin@example.com

# Non-interactive mode (for automation / CI)
node scripts/create-admin.js admin@example.com --yes
```

Example Output:
```text
[DoubtBridge] Connecting to database and verifying user account...

=== Target Account Details ===
  User ID:      cmwrlrl430000j0dg9qjuvk2d
  Full Name:    System Administrator
  Email:        admin@example.com
  Department:   Computer Science & Engineering
  Year:         Faculty
  Current Role: STUDENT
  New Role:     ADMIN
  Status:       Active
  Registered:   2026-11-22T08:56:30.627Z
==============================

Are you sure you want to promote this user to ADMIN? Type "yes" to confirm: yes

Promoting user admin@example.com to ADMIN...

✔ SUCCESS: User has been successfully promoted to ADMIN!

Summary:
  User ID:      cmwrlrl430000j0dg9qjuvk2d
  Name:         System Administrator
  Email:        admin@example.com
  Role:         ADMIN
  Updated At:   2026-11-22T08:56:44.730Z

Audit log entry created with action: USER_ROLE_CHANGE.
The user can now sign in at /login and access the Admin Dashboard (/admin).
```

---

### 4.2. Production Database Execution (Vercel + Supabase)

To promote an account in production:

#### Option A: Run from your authorized local terminal pointing to production
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" node scripts/create-admin.js admin@university.edu
```

#### Option B: Run via Vercel CLI / Build & Deployment Pipeline
If using Vercel CLI linked to your production project:
```bash
vercel env pull .env.production.local
DATABASE_URL=$(grep DATABASE_URL .env.production.local | cut -d '=' -f2-) node scripts/create-admin.js admin@university.edu
```

---

## 5. Verification After Promotion

1. Navigate to `/login`.
2. Sign in with the promoted user's email and password.
3. The application will authenticate the session and automatically redirect the user to the **Admin Dashboard**:
   `/admin`
4. The administrator can now manage users, oversee doubt resolution, inspect audit logs, and moderate answers.
