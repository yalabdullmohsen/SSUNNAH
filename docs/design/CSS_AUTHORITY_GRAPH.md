# CSS_AUTHORITY_GRAPH_SINGLE

| Field | Value |
|---|---|
| Date | 2026-10-04 |
| Entry | `artifacts/majalis/src/styles/design-system.css` (deferred from `main.tsx`) |
| Physical sheets | **1** (`cssFiles` ceiling 356 forbids extra DS partitions) |

## Graph

```
design-system.css
  COMPONENT_AUTHORITY   cards, buttons, forms, chips, badges, stats, pagination, empty, search-ui
  FEATURE_AUTHORITY     home, auth, admin, search, tasbih, user-stats, learning-seasons, tawhid, leftover surfaces
  FOUNDATION seal       html / :root v5 / page-shell / prose / skeleton / premium
```

Runtime order: **Components → Features → Foundation seal**.

That seal is intentional. The pre-split mega-file ended with the v5 premium layer, which already won heading color, card/button refinements, `.ds-stat strong`, and `body` line-height.

18 micro-sheets from the first extraction were inlined back (same order Vite would have inlined `@import`). See `CSS_INTRODUCTION_AUDIT.md`.

## Forbidden edges (enforced)

| Edge | Status |
|---|---|
| Extra `styles/features/*.css` or DS `components/{cards,buttons,…}.css` | must not exist |
| Feature region `:root` token redefine | none |
| Home → Tawhid import | none |
| Tasbih → Search import | none |
| Circular import | none |

## Ownership

| Layer | Location | May |
|---|---|---|
| Foundation | `design-system.css` after FEATURE region | html/body, `:root --ds-*`, page-shell, prose, skeleton, motion, scrollbar, premium primitive seal |
| Components | `COMPONENT_AUTHORITY` region in the same file | consume tokens; no `:root` |
| Features | `FEATURE_AUTHORITY` region in the same file | consume tokens; no `:root` |

Route-level `styles/pages/*.css` (tasbih, tawhid, search, auth, user-stats) remain **KEEP_COMPATIBILITY**. TSX imports of those files were not changed.
