# CSS_AUTHORITY_GRAPH_SINGLE

| Field | Value |
|---|---|
| Date | 2026-10-04 |
| Entry | `artifacts/majalis/src/styles/design-system.css` (deferred from `main.tsx`) |
| Bundler | Vite inlines `@import` into the same deferred chunk — one network sheet |

## Graph

```
design-system.css
  @import components/cards.css
  @import components/buttons.css
  @import components/forms.css
  @import components/chips.css
  @import components/badges.css
  @import components/stats.css
  @import components/pagination.css
  @import components/empty-states.css
  @import components/search-ui.css
  @import features/home.css
  @import features/auth.css
  @import features/admin.css
  @import features/search.css
  @import features/tasbih.css
  @import features/user-stats.css
  @import features/learning-seasons.css
  @import features/tawhid.css
  @import features/legacy-surfaces.css
  ── then FOUNDATION rules in this file (tokens v5, html/body, page-shell, prose, skeleton, premium seal)
```

Runtime order: **Components → Features → Foundation seal**.

That seal is intentional. The pre-split mega-file ended with the v5 premium layer, which already won heading color, card/button refinements, `.ds-stat strong`, and `body` line-height. Putting foundation last preserves those computed winners. `@import` cannot follow rules, so foundation cannot be both “first in the file” and “last in the cascade.”

## Forbidden edges (enforced)

| Edge | Status |
|---|---|
| Feature → Foundation `@import` | none |
| Feature → Feature `@import` | none |
| Home → Tawhid | none |
| Tasbih → Search | none |
| Feature `:root` token redefine | none |
| Circular import | none |

## Ownership

| Layer | Files | May |
|---|---|---|
| Foundation | `design-system.css` (post-import) | html/body, `:root --ds-*`, page-shell, prose, skeleton, motion, scrollbar, premium primitive seal |
| Components | `styles/components/{cards,buttons,forms,chips,badges,stats,pagination,empty-states,search-ui}.css` | consume tokens; no `:root` |
| Features | `styles/features/{home,auth,admin,search,tasbih,user-stats,learning-seasons,tawhid,legacy-surfaces}.css` | consume tokens; no `:root`; no cross-feature import |

Route-level `styles/pages/*.css` (tasbih, tawhid, search, auth, user-stats) remain **KEEP_COMPATIBILITY**. They are imported by TSX and load after this deferred graph. Consumers of those imports were not changed.
