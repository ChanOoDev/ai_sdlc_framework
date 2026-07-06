# Developer Guide

**Status:** Complete  
**Last Updated:** 2026-07-06  
**Owner:** Documentation Agent

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Clone & Install](#3-clone--install)
4. [Environment Setup](#4-environment-setup)
5. [Supabase Setup](#5-supabase-setup)
6. [GitHub CLI Setup](#6-github-cli-setup)
7. [GitHub Repository Setup](#7-github-repository-setup)
8. [GitHub Project Setup](#8-github-project-setup)
9. [GitHub Actions CI/CD](#9-github-actions-cicd)
10. [Vercel Deployment](#10-vercel-deployment)
11. [Run the App](#11-run-the-app)
12. [Claude Code Infrastructure](#12-claude-code-infrastructure)
13. [Skills Reference](#13-skills-reference)
14. [Agents Reference](#14-agents-reference)
15. [Hooks Reference](#15-hooks-reference)
16. [Commands Reference](#16-commands-reference)
17. [MCP Servers](#17-mcp-servers)
18. [Day-to-Day Workflow](#18-day-to-day-workflow)
19. [Project Structure](#19-project-structure)
20. [Troubleshooting](#20-troubleshooting)

---

## 1. Overview

This is an **AI-driven SDLC project** built with:
- **Next.js 14** (App Router, Server Components, Server Actions)
- **Supabase** (PostgreSQL, Auth, RLS)
- **Tailwind CSS v4** + **shadcn/ui v4**
- **Claude Code** with AI agents, skills, hooks, and slash commands

The project uses an orchestrator pattern where AI agents coordinate the full software development lifecycle — from product planning to deployment.

---

## 2. Prerequisites

Install these before starting:

| Tool | Version | Install |
|---|---|---|
| **Node.js** | 18+ | https://nodejs.org |
| **npm** | 9+ | Comes with Node.js |
| **Git** | Latest | https://git-scm.com |
| **Claude Code** | Latest | `npm install -g @anthropic-ai/claude-code` |
| **GitHub account** | — | https://github.com |
| **Supabase account** | — | https://supabase.com |

Verify installation:

```bash
node --version    # Should be v18+
npm --version     # Should be 9+
git --version     # Should be 2.x+
claude --version  # Should be latest
```

---

## 3. Clone & Install

```bash
# 1. Clone the repository
git clone https://github.com/ChanOoDev/ai_sdlc_framework.git
cd ai_sdlc_framework

# 2. Install dependencies
npm install

# 3. Verify installation
npm run typecheck
```

---

## 4. Environment Setup

### 4.1 Create `.env.local`

```bash
cp .env.example .env.local
```

### 4.2 Fill in values (from Supabase dashboard)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ **Never commit `.env.local`** — it's in `.gitignore` by default.

---

## 5. Supabase Setup

### 5.1 Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Choose a name and database password
4. Wait for project to be ready (~1 minute)

### 5.2 Get API Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 5.3 Run Database Migrations

1. Go to **SQL Editor** in Supabase dashboard
2. Run the migration files in order from `supabase/migrations/`:

```bash
# Check available migrations
ls supabase/migrations/
```

3. Copy and paste each migration file's content into the SQL Editor and run it

### 5.4 Verify RLS

After running migrations, verify Row Level Security is enabled:

1. Go to **Authentication** → **Policies**
2. Check that policies exist for: `profiles`, `patients`, `doctors`, `consultations`

---

## 6. GitHub CLI Setup

### 6.1 Install GitHub CLI

```bash
# Windows (winget)
winget install GitHub.cli

# macOS
brew install gh

# Linux (apt)
sudo apt install gh
```

### 6.2 Authenticate

```bash
# Login to GitHub
gh auth login

# Follow the prompts:
# ? What account? → GitHub.com
# ? Preferred protocol? → HTTPS
# ? Authenticate Git? → Yes
# ? Login with web browser? → Yes
```

### 6.3 Verify

```bash
gh auth status
# Should show: Logged in to github.com as <your-username>
```

---

## 7. GitHub Repository Setup

### 7.1 Create Repository

```bash
# Create a new repo on GitHub
gh repo create ai_sdlc_framework --private --source=. --push

# Or if repo already exists, just set the remote
git remote add origin https://github.com/ChanOoDev/ai_sdlc_framework.git
git push -u origin master
```

### 7.2 Configure Branch Protection

Protect the `master` branch so all changes go through PRs:

```bash
# Enable branch protection via API
gh api repos/{owner}/{repo}/branches/master/protection -X PUT -f '{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}'
```

Or manually:
1. Go to **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Branch name pattern: `master`
4. Enable: **Require a pull request before merging**
5. Save changes

### 7.3 Create Issue Labels

```bash
# Create labels for the project
gh label create "type: epic" --color "A2EEEF" --description "Major delivery item"
gh label create "type: story" --color "7057FF" --description "User-facing story"
gh label create "type: task" --color "008672" --description "Implementation task"
gh label create "type: bug" --color "D73A4A" --description "Defect report"
gh label create "status: backlog" --color "C5DEF5" --description "Not yet planned"
gh label create "status: ready" --color "0E8A16" --description "Ready to start"
gh label create "status: in-progress" --color "FBCA04" --description "Currently working"
gh label create "status: in-review" --color "D4C5F9" --description "Under review"
gh label create "status: qa" --color "F9D0C4" --description "QA testing"
gh label create "status: blocked" --color "E11D48" --description "Blocked"
gh label create "status: done" --color "0E8A16" --description "Completed"
gh label create "priority: high" --color "B60205" --description "High priority"
gh label create "priority: medium" --color "FBCA04" --description "Medium priority"
gh label create "priority: low" --color "0E8A16" --description "Low priority"
gh label create "area: frontend" --color "1D76DB" --description "Frontend work"
gh label create "area: backend" --color "006B75" --description "Backend work"
gh label create "area: database" --color "5319E7" --description "Database work"
gh label create "area: devops" --color "D4C5F9" --description "DevOps work"
gh label create "area: docs" --color "0075CA" --description "Documentation"
```

---

## 8. GitHub Project Setup

### 8.1 Create GitHub Project

1. Go to https://github.com/projects
2. Click **New project**
3. Choose **Board** view
4. Name: `Doctor Note MVP`
5. Description: `Sprint board for Doctor Note MVP development`

### 8.2 Configure Status Field

The project uses a `Status` field with these options:

| Status | Color | Description |
|---|---|---|
| Backlog | Gray | Not yet planned |
| Ready | Blue | Ready to start |
| In Progress | Yellow | Currently working |
| In Review | Purple | Under review |
| QA | Orange | QA testing |
| Blocked | Red | Blocked |
| Done | Green | Completed |

### 8.3 Create Issues from Templates

The project includes issue templates in `.github/ISSUE_TEMPLATE/`:

```bash
# Create issues from templates
gh issue create --template user-story
gh issue create --template epic
gh issue create --template task
gh issue create --template bug-report
```

### 8.4 Link Issues to Project

```bash
# Add issue to project
gh project item-add {project-number} --owner {owner} --url {issue-url}
```

### 8.5 Update Issue Status

```bash
# Move issue to "In Progress"
gh project item-edit --project-id {project-id} --id {item-id} --field-id {status-field-id} --single-select-option-id {in-progress-id}

# Move issue to "Done"
gh project item-edit --project-id {project-id} --id {item-id} --field-id {status-field-id} --single-select-option-id {done-id}
```

---

## 9. GitHub Actions CI/CD

### 9.1 Workflow Overview

```
┌─────────────────────────────────────────────────────────┐
│  CI Workflow (ci.yml)                                   │
│  Triggers: Push to master, Pull Requests                │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Lint & Typecheck│  │ Tests           │  (parallel)  │
│  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                        │
│  ┌────────┴────────────────────┴────────┐              │
│  │ Security Scan                         │              │
│  │ (npm audit + secret scan)             │              │
│  └────────────────────┬─────────────────┘              │
│                       │                                 │
│  ┌────────────────────┴─────────────────┐              │
│  │ Build                                 │              │
│  └──────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Deploy Workflow (deploy.yml)                           │
│  Triggers: Push to master                               │
│                                                         │
│  Step 1: Deploy Preview (staging)                       │
│  Step 2: ⏸️  Approval Gate (manual)                     │
│  Step 3: Deploy Production                              │
└─────────────────────────────────────────────────────────┘
```

### 9.2 CI Workflow (`.github/workflows/ci.yml`)

Runs automatically on every push and pull request:

| Job | What It Does | Runs On |
|---|---|---|
| `lint-and-typecheck` | TypeScript check + ESLint | ubuntu-latest |
| `test` | Vitest test suite | ubuntu-latest |
| `security` | npm audit + secret scan | ubuntu-latest |
| `build` | Next.js production build | ubuntu-latest |

**Jobs run in parallel** (lint, test, security), then **build runs after all pass**.

### 9.3 Deploy Workflow (`.github/workflows/deploy.yml`)

Runs after CI passes on push to master:

| Step | What It Does | Requires |
|---|---|---|
| `ci` | Runs CI workflow | — |
| `deploy-preview` | Deploys to Vercel preview | CI passes |
| `approve` | Waits for manual approval | Preview deployed |
| `deploy-production` | Deploys to Vercel production | Approval received |

### 9.4 Add Repository Secrets

```bash
# Add secrets to GitHub repo
gh secret set NEXT_PUBLIC_SUPABASE_URL --body "https://your-project.supabase.co"
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --body "your-anon-key"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "your-service-role-key"
gh secret set VERCEL_TOKEN --body "your-vercel-token"
```

Or manually:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret

### 9.5 Setup GitHub Environment (Required for Approval Gate)

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name: `production`
4. Enable **Required reviewers**
5. Add yourself as reviewer
6. Save

**Without this setup, the deploy workflow will fail at the approval step.**

---

## 10. Vercel Deployment

### 10.1 Connect Repository to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
4. Click **Deploy**

### 10.2 Set Environment Variables

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add:

| Variable | Value | Environment |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Production, Preview |

### 10.3 Get Vercel Token (for GitHub Actions)

1. Go to https://vercel.com/account/tokens
2. Click **Create Token**
3. Name: `github-actions`
4. Copy the token
5. Add to GitHub: `gh secret set VERCEL_TOKEN --body "your-token"`

### 10.4 Configure Domains (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed

### 10.5 Deployment Flow

```
Push to master
    │
    ▼
┌─────────────────────┐
│ CI passes           │
│ (lint+test+sec+build)│
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Preview deployed    │ ← You can review here
│ (staging URL)       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ ⏸️  Approval needed  │ ← Approve in GitHub UI
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Production live     │
│ (your-domain.vercel.app)│
└─────────────────────┘
```

### 10.6 Manual Deployment

To deploy manually without waiting for approval:

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 11. Run the App

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint
npm run lint

# Type check
npm run typecheck
```

Open http://localhost:3000 in your browser.

---

## 12. Claude Code Infrastructure

The `.claude/` directory contains all AI configuration:

```
.claude/
├── CLAUDE.md              # Project instructions (read every session)
├── settings.json          # Global hooks and permissions
├── settings.local.json    # Local overrides (not committed)
├── agents/                # AI specialist agents
│   ├── SCHEMAS.md         # Output schemas for all agents
│   ├── orchestrator.md    # AI Engineering Manager
│   ├── developer.md       # Implements features
│   ├── reviewer.md        # Code review
│   ├── qa.md              # Quality assurance
│   ├── scrum-master.md    # Sprint planning
│   ├── product-manager.md # Product decisions
│   ├── architect.md       # Architecture
│   ├── release-manager.md # Release decisions
│   ├── devops.md          # Infrastructure
│   └── documentation.md   # Docs generation
├── commands/              # Slash commands
│   ├── bootstrap.md       # /bootstrap — scaffold project
│   ├── warmup.md          # /warmup — fill TODO stubs
│   ├── next-task.md       # /next-task — pick next task
│   ├── feature.md         # /feature — implement feature
│   ├── review.md          # /review — code review
│   ├── qa.md              # /qa — quality assurance
│   ├── bugfix.md          # /bugfix — fix a bug
│   ├── regression.md      # /regression — regression test
│   ├── release-check.md   # /release-check — release readiness
│   ├── deploy-check.md    # /deploy-check — deployment readiness
│   ├── docs-sync.md       # /docs-sync — sync documentation
│   ├── status.md          # /status — project status
│   └── publish-pr.md      # /publish-pr — create PR
├── skills/                # Domain knowledge
│   ├── ai-sdlc-skill.md         # SDLC workflow phases
│   ├── doctor-note-domain-skill.md # Domain knowledge
│   ├── uiux-skill.md            # Design tokens, colors
│   ├── frontend-dev-skill.md    # React/TypeScript patterns
│   ├── backend-skill.md         # Supabase, auth, RLS
│   ├── nextjs-skill.md          # Next.js framework
│   ├── supabase-skill.md        # Database patterns
│   ├── security-review-skill.md # Security checklist
│   ├── qa-testing-skill.md      # Testing patterns
│   ├── devops-deploy-skill.md   # Deployment
│   └── documentation-skill.md   # Docs generation
└── hooks/                 # Automated checks
    ├── secret-scan.sh     # Prevents secrets in code
    ├── lint.sh            # ESLint on file changes
    ├── typecheck.sh       # TypeScript on file changes
    ├── build.sh           # Build check
    ├── test.sh            # Test runner
    └── progress-reminder.sh # Reminds to update docs
```

### How It Works

1. **CLAUDE.md** is read at the start of every Claude Code session — it contains project rules
2. **Skills** activate automatically based on file patterns (e.g., editing `*.tsx` triggers `uiux-skill`)
3. **Agents** are spawned by the orchestrator to handle specific roles
4. **Hooks** run automatically after every file edit (lint, typecheck, secret scan)
5. **Commands** are slash commands you type in Claude Code (e.g., `/next-task`)

---

## 13. Skills Reference

Skills provide domain knowledge that Claude uses automatically.

### Core Skills

| Skill | Triggers On | What It Does |
|---|---|---|
| `ai-sdlc-skill` | All files | SDLC phase gates and workflow rules |
| `doctor-note-domain-skill` | All files | Clinic domain knowledge (patients, doctors, consultations) |
| `uiux-skill` | `src/**/*.tsx`, `src/**/*.css` | Design tokens, colors, typography, component patterns |
| `frontend-dev-skill` | `src/**/*.tsx`, `src/**/*.ts`, `src/**/*.css` | React/TypeScript patterns, data fetching, error handling |
| `backend-skill` | `src/app/actions/**/*.ts`, `src/lib/**/*.ts` | Auth, Supabase, RLS, validation, security |
| `nextjs-skill` | `src/**/*.tsx`, `src/**/*.ts` | Next.js routing, Server Components, caching |

### Supporting Skills

| Skill | What It Does |
|---|---|
| `supabase-skill` | Database patterns, RLS policies, migrations |
| `security-review-skill` | Security checklist, vulnerability patterns |
| `qa-testing-skill` | Test planning, test execution |
| `devops-deploy-skill` | Deployment, environment setup |
| `documentation-skill` | Doc generation, README writing |

### How Skills Activate

When you edit a file, Claude automatically loads the relevant skill. For example:
- Edit `src/app/page.tsx` → `uiux-skill` + `frontend-dev-skill` + `nextjs-skill` activate
- Edit `src/app/actions/patients.ts` → `backend-skill` activates
- Edit `src/app/globals.css` → `uiux-skill` activates

---

## 14. Agents Reference

Agents are specialist AI roles that the orchestrator delegates work to.

| Agent | Role | Key Responsibility |
|---|---|---|
| `orchestrator` | AI Engineering Manager | Coordinates all agents, enforces quality gates |
| `product-manager` | Product Owner | PRD, user stories, acceptance criteria |
| `architect` | Technical Architect | Architecture, ERD, database schema, API spec |
| `scrum-master` | Scrum Master | Sprint backlog, task breakdown, daily plan |
| `developer` | Senior Developer | Implements features, writes tests |
| `reviewer` | Code Reviewer | Code review, security review |
| `qa` | QA Engineer | Test execution, bug reporting |
| `release-manager` | Release Manager | Go/No-Go decisions |
| `devops` | DevOps Engineer | Infrastructure, deployment |
| `documentation` | Technical Writer | README, user guide, release notes |

### Agent Output Schemas

Each agent returns structured output defined in `.claude/agents/SCHEMAS.md`. The orchestrator validates these outputs before proceeding.

---

## 15. Hooks Reference

Hooks run automatically after specific events.

### PostToolUse Hooks (run after every file edit)

| Hook | What It Checks |
|---|---|
| `secret-scan.sh` | Scans for leaked secrets (API keys, passwords) |
| `lint.sh` | Runs ESLint on `src/` |
| `typecheck.sh` | Runs TypeScript type checking |
| `test.sh` | Runs tests (if configured) |

### Stop Hooks (run when Claude stops)

| Hook | What It Does |
|---|---|
| `progress-reminder.sh` | Reminds to update `docs/Progress.md` |

### Hook Configuration

Hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/secret-scan.sh" },
          { "type": "command", "command": ".claude/hooks/lint.sh" },
          { "type": "command", "command": ".claude/hooks/typecheck.sh" }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/progress-reminder.sh" }
        ]
      }
    ]
  }
}
```

---

## 16. Commands Reference

Type these in Claude Code to trigger workflows.

### Setup Commands

| Command | What It Does |
|---|---|
| `/bootstrap` | Scaffolds a new Next.js + Supabase project |
| `/warmup` | Fills all TODO stubs in product and architecture docs |

### Development Commands

| Command | What It Does |
|---|---|
| `/next-task` | Picks the next pending task from the sprint backlog |
| `/feature <description>` | Implements a specific feature |
| `/bugfix <description>` | Fixes a specific bug |

### Quality Commands

| Command | What It Does |
|---|---|
| `/review` | Runs code review on recent changes |
| `/qa` | Runs quality assurance testing |
| `/regression` | Runs regression testing |

### Release Commands

| Command | What It Does |
|---|---|
| `/release-check` | Checks release readiness |
| `/deploy-check` | Checks deployment readiness |
| `/publish-pr` | Creates a pull request |
| `/pr` | Alternative PR command |

### Documentation Commands

| Command | What It Does |
|---|---|
| `/docs-sync` | Synchronizes documentation with code |
| `/status` | Shows current project status |

---

## 17. MCP Servers

MCP (Model Context Protocol) servers extend Claude's capabilities.

### Pencil Design Tool (Already Configured)

The project includes the Pencil MCP server for design work. It's configured in your Claude Code settings.

### Adding Custom MCP Servers

To add an MCP server, edit `.claude/settings.local.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

---

## 18. Day-to-Day Workflow

### Starting a New Task

```
1. Open Claude Code in the project directory
2. Type: /next-task
3. Claude will:
   - Read the sprint backlog
   - Pick the next pending task
   - Create a feature branch
   - Implement the feature
   - Run review and QA
   - Create a PR
   - Update documentation
```

### Manual Feature Development

```
1. Create a feature branch
   git checkout -b feat/my-feature

2. Open Claude Code
   claude

3. Describe what you want to build
   "Add a patient search feature to the patients page"

4. Claude will use the relevant skills and agents to implement it

5. Review the changes
   git diff

6. Commit and push
   git add -A
   git commit -m "feat(patients): add search functionality"
   git push origin feat/my-feature

7. Create a PR
   gh pr create
```

### Quality Gates

The system enforces these quality gates:

| Gate | Blocker | Action |
|---|---|---|
| Critical bug | Always | Fix before proceeding |
| High bug | Always | Fix before proceeding |
| Security Critical | Always | Fix before proceeding |
| Lint errors | Always | Fix before proceeding |
| Type errors | Always | Fix before proceeding |

---

## 19. Project Structure

```
ai_software_company_template/
├── .claude/                    # Claude Code configuration
│   ├── CLAUDE.md               # Project instructions
│   ├── settings.json           # Global settings
│   ├── agents/                 # AI agents
│   ├── commands/               # Slash commands
│   ├── skills/                 # Domain knowledge
│   └── hooks/                  # Automated checks
├── docs/                       # Project documentation
│   ├── 00-Project-Brief.md
│   ├── 02-PRD.md
│   ├── 04-User-Stories.md
│   ├── 12-Architecture.md
│   ├── 15-Database-Schema.md
│   ├── 18-Sprint-Backlog.md
│   ├── Progress.md
│   └── ... (40+ docs)
├── src/
│   ├── app/
│   │   ├── (auth)/             # Auth pages (login, signup)
│   │   ├── (dashboard)/        # Dashboard pages
│   │   │   ├── components/     # Reusable components
│   │   │   ├── dashboard/      # Dashboard page
│   │   │   ├── patients/       # Patient CRUD
│   │   │   ├── doctors/        # Doctor CRUD
│   │   │   ├── consultations/  # Consultation CRUD
│   │   │   └── users/          # User management
│   │   ├── actions/            # Server actions
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/ui/          # shadcn components
│   ├── lib/
│   │   ├── supabase/           # Supabase clients
│   │   ├── utils.ts            # Utilities
│   │   └── validators.ts       # Validation schemas
│   └── types/
│       └── database.ts         # TypeScript types
├── supabase/
│   ├── migrations/             # SQL migrations
│   └── seed.sql                # Seed data
├── middleware.ts                # Next.js middleware
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## 20. Troubleshooting

### "Module not found" errors

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Tailwind styles not working

Ensure `globals.css` uses Tailwind v4 syntax:

```css
@import "tailwindcss";
@import "tw-animate-css";
```

NOT the old v3 syntax:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### shadcn `asChild` prop errors

shadcn v4 uses **base-ui**, not radix. There is no `asChild` prop. Use `buttonVariants` instead:

```tsx
// ❌ Wrong (radix pattern)
<Button asChild><Link href="/page">Click</Link></Button>

// ✅ Correct (base-ui pattern)
<Link href="/page" className={buttonVariants()}>Click</Link>
```

### Supabase connection errors

1. Check `.env.local` has correct values
2. Verify Supabase project is running
3. Check RLS policies are enabled

### Build fails

```bash
# Check for type errors
npm run typecheck

# Check for lint errors
npm run lint

# Full build
npm run build
```

### Hooks not running

Check `.claude/settings.json` exists and has correct hook configuration. Ensure hook scripts are executable:

```bash
chmod +x .claude/hooks/*.sh
```

---

## Quick Start Checklist

### Local Setup
- [ ] Node.js 18+ installed
- [ ] Claude Code installed (`npm install -g @anthropic-ai/claude-code`)
- [ ] GitHub CLI installed (`gh --version`)
- [ ] Repository cloned
- [ ] `npm install` completed
- [ ] `.env.local` created with Supabase credentials
- [ ] Database migrations run in Supabase
- [ ] `npm run dev` starts successfully
- [ ] Can access http://localhost:3000
- [ ] Can sign up and log in
- [ ] Claude Code opens with project context

### GitHub Setup
- [ ] GitHub CLI authenticated (`gh auth status`)
- [ ] Repository created and pushed
- [ ] Branch protection enabled on `master`
- [ ] Issue labels created
- [ ] GitHub Project board created
- [ ] Repository secrets added (Supabase keys)

### Vercel Setup
- [ ] Vercel account created
- [ ] Repository imported to Vercel
- [ ] Environment variables set in Vercel
- [ ] Vercel token added as GitHub secret
- [ ] First deployment successful

---

## Next Steps

After setup, use these commands in Claude Code:

1. **`/status`** — Check current project state
2. **`/next-task`** — Pick the next sprint task
3. **`/feature <description>`** — Implement a custom feature
