# SELECTOR_COMPETITION_ZERO

| Field | Value |
|---|---|
| Date | 2026-10-04 |
| Scope | Competing definitions for PR A closure on latest main |

Each row is one responsibility. Extra sheets outside the DS graph (`final-release.css`, `styles/pages/*`) are KEEP_COMPATIBILITY unless noted as resolved.

| Selector | Blocks in graph | Winner | Classification | Justification |
|---|---|---|---|---|
| `html` font-size | 1 (foundation) | calc(`--ui-font-scale`) | FOUNDATION_WINNER | Startup typography contract |
| `:root --ds-*` v5 | early aliases + v5 | v5 block | FOUNDATION_WINNER | Last `:root` in foundation |
| `--ds-transition` / `--ds-transition-slow` | 2 | v5 | FOUNDATION_WINNER | Compatibility bridge kept |
| `body` line-height | 1 | ZERO-FLICKER `1.55` | FOUNDATION_WINNER | Duplicate `--ds-line` bodies removed |
| `.page-shell` | 1 FOUNDATION (+ media) | FOUNDATION contract | FOUNDATION_WINNER | Early DS + FR base absorbed |
| `.ds-card` / `.ui-card` / `.page-card` | component + premium | premium | COMPONENT_WINNER | Seal after feature CSS |
| `.ds-btn` | buttons + premium | premium | COMPONENT_WINNER | |
| `.login-submit` | premium color map only in DS | auth.css layout + premium color | AUTH_ALIAS + COMPONENT_WINNER | Detached from FR/deferred clusters |
| `.ui-card-btn--danger` | buttons.css | that file | COMPONENT_WINNER | |
| `.ds-stat` layout + dark | stats.css | stats.css | COMPONENT_WINNER | |
| `.ds-stat strong` color | stats.css + premium | premium | COMPONENT_WINNER | |
| `.search-result-row` | 1 layout + premium hover | last layout; hover from premium | FEATURE_WINNER + FOUNDATION_WINNER (hover) | Early blocks removed |
| `.search-results-group-title` | search.css + premium color | premium color | FOUNDATION_WINNER | Layout in search.css |
| `.search-page-title` | search.css + premium color | premium color | FOUNDATION_WINNER | |
| `.tc-ring-btn` | 2 in tasbih.css | later (clamp size) | FEATURE_WINNER | |
| `.user-stats-section__title` | user-stats.css + premium color | premium color | FOUNDATION_WINNER | |
| `.user-stat-card__value` | user-stats.css + premium | premium color | FOUNDATION_WINNER | |
| `.reading-text` | foundation + premium | premium | FOUNDATION_WINNER | |
| `.fm-parent` | 0 | — | DEAD_WITH_PROOF_AND_REMOVED | Empty rule deleted; JSX class kept |
| `.tawheed-breadcrumb` | 0 | — | DELETE_DUPLICATE | Already DEAD_WITH_PROOF |
| `.fiqh-adopted-opinion` | 0 | — | DELETE_DUPLICATE | Already DEAD_WITH_PROOF |

## Route CSS still competing (not deleted — PRs C/D)

| Selector | Other file | Classification |
|---|---|---|
| `.search-result-row` | `styles/pages/search.css` (SearchView import) | KEEP_COMPATIBILITY |
| `.tc-*` / `.tasbih-*` | `styles/pages/tasbih.css` | KEEP_COMPATIBILITY |
| `.tawheed-*` / tawhid hub | `styles/pages/tawhid.css` | KEEP_COMPATIBILITY |
| login card / submit layout | `styles/pages/auth.css` | KEEP_COMPATIBILITY (sole page owner for submit layout) |
| user stats page | `styles/pages/user-stats.css` | KEEP_COMPATIBILITY |

No mass delete. Route consumers unchanged. No new CSS file.
