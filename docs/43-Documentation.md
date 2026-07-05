# Documentation

Status: Complete

Owner: Technical Writer
Last updated: 2026-07-06

---

## README

Project overview, tech stack, setup instructions, scripts, project structure, database schema, roles, and AI SDLC framework usage. See [README.md](../README.md).

## Developer Guide

### Architecture Overview

Next.js 14 App Router with Server Components and Server Actions. Supabase PostgreSQL with RLS. Three-tier architecture:

1. **Presentation:** React components with Tailwind CSS
2. **Logic:** Server Actions and Route Handlers
3. **Data:** Supabase PostgreSQL with RLS policies

### Local Setup

```bash
git clone https://github.com/ChanOoDev/ai_sdlc_framework.git
cd ai_sdlc_framework
npm install
cp .env.example .env.local
# Fill in Supabase credentials
npm run dev
```

### Coding Standards

- TypeScript strict mode enabled
- Server Components by default, `"use client"` only when needed
- All mutations via Server Actions (not client-side fetches)
- Zod for input validation
- ESLint with typescript-eslint

### Key Files

| File | Purpose |
|---|---|
| `src/lib/supabase/server.ts` | Server-side Supabase client |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/middleware.ts` | Session refresh and route protection |
| `middleware.ts` | Next.js middleware entry point |
| `src/app/actions/auth.ts` | Signup and logout Server Actions |
| `supabase/migrations/00001_initial_schema.sql` | Database schema and RLS |

### Contributing

1. Create a feature branch from `main`
2. Implement changes
3. Run `npm run typecheck` and `npm run lint`
4. Commit with conventional commits (`feat:`, `fix:`, `docs:`)
5. Push and create a PR

## User Guide

### Login

1. Navigate to `/login`
2. Enter email and password
3. Click "Sign in"

### Signup

1. Navigate to `/signup`
2. Enter full name, email, password
3. Select role (Doctor or Receptionist)
4. Click "Sign up"

**Note:** Admin role cannot be self-assigned. Contact a clinic administrator.

### Roles

| Role | Can Do | Cannot Do |
|---|---|---|
| Admin | Manage all users, patients, doctors, consultations | — |
| Doctor | View own patients, create/edit own consultations | Manage users, view other doctors' patients |
| Receptionist | Register and edit patients, view consultations | Create consultations, manage doctors |

## Demo Script

### For Stakeholders

1. **Show login page** — demonstrate form validation and error states
2. **Create a receptionist account** — show role selection on signup
3. **Log in as receptionist** — show dashboard with stats
4. **Register a patient** — demonstrate patient form with required fields
5. **Log out** — show redirect behavior
6. **Show architecture docs** — highlight RLS policies and security

### For Technical Review

1. Show `supabase/migrations/00001_initial_schema.sql` — RLS policies
2. Show `src/app/actions/auth.ts` — Server-side validation
3. Show `next.config.js` — Security headers
4. Run `npm run typecheck` — zero errors
5. Run `npm run lint` — zero warnings
6. Run `npm run build` — successful production build

## Final Release Summary

### Version 0.1.0 — Auth Scaffold (US-001)

**Delivered:**
- Supabase Auth integration (email/password)
- Login and signup pages with validation
- Server-side role validation on signup
- Middleware for session refresh and route protection
- Database schema with 4 tables and RLS
- Security headers configured

**Quality:**
- 0 Critical bugs, 0 High bugs
- TypeScript strict mode, 0 type errors
- ESLint clean, 0 warnings
- Production build passes

**Known Issues (Non-Blocking):**
- Auth-profile creation race condition (Medium)
- Missing centralized error handling module (Medium)
- @types/react version mismatch (Medium)

## Lessons Learned

### What Went Well

- Phase-gated SDLC workflow caught issues early
- Automated code review found security vulnerabilities before deployment
- Bugfix rounds were efficient — targeted fixes only
- Regression testing verified all fixes without new regressions

### What Could Improve

- CI/CD pipeline should be set up earlier (before first commit)
- ESLint config should be initialized during project scaffold
- Tailwind version should be pinned during setup to avoid compatibility issues
- Environment variable validation should be added at startup

### Recommendations

- Set up GitHub Actions CI before coding begins
- Use `create-next-app` for initial scaffold to avoid config issues
- Pin all dependency versions in package.json
- Add integration tests once Supabase project is provisioned

## Project Handoff

### Handoff Checklist

- [x] Source code in GitHub repository
- [x] Database migration file ready
- [x] Environment variables documented
- [x] README with setup instructions
- [x] Architecture documentation
- [x] Release report with GO verdict
- [x] Deployment report with rollback plan
- [ ] CI/CD pipeline (recommended)
- [ ] Integration tests (deferred)

### Contacts

| Role | Responsibility |
|---|---|
| Product Manager | Requirements, scope, acceptance criteria |
| Architect | Technical design, database schema, API spec |
| Developer | Implementation, bug fixes |
| QA Engineer | Testing, regression, quality gates |
| Release Manager | Release readiness, go/no-go decisions |
| DevOps Engineer | Deployment, infrastructure, monitoring |

### Next Steps

1. Provision Supabase project and set environment variables
2. Apply database migration
3. Deploy to Vercel
4. Continue with US-002 (Role-based Access Control)
