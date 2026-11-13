# DoubtBridge Production Deployment Guide

This guide describes the complete procedure for deploying DoubtBridge to production environments, including database setup, environment variable configuration, migration deployment, and post-deployment verification.

---

## 1. Prerequisites

- **Node.js**: `v18.18.0` or higher (Node `v22.x` recommended).
- **Package Manager**: `npm` (v10+).
- **PostgreSQL Database**: PostgreSQL 15+ (Hosted on Supabase, AWS RDS, Neon, or self-hosted).
- **Connection Pooler**: PgBouncer or Supabase connection pooling (port 6543) recommended for serverless or high-concurrency environments.

---

## 2. Environment Variables Configuration

Copy `.env.example` to `.env.production` (or configure directly in your cloud hosting provider's dashboard):

```bash
cp .env.example .env.production
```

### Required Production Variables

| Variable | Description | Example / Format |
| :--- | :--- | :--- |
| `DATABASE_URL` | Transaction pooled connection URL (port 6543) for runtime queries. | `postgresql://postgres.[ref]:[pwd]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Direct session connection URL (port 5432) for running Prisma migrations. | `postgresql://postgres.[ref]:[pwd]@aws-0-[region].pooler.supabase.com:5432/postgres` |
| `SESSION_SECRET` | 32+ character cryptographically random string for iron-session encryption. | Generate with `openssl rand -hex 32` or `node -e "console.log(crypto.randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_APP_NAME` | Public platform branding name. | `DoubtBridge` |
| `NEXT_PUBLIC_APP_URL` | Canonical public HTTPS URL of your deployment. | `https://doubtbridge.yourdomain.com` |
| `NODE_ENV` | Environment mode. Must be set to `production`. | `production` |

> [!CAUTION]
> **Never commit `.env` or `.env.production` to Git!**
> DoubtBridge enforces strict startup validation: if `SESSION_SECRET` is unset, shorter than 32 characters, or contains demo placeholders in production, the application will terminate immediately to prevent security vulnerabilities.

---

## 3. Database Migrations & Prisma Setup

DoubtBridge uses Prisma ORM with version-controlled SQL migrations located in `prisma/migrations/`:
1. `20261029060014_init_doubtbridge`: Baseline schema (User, HelperProfile, Doubt, Answer, ModerationReview, KnowledgeResource, Bookmark, Notification, Tags, Report).
2. `20261113000000_audit_and_hardening`: AuditLog table with actor snapshot columns, nullable actorId with `ON DELETE SET NULL`, `User.suspensionReason`, `Notification.link`, and `Report.resolutionNotes`.

### Applying Migrations in Production

Run Prisma's production migration command, which connects via `DIRECT_URL` without interactive prompts:

```bash
npx prisma migrate deploy
```

Verify migration status at any time:

```bash
npx prisma migrate status
```

Output should confirm:
```
2 migrations found in prisma/migrations
Database schema is up to date!
```

Generate the Prisma Client matching the target platform architecture:

```bash
npx prisma generate
```

---

## 4. Deployment Targets

### Option A: Vercel Deployment (Recommended for Next.js 15)

1. **Import Repository**:
   - In the Vercel dashboard, click **Add New Project** and select your GitHub repository: `keshav62/DoubtBridge-Peer-to-Peer-Academic-Doubt-Resolution-Platform`.
2. **Framework Preset**:
   - Vercel automatically detects **Next.js**.
3. **Build & Output Settings**:
   - **Build Command**: `npm run build` (runs `prisma generate && next build`)
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
4. **Environment Variables**:
   - Add all 6 production environment variables defined above in the Vercel Environment Variables settings.
5. **Deploy**:
   - Click **Deploy**. Vercel will build all 45 routes and deploy globally to edge and serverless networks.

---

### Option B: Node.js Standalone / Docker Deployment

1. **Build Application**:
   ```bash
   npm ci
   npx prisma generate
   npm run build
   ```
2. **Process Management (PM2)**:
   ```bash
   pm2 start npm --name "doubtbridge" -- start
   pm2 save
   pm2 startup
   ```
3. **Nginx Reverse Proxy Configuration**:
   ```nginx
   server {
       listen 80;
       server_name doubtbridge.yourdomain.com;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name doubtbridge.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/doubtbridge.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/doubtbridge.yourdomain.com/privkey.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 5. Post-Deployment Verification Checklist

Once deployed, execute this checklist to verify operational readiness:

- [ ] **Health Endpoint**: Probe `GET https://[your-domain]/api/health/database` — should return `200 OK` with database latency.
- [ ] **Registration & Role Guard**: Navigate to `/register`. Register a new test student. Verify login creates the signed `doubtbridge_session` cookie.
- [ ] **Doubt Feed & Creation**: Submit a new doubt at `/doubts/new`. Verify it renders on the live feed.
- [ ] **Answer Submission & Moderation**: Log in as a helper, submit an answer. Verify initial status is `PENDING`. Log in as moderator and approve the answer.
- [ ] **Solution Acceptance**: As doubt owner, accept the approved answer. Verify status changes to `RESOLVED` and helper reputation increments by `+25`.
- [ ] **Helper Matching Engine**: Navigate to `/helpers`. Verify matching scores calculate dynamically and availability toggles work.
- [ ] **Knowledge Hub**: Save a draft article, submit for review, approve, and verify bookmarking at `/knowledge/bookmarks`.
- [ ] **Notifications Center**: Trigger notifications (answers, moderation) and verify real-time unread bell badge and `/notifications` center.
- [ ] **Admin Control Center**: Access `/admin` as an `ADMIN`. Verify user directory, account suspension, report review, and immutable audit logs.
- [ ] **Security Headers**: Run `curl -I https://[your-domain]` and verify `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security`.

---

## 6. Troubleshooting Common Issues

### 1. PgBouncer Prepared Statement Error (`42601` or `prepared statement "s0" already exists`)
- **Cause**: Prisma prepared statements colliding with transaction-level connection pooling.
- **Solution**: Ensure `?pgbouncer=true` query parameter is appended to `DATABASE_URL` in `schema.prisma` and `.env`. Ensure migrations always use `DIRECT_URL` (port 5432).

### 2. Startup Failure: `SESSION_SECRET is unset or shorter than 32 characters`
- **Cause**: In production, `src/lib/session.js` validates that `SESSION_SECRET` is configured and has sufficient entropy.
- **Solution**: Generate a 32-byte hexadecimal string with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and set it in your hosting platform's environment settings.

### 3. Rate Limit Reset on Restart
- **Cause**: The default rate limiter uses in-memory tracking.
- **Solution**: Expected behavior on single instance. For distributed serverless environments, connect to Upstash Redis as documented in `docs/SECURITY.md`.
