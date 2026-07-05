# =====================================================
# SINGLE-DEVELOPER MODE (current — uncomment this, comment multi-developer below)
# =====================================================
Read:
- docs/18-Sprint-Backlog.md
- docs/Progress.md

Find the next Pending task.

Then:
1. Explain the selected task.
2. Delegate implementation to the correct subagent.
3. Follow developer → reviewer → qa → documentation workflow.
4. Fix Critical and High issues.
5. Update docs/Progress.md.
6. Tell me what was completed and what is next.

Do not start more than one task.
# =====================================================

# =====================================================
# MULTI-DEVELOPER MODE (uncomment this when team grows, comment single-developer above)
# =====================================================
# When working with multiple developers, use this mode.
# It checks GitHub Project for issues assigned to you.
#
# Steps:
#
# 1. Get your GitHub username:
#    gh api user --jq '.login'
#
# 2. List your assigned open issues:
#    gh issue list --repo ChanOoDev/ai_sdlc_framework --assignee @me --label user-story --state open
#
# 3. Check which are still Todo on the project board:
#    gh project item-list 5 --owner ChanOoDev --format json --jq '.items[] | select(.status == "Todo") | {title, id}'
#
# 4. Pick the first Todo issue assigned to you and set it to In Progress:
#    gh project item-edit --project-id PVT_kwHOBrrxHs4BcjpP --id <ITEM_ID> --field-id PVTSSF_lAHOBrrxHs4BcjpPzhXLgLE --single-select-option-id 47fc9ee4
#
# 5. Create a feature branch:
#    git checkout -b feat/<your-name>-<issue-slug>
#
# 6. Read docs/18-Sprint-Backlog.md and docs/Progress.md for the task details.
#
# 7. Explain the selected task.
#
# 8. Delegate implementation to the correct subagent.
#
# 9. Follow developer → reviewer → qa → documentation workflow.
#
# 10. Fix Critical and High issues.
#
# 11. Commit, push to feature branch, create PR:
#     git add -A && git commit -m "feat(<scope>): <description>"
#     git push origin feat/<your-name>-<issue-slug>
#     gh pr create --title "<title>" --body "Closes #<issue-number>"
#
# 12. Set issue to Done on project board:
#     gh project item-edit --project-id PVT_kwHOBrrxHs4BcjpP --id <ITEM_ID> --field-id PVTSSF_lAHOBrrxHs4BcjpPzhXLgLE --single-select-option-id 98236657
#
# 13. Update docs/Progress.md.
#
# 14. Tell me what was completed and what is next.
#
# Do not start more than one task.
# =====================================================
