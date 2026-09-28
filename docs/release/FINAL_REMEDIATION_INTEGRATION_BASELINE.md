# FINAL REMEDIATION INTEGRATION BASELINE

| Field | Value |
|---|---|
| Generated | 2026-09-28 |
| Git root (delivery WT) | `/Users/alabdullmohsen/wt-final-remediation-ready` |
| Common git dir | `/Users/alabdullmohsen/majlis-app/.git` |
| Delivery branch (Phase 1 start) | `cursor/fix-contrast-ci-7543-ready` |
| Base | `origin/main` @ `2e008c8d552252e7a817e0c33ac071af064dc6ce` |
| Production `version.json` | `2e008c8d` · HTTP 200 · `builtAt=2026-09-28T13:00:10.787Z` · `ref=main` |
| Store | **HOLD** (unchanged) |
| Merge policy | PR → main · squash auto-merge after Verify build (`.github/workflows/auto-merge-to-main.yml`) |
| Deploy policy | Vercel on `main` (`artifacts/majalis/vercel.json`) + `.github/workflows/auto-deploy.yml` verify |
| Branch protection API | Not readable via token (404) — still follow PR + required checks path; no admin bypass |

## Verified commits

| Label | SHA | Subject | Present |
|---|---|---|---|
| P1 on main | `2e008c8d5` | startup mushaf persistence (#2328) | yes (main tip) |
| Contrast | `edfe36e5c` | fix(a11y) HubCard/hero contrast CI #7543 | yes (parent = main tip) |
| Mushaf editor fix | `32ea046ed` | VisualViewport bookmark editor | yes |
| Mushaf editor tip | `a4a2eda01` | chore noise cleanup after editor | yes |
| P2 | `45d432a62` | API security | yes (based on pre-squash `1ba918c50`) |
| P3 | `3b5ef4ae6` | Admin v3 CRUD | yes |
| P4 | `b64319d06` | content delivery/perf | yes |
| P5 | `7716977d7` | design/UX/a11y | yes |
| P6 gate | `c935dab07` | release:verify HOLD | yes |
| P7 docs | `dd1cb859b` / `a8d446dbd` | integration + final report | yes |

## Dirty worktrees (not touched)

| Worktree | Branch | Dirty lines (approx) |
|---|---|---:|
| wt-api-security-p2 | cursor/api-security-hardening-p2 | 6 |
| wt-release-rc-p6 | release/sunnah-final-integration | 8 |
| wt-auth-registration | cursor/auth-registration-p0 | 10 |
| majlis-app | cursor/nav-prayer-stability-p0 | 22 |
| wt-contrast-ci-7543 | cursor/fix-contrast-ci-7543 | 0 |
| wt-mushaf-bookmark-editor | cursor/mushaf-bookmark-editor-viewport | 0 |
| wt-admin/content/design | clean | 0 |

Stashes: many historical (200+) — left intact. No `git clean`, no stash drop, no worktree remove.

## Integration plan (execution order)

1. Cherry-pick `edfe36e5c` → PR → main (unblock Color contrast).
2. Cherry-pick `32ea046ed` + `a4a2eda01` onto updated main → PR → main.
3. Rebuild `release/sunnah-final-integration-ready` from updated main; cherry-pick P2→P5 unique commits then P6/P7 docs/gates; verify; PR → main; Auto Deploy; smoke; STORE HOLD.

## Exclusion

- `cursor/auth-registration-p0` — not in P2–P7 delivery path unless proven hard dependency.
- Store signing / TestFlight / Play upload — forbidden.
- Destructive SQL / production secrets — forbidden.
