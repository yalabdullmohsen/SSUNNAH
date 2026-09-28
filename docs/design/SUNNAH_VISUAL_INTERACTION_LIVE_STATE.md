# Visual + Interaction — Live State

| Field | Value |
|---|---|
| Captured | 2026-09-28T22:05Z |
| Source | `gh` + live `version.json` |

## Tips

| Item | Value |
|---|---|
| `origin/main` | `22f1a78f9` — account-deletion method guard `#2338` |
| Production `version.json` | `22f1a78f` · **MATCH** · `builtAt=2026-09-28T21:50:03.502Z` |
| Decision | **WEB_RELEASED_NATIVE_HOLD** · Store **HOLD** |

## PRs

| PR | Role | State | Notes |
|---|---|---|---|
| #2336 | Visual System PR-1 | **MERGED** | Token authority + debt budgets |
| #2337 | Interaction System PR-1 | **MERGED** | Canonical Button + façades |
| #2338 | account-deletion method guard | **MERGED** | Live probe: GET→405 + `Allow: POST, DELETE`; POST/DELETE→401 |
| next | Interaction PR-2 Home/Search/Account | IN_PROGRESS | Branch `cursor/interaction-pr2-home-search-account` |

## Debt (interaction, after PR-2 local)

| Metric | Ceiling / Floor |
|---|---|
| rawButtonFiles | ≤ 339 |
| rawButtonElements | ≤ 1290 |
| officialButtonImportFiles | ≥ 21 |

## Explicit non-claims

STORE GO · WCAG certification · device-complete · FULLY COMPLETE
