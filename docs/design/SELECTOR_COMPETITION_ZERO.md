# SELECTOR_COMPETITION_ZERO

| Field | Value |
|---|---|
| Date | 2026-10-04 |
| Scope | Competing definitions that originated inside `design-system.css` |

Each row is one responsibility. Extra sheets outside this graph (`final-release.css`, `styles/pages/*`) are KEEP_COMPATIBILITY unless noted.

| Selector | Blocks in graph | Winner | Classification | Justification |
|---|---|---|---|---|
| `html` font-size | 1 (foundation) | calc(`--ui-font-scale`) | FOUNDATION_WINNER | Startup typography contract |
| `:root --ds-*` v5 | early aliases + v5 | v5 block | FOUNDATION_WINNER | Last `:root` in foundation |
| `--ds-transition` / `--ds-transition-slow` | 2 | v5 | FOUNDATION_WINNER | Compatibility bridge kept |
| `body` line-height | 3 | premium seal | FOUNDATION_WINNER | No font-size / background |
| `.page-shell` | 2 in foundation | later block (adds `padding-bottom`) | FOUNDATION_WINNER | First block KEEP_COMPATIBILITY |
| `.ds-card` / `.ui-card` / `.page-card` | component + premium | premium | COMPONENT_WINNER | Seal after feature CSS |
| `.ds-btn` / `.login-submit` | buttons + premium | premium | COMPONENT_WINNER | `.login-submit` stays on the shared button cluster (not moved to auth) |
| `.ui-card-btn--danger` | buttons.css | that file | COMPONENT_WINNER | Extracted from tasbih cluster; `!important` still beats premium background |
| `.ds-stat` layout + dark | stats.css | stats.css | COMPONENT_WINNER | |
| `.ds-stat strong` color | stats.css + premium | premium | COMPONENT_WINNER | Contrast tokens unchanged |
| `.search-result-row` | 3 in `features/search.css` + premium hover | last layout in search.css; hover from premium | FEATURE_WINNER + FOUNDATION_WINNER (hover) | All original text kept |
| `.search-results-group-title` | 2 in search.css + premium color | premium color | FOUNDATION_WINNER | Layout in search.css |
| `.search-page-title` | search.css + premium color | premium color | FOUNDATION_WINNER | |
| `.tc-ring-btn` | 2 in tasbih.css | later (clamp size) | FEATURE_WINNER | |
| `.user-stats-section__title` | user-stats.css + premium color | premium color | FOUNDATION_WINNER | |
| `.user-stat-card__value` | user-stats.css + premium | premium color | FOUNDATION_WINNER | |
| `.reading-text` | foundation + premium | premium | FOUNDATION_WINNER | |
| `.tawheed-breadcrumb` | 0 | — | DELETE_DUPLICATE | Already DEAD_WITH_PROOF (Wave 1A); not restored |
| `.fiqh-adopted-opinion` | 0 | — | DELETE_DUPLICATE | Already DEAD_WITH_PROOF (Wave 1A) |

## Route CSS still competing (not deleted)

| Selector | Other file | Classification |
|---|---|---|
| `.search-result-row` | `styles/pages/search.css` (SearchView import) | KEEP_COMPATIBILITY — route sheet wins after DS graph |
| `.tc-*` / `.tasbih-*` | `styles/pages/tasbih.css` | KEEP_COMPATIBILITY |
| `.tawheed-*` / tawhid hub | `styles/pages/tawhid.css` | KEEP_COMPATIBILITY |
| login card | `styles/pages/auth.css` | KEEP_COMPATIBILITY |
| user stats page | `styles/pages/user-stats.css` | KEEP_COMPATIBILITY |

No mass delete. Route consumers unchanged.
