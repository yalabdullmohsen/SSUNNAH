# Visual + Interaction — Live State

| Field | Value |
|---|---|
| Captured | 2026-09-29T06:46Z |
| Source | worktree `cursor/interaction-pr4-nav-fab` + inventory |

## Tips

| Item | Value |
|---|---|
| Branch tip (PR-4 worktree) | `ecead2e61` — Interaction PR-3 on main (`feat(ui): Interaction PR-3 — ترحيل Content/Learning/Worship`) |
| Working tree | Uncommitted PR-4 nav/FAB migrations (do not treat as merged) |
| Decision | **WEB_RELEASED_NATIVE_HOLD** · Store **HOLD** |

## PRs

| PR | Role | State | Notes |
|---|---|---|---|
| #2336 | Visual System PR-1 | **MERGED** | Token authority + debt budgets |
| #2337 | Interaction System PR-1 | **MERGED** | Canonical Button + façades |
| #2338 | account-deletion method guard | **MERGED** | Live probe: GET→405 + `Allow: POST, DELETE`; POST/DELETE→401 |
| #2339 | Interaction PR-2 Home/Search/Account | **MERGED** | Canonical Button on Home/Search/Account |
| #2340 | Interaction PR-3 Content/Learning/Worship | **MERGED** | `ecead2e61` — raw buttons → Button/IconButton |
| next | Interaction PR-4 Navigation + FAB | **IN_PROGRESS** | Branch `cursor/interaction-pr4-nav-fab` — nav/back/FAB + `FLOATING_CONTROLS_POLICY` |

## Debt (interaction, after PR-4 local)

| Metric | Ceiling / Floor |
|---|---|
| rawButtonFiles | ≤ 277 |
| rawButtonElements | ≤ 1063 |
| officialButtonImportFiles | ≥ 79 |

Delta vs post-PR-3 budget: files 285→277 (−8), elements 1094→1063 (−31), official imports 71→79 (+8).

## Floating policy

- Authority: `docs/design/FLOATING_CONTROLS_POLICY.md` (inventory + 13 rules).
- Wiring: `GlobalBackControlHost` suppresses when `hasInPageBackChrome` (prefer in-page `AppBackButton`).

## Explicit non-claims

STORE GO · WCAG certification · device-complete · FULLY COMPLETE
