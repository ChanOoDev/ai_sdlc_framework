Prepare a pull request draft using the enterprise PR template.

PR title input:
$ARGUMENTS

Read:
- templates/pull-request-template.md
- docs/02-PRD.md
- docs/06-Acceptance-Criteria.md
- docs/12-Architecture.md
- docs/20-Definition-of-Done.md
- docs/23-Code-Review-Report.md
- docs/24-Security-Review.md
- docs/33-Regression-Test-Report.md
- docs/36-Release-Notes.md
- docs/Progress.md

Create/update:
- docs/50-Pull-Request.md

Instructions:
1. Use `templates/pull-request-template.md` as the exact section structure.
2. Use `$ARGUMENTS` as the PR title and place it in the `## PR Title` section.
3. Fill the rest of the template with the current change context from the docs.
4. Keep content concise, specific, and reviewer-friendly.
5. If information is missing, write `TODO` instead of inventing details.
6. Do not generate a git commit or change git history.
7. Do not treat `$ARGUMENTS` as the full PR body; use it only as the PR title/context seed.
8. Ensure testing evidence, risk, deployment, rollback, and security sections are covered.
