# DoubtBridge REST API Specification

All API endpoints return JSON responses. State-changing requests (`POST`, `PATCH`, `DELETE`) require an active session cookie (`doubtbridge_session`) unless documented as public.

---

## 1. Authentication Endpoints

### Register User
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public (Rate-limited: 5 requests / 15 minutes / IP)
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@university.edu",
    "password": "SecurePassword123!",
    "role": "STUDENT",       // Only STUDENT or HELPER accepted; ADMIN/MODERATOR silently mapped to STUDENT
    "department": "Computer Science",
    "academicYear": "Year 3"
  }
  ```
- **Responses**:
  - `201 Created`: `{ "success": true, "user": { ... }, "message": "Account created successfully." }`
  - `400 Bad Request`: `{ "success": false, "errors": ["Password must be at least 8 characters."] }`
  - `409 Conflict`: `{ "success": false, "errors": ["An account with this email already exists."] }`
  - `429 Too Many Requests`: `{ "success": false, "error": "Too many registration attempts." }`

### Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public (Rate-limited: 10 attempts / minute / IP)
- **Request Body**:
  ```json
  {
    "email": "jane@university.edu",
    "password": "SecurePassword123!"
  }
  ```
- **Responses**:
  - `200 OK`: Sets `doubtbridge_session` encrypted cookie. Returns user object.
  - `401 Unauthorized`: `{ "success": false, "error": "Invalid email or password." }`
  - `403 Forbidden`: `{ "success": false, "error": "Account suspended. Reason: ..." }`

### Logout
- **Endpoint**: `POST /api/auth/logout`
- **Access**: Authenticated
- **Response**: `200 OK`: Destroys session cookie.

### Current User
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated
- **Response**: `200 OK`: `{ "success": true, "user": { "id", "name", "email", "role", "reputation", ... } }`

### Change Password
- **Endpoint**: `POST /api/auth/change-password`
- **Access**: Authenticated
- **Request Body**: `{ "currentPassword": "...", "newPassword": "..." }`
- **Responses**:
  - `200 OK`: `{ "success": true, "message": "Password changed successfully." }`
  - `401 Unauthorized`: Current password incorrect.

---

## 2. Doubts & Answers Endpoints

### List Doubts
- **Endpoint**: `GET /api/doubts`
- **Access**: Authenticated
- **Query Parameters**:
  - `page` (default: 1), `limit` (default: 10)
  - `subject`, `status` (`OPEN`, `CLAIMED`, `ANSWERED`, `RESOLVED`, `CLOSED`), `urgency`
  - `search` (keyword search on title and description)
- **Response**: `200 OK`: `{ "success": true, "doubts": [...], "pagination": { ... } }`

### Create Doubt
- **Endpoint**: `POST /api/doubts`
- **Access**: Authenticated (`STUDENT`, `HELPER`, `MODERATOR`, `ADMIN`)
- **Request Body**:
  ```json
  {
    "title": "Question title (min 5 chars)",
    "description": "Full markdown description",
    "subject": "Mathematics",
    "topic": "Calculus",
    "priority": "MEDIUM",
    "tags": ["calculus", "integrals"]
  }
  ```

### Get Doubt Detail
- **Endpoint**: `GET /api/doubts/[doubtId]`
- **Access**: Authenticated
- **Response**: Returns doubt details with verified answers and author profiles.

### Submit Answer
- **Endpoint**: `POST /api/doubts/[doubtId]/answers`
- **Access**: Authenticated
- **Request Body**: `{ "content": "Detailed academic answer content..." }`
- **Behavior**: New answer is created with `status: "PENDING"` awaiting moderator review.

### Moderate Answer
- **Endpoint**: `POST /api/doubts/[doubtId]/answers/[answerId]/review`
- **Access**: `MODERATOR` or `ADMIN`
- **Request Body**: `{ "decision": "APPROVED" | "REJECTED" | "NEEDS_CHANGES", "feedback": "Optional" }`
- **IDOR Protection**: Authors cannot review their own answers (403).

### Accept Solution
- **Endpoint**: `POST /api/doubts/[doubtId]/answers/[answerId]/accept`
- **Access**: Doubt Owner (`studentId`) or `ADMIN`
- **Behavior**: Sets `isAccepted: true`, marks Doubt as `RESOLVED`, awards `+25` reputation points to the answer author.

---

## 3. Peer Helper Endpoints

### Helper Directory
- **Endpoint**: `GET /api/helpers`
- **Query Parameters**: `subject`, `search`, `page`, `limit`

### Helper Profile & Availability
- **Endpoint**: `GET /api/helpers/profile` — Fetch active helper's stats and bio.
- **Endpoint**: `PATCH /api/helpers/profile` — Toggle availability or update subjects/expertise.

### Recommended Doubts Feed
- **Endpoint**: `GET /api/helpers/feed`
- **Access**: `HELPER` or `ADMIN`
- **Behavior**: Evaluates 100-point matching engine against all open doubts and sorts by relevance score.

### Claim Doubt
- **Endpoint**: `POST /api/doubts/[doubtId]/claim`
- **Access**: `HELPER` or `ADMIN`
- **Behavior**: Atomically assigns doubt to helper. Rejects if doubt is already claimed or helper has reached active workload limit (5).

### Update Assignment Status
- **Endpoint**: `PATCH /api/helpers/assignments/[assignmentId]`
- **Access**: Assignment Owner or `ADMIN`
- **Request Body**: `{ "action": "CANCEL" | "COMPLETE" }`
- **IDOR Protection**: Returns 403 Forbidden if called by another user.

---

## 4. Knowledge Hub Endpoints

### Search & List Articles
- **Endpoint**: `GET /api/knowledge`
- **Query Parameters**: `q`, `subject`, `topic`, `sort` (`popular`, `recent`), `page`, `limit`

### Create Article / Resource
- **Endpoint**: `POST /api/knowledge`
- **Request Body**: `{ "title", "content", "subject", "topic", "status": "DRAFT" | "PENDING" }`

### Review Knowledge Submission
- **Endpoint**: `POST /api/knowledge/[articleId]/review`
- **Access**: `MODERATOR` or `ADMIN`
- **Request Body**: `{ "decision": "APPROVED" | "REJECTED" }`
- **IDOR Protection**: Authors cannot review their own submissions (403).

### Bookmarks
- **Endpoint**: `GET /api/knowledge/bookmarks` — Returns list of bookmarked articles for current user.
- **Endpoint**: `POST /api/knowledge/[articleId]/bookmark` — Toggles bookmark state (saved / removed).

---

## 5. Notifications Activity Center

### List Notifications
- **Endpoint**: `GET /api/notifications`
- **Query Parameters**: `page`, `limit`, `read` (`true` | `false`), `type`
- **Security**: Strictly scoped to current session user.

### Unread Count
- **Endpoint**: `GET /api/notifications/unread-count`
- **Response**: `{ "success": true, "unreadCount": 3 }`

### Mark as Read / Read All
- **Endpoint**: `PATCH /api/notifications/[notificationId]/read`
- **Endpoint**: `POST /api/notifications/read-all`

### Delete Notification
- **Endpoint**: `DELETE /api/notifications/[notificationId]`
- **IDOR Protection**: Only the recipient user can delete their notifications (403).

---

## 6. Admin Control Center Endpoints

### Platform Overview
- **Endpoint**: `GET /api/admin/overview`
- **Access**: `ADMIN` only (403 Forbidden for others)
- **Response**: Returns user role distribution, queue counts, resolution rates, and recent audit logs.

### User Management
- **Endpoint**: `GET /api/admin/users` — Paginated user directory with filters (`role`, `status`, `search`).
- **Endpoint**: `GET /api/admin/users/[userId]` — Detailed user profile with recent doubts, answers, and audit history.
- **Endpoint**: `PATCH /api/admin/users/[userId]/role` — Promote/demote role. Blocks self-escalation (403).
- **Endpoint**: `PATCH /api/admin/users/[userId]/status` — Suspend or reactivate user. Blocks self-suspension (403).

### Moderation Queue & Reports
- **Endpoint**: `GET /api/admin/moderation` — Unified pending queue (answers, articles, reports).
- **Endpoint**: `GET /api/admin/reports` — Community user reports.
- **Endpoint**: `PATCH /api/admin/reports/[reportId]` — Resolve report with resolution notes.

### Append-Only Audit Logs
- **Endpoint**: `GET /api/admin/audit-logs`
- **Access**: `ADMIN` only
- **Query Parameters**: `action`, `targetType`, `actorId`, `page`, `limit`
- **Retention Guarantee**: Survives administrator account deletion. Sensitive secrets auto-redacted.

---

## 7. System Health Endpoints

- **Endpoint**: `GET /api/health` — Basic service status.
- **Endpoint**: `GET /api/health/database` — Direct database connection probe.
