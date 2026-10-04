# DESIGN_SYSTEM_AUTHORITY_MODEL

| Field | Value |
|---|---|
| Date | 2026-10-04 |
| Program | `DESIGN_SYSTEM_CSS_DECOMPOSITION_AND_AUTHORITY_RECONCILIATION` |
| Safety | No intentional visual change. Rule text relocated, not restyled. |

## Authority

| Layer | Location | Contains |
|---|---|---|
| TYPOGRAPHY / SPACING / RADIUS / SHADOW / COLOR | `styles/design-system.css` `:root` v5 | `--ds-*` only |
| BASE_LAYOUT / PAGE_SHELL | same file | `.ds-page`, `.page-shell`, `.ds-section`, `.ds-grid`, `.content-hub` |
| RESPONSIVE_FOUNDATION | same file | content-hub desktop, filter desktop visibility that remained in foundation slices |
| Skeletons / a11y / motion / scrollbar / prose | same file | `.ds-skeleton`, `ds-shimmer`, reduced-motion, `::-webkit-scrollbar`, article rhythm |
| Startup-safe `html`/`body` | same file | `html` font-size follows `--ui-font-scale`; `body` line-height only |
| Premium primitive seal | same file (end) | heading color, card/button refinements, nav colors, `.ds-stat strong` |
| Components | `styles/components/*.css` | cards, buttons, forms, chips, badges slot, stats, pagination, empty, search-ui |
| Features | `styles/features/*.css` | home, auth, admin, search, tasbih, tawhid, learning-seasons, user-stats, leftover surfaces |

## Size

| State | Lines | Bytes |
|---|---:|---:|
| Initial mega-file | 3147 | 85391 |
| Foundation file after split | 862 | 26224 |

Feature+component bytes are in sibling files inlined by Vite, so shipped CSS volume is the same rules plus banners.

## Success flags

- DESIGN_SYSTEM_AUTHORITY_DEFINED
- FOUNDATION_IS_FOUNDATION_ONLY
- COMPONENTS_IS_COMPONENTS_ONLY
- FEATURES_IS_FEATURES_ONLY
- TASBIH_ISOLATED / TAWHID_ISOLATED / HOME_ISOLATED / AUTH_ISOLATED / ADMIN_ISOLATED / SEARCH_ISOLATED / LEARNING_SEASONS_ISOLATED / USER_STATS_ISOLATED
- SELECTOR_COMPETITION_ZERO (documented winners; no silent dual authority inside the graph without a row)
- TOKEN_AUTHORITY_CLEAR
- NO_DEAD_CSS_WITH_CONSUMERS
- CSS_IMPORT_GRAPH_EXPLICIT
- DESIGN_SYSTEM_FILE_SIZE_SIGNIFICANTLY_REDUCED
- FINAL_AUTHORITY_MODEL_DOCUMENTED

## Future cleanup (do not do in this PR)

1. Absorb `styles/pages/{tasbih,tawhid,search,auth,user-stats}.css` into the matching `styles/features/*` after proving computed-style equality per route.
2. Move leftover `legacy-surfaces.css` (revelation, miracles, lessons-v2, `am-*`) into route CSS with consumer proof.
3. Collapse duplicate `.page-shell` / `.search-result-row` blocks now that winners are documented.
4. Empty `.fm-parent { }` after a second consumer sweep.
5. Point `badges.css` at `.revelation-badge` once that cluster is split without media-query breakage.
