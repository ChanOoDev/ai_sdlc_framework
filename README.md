# AI Software Company Template

Reusable Claude Code framework for AI-driven SDLC delivery.

## Purpose

This template turns Claude Code into a structured AI software delivery team with:

- Specialist subagents
- Reusable slash commands
- Quality hooks
- Project documentation templates
- SDLC phase gates
- Release governance

## Recommended Workflow

```text
00 Project Brief
   ↓
01 Product
   ↓
02 Architecture
   ↓
03 Sprint Planning
   ↓
04 Development
   ↓
05 Review
   ↓
06 QA + Regression
   ↓
06.5 Release Management
   ↓
07 DevOps
   ↓
08 Documentation + Handoff
```

## How to Use

1. Copy this template into your project root.
2. Edit `docs/00-Project-Brief.md`.
3. Start Claude Code.
4. Run:

```text
/status
```

Then:

```text
/next-task
```

## Minimum Recommended Commands

```text
/next-task
/feature Authentication
/pr feat(auth): add login endpoint and validation
/publish-pr
/review
/qa
/bugfix
/regression
/release-check
/deploy-check
/docs-sync
/status
```

## GitHub Projects

For a 5-developer MVP team, use `GitHub Issues + GitHub Projects` as the live execution board.

- Use issue templates in `.github/ISSUE_TEMPLATE/`
- Track work status in the GitHub Project board
- Keep PRD, architecture, QA, and release evidence in `docs/`
- Link PRs to issues and reference the issue ID in the PR template

Recommended statuses:

```text
Backlog
Ready
In Progress
In Review
QA
Blocked
Done
```

See [51-GitHub-Project-Workflow.md](/C:/Users/chano/Downloads/ai_software_company_template/docs/51-GitHub-Project-Workflow.md) for the operating model.

## PR Command Usage

Use `/pr` to prepare a pull request draft from the enterprise PR template.

```text
/pr feat(auth): add login endpoint and validation
```

Sample commit:

```text
git commit -m "feat(auth): add login endpoint and validation"
```

Use `/publish-pr` after the draft is ready and reviewed. It should confirm the commit message, branch, and PR title before doing any `git commit`, `git push`, or remote PR creation.

## Important

- Keep `00-Project-Brief.md` as the single source of truth.
- Do not start coding before PRD and architecture are created.
- Do not deploy before QA and Release Manager approval.
- Do not expose secrets in project files.
