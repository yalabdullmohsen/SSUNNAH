# سُنّة — Interaction System Baseline (PR-1)

| Field | Value |
|---|---|
| Measured | 2026-09-28T20:28:02.593Z |
| Scope | `artifacts/majalis/src` |
| Tool | `artifacts/majalis/scripts/interaction-system-inventory.mjs` |
| JSON | `artifacts/majalis/reports/interaction-system-baseline.json` |
| Budget | `artifacts/majalis/reports/interaction-system-debt-budget.json` |
| Authority | `docs/design/INTERACTION_COMPONENT_AUTHORITY.md` |
| Screenshot matrix (all viewports) | **NOT_RUN** this wave — code metrics + unit gates only |
| Mushaf controls | excluded from migration (MUSHAF_SPECIAL) |

## Metrics (post Wave-1 shared migrate)

| Metric | Value | Role |
|---|---:|---|
| TSX files | 820 | volume |
| Raw `<button` files | **352** | ceiling |
| Raw `<button` elements | **1368** | ceiling |
| Official `ui/button` import files | **9** | floor |
| ActionButton/Primary/Secondary consumers | **7** | floor |
| IconButton consumers (excl. definition) | 0 | watch |
| `div`/`span` + onClick | **60** | ceiling |
| Form buttons missing `type=` | **0** | ceiling |
| Floating-control file mentions | **10** | ceiling |
| Button-related `!important` (approx) | **1268** | ceiling |
| Button-related hex (approx) | **1768** | ceiling |

## Classification seed

| Class | Examples |
|---|---|
| CANONICAL | `ui/button.tsx` `Button` |
| MIGRATION_REQUIRED | remaining 352 raw button files |
| LINK via façade | `ActionButton` + `href` |
| FLOATING_CONTROL_CONFLICT | ScrollToTop, FloatingBack, assistant |
| MUSHAF_SPECIAL | mushaf reader/madinah controls |
| NON_SEMANTIC_INTERACTIVE | 60 div/span onClick |

## Wave-1 completed in this PR

- Canonical `Button` API: variants, sizes, loading, icons, fullWidth, type default
- `ActionButton` / `IconButton` delegate to `Button` (links stay `Link`)
- Migrated: `FilterResetButton`, `ShareButton`

## Next waves

- Home / Search / Account raw buttons
- Lessons / Hadith / Worship
- Admin v3
- Floating policy (prefer AppBackButton; reduce FABs)
- Mushaf special review
