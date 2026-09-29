# PR #2357 — Conflict Resolution Report

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Target PR | [#2357](https://github.com/yalabdullmohsen/majalis/pull/2357) |
| Head | `cursor/debt-reduction-w3` |
| Base | `main` |
| Resolution outcome | **Already MERGED** — no open conflict on #2357 |

## FILES IN CONFLICT

### On PR #2357 itself

**None.** GitHub API:

| Field | Value |
|---|---|
| `state` | `MERGED` |
| `mergedAt` | `2026-09-29T17:47:59Z` |
| `mergeCommit` | `c52bbbfd4c97db82b2631467c8fd39c6f44bcd7b` |
| Live `version.json` | `c52bbbfd` (MATCH) |

The branch tip was deleted after squash merge (`cursor/debt-reduction-w3` remote ref gone). There is nothing left to rebase for #2357.

### Related open PRs that still show CONFLICTING (superseded)

These are **not** #2357; they are older debt waves whose tips conflict with current `main` because #2357 already absorbed their work:

| PR | Branch | `mergeable` |
|---|---|---|
| #2356 (Wave 2) | `cursor/debt-reduction-w2` | CONFLICTING |
| #2354 (Wave 1) | `cursor/debt-reduction-w1` | CONFLICTING |

Conflict files when simulating `origin/main` ← `cursor/debt-reduction-w2`:

| File | Conflict type |
|---|---|
| `artifacts/majalis/reports/interaction-system-baseline.json` | content |
| `artifacts/majalis/reports/interaction-system-debt-budget.json` | content |
| `artifacts/majalis/reports/visual-system-baseline.json` | content |
| `artifacts/majalis/reports/visual-system-debt-budget.json` | content |
| `artifacts/majalis/src/lib/__tests__/no-new-utility-screen-gate.test.ts` | content (KEEP ceiling 5 vs 3) |
| `artifacts/majalis/src/styles/theme-aliases.css` | content (token absorb / spacing) |
| `docs/audit/DARK_BRIDGE_REDUCTION_REPORT.md` | add/add |
| `docs/audit/ROUTE_QUALITY_MATRIX.json` | content |
| `docs/design/BUTTON_DEBT_PROGRESS.md` | add/add |
| `docs/design/LEGACY_CSS_RETIREMENT_MATRIX.md` | content |
| `docs/design/UTILITYSCREEN_MIGRATION_MATRIX.md` | content |
| `reports/changed-scope-report.md` | content |
| `reports/changed-scope-verify.json` | content |

Auto-merged without conflict during that simulation: `LessonsView.tsx`, `DailyWirdView.tsx`, `design-system/index.ts`, `REPO_INDEX.md` (among others).

## ROOT CAUSE

1. **#2357** was squash-merged to `main` successfully after CI green.
2. UI “Unable to merge / Conflicts” on **#2356 / #2354** is expected: those branches predate Wave 3 retirements (`soft-cards.css` delete, UtilityScreen KEEP 5→3, tighter debt budgets, theme-aliases absorb).
3. Conflict nature: **mostly textual / metric-doc / budget JSON** + intentional Wave 3 tightenings — not a behavioral product fork that needs a new debt wave.

## RESOLUTION STRATEGY

| Action | Rationale |
|---|---|
| **Do not reopen / rebase #2357** | Already on `main` as `c52bbbfd` |
| **Do not merge #2356 / #2354 into main** | Would fight Wave 3 (risk: restore soft-cards consumers, Utility KEEP 5, older budgets) |
| **Close #2356 + #2354 as superseded** | Wave 3 (#2357) is the single successor PR |
| **Keep `main` tip as source of truth** | Preserves Wave 2+3 fixes already shipped |

Rules applied (no new wave): keep main · keep Wave 2/3 retirements · no soft-card / Utility / mj-outside / raw-button / select regressions.

## BEFORE

| Metric | Post-#2357 merge tip (intended) |
|---|---:|
| soft-card TSX consumers | 0 |
| `soft-cards.css` | deleted |
| public native `<select>` | 16 |
| raw button files / elements | 227 / 978 |
| UtilityScreen KEEP | 3 |
| mj-outside | 30 |

## AFTER

Live re-measure on `origin/main` @ `c52bbbfd` (2026-09-29T17:55Z):

| Metric | Live | Regression? |
|---|---:|---|
| soft-card TSX consumers | **0** | No |
| `soft-cards.css` | **absent** | No |
| public native `<select>` | **16** | No |
| raw button files | **227** | No |
| raw button elements | **978** | No |
| UtilityScreen KEEP | **3** | No |
| mj-outside | **30** | No |

## REGRESSION CHECK

| Guard | Result |
|---|---|
| soft-card consumers restored? | **No** |
| UtilityScreen consumers > 3? | **No** (3: Settings, NotificationSettings, AdhanSettings) |
| mj-outside rose? | **No** (30) |
| raw buttons rose? | **No** (227 / 978) |
| native selects restored on ported pages? | **No** (public count stays 16) |

## VERIFY RESULTS

| Gate | Result |
|---|---|
| Prior #2357 CI | **34/34 PASS** (pre-merge) · auto-squash done |
| Local `verify:preflight` | **PASS** |
| Local `verify:ci` (clean `dist`) | **PASS** |
| Local `release:verify` | **FAIL (1)** — `critical-css-gzip-gate` on `index-Byoj7yxl.css` gzip≈61808–61904 > 61440 |
| Build raw CSS budget | **PASS** (338428 ≤ 505000) |
| Production `version.json` | `c52bbbfd` MATCH |

**Class B (outside conflict scope):** gzip overage on tip bundle; do not raise budget. Follow-up trim only. Hygiene: #2356/#2354 closed; report #2359 merged.

## SUCCESS CRITERIA

| Criterion | Status |
|---|---|
| PR #2357 mergeable / merged | **MERGED** (`c52bbbfd`) |
| CI PASS (#2357) | **Yes** |
| Auto-merge completed | **Yes** |
| No metric regression | **Yes** |
| Wave 1/2 conflict merge avoided | **Yes** (PRs closed) |
