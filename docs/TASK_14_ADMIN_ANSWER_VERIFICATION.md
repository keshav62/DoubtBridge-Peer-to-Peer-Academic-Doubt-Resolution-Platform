# Task 14 — Admin Dashboard: Answer Verification & Moderation Center

## 1. Executive Summary

Task 14 delivers a complete **Admin Dashboard & Answer Verification Center** for the **DoubtBridge** platform. It provides administrators and moderators with a dedicated workspace to audit, verify, approve, reject, or request changes on academic solutions submitted by peer helpers before they are accepted as official resolutions.

---

## 2. Existing Architecture Inspected & Reused

Before implementation, the following systems were inspected to ensure zero duplicate models or services:
- **Prisma Schema (`prisma/schema.prisma`)**:
  - Reused existing models: `User`, `Doubt`, `Answer`, `ModerationReview`, `AuditLog`, `Notification`, `Report`.
  - Reused existing enums: `Role` (`STUDENT`, `HELPER`, `MODERATOR`, `ADMIN`), `AnswerStatus` (`PENDING`, `APPROVED`, `REJECTED`), `ModerationDecision` (`APPROVED`, `REJECTED`, `NEEDS_CHANGES`), `DoubtStatus` (`OPEN`, `ASSIGNED`, `CLAIMED`, `ANSWERED`, `RESOLVED`, `CLOSED`), `NotificationType` (`MODERATION_DECISION`, `ANSWER_SUBMITTED`, etc.).
  - **No database migrations or schema alterations were needed.**
- **Existing Services Reused**:
  - `src/features/admin/service.js`: Extended with verification querying, atomic moderation transactions, audit logging, and moderation analytics.
  - `src/features/notifications/service.js`: Reused `notifyAnswerApproved`, `notifyAnswerRejected`, and added `notifyAnswerChangesRequested`.
  - `src/lib/permissions.js`: Enforced `requireRole(user, [ROLES.ADMIN, ROLES.MODERATOR])`.

---

## 3. Implemented Features & Pages

### 3.1 Platform Control Center (`/admin`)
- **Route**: `src/app/(dashboard)/admin/page.jsx`
- **Component**: `src/components/admin/AdminStats.jsx`
- **Real Database Statistics**:
  - Total registered platform users, students, helpers, moderators, admins.
  - Total submitted answers.
  - Pending answers awaiting review.
  - Approved answers count.
  - Rejected answers count.
  - Answers requiring changes count.
  - Total resolved doubts and overall resolution rate.
  - Reports awaiting review.
- **Navigation Shortcuts**: Added direct shortcut card to **Answer Verification**.

### 3.2 Answer Verification Center (`/admin/answers`)
- **Route**: `src/app/(dashboard)/admin/answers/page.jsx`
- **Features**:
  - **Interactive Queue Tabs**:
    - *All Answers*
    - *Pending Review* (active queue)
    - *High Priority Doubts* (doubts with priority `HIGH` or `URGENT`)
    - *Needs Changes* (answers awaiting revisions)
    - *Approved* (verified answers)
    - *Rejected* (declined answers)
  - **Filters**:
    - Search by answer content, helper name, or doubt title (debounced).
    - Subject filter dropdown.
    - Sorting by newest and oldest submissions.
    - Server-side pagination with previous/next controls.
  - **Answer Review & Verification Modal/Panel**:
    - Lets administrators inspect details without losing position in the queue.
    - Displays full Doubt context (title, description, tags, student name, department).
    - Displays Helper profile (reputation, accepted answers, qualified subjects, total answers).
    - Displays complete answer content.
    - Displays prior moderation review history (reviewer, decision, feedback, timestamp).
    - In-modal moderation form to Approve, Request Changes, or Reject.

### 3.3 Moderation Quality & Analytics Hub (`/admin/moderation`)
- **Route**: `src/app/(dashboard)/admin/moderation/page.jsx`
- **Tabs**:
  - **Unified Queue**: Reused `AdminModerationQueue` for pending answers, knowledge guides, and reports.
  - **Moderation Analytics & Quality**:
    - Total answers audited.
    - Approval rate percentage.
    - Rejection rate percentage.
    - Needs-changes rate percentage.
    - Average turnaround time (from answer submission to decision).
    - Daily review volume timeline (past 14 days).
    - Moderator activity leaderboard (ranked by reviews completed).
    - Subject-wise quality distribution table.
    - Explicit methodology note: *"Moderation decisions represent quality, pedagogical clarity, and academic integrity safety checkpoints; they are not an objective measurement of academic correctness."*

### 3.4 Navigation Integration (`src/components/layout/Sidebar.jsx`)
- Added **Answer Verification** (`/admin/answers`) to sidebar navigation.
- Configured RBAC visibility so both `ADMIN` and `MODERATOR` roles have access to moderation tools.

---

## 4. Moderation Workflow & Logic

All moderation decisions are executed atomically via Prisma transactions (`prisma.$transaction`):

| Decision | Target Status | Validation | Side Effects |
|---|---|---|---|
| **APPROVE** | `APPROVED` | Reviewer is ADMIN/MODERATOR. Cannot review own answer. | Creates `ModerationReview`. Updates Answer to `APPROVED`. Transitions doubt from `OPEN`/`CLAIMED` to `ANSWERED`. Dispatches `notifyAnswerApproved`. Writes `AuditLog`. |
| **REJECT** | `REJECTED` | Requires rejection reason (min 5 characters). Cannot review own answer. | Creates `ModerationReview`. Updates Answer to `REJECTED`. Dispatches `notifyAnswerRejected`. Writes `AuditLog`. |
| **REQUEST CHANGES** | `PENDING` | Requires constructive feedback (min 5 characters). Cannot review own answer. | Creates `ModerationReview` with decision `NEEDS_CHANGES`. Answer remains `PENDING` awaiting helper revision. Dispatches `notifyAnswerChangesRequested`. Writes `AuditLog`. |

---

## 5. Backend API Endpoints

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/admin/overview` | `ADMIN`, `MODERATOR` | Platform KPIs including answer lifecycle breakdown |
| `GET` | `/api/admin/answers` | `ADMIN`, `MODERATOR` | Paginated answers queue with filters (`status`, `queue`, `subject`, `search`, `sort`) |
| `GET` | `/api/admin/answers/[answerId]` | `ADMIN`, `MODERATOR` | Complete answer detail with doubt and review history |
| `POST` / `PATCH` | `/api/admin/answers/[answerId]/moderate` | `ADMIN`, `MODERATOR` | Executes moderation action (`decision`, `feedback`) |
| `GET` | `/api/admin/analytics/moderation` | `ADMIN`, `MODERATOR` | Turnaround time, approval/rejection rates, daily counts, moderator activity |

---

## 6. Security Guarantees & RBAC Enforcement

1. **Role Enforcement**: All admin APIs invoke `requireRole(user, [ROLES.ADMIN, ROLES.MODERATOR])`. Unauthenticated requests yield `401 Unauthorized`; unprivileged roles (`STUDENT`, `HELPER`) receive `403 Forbidden`.
2. **Session-Derived Reviewer Identity**: The reviewer identity is never accepted from request parameters; it is extracted strictly from the iron-session cookie via `getCurrentUser()`.
3. **Self-Moderation Prevention**: If `answer.authorId === reviewer.id`, the action is strictly blocked with `403 Forbidden`, preventing helpers or moderators from approving their own answers.
4. **Append-Only Audit Trail**: Every decision is written to `AuditLog` with actor snapshot (email, role, name) and sanitized metadata (passwords and tokens redacted).
5. **Safe Input Validation**: Rejection and changes requests mandate non-empty constructive guidance.

---

## 7. Verification & Test Results

### 7.1 Automated Integration Tests
- **Test File**: `tests/integration/admin-answer-verification.test.mjs`
- **Results**:
  - `1. getAdminAnswers returns answers list with queue filtering` — **PASS**
  - `2. getAdminAnswerDetail returns complete context including doubt and helper` — **PASS**
  - `3. Non-privileged roles (STUDENT, HELPER) cannot execute moderation` — **PASS**
  - `4. Self-moderation is blocked even if reviewer has MODERATOR role` — **PASS**
  - `5. Rejection requires a reason of at least 5 characters` — **PASS**
  - `6. Needs Changes requires constructive feedback of at least 5 characters` — **PASS**
  - `7. MODERATOR can request changes, dispatches notification and audit log` — **PASS**
  - `8. ADMIN approves answer: transitions status to APPROVED, doubt to ANSWERED` — **PASS**
  - `9. getAdminModerationAnalytics returns computed quality rates` — **PASS**
  - `10. Unauthenticated API access returns 401` — **PASS**
  - **Summary**: 11 passed, 0 failed, duration: ~47s.

### 7.2 Lint and Build Results
- **Prisma Schema Validation**: `npx prisma validate` — Valid 🚀
- **ESLint**: `npm run lint` — **0 warnings, 0 errors** ✔
- **Production Build**: `npm run build` — **Compiled successfully in 21.9s, generating 60 static/dynamic routes with zero build errors** ✔
