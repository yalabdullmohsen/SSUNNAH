# CSS_INTRODUCTION_AUDIT

| Field | Value |
|---|---|
| Date | 2026-10-04 |
| Ceiling | `cssFiles` = **356** (unchanged) |
| Before this reconciliation | 374 |
| After | **356** |
| Delta introduced by decomposition | **+18** physical sheets |

Debt budget was not modified. No new CSS files remain on disk.

## Introduced sheets

Exclusive consumers of every row were `design-system.css` `@import` plus the authority gate. TSX still imports `styles/pages/*` (unchanged). Basename hits on `tasbih.css` / `search.css` / `auth.css` / `tawhid.css` / `user-stats.css` are the **existing** page sheets, not the extracted copies.

| Path | Bytes | Exclusive selectors (prefix) | Duplicated vs `pages/*` | Justified as own sheet? | Class |
|---|---:|---|---|---|---|
| `styles/components/cards.css` | 3297 | `.ds-card` `.ui-card` `.page-card*` | competes with card-system (pre-existing) | logical yes; physical no (ceiling) | MERGE |
| `styles/components/buttons.css` | 1470 | `.ds-btn*` `.ui-card-btn*` | `.login-submit` also in auth cluster | micro | MERGE |
| `styles/components/forms.css` | 645 | `.ds-input` | login-field overlap | micro | MERGE |
| `styles/components/chips.css` | 2294 | `.content-hub-chip` `.ds-filter*` | — | micro | MERGE |
| `styles/components/badges.css` | 461 | none (slot comment only) | `.revelation-badge` stayed in leftover | **not justified** | MERGE |
| `styles/components/stats.css` | 1786 | `.ds-stat` `.page-stats-row` | — | logical yes | MERGE |
| `styles/components/pagination.css` | 798 | `.ruling-pagination` | — | micro | MERGE |
| `styles/components/empty-states.css` | 362 | `.ds-empty` | — | micro | MERGE |
| `styles/components/search-ui.css` | 699 | `.page-search-input` `.content-hub-search` | not `search-page*` | micro | MERGE |
| `styles/features/home.css` | 13642 | `hcp-*` `hcz-*` `hpv4-*` `ds-quiz-home-card-*` | no `pages/home.css` | logical yes | MERGE |
| `styles/features/auth.css` | 2095 | `login-oauth*` `login-card*` | `pages/auth.css` KEEP_COMPATIBILITY | same ownership as page sheet; extra file | MERGE |
| `styles/features/admin.css` | 1363 | `admin-bootstrap*` `admin-feature-status*` | other `admin-*.css` exist | fragment | MERGE |
| `styles/features/search.css` | 3370 | `search-page*` `search-result*` `search-filter*` | `pages/search.css` KEEP_COMPATIBILITY | same ownership; extra file | MERGE |
| `styles/features/tasbih.css` | 9200 | `tc-*` `tasbih-*` | `pages/tasbih.css` KEEP_COMPATIBILITY | same ownership; extra file | MERGE |
| `styles/features/tawhid.css` | 5861 | `tawheed-*` | `pages/tawhid.css` KEEP_COMPATIBILITY | same ownership; extra file | MERGE |
| `styles/features/user-stats.css` | 1461 | `user-stat*` | `pages/user-stats.css` KEEP_COMPATIBILITY | same ownership; extra file | MERGE |
| `styles/features/learning-seasons.css` | 3296 | `lsw-*` | — | fragment | MERGE |
| `styles/features/legacy-surfaces.css` | 12359 | revelation, miracles, `am-*`, lessons-v2 | mixed owners | temporary extract | MERGE |

No row is `DELETE_WITH_PROOF` (rules still have consumers). No row is `ABSORB` into `pages/*` (that would drop global deferred load for `am-*`, home, tasbih counter). No row stays as its own sheet (`KEEP`).

## Reconciliation

All 18 sheets were **inlined** into `styles/design-system.css` in the same order as the former `@import` graph:

```
COMPONENT_AUTHORITY → FEATURE_AUTHORITY → FOUNDATION (html / :root v5 / premium seal)
```

Physical file count returns to 356. Logical ownership is labeled regions, not extra files.

## Duplicate extraction cleanup

There were no `feature-a-overrides.css` / `feature-a-legacy.css` pairs. Fragments with the same owner (`tasbih` vs `pages/tasbih.css`, etc.) remain **KEEP_COMPATIBILITY** at the route sheet; DS copies live in the FEATURE region so global deferred load is unchanged.
