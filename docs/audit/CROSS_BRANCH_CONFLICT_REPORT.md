# CROSS_BRANCH_CONFLICT_REPORT

TASK_CLASSIFICATION: SHARED_PLATFORM  
Date: 2026-10-04

| Branch | PR | Head | Merge-base vs origin/main |
|---|---|---|---|
| `cursor/design-system-css-authority` | #2558 | `95b2081d5` | `f4275d913` (identical to origin/main) |
| `cursor/ios-sunnah-widget-platform-w0-w8` | #2557 | `8850b86e2` | `f4275d913` (identical to origin/main) |

origin/main: `f4275d913` — no drift beyond these two feature branches.

## Overlapping paths

Only:

`artifacts/majalis/package.json`

- #2558 adds `test:css-authority-graph`
- #2557 extends `test:ios-gates` and adds `test:ios-sunnah-widget-platform-contract` + `test:ios-widget-data-platform`

Semantic merge after #2558 lands: **keep both hunks**. Do not use ours/theirs.

No overlapping CSS, Swift, entitlements, or Widget Center files.

## Policy

- Never merge one branch into the other.
- Never cherry-pick CSS debt fixes into #2557 or Widget files into #2558.
- Update #2557 from new main **after** #2558 squash-merge only.
- #2558 is draft; #2557 is open but BLOCKED on red required checks.

NO_CROSS_BRANCH_CONTAMINATION hold is intact at program start.
