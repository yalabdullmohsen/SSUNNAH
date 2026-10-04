# PR A — Selector winner cleanup (closure wave)

| Field | Value |
|---|---|
| Branch | `cursor/design-pr-a-selector-single-ownership` |
| Base | `origin/main` `2a6961a7f` |
| Date | 2026-10-04 |
| TASK_CLASSIFICATION | SHARED_PLATFORM |

## Removed with proof

| Item | Proof | Winner kept |
|---|---|---|
| `.fm-parent { }` | Already removed on main (#2559); gate asserts empty rule stays gone | JSX class retained for structure |
| Early `.page-shell` (`width: min(100%, var(--ds-max))` only) | Shadowed by FOUNDATION contract | FOUNDATION `.page-shell` / narrow / wide |
| `final-release.css` base `.page-shell` + narrow + mobile | Absorbed into FOUNDATION | design-system FOUNDATION |
| Duplicate `body { line-height: var(--ds-line) }` (×2) | Shadowed by ZERO-FLICKER `1.55` | sole `body { line-height: 1.55 }` |
| `index-deferred` duplicate `.page-shell { animation: none }` | Duplicate of later reduced-motion block | deferred reduced-motion + FR `@media` |
| `final-release` / deferred `.login-submit` a11y + `!important` theme cluster | Competing with auth.css + DS premium | `pages/auth.css` layout/a11y + DS premium color map |
| Early `.search-result-row` + defeated hover | Already removed (#2559) | later layout + premium hover |

## LOGIN_SUBMIT model

**B — Auth compatibility alias**

- Layout / disabled / focus-visible: sole page owner = `styles/pages/auth.css`
- Color / hover / active map to canonical button authority: DS premium seal only
- Removed from broad `final-release` button a11y cluster and deferred `!important` theme override

## PAGE_SHELL model

One FOUNDATION contract owns:

- width / max-width
- margin-inline
- logical padding + bottom safe spacing
- narrow / wide
- mobile ≤879px narrow / lesson-detail measure

Feature compounds (`.content-hub-page.page-shell`, hero `:has`, density, contrast text-align, animation:none) remain consumers — they must not redefine the foundation box.

## Not removed (KEEP_COMPATIBILITY — PRs C/D)

`styles/pages/{tasbih,tawhid,search,auth,user-stats}.css` — route imports still active.

## Gate

`css-authority-graph-gate` allowlists exact defeated bodies and asserts:

- winners remain
- defeated early `.page-shell` / search hover / empty `.fm-parent` do not return
- sole `body` line-height value is `1.55`

## Ceilings

No ceiling raise. No new CSS file.
