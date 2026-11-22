<div align="center">

# 🎓 DoubtBridge
### Peer-to-Peer Academic Doubt Resolution Platform

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&pause=1000&color=2563EB&center=true&vcenter=true&width=620&lines=Connecting+Students%2C+Empowering+Peer+Learning.;Real-Time+Academic+Doubt+Resolution;Verified+Peer+Helpers+%26+Curated+Knowledge;Role-Based+Answer+Verification+%26+Moderation;Engineered+with+Next.js+15%2C+React+19+%26+Prisma+6." alt="DoubtBridge Tagline Animation" />
</p>

<p align="center">
  <strong>An enterprise-grade, role-based academic collaboration platform connecting university students with verified peer helpers to resolve academic questions with quality verification, reputation incentives, and forensic audit logging.</strong>
</p>

<p align="center">
  <a href="https://github.com/keshav62/DoubtBridge-Peer-to-Peer-Academic-Doubt-Resolution-Platform">
    <img src="https://img.shields.io/badge/GitHub-Repository-101B3D?style=for-the-badge&logo=github" alt="Repository" />
  </a>
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  </a>
  <a href="https://react.dev">
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  </a>
  <a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS 4" />
  </a>
  <a href="https://www.prisma.io">
    <img src="https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma" alt="Prisma 6" />
  </a>
  <a href="https://supabase.com">
    <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase PostgreSQL" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Auth-iron--session_9.1-blueviolet?style=flat-square" alt="iron-session" />
  <img src="https://img.shields.io/badge/Security-bcryptjs_12_rounds-red?style=flat-square" alt="bcryptjs" />
  <img src="https://img.shields.io/badge/Validation-Zod_4.6-3E67B1?style=flat-square&logo=zod" alt="Zod" />
  <img src="https://img.shields.io/badge/Tests-Native_Node.js_Runner-339933?style=flat-square&logo=node.js" alt="Node Test Runner" />
  <img src="https://img.shields.io/badge/Architecture-App_Router_RSC-2563EB?style=flat-square" alt="Next.js App Router" />
</p>

---

[Explore Features](#-key-features) •
[System Architecture](#-system-architecture) •
[Database Design](#-database-design) •
[API Reference](#-api-documentation) •
[Local Setup](#-installation--local-setup) •
[Admin Bootstrap](#-admin-account-setup) •
[Testing](#-testing-suite)

---

</div>

## 📖 Table of Contents

- [Overview & Problem Statement](#-overview--problem-statement)
- [Key Features](#-key-features)
  - [Student Experience](#1-student-experience)
  - [Peer Helper Experience](#2-peer-helper-experience)
  - [Admin & Moderation Center](#3-admin--moderation-center)
  - [Platform Foundation Features](#4-platform-foundation-features)
- [Visual Showcase & Screenshots](#-visual-showcase--screenshots)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
  - [High-Level Data Flow](#high-level-data-flow)
  - [Answer Moderation & Quality Lifecycle](#answer-moderation--quality-lifecycle)
- [Project Structure](#-project-structure)
- [Database Design](#-database-design)
  - [Relational Models Overview](#relational-models-overview)
  - [Entity-Relationship Diagram](#entity-relationship-diagram)
- [Authentication & Security Architecture](#-authentication--security-architecture)
- [Installation & Local Setup](#-installation--local-setup)
- [Admin Account Setup (CLI Bootstrap)](#-admin-account-setup-cli-bootstrap)
- [API Documentation](#-api-documentation)
- [Testing Suite](#-testing-suite)
- [Production Deployment](#-production-deployment)
- [Project Roadmap](#-project-roadmap)
- [Contributing](#-contributing)
- [Authors & Contact](#-authors--contact)

---

## 🎯 Overview & Problem Statement

University students regularly encounter bottlenecks when working through complex academic concepts, programming assignments, and mathematical proofs. Traditional university office hours are geographically constrained, time-limited, and often congested. Conversely, public forums like StackOverflow or Reddit lack course-level academic context, are intimidating to beginners, and often violate university academic honor codes.

**DoubtBridge** bridges this gap by providing a private, peer-to-peer academic platform that promotes collaborative learning with structured quality control:

- **Students** post questions categorized by subject, urgency, and difficulty, receive tailored peer assistance, and accept solutions that helped them learn.
- **Peer Helpers** reinforce their own mastery, claim questions aligned with their verified subjects, and earn transparent peer reputation points.
- **Moderators and Administrators** maintain strict academic integrity through a dedicated **Answer Verification & Moderation Center**, ensuring all solutions meet quality standards before reaching students.

---

## ✨ Key Features

### 1. Student Experience
- **Structured Doubt Creation**: Create academic doubts with title, detailed problem description, course subject, topic, difficulty level (`Beginner`, `Intermediate`, `Advanced`), urgency level, and searchable tags.
- **Live Search & Filtering Feed**: Debounced search (350ms) across doubt titles, descriptions, and tags. Filter by real-time status chips (`OPEN`, `CLAIMED`, `ASSIGNED`, `ANSWERED`, `RESOLVED`, `CLOSED`), subjects, and sorting criteria (`Newest`, `Oldest`, `Highest urgency`).
- **Interactive Resolution Thread**: Review submitted answers, upvote helpful explanations, and mark the correct solution with **"Accept Answer"**, transitioning the doubt to `RESOLVED`.
- **Knowledge Bookmarks**: Bookmark useful doubts and knowledge hub resources into a unified personal repository.
- **Personal Progress Analytics**: View personal contribution statistics (doubts created, resolved, answers submitted, upvotes, acceptance rate, and subject-wise distribution chart).
- **Profile & Preferences**: Manage personal department, academic year, bio, and password preferences through the Settings center.

### 2. Peer Helper Experience
- **Dedicated Helper Workspace**: Browse doubts in the open community feed, inspect questions matching qualified subjects, and claim doubts directly.
- **Helper Directory & Matching**: Students can discover qualified peer helpers filtered by subject expertise and reputation rating.
- **Availability Status Toggle**: Helpers can switch between **"Available for Doubts"** and **"Busy / Offline"** with instantaneous state updates.
- **Assignment Management**: Track active assignments, completed peer sessions, and view performance metrics.
- **Answer Submission**: Submit structured academic explanations with rich text and code formatting.

### 3. Admin & Moderation Center
- **Executive Platform Analytics**: Real-time KPI counters: total registered students, verified helpers, submitted answers, pending moderation queue, resolved doubts, and active dispute reports.
- **Answer Verification Center**: Three-way decision workflow for submitted answers:
  - **Approve**: Immediately transitions answer to `APPROVED` and doubt to `ANSWERED`.
  - **Reject**: Rejects non-compliant submissions with a mandatory explanation of at least 5 characters.
  - **Needs Changes**: Requests revisions with constructive peer feedback.
- **User Governance**: Browse, search, filter, and inspect registered users. Administrators can safely update user roles or suspend non-compliant accounts with mandatory audit reasons.
- **Reports & Safety Center**: Review user-flagged doubts and answers with resolution tracking.
- **Forensic Audit Log Explorer**: Search and inspect an immutable audit trail (`AuditLog`) capturing actor identity, action type, target ID, metadata snapshot, and exact UTC timestamp.

### 4. Platform Foundation Features
- **Stateless Encrypted Sessions**: Zero-database session lookups per HTTP request using sealed cookies powered by `iron-session`.
- **Role-Based Access Control (RBAC)**: Strict server-side policy layer (`ROLES.STUDENT`, `HELPER`, `MODERATOR`, `ADMIN`) guarding API endpoints and dashboard routes.
- **In-App Notification Dispatcher**: Real-time alert badges and notification inbox informing users when doubts are answered, reviewed, or accepted.
- **Academic Knowledge Hub**: Community article repository with view counting, categories, bookmarked resources, and moderator publication reviews.
- **Community Discussion & Leaderboard**: Global reputation leaderboard tracking weekly, monthly, and all-time top peer helpers and students.

---

## 📸 Visual Showcase & Screenshots

> [!NOTE]
> The screenshots below highlight the visual identity and user interface of DoubtBridge. To capture fresh screenshots for your deployment, follow the instructions in [docs/screenshots/README.md](docs/screenshots/README.md).

| Platform View | Preview / Description |
|:---|:---|
| **Platform Landing** | <img src="public/images/students-hero.jpg" width="440" alt="DoubtBridge Landing View" /><br />*Public landing page with live platform statistics and feature introduction.* |
| **Academic Community** | <img src="public/images/students-community.jpg" width="440" alt="Students Community View" /><br />*Interactive peer learning space and active doubt feeds.* |
| **Academic Knowledge Hub** | <img src="public/images/knowledge-hub.jpg" width="440" alt="Knowledge Hub Library" /><br />*Curated academic articles, study notes, and peer study resources.* |

<details>
<summary><strong>📋 View Full Screenshot Capture Checklist (17 Views)</strong></summary>

The interface is ready for capturing high-resolution 1920×1080 screenshots:
- `01-landing-page.png` — Public desktop landing view (`/`)
- `02-login-page.png` — Unified authentication portal (`/login`)
- `03-register-page.png` — Role selection & onboarding (`/register`)
- `04-student-dashboard.png` — Student learning dashboard (`/dashboard`)
- `05-all-doubts.png` — Searchable doubt feed with filters (`/all-doubts`)
- `06-doubt-detail.png` — Doubt thread with answers & accept action (`/doubts/[id]`)
- `07-ask-doubt.png` — Question creation interface (`/doubts/new`)
- `08-helper-feed.png` — Helper discovery feed (`/help-others`)
- `09-helper-directory.png` — Helper matching directory (`/helpers`)
- `10-admin-overview.png` — Administrative analytics dashboard (`/admin`)
- `11-admin-verification.png` — Answer moderation queue (`/admin/answers`)
- `12-admin-users.png` — User management and role switching (`/admin/users`)
- `13-admin-audit-logs.png` — Forensic audit logs explorer (`/admin/audit-logs`)
- `14-knowledge-hub.png` — Knowledge article library (`/knowledge`)
- `15-my-progress.png` — Learning analytics and charts (`/progress`)
- `16-leaderboard.png` — Reputation ranking leaderboard (`/leaderboard`)
- `17-settings-profile.png` — Account settings and security (`/settings`)

See [docs/screenshots/README.md](docs/screenshots/README.md) for full capturing procedures.
</details>

---

## 💻 Technology Stack

| Layer | Technology | Version | Purpose |
|:---|:---|:---:|:---|
| **Frontend Framework** | [Next.js (App Router)](https://nextjs.org/) | `^15.0.0` | React Server Components, Server Actions, Dynamic Layouts |
| **UI Library** | [React](https://react.dev/) | `^19.0.0` | Declarative component UI architecture |
| **Styling & Design** | [Tailwind CSS](https://tailwindcss.com/) | `^4.3.3` | Modern utility-first styling with custom academic theme |
| **Iconography** | [Lucide React](https://lucide.dev/) | `^1.16.0` | Accessible SVG iconography |
| **UI Animations** | [Motion](https://motion.dev/) | `^14.6.0` | Smooth transitions and state animations |
| **ORM** | [Prisma ORM](https://www.prisma.io/) | `^6.0.0` | Type-safe database queries, schema modeling, migrations |
| **Database** | [PostgreSQL via Supabase](https://supabase.com/) | `Postgres 15` | Managed relational database with PgBouncer connection pooling |
| **Authentication** | [iron-session](https://github.com/vvo/iron-session) | `^9.1.0` | Stateless, encrypted, signed HTTP cookie sessions |
| **Password Crypto** | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | `^3.0.3` | Cost factor 12 password hashing & constant-time verify |
| **Schema Validation** | [Zod](https://zod.dev/) | `^4.6.7` | Strict request validation across all auth and API endpoints |
| **Test Runner** | Node.js Native Runner | `Node.js 20+` | Zero-dependency native unit and integration testing suite |
| **Linting** | [ESLint](https://eslint.org/) | `^9.0.0` | Strict syntax, accessibility, and code quality standards |

---

## 🏗 System Architecture

### High-Level Data Flow

```mermaid
flowchart TD
    Client["Client Browser\n(React 19 / Tailwind CSS 4)"]

    subgraph EdgeLayer ["Edge Middleware Guard (src/middleware.js)"]
        MW{"Route Guard"}
        PublicCheck["Public Whitelist\n(/, /login, /register, etc.)"]
        AuthCheck["iron-session Sealed Cookie\n(userId + role + isActive)"]
        RBACGuard["RBAC Authorization Guard\n(/admin, /helper)"]
    end

    subgraph AppRouter ["Presentation & API Layer (src/app)"]
        RSC["React Server Components\n(Dashboard Shell, Layouts)"]
        APIs["Next.js Route Handlers\n(/api/doubts, /api/auth, /api/admin)"]
    end

    subgraph ServiceLayer ["Domain Feature Services (src/features/*)"]
        AuthSvc["Auth & Password Reset Engine"]
        DoubtsSvc["Doubts & Answers Service"]
        HelpersSvc["Helper Matching Engine"]
        AdminSvc["Admin Moderation & Audit Service"]
        NotifSvc["Notification Dispatcher"]
    end

    subgraph DatabaseLayer ["Data Persistence Layer"]
        Prisma["Singleton Prisma Client (src/lib/prisma.js)"]
        PgBouncer["Supabase PgBouncer Pooler (:6543)"]
        PostgreSQL[("Supabase PostgreSQL Database")]
    end

    Client -->|HTTP Request| MW
    MW --> PublicCheck
    MW --> AuthCheck
    AuthCheck -->|Authorized| RBACGuard
    RBACGuard -->|Permitted| RSC
    RBACGuard -->|Permitted| APIs
    AuthCheck -->|Unauthenticated / Suspended| Redirect["Redirect to /login\nor 401/403 JSON"]

    RSC --> ServiceLayer
    APIs --> ServiceLayer
    ServiceLayer --> Prisma
    Prisma -->|Pooled Transactions| PgBouncer
    PgBouncer --> PostgreSQL
```

---

### Answer Moderation & Quality Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Author)
    actor Helper as Peer Helper
    actor Mod as Moderator / Admin
    participant System as DoubtBridge Platform
    participant DB as PostgreSQL Database

    Student->>System: POST /api/doubts (Create Doubt, Status: OPEN)
    Helper->>System: POST /api/doubts/[id]/answers (Submit Answer, Status: PENDING)
    System->>DB: Persist Answer (Status: PENDING)
    System->>Mod: Display in Answer Verification Center (/admin/answers)
    
    alt Decision: APPROVE
        Mod->>System: POST /api/admin/answers/[id]/moderate { decision: "APPROVED" }
        System->>DB: Update Answer (APPROVED) & Doubt (ANSWERED)
        System->>DB: Insert AuditLog & Notification to Helper and Student
        Student->>System: POST /api/doubts/[id]/answers/[id]/accept (Accept Answer)
        System->>DB: Mark Answer isAccepted: true & Doubt Status: RESOLVED
        System->>DB: Award Reputation Points to Helper
    else Decision: REJECT
        Mod->>System: POST /api/admin/answers/[id]/moderate { decision: "REJECTED", reason: "..." }
        System->>DB: Update Answer (REJECTED) & Doubt remains OPEN
        System->>DB: Record AuditLog & Notify Helper with rejection reason
    else Decision: NEEDS_CHANGES
        Mod->>System: POST /api/admin/answers/[id]/moderate { decision: "NEEDS_CHANGES", feedback: "..." }
        System->>DB: Dispatch revision feedback to Helper & Log event
        Helper->>System: Resubmit revised answer explanation
    end
```

---

## 📁 Project Structure

```text
DoubtBridge-Peer-to-Peer-Academic-Doubt-Resolution-Platform/
├── prisma/
│   ├── schema.prisma              # 14 relational Prisma models, enums & pooler configs
│   └── seed.js                    # Comprehensive database seed script (16 users, doubts, answers)
├── public/
│   ├── images/                    # Platform hero imagery and avatar resources
│   └── favicon.ico
├── docs/
│   ├── ARCHITECTURE.md            # In-depth system design & module specifications
│   ├── API.md                     # Comprehensive REST API catalog
│   ├── SECURITY.md                # Threat model, RBAC policies & forensic audit guide
│   ├── ADMIN_BOOTSTRAP.md         # Secure CLI procedure for first admin creation
│   ├── DEPLOYMENT.md              # Production deployment reference (Vercel + Supabase)
│   └── screenshots/               # Interface screenshot catalog and capture instructions
├── scripts/
│   └── create-admin.js            # Controlled CLI tool to promote users to ADMIN
├── src/
│   ├── middleware.js              # Route middleware (Session verification & RBAC guard)
│   ├── app/
│   │   ├── layout.jsx             # Root layout with font optimization
│   │   ├── page.jsx               # Landing page with interactive hero & metrics
│   │   ├── (auth)/                # Authentication route group
│   │   │   ├── login/page.jsx     # Unified sign in (Students, Helpers, Admins)
│   │   │   ├── register/page.jsx  # Student & Helper registration with Zod validation
│   │   │   ├── forgot-password/   # HMAC token password recovery request
│   │   │   └── reset-password/    # Secure password reset confirmation
│   │   ├── (dashboard)/           # Protected dashboard route group
│   │   │   ├── layout.jsx         # Server layout injecting authenticated user
│   │   │   ├── dashboard/page.jsx # Student dashboard with KPI widgets
│   │   │   ├── all-doubts/        # Doubt browsing feed with search & filters
│   │   │   ├── doubts/            # Question threads and answer submission
│   │   │   ├── helpers/           # Helper directory, feed, and assignments
│   │   │   ├── knowledge/         # Academic Knowledge Hub and article editor
│   │   │   ├── progress/          # Personal progress analytics and activity timeline
│   │   │   ├── leaderboard/       # Platform reputation ranking
│   │   │   ├── discussion/        # Community discussion threads
│   │   │   ├── bookmarks/         # Saved doubts and bookmarked articles
│   │   │   ├── notifications/     # Activity and alert notification center
│   │   │   ├── settings/          # Account profile, helper preferences & security
│   │   │   └── admin/             # Admin control center (answers, users, reports, logs)
│   │   └── api/                   # REST API route handlers
│   │       ├── auth/              # Auth handlers (login, register, logout, me, reset)
│   │       ├── doubts/            # Doubt CRUD, claims, answers, and accept
│   │       ├── helpers/           # Helper profiles, availability, and assignments
│   │       ├── knowledge/         # Article publishing, bookmarking, and moderation
│   │       ├── admin/             # Verification center, user control, audit logs
│   │       ├── bookmarks/         # Personal bookmarking API
│   │       ├── notifications/     # Notification dispatching and read status
│   │       ├── progress/          # Progress analytics aggregation
│   │       ├── leaderboard/       # Leaderboard rankings API
│   │       ├── user/              # Backward-compatible alias for /api/auth/me
│   │       └── health/            # PostgreSQL live database health check
│   ├── components/                # Reusable UI component atoms
│   │   ├── layout/                # Sidebar, Navbar, UserMenu, DashboardShell
│   │   ├── doubts/                # DoubtCard, AnswerCard, StatusBadge, Filters
│   │   └── notifications/         # NotificationBell, AlertList
│   ├── features/                  # Domain service business logic
│   │   ├── doubts/service.js      # Doubt lifecycle management
│   │   ├── answers/service.js     # Answer submission, acceptance & voting
│   │   ├── helpers/service.js     # Matching algorithm and assignment logic
│   │   └── admin/service.js       # Moderation decisions, user admin & audit logging
│   └── lib/                       # Core utilities and singletons
│       ├── prisma.js              # Centralized singleton Prisma Client
│       ├── session.js             # Encrypted session helper using iron-session
│       ├── sessionConfig.js       # Session encryption configuration & key derivation
│       ├── permissions.js         # RBAC guard functions & permission predicates
│       ├── passwordReset.js       # Web Crypto HMAC-SHA256 reset token generator
│       └── rateLimit.js           # Sliding window IP-based rate limiter
├── tests/
│   ├── unit/                      # Fast unit tests (RBAC, rate limiter, session config)
│   ├── integration/               # End-to-end integration tests (Auth, Admin, Doubts)
│   ├── mock-headers.mjs           # Cookie and header mocking harness
│   └── register.mjs               # Node module loader mapping for @/* path aliases
├── .env.example                   # Environment configuration template
├── package.json                   # Dependency definitions and npm scripts
└── README.md                      # Project documentation
```

---

## 🗄 Database Design

The database is modeled using Prisma ORM with **14 relational models** optimized for PostgreSQL:

### Relational Models Overview

| Model | Primary Purpose | Key Fields |
|:---|:---|:---|
| **User** | Core user identity & authentication | `id`, `name`, `email`, `role`, `department`, `academicYear`, `isActive`, `reputation`, `passwordHash` |
| **HelperProfile** | Extended metadata for peer helpers | `userId`, `bio`, `expertise`, `subjects`, `reputation`, `totalAnswers`, `acceptedAnswers`, `isAvailable` |
| **Doubt** | Academic questions posted by students | `title`, `description`, `subject`, `topic`, `difficulty`, `status`, `priority`, `urgency`, `studentId`, `helperId` |
| **Answer** | Solutions submitted by peer helpers | `content`, `doubtId`, `authorId`, `status`, `isAccepted`, `upvotes` |
| **DoubtAssignment** | Formal assignment tracking | `doubtId`, `helperId`, `status`, `assignedAt`, `completedAt` |
| **ModerationReview** | Formal quality audits of answers | `answerId`, `reviewerId`, `decision`, `feedback`, `reviewedAt` |
| **KnowledgeResource** | Community learning resources | `title`, `description`, `content`, `subject`, `authorId`, `status`, `views` |
| **KnowledgeArticle** | Curated documentation articles | `title`, `content`, `subject`, `tags`, `views`, `authorId` |
| **Bookmark** | Saved doubts & articles | `userId`, `doubtId`, `resourceId` *(unique constraints prevent duplicates)* |
| **Notification** | Event-driven user alert inbox | `userId`, `title`, `message`, `type`, `link`, `isRead` |
| **Tag / DoubtTag** | Course topics & tag taxonomy | `name`, `doubtId`, `tagId` |
| **Report** | Content flagging & dispute reports | `reason`, `status`, `reporterId`, `doubtId`, `answerId`, `resolutionNotes` |
| **AuditLog** | Immutable forensic compliance trail | `actorId`, `actorName`, `actorRole`, `action`, `targetType`, `targetId`, `metadata` |

### Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o| HelperProfile : "provisions"
    User ||--o{ Doubt : "asks (studentId)"
    User ||--o{ Doubt : "claims (helperId)"
    User ||--o{ Answer : "authors"
    User ||--o{ ModerationReview : "moderates"
    User ||--o{ Notification : "receives"
    User ||--o{ Bookmark : "saves"
    User ||--o{ Report : "files"
    User ||--o{ AuditLog : "initiates"

    Doubt ||--o{ Answer : "receives"
    Doubt ||--o{ DoubtAssignment : "tracks"
    Doubt ||--o{ DoubtTag : "categorized by"
    Tag ||--o{ DoubtTag : "associates"
    Doubt ||--o{ Bookmark : "referenced in"
    Doubt ||--o{ Report : "flagged in"

    Answer ||--o{ ModerationReview : "audited by"
    Answer ||--o{ Report : "reported in"

    KnowledgeResource ||--o{ Bookmark : "bookmarked"
```

---

## 🔒 Authentication & Security Architecture

DoubtBridge implements a defense-in-depth security model:

```text
Registration / Login
        ↓
Strict Zod Validation (Name, Email syntax, Password min 8 chars + letter + number)
        ↓
Bcrypt Hashing (Cost factor 12) + Constant-Time Dummy Hash against Timing Attacks
        ↓
Active Account Verification (isActive === false triggers HTTP 403 Forbidden with reason)
        ↓
iron-session Cookie (Sealed with 32-byte AES-256-GCM encryption)
        ↓
Route Guard Middleware (RBAC validation: STUDENT, HELPER, MODERATOR, ADMIN)
        ↓
Server-Side Session Resolution (Never trusts client-supplied headers or user IDs)
```

- **Stateless Encrypted Sessions**: Sessions are encrypted client-side using `iron-session` with a minimum 32-character secret (`SESSION_SECRET`). Zero database lookups are required to verify identity on normal navigations.
- **Timing Attack Mitigation**: When nonexistent accounts attempt to sign in, the login handler compares the password against a constant-time dummy bcrypt hash to ensure uniform response times and prevent email enumeration.
- **Privilege Escalation Defense**: Public registration (`/register`) strictly sanitizes requested roles. Any attempt to supply `ADMIN` or `MODERATOR` via public endpoints is automatically coerced to `STUDENT`.
- **Stateless HMAC Password Recovery**: Password reset tokens use the Web Crypto API (`HMAC-SHA256`) encoding the user ID, expiration timestamp (`15 minutes`), and a snapshot of the current password hash. Updating the password immediately invalidates the reset token and all prior tokens without extra database overhead.
- **Insecure Direct Object Reference (IDOR) Protection**: Mutations (e.g. accepting an answer, deleting a bookmark, or updating a profile) require ownership checks via `requireOwnerOrAdmin(user, resourceOwnerId)`.
- **Forensic Audit Logging**: Privileged operations (role changes, account suspensions, moderation reviews, report resolutions) write immutable structured records into `AuditLog`.

---

## 🚀 Installation & Local Setup

### Prerequisites

Ensure the following runtimes and tools are installed:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or higher
- **Git**: `v2.x` or higher
- **PostgreSQL**: A local PostgreSQL instance or a cloud database on [Supabase](https://supabase.com).

### 1. Clone the Repository

```bash
git clone https://github.com/keshav62/DoubtBridge-Peer-to-Peer-Academic-Doubt-Resolution-Platform.git
cd DoubtBridge-Peer-to-Peer-Academic-Doubt-Resolution-Platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the provided environment template:

```bash
cp .env.example .env
```

Configure `.env` with your database credentials and a 32+ character session secret:

```env
# Supabase Transaction Pooler URL (Runtime queries, Port 6543)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Direct Connection URL (Prisma migrations, Port 5432)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Secure random 32+ character key for cookie encryption
# Generate via: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET="your-32-character-or-longer-random-secret-key-here"

# Application Settings
NEXT_PUBLIC_APP_NAME="DoubtBridge"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Database Initialization

Generate the Prisma Client and sync your database schema:

```bash
# Generate Prisma Client types
npm run prisma:generate

# Sync schema to your database
npx prisma db push

# (Optional) Seed the database with 16 users, sample doubts, answers & articles
npm run prisma:seed
```

### 5. Run the Application

```bash
# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production Build

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

---

## 🛡 Admin Account Setup (CLI Bootstrap)

In accordance with DoubtBridge security design, **there is no public registration for the ADMIN role**. Creating the initial administrator is performed through a secure, controlled out-of-band CLI tool.

### Bootstrap Procedure:

1. **Register a Standard Account**: Open [http://localhost:3000/register](http://localhost:3000/register) in your browser and create a normal account (e.g. `admin@university.edu`). Public registration safely assigns the account a default role of `STUDENT`.
2. **Execute the Bootstrap Script**:
   From your authorized administrator terminal, execute:
   ```bash
   # Interactive mode (displays target user card and requests explicit confirmation)
   node scripts/create-admin.js admin@university.edu

   # Non-interactive mode (for automation)
   node scripts/create-admin.js admin@university.edu --yes
   ```
3. **Confirm Promotion**: The script validates that the account exists and is active, prompts for confirmation, updates the role to `ADMIN` in an atomic transaction, and records an immutable entry in `AuditLog`.
4. **Sign In**: Navigate to `/login` and sign in. The system will issue an updated `iron-session` cookie and automatically redirect you to the **Admin Dashboard** (`/admin`).

> For full administrative documentation, see [docs/ADMIN_BOOTSTRAP.md](docs/ADMIN_BOOTSTRAP.md).

---

## 📡 API Documentation

DoubtBridge provides a modular REST API structured across distinct domain boundaries:

<details open>
<summary><strong>🔐 Authentication & User Profile APIs</strong></summary>

| Method | Endpoint | Access | Description |
|:---|:---|:---:|:---|
| `POST` | `/api/auth/register` | Public | Registers a new Student or Helper with Zod validation. Coerces privileged roles. |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, verifies active status, and sets sealed session cookie. |
| `POST` | `/api/auth/logout` | Session | Destroys the active `iron-session` cookie. |
| `GET` | `/api/auth/me` | Authenticated | Resolves the authenticated user profile (omits `passwordHash`). |
| `PUT` | `/api/auth/me` | Authenticated | Updates user profile (name, department, year, bio, subjects, availability). |
| `GET, PUT` | `/api/user` | Authenticated | Backward-compatible alias for `/api/auth/me`. |
| `POST` | `/api/auth/forgot-password` | Public | Generates stateless HMAC reset token (prevents email enumeration). |
| `POST` | `/api/auth/reset-password` | Public | Validates reset token and updates password hash. |
| `POST` | `/api/auth/change-password` | Authenticated | Updates password using current credentials verification. |

</details>

<details>
<summary><strong>❓ Doubts & Answers APIs</strong></summary>

| Method | Endpoint | Access | Description |
|:---|:---|:---:|:---|
| `GET` | `/api/doubts` | Authenticated | Lists doubts with debounced keyword search, subject, status, and pagination. |
| `POST` | `/api/doubts` | Student / Admin | Posts a new academic doubt with subject, topic, tags, and urgency. |
| `GET` | `/api/doubts/[doubtId]` | Authenticated | Retrieves comprehensive doubt context, tags, author, and answer list. |
| `POST` | `/api/doubts/[doubtId]/claim` | Helper / Admin | Claims an open doubt for resolution by a peer helper. |
| `GET` | `/api/doubts/[doubtId]/answers` | Authenticated | Retrieves submitted answers for a doubt thread. |
| `POST` | `/api/doubts/[doubtId]/answers` | Authenticated | Submits a new answer explanation (Status initialized to `PENDING`). |
| `POST` | `/api/doubts/[doubtId]/answers/[answerId]/accept` | Doubt Author | Marks an answer accepted (`isAccepted: true`) and doubt `RESOLVED`. |
| `POST` | `/api/doubts/[doubtId]/answers/[answerId]/upvote` | Authenticated | Upvotes an answer and increases author reputation. |

</details>

<details>
<summary><strong>🤝 Helper Management APIs</strong></summary>

| Method | Endpoint | Access | Description |
|:---|:---|:---:|:---|
| `GET` | `/api/helpers` | Authenticated | Lists verified peer helpers with subject filter and reputation sorting. |
| `GET` | `/api/helpers/profile` | Helper / Admin | Retrieves helper profile statistics, specializations, and availability. |
| `PUT, POST` | `/api/helpers/profile` | Helper / Admin | Updates helper subjects or toggles availability (`toggle_availability`). |
| `GET` | `/api/helpers/assignments` | Helper / Admin | Retrieves assigned and claimed doubts for the authenticated helper. |
| `GET` | `/api/helpers/feed` | Helper / Admin | Tailored doubt recommendation feed matching helper subject qualifications. |

</details>

<details>
<summary><strong>⚖️ Admin & Moderation APIs</strong></summary>

| Method | Endpoint | Access | Description |
|:---|:---|:---:|:---|
| `GET` | `/api/admin/overview` | Admin / Mod | Aggregated platform KPI counters (users, doubts, answers, reports). |
| `GET` | `/api/admin/answers` | Admin / Mod | Answer moderation review queue with status and subject filters. |
| `GET` | `/api/admin/answers/[answerId]` | Admin / Mod | Deep context inspection of an answer, doubt, and author for review. |
| `POST` | `/api/admin/answers/[answerId]/moderate` | Admin / Mod | Moderates answer: `APPROVED`, `REJECTED`, or `NEEDS_CHANGES`. |
| `GET` | `/api/admin/analytics/moderation` | Admin / Mod | Moderation throughput analytics and approval rates. |
| `GET` | `/api/admin/users` | Admin Only | Paginated user management table with role and status filters. |
| `GET` | `/api/admin/users/[userId]` | Admin Only | Detailed user profile, academic history, and activity breakdown. |
| `PATCH` | `/api/admin/users/[userId]/role` | Admin Only | Updates a user's role (Strict self-modification prevention). |
| `PATCH` | `/api/admin/users/[userId]/status` | Admin Only | Suspends or activates a user with mandatory audit reason. |
| `GET, PATCH`| `/api/admin/reports` | Admin / Mod | Browse and resolve user-submitted content dispute reports. |
| `GET` | `/api/admin/audit-logs` | Admin Only | Forensic query interface for the immutable platform audit log. |

</details>

<details>
<summary><strong>📚 Knowledge Hub, Community & Progress APIs</strong></summary>

| Method | Endpoint | Access | Description |
|:---|:---|:---:|:---|
| `GET` | `/api/knowledge` | Authenticated | Browses published academic resources and documentation articles. |
| `POST` | `/api/knowledge` | Authenticated | Drafts and publishes a new academic knowledge resource. |
| `GET` | `/api/knowledge/[articleId]` | Authenticated | Reads article content and increments view metrics. |
| `POST` | `/api/knowledge/[articleId]/bookmark`| Authenticated | Toggles personal bookmark for an article. |
| `GET, POST` | `/api/bookmarks` | Authenticated | Lists and manages personal saved doubts and knowledge items. |
| `GET` | `/api/progress` | Authenticated | Aggregates individual learning analytics, weekly activity, and charts. |
| `GET` | `/api/leaderboard` | Authenticated | Computes reputation rankings across weekly, monthly, and all-time periods. |
| `GET` | `/api/notifications` | Authenticated | Retrieves user notifications inbox. |
| `POST` | `/api/notifications/read-all` | Authenticated | Marks all unread alerts as read. |
| `GET` | `/api/health/database` | Public | Live PostgreSQL connectivity check (`SELECT 1`). |

</details>

---

## 🧪 Testing Suite

DoubtBridge utilizes the high-performance **native Node.js Test Runner** (`node:test`) coupled with `node:assert/strict` and custom module loaders (`tests/register.mjs`) to test API routes, business services, and database transactions without heavy external testing frameworks.

### Running Tests

```bash
# Run all unit and integration test suites
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run a specific test suite
node --import ./tests/register.mjs --test tests/integration/complete-auth.test.mjs
```

### Verified Test Suites

| Suite File | Scope & Tested Scenarios | Status |
|:---|:---|:---:|
| `tests/integration/complete-auth.test.mjs` | Student/Helper registration, duplicate 409, role tampering rejection, login, suspended accounts, password reset tokens, middleware RBAC | **12/12 PASS** |
| `tests/integration/auth-regression.test.mjs` | Credential verification, session cookie unsealing, route protection, secret validation fallback, session persistence | **14/14 PASS** |
| `tests/integration/admin-answer-verification.test.mjs` | Answer queue filtering, detail inspection, 3-way moderation decisions, self-moderation prevention, audit trail | **10/10 PASS** |
| `tests/integration/settings-profile.test.mjs` | Profile retrieval, safe serialization, `/api/user` alias, 404 missing user, 403 suspended, profile & helper updates | **8/8 PASS** |
| `tests/integration/admin-bootstrap.test.mjs` | CLI admin script execution, email normalization, active validation, role promotion, password immutability | **4/4 PASS** |
| `tests/integration/progress-leaderboard.test.mjs` | Learning progress analytics, acceptance rates, leaderboard period filtering, pagination | **PASS** |
| `tests/integration/doubts-answers-flow.test.mjs` | End-to-end question lifecycle, answer submissions, upvoting, and doubt author resolution | **PASS** |
| `tests/integration/idor-security.test.mjs` | Non-owner permission checks, author-only actions, cross-tenant isolation | **PASS** |
| `tests/unit/rbac.test.mjs` | Role primitive guards (`isAdmin`, `isHelper`, `isModerator`), domain operation predicates | **PASS** |
| `tests/unit/rate-limiter.test.mjs` | Sliding window in-memory rate limiting, IP extraction, burst limits | **PASS** |

---

## ☁️ Production Deployment

DoubtBridge is engineered for seamless deployment on **Vercel** connected to a **Supabase PostgreSQL** cluster.

### 1. Configure Supabase PostgreSQL
- Create a project on [Supabase](https://supabase.com).
- Under **Project Settings > Database**, note your **Connection Pooling (PgBouncer, Port 6543)** and **Direct Connection (Port 5432)** URLs.

### 2. Configure Production Environment Variables on Vercel
In the Vercel dashboard under **Settings > Environment Variables**, define:

| Variable | Recommended Value / Format | Description |
|:---|:---|:---|
| `DATABASE_URL` | `postgresql://postgres.[ref]:[pass]@[host]:6543/postgres?pgbouncer=true` | Pooled connection for Serverless functions |
| `DIRECT_URL` | `postgresql://postgres.[ref]:[pass]@[host]:5432/postgres` | Direct connection for Prisma schema sync |
| `SESSION_SECRET` | `[64-character random hex string]` | Key for AES-256 session cookie encryption |
| `NEXT_PUBLIC_APP_NAME` | `DoubtBridge` | Application display title |
| `NEXT_PUBLIC_APP_URL` | `https://your-production-domain.vercel.app` | Base production URL |
| `NODE_ENV` | `production` | Production environment flag |

### 3. Deploy via Git
Pushing to your `main` branch automatically triggers Vercel's build pipeline:
```bash
# Build script executed automatically by Vercel
npm run build
# Runs: prisma generate && next build
```

> For step-by-step guidance on connection pooling, strict session enforcement, and migration troubleshooting, consult [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 🗺 Project Roadmap

### ✅ Completed Milestones
- [x] Dual-mode Supabase PostgreSQL database architecture with connection pooling.
- [x] Live doubt feed with debounced search, subject filtering, and pagination.
- [x] Question resolution lifecycle: answer submissions, upvoting, and creator acceptance.
- [x] Role-Based Access Control (`STUDENT`, `HELPER`, `MODERATOR`, `ADMIN`).
- [x] Complete authentication system with sealed `iron-session` cookies and bcryptjs.
- [x] Stateless HMAC-SHA256 password recovery architecture.
- [x] Helper directory, subject qualification tags, and availability status toggle.
- [x] Academic Knowledge Hub with curated article library and view metrics.
- [x] Admin Answer Verification Center with 3-way moderation decisions.
- [x] User management, suspension controls, and dispute reports center.
- [x] Immutable forensic audit logging system (`AuditLog`).
- [x] Comprehensive personal learning progress analytics & global leaderboard.
- [x] Full-featured user settings center with profile editing and password updates.
- [x] Secure out-of-band CLI tool for first administrator bootstrapping.

### 🔮 Future Enhancements
- [ ] **Real-Time Collaboration**: Live peer chat and doubt rooms powered by WebSockets.
- [ ] **Rich Math & Formula Editor**: Native KaTeX / LaTeX equation input and preview for STEM questions.
- [ ] **Cloud Asset Storage**: Direct image and PDF assignment attachment uploads integrated with AWS S3 or Cloudflare R2.
- [ ] **Automated Mailer Integration**: Transactional email dispatching for password resets and notification digests via Resend or AWS SES.
- [ ] **AI-Assisted Similar Doubt Matching**: Vector embeddings to suggest previously resolved answers before a new doubt is submitted.

---

## 🤝 Contributing

Contributions to DoubtBridge are welcomed! To ensure code quality and stability, please follow these steps:

1. **Fork the Repository**: Click "Fork" at the top right of the GitHub page.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. **Commit Your Changes**: Follow clear commit message standards:
   ```bash
   git commit -m "feat(doubts): add course syllabus filtering tag"
   ```
4. **Run Verification**: Ensure all tests and lint checks pass:
   ```bash
   npm run lint
   npm test
   npm run build
   ```
5. **Open a Pull Request**: Push your branch to GitHub and open a Pull Request describing your implementation.

---

## 👥 Authors & Contributors

| Contributor | GitHub Profile | Role / Focus Areas |
|:---|:---:|:---|
| **Keshav Singh** | [@keshav62](https://github.com/keshav62) | Full-Stack Development, Security & System Architecture |
| **Vishal Dadrwal** | [@vishaldadrwal](https://github.com/vishaldadrwal) | Core Platform Modules & Feature Engineering |
| **Kashika** | [@kashika-29](https://github.com/kashika-29) | Academic Workflows & Module Development |

---

### 📬 Project Repository & Issues

- **GitHub Repository**: [DoubtBridge-Peer-to-Peer-Academic-Doubt-Resolution-Platform](https://github.com/keshav62/DoubtBridge-Peer-to-Peer-Academic-Doubt-Resolution-Platform)
- **Issue Tracker & Discussions**: [GitHub Issues](https://github.com/keshav62/DoubtBridge-Peer-to-Peer-Academic-Doubt-Resolution-Platform/issues)

---

<div align="center">
  <sub>Built with ❤️ for university students, educators, and collaborative peer learning.</sub>
</div>
