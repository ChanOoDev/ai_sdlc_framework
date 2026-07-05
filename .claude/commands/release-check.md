Run Release Manager workflow.

Read:
- docs/31-Release-Readiness.md
- docs/33-Regression-Test-Report.md
- docs/29-Bug-Report.md
- docs/23-Code-Review-Report.md
- docs/24-Security-Review.md

Create/update:
- docs/34-Release-Checklist.md
- docs/35-Go-No-Go-Report.md
- docs/36-Release-Notes.md
- docs/37-DevOps-Handoff.md

Decision rule:
- Critical bug > 0 = NO-GO
- High bug > 0 = NO-GO
- Security review failed = NO-GO
- Regression failed = NO-GO
- Otherwise = GO
