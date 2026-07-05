# Deployment Report

Status: READY (with caveats)

Owner: DevOps Engineer
Last updated: 2026-07-06
Sprint: Doctor Note MVP (Auth scaffold — US-001)
Version: 0.1.0

---

## Deployment Readiness Checklist

| Item | Status | Notes |
|---|---|---|
| Go/No-Go decision is GO | ✅ | Release report: GO |
| Environment variables documented | ✅ | `.env.example` with 3 vars |
| Database migrations ready | ✅ | `00001_initial_schema.sql` |
| Security policies ready | ✅ | RLS enabled, security headers configured |
| Hosting setup ready | ⚠️ | Vercel (no vercel.json — uses defaults) |
| Rollback plan exists | ✅ | Documented below |
| CI/CD pipeline | ❌ | No GitHub Actions workflows yet |

---

## Environment Variables

Required in `.env.local` (local) and Vercel dashboard (production):

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server only) | Supabase service role key — never expose to client |

**Note:** Architecture doc also lists `NEXT_PUBLIC_APP_URL` and `NODE_ENV` but these are not currently used in code.

---

## Database Migration

**File:** `supabase/migrations/00001_initial_schema.sql`

**Tables:** profiles, doctors, patients, consultations

**Apply via:**
```bash
# Option A: Supabase CLI
supabase db push

# Option B: Supabase Dashboard SQL Editor
# Copy and paste the migration file contents
```

**RLS:** Enabled on all 4 tables with role-specific policies.

---

## Security Policies

- Self-signup restricted to receptionist role (doctor/admin require admin assignment)
- Admin can manage all profiles and roles
- Doctor ownership enforced on consultations
- created_by validation on patient inserts
- Security headers: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, X-XSS-Protection
- poweredByHeader disabled

---

## Hosting Setup

**Target:** Vercel

**Configuration:** Default Next.js config (no vercel.json)

**Deploy trigger:** Push to `main` branch (auto-deploy)

**Build command:** `next build` (default)

**Node version:** 22.x

---

## Rollback Plan

### Application Rollback

1. In Vercel dashboard, go to Deployments
2. Find the last known good deployment
3. Click "Promote to Production"

### Database Rollback

If migration causes issues:

1. **Do not drop tables** — data loss risk
2. Create a new migration to revert specific changes:
   ```sql
   -- Example: Remove a problematic policy
   DROP POLICY "Policy Name" ON table_name;
   ```
3. Apply via `supabase db push` or SQL Editor

### Full Rollback

1. Revert code to previous commit: `git revert HEAD`
2. Push to main — Vercel auto-deploys previous version
3. If database changes need reverting, create compensating migration

---

## CI/CD Pipeline

**Status:** Not yet created

**Recommended setup (`.github/workflows/ci.yml`):**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint src/
      - run: npx next build
```

---

## Post-Deployment Verification

After deploy, verify:

1. [ ] `/login` page loads without errors
2. [ ] `/signup` page loads without errors
3. [ ] Can create a new account (receptionist role)
4. [ ] Can log in with new account
5. [ ] Unauthenticated access to `/dashboard` redirects to `/login`
6. [ ] Authenticated access to `/login` redirects to `/dashboard`
7. [ ] Security headers present (check via `curl -I` or browser dev tools)
