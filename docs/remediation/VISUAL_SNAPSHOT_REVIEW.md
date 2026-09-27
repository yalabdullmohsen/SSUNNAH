# Visual Snapshot Review — UI recovery wave

## Policy

No blind snapshot updates. Accessibility / layout source gates must pass first.

## #2304 homepage

| Item | Verdict |
|---|---|
| Intended change | Compact hero, single primary CTA, hide scroll-to-top until ≥720px |
| Contrast gate | Fixed selector → `.hw3-chip--lead` |
| Scroll source gate | Fixed numeric `scrollY > 720` |
| Playwright visual PNG baselines | Not mass-updated in this wave |
| Approval | Product + gate fix only; snapshot PNG churn deferred unless CI reports intentional diffs |

## #2305 lessons

| Item | Verdict |
|---|---|
| Intended change | Compact cards, sticky filters, overflow menu, detail redesign |
| Contrast | HARD_WHITE_BG fixed via surface tokens |
| Snapshots | Docs under `docs/ux/lessons-redesign/` are evidence captures, not CI baselines |

## Main

Visual-snapshot job green on `a9e7bf87`.
