# PR D — Search / Auth / User Stats compatibility retirement

| Field | Value |
|---|---|
| Branch | `cursor/design-pr-d-search-auth-userstats-compat` |
| Base | `origin/main` `641ab5e9b` |
| TASK_CLASSIFICATION | SHARED_PLATFORM |

## Ownership

| Area | Sole owner | Notes |
|---|---|---|
| Search chrome (form/toolbar/filters/chips/groups/count/list/empty/meta) | `pages/search.css` | Removed DS/deferred/FR duplicates |
| `.search-page-title` + `.search-result-row` (+ premium hover) | `design-system.css` | Gate winners; flex absorbed from page |
| Auth page/card/alerts/back-link/submit layout | `pages/auth.css` | Removed DS login-card + deferred theme overrides |
| `.login-oauth*` | `design-system.css` | Shared OAuth recipes |
| `.login-submit` color/hover/active | DS premium seal | MODEL B KEEP — maps to button authority |
| User stats | already single | No simple dual with DS |

## Auth iOS

`login-field input` / `.login-input` → `font-size: 16px` (auto-zoom risk zero).

## Integrity

- Search ranking/semantics unchanged (CSS only)
- Auth logic unchanged
- No fabricated stats
- No new CSS file
