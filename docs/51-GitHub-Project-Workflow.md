# GitHub Project Workflow

## Purpose

Use GitHub Issues and GitHub Projects as the live execution board for the MVP team.

This repo remains the source of truth for long-form delivery artifacts such as PRD, architecture, QA evidence, release readiness, and handoff documents.

## Recommended Setup

- Team size: 5 developers
- Tracking tool: GitHub Issues + one GitHub Project
- PR workflow: GitHub Pull Requests
- Documentation: `docs/` folder in this repository

## Issue Types

- `Epic`
- `User Story`
- `Task`
- `Bug Report`

Use the issue templates in `.github/ISSUE_TEMPLATE/`.

## Recommended Labels

- `type: epic`
- `type: story`
- `type: task`
- `type: bug`
- `status: backlog`
- `status: ready`
- `status: in-progress`
- `status: in-review`
- `status: qa`
- `status: blocked`
- `status: done`
- `priority: high`
- `priority: medium`
- `priority: low`
- `area: frontend`
- `area: backend`
- `area: database`
- `area: devops`
- `area: docs`

## Recommended Project Statuses

- `Backlog`
- `Ready`
- `In Progress`
- `In Review`
- `QA`
- `Blocked`
- `Done`

## SDLC Mapping

| SDLC Stage | GitHub Project Status | Main Artifact |
|---|---|---|
| Product / Planning | Backlog | `docs/02-PRD.md` |
| Sprint Selection | Ready | `docs/18-Sprint-Backlog.md` |
| Development | In Progress | Branches, commits, implementation changes |
| Code Review | In Review | PRs, `docs/23-Review-Report.md` |
| QA / Regression | QA | `docs/26-QA-Report.md` |
| Blocked Work | Blocked | Updated issue with blocker details |
| Completed Work | Done | Merged PR, updated docs, release evidence as needed |

## Team Rules

- Track day-to-day execution in GitHub Project, not in multiple markdown trackers.
- Keep long-form analysis and evidence in the `docs/` directory.
- Link every PR to at least one issue.
- Reference the issue ID in `templates/pull-request-template.md` under `Related story/bug/epic`.
- Move issues to `In Review` only when a PR is open.
- Move issues to `Done` only after review and QA expectations are met.
- Create a `Bug Report` issue for defects found in QA or regression.

## Minimum Operating Model

1. Create an `Epic` for each major MVP capability.
2. Create `User Story` issues under the epic.
3. Break stories into `Task` issues.
4. Use `Bug Report` issues for defects.
5. Manage sprint execution from the GitHub Project board.
6. Use `/pr` to prepare the PR draft and `/publish-pr` when ready to publish.

## Suggested Views

- Board view by `Status`
- Table view grouped by `Type`
- My items view filtered by assignee
- Bugs only view filtered by `type: bug`
