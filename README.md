# 🎓 DoubtBridge — Peer-to-Peer Academic Doubt Resolution Platform

**DoubtBridge** is an enterprise-grade academic collaboration platform engineered with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS 4**, **Prisma ORM 6**, and **PostgreSQL (Supabase)**. It connects university students with verified peer helpers and mentors to solve academic doubts with full traceability, role-based moderation, and reputation incentives.

---

## 📋 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Key Features Implemented](#-key-features-implemented)
  - [1. Database Foundation & Prisma Schema](#1-database-foundation--prisma-schema)
  - [2. Live Doubt Listing, Search & Filters (Task 1)](#2-live-doubt-listing-search--filters-task-1)
  - [3. Live Doubt Detail, Answer Submission & Moderation (Task 2)](#3-live-doubt-detail-answer-submission--moderation-task-2)
  - [4. Live Dashboard, Analytics & Role-Based Statistics (Task 3)](#4-live-dashboard-analytics--role-based-statistics-task-3)
  - [5. Peer Helper Service, Matching Engine & Assignment Management (Task 4)](#5-peer-helper-service-matching-engine--assignment-management-task-4)
  - [6. Academic Knowledge Hub, Article Library & Resource Management (Task 5)](#6-academic-knowledge-hub-article-library--resource-management-task-5)
  - [7. Real-Time Notifications & Activity Center (Task 6)](#7-real-time-notifications--activity-center-task-6)
- [Component & Service Architecture](#-component--service-architecture)
- [REST API Reference](#-rest-api-reference)
- [Role-Based Access Control (RBAC) & Workflows](#-role-based-access-control-rbac--workflows)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Verification & Testing](#-verification--testing)

---

## 🏛 Overview & Architecture

DoubtBridge uses a multi-tier architecture separating presentation, feature actions, domain validation, and database operations:

```mermaid
flowchart TD
    User["Student / Peer Helper / Moderator"] -->|Web UI| App["Next.js 15 App Router (React 19)"]
    App --> Components["UI Atoms & Domain Components (src/components/doubts)"]
    Components --> Handlers["Next.js API Route Handlers (src/app/api)"]
    Handlers --> Services["Domain Service Layer (src/features/*)"]
    Services --> RBAC["RBAC & Session Resolver (src/lib/auth.js, src/lib/permissions.js)"]
    Services --> Prisma["Singleton Prisma 6 Client (src/lib/prisma.js)"]
    Prisma -->|Port 6543 / PgBouncer Pooler| Supabase[("Supabase PostgreSQL Database")]
```

### Technology Stack
- **Framework:** Next.js 15 (App Router, Server Components + Client Components)
- **UI Library:** React 19, Lucide React Icons, Motion
- **Language:** JavaScript & JSX (strict ECMAScript standard)
- **Styling:** Tailwind CSS 4 (custom color palette: Primary Blue `#2563EB`, Dark Text `#101B3D`, Border `#E5EAF2`)
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** Prisma ORM 6 with PgBouncer connection pooling support
- **Linting & Code Quality:** ESLint 9 (Next.js config)

---

## ✨ Key Features Implemented

### 1. Database Foundation & Prisma Schema
- **Connection Pooling**: Configured dual-connection architecture in `prisma/schema.prisma` with `url` (port 6543 transaction pooler with `?pgbouncer=true`) for application queries and `directUrl` (port 5432) for schema migrations.
- **Client Singleton**: Centralized Prisma Client in `src/lib/prisma.js` preventing multiple connection leaks during hot reloads.
- **Relational Schema (14 Models)**:
  - `User`: Roles (`STUDENT`, `HELPER`, `MODERATOR`, `ADMIN`), department, academic year, peer reputation.
  - `HelperProfile`: Specializations, subjects, total answers, accepted answers, availability status.
  - `Doubt`: Status (`OPEN`, `ASSIGNED`, `CLAIMED`, `ANSWERED`, `RESOLVED`, `CLOSED`), urgency (`LOW`, `MEDIUM`, `HIGH`), priority, relations to student and helper.
  - `Answer`: Status (`PENDING`, `APPROVED`, `REJECTED`), `isAccepted`, upvote count, relations to doubt and author.
  - `DoubtAssignment`: Tracks claimed doubts and active/completed states.
  - `ModerationReview`: Decisions (`APPROVED`, `REJECTED`, `NEEDS_CHANGES`), reviewer notes, audit timestamps.
  - `KnowledgeResource`, `KnowledgeArticle`, `ArticleRevision`, `Tag`, `DoubtTag`, `ArticleTag`, `Vote`, `Bookmark`, `Report`, `ActivityLog`.
- **Database Health Check**: Implemented server-only route `GET /api/health/database` executing live PostgreSQL queries (`SELECT 1`).
- **Seed Data**: Fully seeded database with 16 users across all roles, 12 doubts, 15 answers, helper profiles, and knowledge articles.

---

### 2. Live Doubt Listing, Search & Filters (Task 1)
Replaced the hardcoded `sampleDoubts` mock data with a high-performance, dynamic feed connected to `GET /api/doubts`:
- **Keyword Search**: Debounced search (350ms) querying `title`, `description`, and `tags` using PostgreSQL case-insensitive matching (`mode: 'insensitive'`).
- **Status Filter Chips**: Real-time filtering across `All`, `OPEN`, `CLAIMED`, `ASSIGNED`, `ANSWERED`, `RESOLVED`, and `CLOSED`.
- **Subject Dropdown**: Case-insensitive subject filtering covering Computer Science, Mathematics, Physics, Chemistry, and Engineering.
- **Multi-criteria Sorting**: Sort by `Newest first`, `Oldest first`, and `Highest urgency`.
- **Feed Scope Switcher**: Instant switching between **"All Doubts"** (community feed) and **"My Doubts Only"** (filtered to the student).
- **Safe Server-Side Pagination**: Bound-checked pagination controls with "Showing X to Y of Z doubts", page counters, and previous/next actions.
- **Loading & Error Handling**: Shimmer skeletons (4 cards), informative empty state with "Ask a Doubt" CTA, and error card with retry mechanism.

---

### 3. Live Doubt Detail, Answer Submission & Moderation (Task 2)
Replaced static mock data in `/doubts/[doubtId]` with a real-time, interactive doubt detail and answer resolution workflow:
- **Comprehensive Question Detail**: Title, full formatted description, subject and topic badges, urgency and difficulty indicators, tags list, author details with avatar initials, relative timestamp (`timeAgo`), and assigned helper indicator.
- **Answer Submission**: Clean textarea form with live character count (5 to 5,000 chars), validation rules, clear action, duplicate submission prevention, and submission states.
- **Role-Based Content Visibility**:
  - `APPROVED` answers are visible to all students and visitors.
  - `PENDING` answers are visible only to the answer author (so they can verify their submission), the doubt creator (so they know an answer arrived), and moderators/admins.
  - `REJECTED` answers are hidden from the general public.
- **Moderator Review Actions**: In-line review bar for `MODERATOR` and `ADMIN` users to approve or reject pending answers with optional feedback notes. Self-moderation is strictly prohibited. When an answer is approved, the parent doubt automatically transitions to `ANSWERED`.
- **Transactional Solution Acceptance**:
  - Only the doubt owner (or `ADMIN`) can accept an answer.
  - The answer must be in `APPROVED` status.
  - Authors cannot accept their own solutions (self-acceptance prevention).
  - Executed inside an atomic Prisma `$transaction` with concurrency optimization:
    1. Updates answer `isAccepted: true`.
    2. Updates parent doubt to `status: RESOLVED` and populates `resolvedAt`.
    3. Rewards helper with `+25` reputation points on `User` and increments `HelperProfile.acceptedAnswers`.
    4. Marks any active `DoubtAssignment` for that helper as `COMPLETED`.
    5. Rejects multiple accepted solutions on the same doubt.
- **Answer Upvoting**: Upvote counter incrementing live in the database.

---

### 4. Live Dashboard, Analytics & Role-Based Statistics (Task 3)
Converted the mock dashboard into a database-backed command center:
- **Role-Tailored Statistics Cards**:
  - `STUDENT`: Total doubts asked, open questions, in-progress/answered questions, resolved doubts, accepted answers received, and student reputation.
  - `HELPER`: Available open questions, claimed questions, active assignments, total answers submitted, approved explanations, accepted solutions, and helper reputation.
  - `MODERATOR`: Pending answers awaiting review, approved answers, rejected answers, flagged reports, personal review counts, and platform-wide moderation audits.
  - `ADMIN`: Total registered users (student, helper, moderator, admin breakdowns), total doubts, total answers, resolution rate percentage, and total pending moderation queue.
- **Interactive Analytics Visualizations (Zero Heavy Charting Dependencies)**:
  - **Doubt Creation Trend**: Pure React SVG line and area gradient chart mapping daily doubt counts across selectable ranges (7, 14, and 30 days) with interactive point tooltips.
  - **Doubt Status Distribution**: Proportional segmented bar visualizer and breakdown grid covering all lifecycle stages (`OPEN`, `CLAIMED`, `ASSIGNED`, `ANSWERED`, `RESOLVED`, `CLOSED`).
  - **Subject Distribution**: Ranked horizontal comparative progress bars highlighting question volumes across academic subjects (Computer Science, Data Structures & Algorithms, Computer Networks, Databases, React, etc.).
- **Live Chronological Platform Activity**:
  - Synthesizes real operational events across `Doubt.createdAt`, `Answer.createdAt`, `ModerationReview.reviewedAt`, `DoubtAssignment.assignedAt`, and `Doubt.resolvedAt`.
  - Displays actor names, dynamic action badges, timestamps via `timeAgo`, and deep links to relevant doubts.
- **Role-Prioritized Recent Doubts**:
  - Highlights the most recent doubts relevant to the authenticated user's role with status badges, subject chips, answer count, and direct view links.
- **Quick Action Navigation**: Direct shortcuts to "Ask a Doubt", "Browse Doubts", "Help Others", and "Knowledge Hub".

---

### 5. Peer Helper Service, Matching Engine & Assignment Management (Task 4)
Engineered an end-to-end academic tutoring and assignment orchestration engine:
- **Helper Profile & Availability Management**:
  - Profile activation allows students to register as peer helpers with biography, qualified academic disciplines, and specific topic expertise.
  - Live availability toggle (`Available` vs `Paused`) synchronized across `User` and `HelperProfile` in PostgreSQL.
  - When paused, helpers are excluded from matched recommendations while active assignments remain intact.
- **Rule-Based Matching Engine (100-Point Rubric)**:
  - **Subject Match**: `+30 points` when doubt's subject matches helper's qualified disciplines.
  - **Topic Match**: `+50 points` when doubt's topic or keywords match helper's topic specializations.
  - **Availability**: `+20 points` when helper is actively accepting new assignments.
  - **Invariants Enforced**: Excludes unavailable helpers, excludes author's own doubts (no self-help), enforces maximum 5 active assignments workload limit.
  - Returns transparent matching breakdown reasons (e.g., `["Subject match: Algorithms (+30)", "Topic match: Graph Theory (+50)", "Helper is available (+20)"]`).
- **Dynamic Helper Feed & Discovery**:
  - Ranks open, claimable questions by match score with urgency and recency tie-breakers.
  - Includes multi-criteria filtering by subject, topic, urgency, difficulty, and sort order.
- **Concurrency-Safe Atomic Doubt Claiming**:
  - Executed inside an atomic Prisma `$transaction` with conditional updates (`where: { id, status: 'OPEN', helperId: null }`).
  - Guarantees that two helpers claiming the same question simultaneously receive immediate conflict protection (`409 Conflict`).
  - Atomically creates `DoubtAssignment` (`status: ACTIVE`) and transitions doubt to `status: CLAIMED`.
- **Assignment Lifecycle & Doubt Reopening**:
  - Full lifecycle tracking: `ACTIVE`, `COMPLETED`, `CANCELLED`.
  - Helpers can release/cancel an active assignment, which atomically sets assignment `CANCELLED` and safely reopens the parent doubt to `status: OPEN` with `helperId: null` for the peer community.
- **Tabbed Peer Helper Hub & Dedicated Route**:
  - `/helpers`: Unified interface with 4 tabs: "Matched Open Doubts", "My Assignments", "Helper Profile & Availability", and "Peer Directory".
  - `/helpers/assignments`: Dedicated assignments management page.

---

### 6. Academic Knowledge Hub, Article Library & Resource Management (Task 5)
Engineered a comprehensive peer academic repository and publishing system:
- **Database-Driven Knowledge Hub**:
  - Replaced hardcoded sample articles with live PostgreSQL data via `KnowledgeResource` and `Bookmark` models.
  - Features dynamic subject tags with live database counts across all academic disciplines.
  - Highlighted **Featured Guide** banner dynamically showcases the most popular peer guide by views and bookmarks.
- **Search, Filtering & Sorting Engine**:
  - 350ms debounced search scanning title, summary, content, subject, and topic specializations.
  - Multi-discipline filtering with custom subject pills and counts.
  - Sorting by Newest, Most Viewed, Oldest, and Alphabetical.
  - Full server-side pagination, skeleton states, error retry, and empty states.
- **Full Article Reader (`/knowledge/[articleId]`)**:
  - Detailed reader view with author credentials (reputation, department, role).
  - Safe formatted content rendering for headers, bullet points, blockquotes, and code blocks without raw untrusted HTML.
  - External academic citation source link.
  - Atomic session-based view counter increment (`POST /api/knowledge/:articleId/view`).
  - Rule-based **Related Articles** recommendation shelf matching subject and topic.
- **Academic Resource Submission & Author Editing**:
  - Form route `/knowledge/new` and editor `/knowledge/[articleId]/edit` with client and server-side validation.
  - Title, subject, topic, summary, content, and external source URL fields.
  - Authors can save as `DRAFT` or submit for peer review (`PENDING`).
  - Strict ownership guard: authors can edit their own submissions; non-authors are forbidden with HTTP 403.
- **Peer Resource Moderation Workflow**:
  - Lifecycle: `DRAFT → PENDING → APPROVED / REJECTED`.
  - Public hub only renders `APPROVED` resources (drafts and pending items remain isolated to author and staff).
  - Dedicated Moderation Queue tab & review banner for `MODERATOR` and `ADMIN` roles (`POST /api/knowledge/:articleId/review`).
  - Invariant: Authors cannot review or approve their own submissions; students cannot moderate.
- **Article Bookmarking & Personal Library**:
  - Polymorphic enhancement to `Bookmark` model supporting both `doubtId` and `resourceId`.
  - Optimistic toggle button on all article cards and detail views (`POST /api/knowledge/:articleId/bookmark`).
  - Dedicated saved articles library at `/knowledge/bookmarks` and tab on the main hub.

---

### 7. Real-Time Notifications & Activity Center (Task 6)
Engineered an event-driven notification dispatch pipeline and centralized activity center:
- **Prisma Schema Enhancement**:
  - Enhanced `Notification` model with an optional `link String?` column allowing direct one-click navigation to the target doubt, answer, or learning resource.
- **Centralized Event-Driven Notification Service**:
  - Centralized module (`src/features/notifications/service.js`) handling creation, querying, unread counters, mark as read, mark all read, and deletion.
  - Full atomic `$transaction` integration ensures that notifications and the underlying workflow events commit together or roll back cleanly.
  - Invariant enforcement: Self-notification prevention (actors never receive notifications for their own actions).
- **Core Workflow Event Triggers**:
  - **Answer Submitted**: Automatically notifies doubt creator (`ANSWER_SUBMITTED`).
  - **Answer Approved**: Notifies answer author of approval (`MODERATION_DECISION`).
  - **Answer Rejected**: Notifies answer author of rejection with feedback notes (`MODERATION_DECISION`).
  - **Answer Accepted**: Notifies answer author that their solution was accepted with `+25` reputation reward (`DOUBT_RESOLVED`).
  - **Doubt Claimed**: Notifies doubt creator that a peer helper has claimed their question (`DOUBT_CREATED`).
  - **Assignment Cancelled**: Notifies doubt creator that their question was released back to the open pool (`SYSTEM`).
  - **Assignment Completed**: Notifies doubt creator of assignment completion (`DOUBT_RESOLVED`).
  - **Resource Approved**: Notifies academic article author that their submission is live (`MODERATION_DECISION`).
  - **Resource Rejected**: Notifies academic article author with moderator feedback notes (`MODERATION_DECISION`).
- **Interactive Header Bell & Real-Time Polling**:
  - Interactive `NotificationBell` with dynamic unread count pill badge (with `99+` formatting).
  - Lightweight 30-second polling interval and automatic window focus revalidation (`visibilitychange` / `focus`).
  - Dropdown preview flyout with quick mark-as-read, type-specific styling, relative timestamps, and one-click direct links.
- **Dedicated Notifications & Activity Center (`/notifications`)**:
  - Full-page responsive notification hub with status tabs (`All`, `Unread`, `Read`) and event type filter dropdown.
  - Paginated list with animated loading skeletons, clean empty states, single-click mark-as-read, delete action, and batch "Mark all as read".

---

## 🧩 Component & Service Architecture

```
src/
├── app/
│   ├── (auth)/                               # Login and Registration routes
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── layout.jsx                    # Metadata provider for dashboard
│   │   │   └── page.jsx                      # Live role-based dashboard, analytics & feeds
│   │   ├── doubts/
│   │   │   ├── layout.jsx                    # Metadata provider for doubt routes
│   │   │   ├── page.jsx                      # Live doubt listing, filters, feed toggle, pagination
│   │   │   ├── [doubtId]/
│   │   │   │   └── page.jsx                  # Live doubt detail, answer list, and submission form
│   │   │   └── new/                          # Ask a Doubt creation form
│   │   ├── helpers/
│   │   │   ├── layout.jsx                    # Metadata provider for helper hub
│   │   │   ├── page.jsx                      # Tabbed Helper Hub (Feed, Assignments, Profile, Directory)
│   │   │   └── assignments/
│   │   │       └── page.jsx                  # Dedicated helper assignments management
│   │   ├── notifications/
│   │   │   ├── layout.jsx                    # Metadata provider for notifications center
│   │   │   └── page.jsx                      # Full-page Notification & Activity Center
│   │   └── knowledge/
│   │       ├── layout.jsx                    # Metadata provider for knowledge hub
│   │       ├── page.jsx                      # Knowledge Hub (Featured, Popular, Subject Pills, Search)
│   │       ├── new/
│   │       │   └── page.jsx                  # Academic article submission form
│   │       ├── bookmarks/
│   │       │   └── page.jsx                  # Saved articles & revision library
│   │       └── [articleId]/
│   │           ├── page.jsx                  # Full article reader & related articles
│   │           └── edit/
│   │               └── page.jsx              # Author edit article route
│   ├── api/
│   │   ├── dashboard/
│   │   │   ├── overview/route.js             # GET role-specific metrics & live activity
│   │   │   └── analytics/route.js            # GET trend, status, & subject aggregations
│   │   ├── doubts/
│   │   │   ├── route.js                      # GET (listing) & POST (create doubt)
│   │   │   └── [doubtId]/
│   │   │       ├── route.js                  # GET (detail), PATCH (update), DELETE
│   │   │       ├── answers/
│   │   │       │   ├── route.js              # GET (list answers), POST (submit answer)
│   │   │       │   └── [answerId]/
│   │   │       │       ├── route.js          # Generic PATCH dispatcher
│   │   │       │       ├── accept/route.js   # POST/PATCH (accept approved solution)
│   │   │       │       ├── review/route.js   # POST/PATCH (moderator approve/reject)
│   │   │       │       └── upvote/route.js   # POST (upvote answer)
│   │   │       └── claim/route.js            # POST (concurrency-safe atomic claim)
│   │   ├── helpers/
│   │   │   ├── route.js                      # GET peer helpers directory
│   │   │   ├── profile/route.js              # GET / PUT helper profile & availability
│   │   │   ├── feed/route.js                 # GET matched & ranked open doubts
│   │   │   └── assignments/
│   │   │       ├── route.js                  # GET helper assignments
│   │   │       └── [assignmentId]/route.js   # PATCH cancel / complete assignment
│   │   ├── notifications/
│   │   │   ├── route.js                      # GET paginated notifications with filters
│   │   │   ├── unread-count/route.js         # GET lightweight unread count for badge
│   │   │   ├── read-all/route.js             # PATCH mark all notifications as read
│   │   │   └── [notificationId]/
│   │   │       ├── route.js                  # GET / DELETE single notification
│   │   │       └── read/route.js             # PATCH mark single notification as read
│   │   └── health/database/route.js          # GET database connectivity health-check
│   └── not-found.jsx                         # Global 404 handler
├── components/
│   ├── dashboard/
│   │   ├── DashboardStats.jsx                # Role-adaptive 4-stat cards container
│   │   ├── StatCard.jsx                      # Reusable single metric card
│   │   ├── RecentDoubts.jsx                  # Latest questions feed with status & answer badges
│   │   ├── RecentActivity.jsx                # Live chronological operational activity stream
│   │   ├── DoubtStatusChart.jsx              # Status proportional bar & breakdown grid
│   │   ├── DoubtTrendChart.jsx               # Interactive SVG creation trend line/area chart
│   │   └── SubjectDistributionChart.jsx      # Ranked subject progress bars
│   ├── doubts/
│   │   ├── DoubtCard.jsx                     # Single doubt card in listing
│   │   ├── DoubtFilters.jsx                  # Search, pills, subject, sort dropdowns
│   │   ├── DoubtList.jsx                     # Shimmer skeletons, empty state, cards
│   │   ├── DoubtStatusBadge.jsx              # Status pill badge for doubts
│   │   ├── DoubtDetail.jsx                   # Question information section
│   │   ├── AnswerCard.jsx                    # Single answer display with upvotes & actions
│   │   ├── AnswerForm.jsx                    # Answer contribution form
│   │   ├── AnswerList.jsx                    # Answers list container & solution highlights
│   │   └── AnswerStatusBadge.jsx             # Status badge for answers (APPROVED, PENDING, REJECTED)
│   ├── helpers/
│   │   ├── HelperFeedList.jsx                # Matched open doubts feed with claim buttons
│   │   ├── HelperAssignmentsList.jsx         # Helper assignments with status filters & actions
│   │   ├── HelperProfileCard.jsx             # Profile summary, availability toggle, and stats
│   │   ├── HelperProfileForm.jsx             # Profile edit / activation modal
│   │   ├── HelperCard.jsx                    # Directory helper card
│   │   └── MatchScoreBadge.jsx               # Score badge with interactive breakdown tooltip
│   ├── knowledge/
│   │   ├── KnowledgeCard.jsx                 # Article card with metadata, read time & bookmark button
│   │   ├── KnowledgeSearch.jsx               # 350ms debounced search bar
│   │   ├── KnowledgeFilters.jsx              # Subject pills with dynamic counts & sort dropdown
│   │   ├── KnowledgeList.jsx                 # Article grid with pagination & loading skeletons
│   │   ├── KnowledgeArticleDetail.jsx        # Full article reader with safe content formatting
│   │   ├── KnowledgeArticleForm.jsx          # Article submission and editor form with validation
│   │   ├── KnowledgeModerationQueue.jsx      # Moderation review queue with inline approve/reject
│   │   ├── BookmarkButton.jsx                # Optimistic bookmark toggle button
│   │   └── RelatedArticles.jsx               # Rule-based related articles recommendation shelf
│   ├── notifications/
│   │   ├── NotificationBell.jsx              # Header bell with polling, badge, and dropdown
│   │   ├── NotificationBadge.jsx             # Count badge pill with 99+ formatting
│   │   ├── NotificationDropdown.jsx          # Flyout preview panel for recent notifications
│   │   ├── NotificationItem.jsx              # Card item with icons, timestamp, and actions
│   │   ├── NotificationFilters.jsx           # Status tabs (All/Unread/Read) and type dropdown
│   │   └── NotificationList.jsx              # Paginated list with shimmer loading skeletons
│   └── ui/                                   # Shared design system components (Badge, Button, Card, EmptyState, Input)
├── features/
│   ├── dashboard/
│   │   └── service.js                        # Multi-role overview metrics & aggregation analytics
│   ├── doubts/
│   │   ├── service.js                        # Doubt queries, search, filtering, and mutations
│   │   ├── actions.js                        # Server actions for doubt operations
│   │   └── validation.js                     # Doubt input sanitizer and validation rules
│   ├── helpers/
│   │   ├── service.js                        # Profile, directory, atomic claim & assignment lifecycle
│   │   ├── matching.js                       # 100-pt rule-based matching engine
│   │   ├── actions.js                        # Helper actions
│   │   └── validation.js                     # Input sanitizer for helper profile and actions
│   ├── notifications/
│   │   └── service.js                        # Event-driven notification dispatchers & queries
│   └── answers/
│       ├── service.js                        # Transactional answer creation, acceptance, and review
│       └── actions.js                        # Server actions for answers
└── lib/
    ├── auth.js                               # Server-side auth resolver (dev x-user-id support)
    ├── permissions.js                        # Role-based permissions (canClaim, canModerate, canAccept)
    ├── prisma.js                             # Singleton Prisma client instance
    └── utils.js                              # cn() and timeAgo() helpers
```

---

## 📡 REST API Reference

### Dashboard Endpoints

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/overview` | — | Role-tailored metrics, recent doubts, and live operational activity |
| `GET` | `/api/dashboard/analytics` | `days` (7, 14, 30), `scope` (`global` \| `mine`) | Status distribution, subject distribution, and daily creation trend |

### Doubts Endpoints

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/doubts` | `q`, `status`, `subject`, `sort`, `mine`, `limit`, `offset` | List doubts with case-insensitive search, filters, and pagination |
| `POST` | `/api/doubts` | — | Create a new doubt record (requires title, description, subject) |
| `GET` | `/api/doubts/:doubtId` | — | Retrieve full doubt details and author-filtered answers |
| `PATCH` | `/api/doubts/:doubtId` | — | Update doubt details (only if `OPEN` and owned by student) |
| `DELETE`| `/api/doubts/:doubtId` | — | Delete doubt (only if `OPEN` and owned by student) |
| `POST` | `/api/doubts/:doubtId/claim` | — | Claim an open doubt (requires `HELPER` or `ADMIN` role) |

### Answers Endpoints

| Method | Endpoint | Payload | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/doubts/:doubtId/answers` | — | Retrieve answers for a doubt with moderation visibility rules applied |
| `POST` | `/api/doubts/:doubtId/answers` | `{ "content": "..." }` | Submit an answer with default status `PENDING` |
| `POST` | `/api/doubts/:doubtId/answers/:answerId/accept` | — | Accept an approved answer as the solution (owner/admin only) |
| `POST` | `/api/doubts/:doubtId/answers/:answerId/review` | `{ "decision": "APPROVED", "feedback": "..." }` | Approve or reject an answer (`MODERATOR` / `ADMIN` only) |
| `POST` | `/api/doubts/:doubtId/answers/:answerId/upvote` | — | Upvote an answer |
| `PATCH`| `/api/doubts/:doubtId/answers/:answerId` | `{ "action": "accept" \| "review" \| "upvote" }` | Unified action dispatcher |

### Knowledge Hub & Academic Resource Endpoints

| Method | Endpoint | Query Parameters / Payload | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/knowledge` | `q`, `subject`, `topic`, `sort`, `mine`, `limit`, `offset` | List approved resources with search, subject filter, and dynamic counts |
| `POST` | `/api/knowledge` | `{ "title", "subject", "topic", "description", "content", "sourceUrl", "status" }` | Submit new resource (`DRAFT` or `PENDING`) |
| `GET` | `/api/knowledge/:articleId` | — | Retrieve single article details and related recommendations |
| `PATCH`| `/api/knowledge/:articleId` | `{ "title", "subject", "topic", "description", "content" }` | Update article (author or admin only) |
| `DELETE`|`/api/knowledge/:articleId` | — | Delete article (author or admin only) |
| `POST` | `/api/knowledge/:articleId/bookmark` | — | Toggle bookmark on article (creates or removes bookmark) |
| `GET` | `/api/knowledge/bookmarks` | `limit`, `offset` | List current user's saved academic resources |
| `GET` | `/api/knowledge/moderation` | `limit`, `offset` | List pending resources awaiting moderation review |
| `POST` | `/api/knowledge/:articleId/review` | `{ "decision": "APPROVED" \| "REJECTED", "feedback": "..." }` | Submit moderation review (staff only, no self-review) |
| `POST` | `/api/knowledge/:articleId/view` | — | Increment view counter atomically |

### Notifications & Activity Center Endpoints

| Method | Endpoint | Query Parameters / Payload | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | `page`, `limit`, `read` (`true`\|`false`), `type` | Paginated notifications for current user with unread counter |
| `GET` | `/api/notifications/unread-count` | — | Lightweight unread counter query for navigation bell |
| `PATCH`| `/api/notifications/read-all` | — | Mark all notifications as read for current user |
| `GET` | `/api/notifications/:notificationId`| — | Retrieve single notification (ownership verified) |
| `PATCH`| `/api/notifications/:notificationId/read` | — | Mark single notification as read (idempotent, ownership verified) |
| `DELETE`| `/api/notifications/:notificationId` | — | Delete single notification (ownership verified) |

---

## 🔐 Role-Based Access Control (RBAC) & Workflows

### User Roles
- `STUDENT`: Can create doubts, view all doubts, submit answers to open questions, and accept approved solutions on their own doubts.
- `HELPER`: All student capabilities plus claiming open doubts in their subject expertise and earning peer reputation points.
- `MODERATOR`: Can review submitted answers (`APPROVED`, `REJECTED`, `NEEDS_CHANGES`), inspect flagged reports, and view hidden/pending content. Cannot self-moderate their own answers.
- `ADMIN`: Full platform access, can moderate any content, claim/resolve any doubt, and manage assignments.

### Moderation & Acceptance Rules Matrix

| Action | Allowed Roles | Restrictions / Business Invariants |
| :--- | :--- | :--- |
| **Submit Answer** | `STUDENT`, `HELPER`, `MODERATOR`, `ADMIN` | Content must be 5 to 10,000 characters; cannot answer closed doubts; initial status is `PENDING`. |
| **Review Answer** | `MODERATOR`, `ADMIN` | Cannot review own answer; decision must be `APPROVED` or `REJECTED`; approval transitions parent doubt to `ANSWERED`. |
| **Accept Solution** | Doubt Creator or `ADMIN` | Answer must have `APPROVED` status; cannot self-accept; cannot accept multiple solutions on same doubt; transitions doubt to `RESOLVED` and sets `resolvedAt`. |
| **Earn Reputation** | Answer Author (Helper/Student) | `+25` reputation points awarded atomically upon solution acceptance; `acceptedAnswers` incremented on `HelperProfile`. |

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js `v20.x` or `v22.x`
- PostgreSQL database (or Supabase instance)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/keshav62/DoubtBridge-Peer-to-Peer-Academic-Doubt-Resolution-Platform.git
cd DoubtBridge-Peer-to-Peer-Academic-Doubt-Resolution-Platform
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
# Supabase Transaction Pooler (Port 6543 with ?pgbouncer=true)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Direct Connection for Migrations (Port 5432)
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"

NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Migration & Seeding
```bash
# Generate the Prisma client
npm run prisma:generate

# Apply migrations to database
npm run prisma:migrate

# Seed demo users, doubts, answers, and articles
npm run prisma:seed
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Testing

### 1. Code Quality & Linting
Run ESLint across all components, API routes, and feature files:
```bash
npm run lint
```
**Result:** `✔ No ESLint warnings or errors`

### 2. Production Build
Verify Next.js compilation, route manifests, and static optimization:
```bash
npm run build
```
**Result:** Compiled successfully with 0 errors. All static (`○`) and dynamic (`ƒ`) routes optimized.

### 3. Automated End-to-End Test Suite
A comprehensive 23-assertion test suite verifies all critical API pathways against a live PostgreSQL database:
- ✅ **Doubt Retrieval**: Valid ID returns 200 OK with sorted answers; invalid ID returns 404.
- ✅ **Answer Validation**: Rejects content `< 5` characters; enforces required fields.
- ✅ **Answer Creation**: New answers stored with `PENDING` moderation state.
- ✅ **Visibility Rules**: Pending answers hidden from uninvolved peers; visible to author & moderator.
- ✅ **Self-Moderation Prevention**: Authors attempting to approve their own answer receive 403 Forbidden.
- ✅ **Moderator Review**: Moderator approval transitions answer to `APPROVED` and doubt to `ANSWERED`.
- ✅ **Unauthorized Acceptance**: Non-owner student attempting acceptance receives 403 Forbidden.
- ✅ **Transactional Acceptance**: Doubt owner acceptance marks `isAccepted: true`, sets `RESOLVED`, updates `resolvedAt`, and rewards `+25` reputation to helper.
- ✅ **Duplicate Acceptance Prevention**: Subsequent acceptance attempts on resolved doubts receive 400 Bad Request.
- ✅ **Upvote System**: Answer upvotes incremented live in database.

**Result:** `E2E TEST SUMMARY: 23 PASSED, 0 FAILED`

### 4. Dashboard & Analytics Multi-Role Database Verification
Validated against live PostgreSQL Supabase data:
- ✅ **STUDENT Role**: Correctly aggregates student's doubts (`7 total`, `6 open`, `1 resolved`), accepted answers (`1`), and personal reputation (`150 Rep`).
- ✅ **HELPER Role**: Aggregates available open doubts (`9`), active claimed doubts (`1`), approved answers (`1`), and helper reputation (`1,875 Rep`).
- ✅ **MODERATOR Role**: Aggregates pending review queue (`3`), approved answers (`10`), rejected answers (`2`), pending reports (`1`), and moderator audit logs (`5 reviews by user / 8 total`).
- ✅ **ADMIN Role**: Aggregates total platform users (`16`: 8 students, 5 helpers, 2 moderators, 1 admin), total doubts (`17`), total answers (`15`), resolution rate (`18%`), and pending moderation queue (`4`).
- ✅ **Analytics Aggregations**: Accurate `groupBy` queries for doubt statuses and top subjects; daily date-bucketed creation trends across 7, 14, and 30 day spans.
- ✅ **Live Activity Stream**: Real-time synthesis of doubt creation, answers, claims, reviews, and resolution events in chronological order.

**Result:** `ALL BACKEND QUERIES & AGGREGATIONS VERIFIED PERFECTLY!`

### 5. Notifications & Activity Center Automated Test Suite
A comprehensive 21-assertion test suite validates all notification triggers, database cascades, and security protections:
- ✅ **Schema Integrity**: `link` column properly mapped and persisted on `Notification`.
- ✅ **Notification Query & Unread Count**: Filter by read status, pagination, and count verification.
- ✅ **Mark Read & Idempotency**: Transitions `isRead` to true; re-reading preserves state without errors.
- ✅ **Mark All Read**: Batch updates all unread notifications for a specific user.
- ✅ **Deletion & Security Guards**: Ownership-verified deletion; cross-user tampering attempts blocked (`403 Forbidden`).
- ✅ **Answer Submission Event**: Creating an answer notifies the doubt creator (`ANSWER_SUBMITTED`).
- ✅ **Self-Action Prevention**: Author answering own doubt triggers 0 self-notifications.
- ✅ **Answer Moderation Decision**: Approving/rejecting an answer notifies the answer author (`MODERATION_DECISION`).
- ✅ **Answer Acceptance Event**: Accepting an answer notifies author with solution status & reputation reward (`DOUBT_RESOLVED`).
- ✅ **Doubt Claiming Event**: Helper claiming an open doubt notifies doubt creator (`DOUBT_CREATED`).
- ✅ **Assignment Lifecycle Events**: Helper cancelling releases question and notifies creator (`SYSTEM`); completing marks resolved (`DOUBT_RESOLVED`).
- ✅ **Knowledge Moderation Events**: Resource approval and rejection notify article author with direct navigation link.

**Result:** `NOTIFICATIONS TEST SUMMARY: 21 PASSED, 0 FAILED`

---

## 👥 Contributors

- **Keshav** & Team — DoubtBridge Peer-to-Peer Academic Doubt Resolution Platform (2026)
