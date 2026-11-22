# DoubtBridge — Screenshot Catalog & Capture Guide

This directory holds the official interface screenshots for the DoubtBridge platform.

> [!NOTE]
> Screenshots should be captured manually in a browser at 1920×1080 resolution (16:9 ratio) using a clean browser window with light mode enabled.

---

## Required Screenshots Catalog

| Target View | Destination File Path | Recommended Capture State / Notes |
|:---|:---|:---|
| **Landing Page** | `docs/screenshots/01-landing-page.png` | Desktop view of the landing hero, platform stats, and feature highlights at `/`. |
| **Unified Sign In** | `docs/screenshots/02-login-page.png` | Centered authentication card with academic email, password, and quick links at `/login`. |
| **Student Registration** | `docs/screenshots/03-register-page.png` | Registration view showing role selection, department, year, and password meter at `/register`. |
| **Student Dashboard** | `docs/screenshots/04-student-dashboard.png` | Dashboard overview with KPI metric cards, recent doubts, and quick actions at `/dashboard`. |
| **Browse & Filter Doubts** | `docs/screenshots/05-all-doubts.png` | Live doubt feed with debounced search, subject filters, status chips, and pagination at `/all-doubts`. |
| **Doubt Detail & Answers** | `docs/screenshots/06-doubt-detail.png` | Question thread showing difficulty, tags, peer answers, and resolution actions at `/doubts/[doubtId]`. |
| **Ask a Doubt Modal/Page** | `docs/screenshots/07-ask-doubt.png` | Question creation interface with title, description, subject, and urgency at `/doubts/new`. |
| **Peer Helper Feed** | `docs/screenshots/08-helper-feed.png` | Helper workspace showing open doubts matching helper qualifications at `/help-others`. |
| **Helper Directory** | `docs/screenshots/09-helper-directory.png` | Verified helper directory with subject badges, ratings, and assignment at `/helpers`. |
| **Admin Overview** | `docs/screenshots/10-admin-overview.png` | Administrative KPI cards, user growth, pending queues, and resolution charts at `/admin`. |
| **Answer Verification Center** | `docs/screenshots/11-admin-verification.png` | Answer moderation queue showing pending reviews, diff viewer, and decisions at `/admin/answers`. |
| **User Management** | `docs/screenshots/12-admin-users.png` | User table with role switching, status toggles, and suspension reason dialog at `/admin/users`. |
| **Forensic Audit Logs** | `docs/screenshots/13-admin-audit-logs.png` | Structured audit trail table showing actor, action, timestamp, and metadata at `/admin/audit-logs`. |
| **Academic Knowledge Hub** | `docs/screenshots/14-knowledge-hub.png` | Curated article library with category filters, view counters, and bookmarks at `/knowledge`. |
| **Personal Progress** | `docs/screenshots/15-my-progress.png` | Weekly activity chart, acceptance rates, and reputation progression at `/progress`. |
| **Platform Leaderboard** | `docs/screenshots/16-leaderboard.png` | Top student and helper rankings filtered by week, month, and all-time at `/leaderboard`. |
| **Account Settings** | `docs/screenshots/17-settings-profile.png` | Profile editing, helper availability toggle, password change, and preferences at `/settings`. |

---

## Capture Procedure

1. Start the local development server:
   ```bash
   npm run dev
   ```
2. Seed the database with comprehensive sample records (if testing locally):
   ```bash
   npm run prisma:seed
   ```
3. Sign in as each role (`STUDENT`, `HELPER`, `ADMIN`) to capture role-specific experiences.
4. Save exported PNGs directly to this directory using the standard file names listed above.
