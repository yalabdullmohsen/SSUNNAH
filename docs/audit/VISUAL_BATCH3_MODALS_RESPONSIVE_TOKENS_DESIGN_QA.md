# Visual Batch 3 — Modals · Responsive · Tokens · Automated Design QA

Date: 2026-10-03 · Branch: `cursor/visual-batch3-modals-responsive-tokens-design-qa` · Base: `cdc1e6ee8` (#2494)

## Migrations

### Modals / overlays
- `ComingSoonDialog` → `AppBottomSheet` + primary CTA (`Button`/`Link` to `/sections`)
- `HomeCustomizeSheet` → `AppBottomSheet` (removed DIY portal/overlay)

### Tokens authority
- Extended `DESIGN_TOKENS_AUTHORITY` with motion · focus · a11y · sheet/alert/toast/drawer · status.noResults/permission/rateLimited
- Paths now **125** (was ~100)
- `DESIGN_TOKENS_AUTHORITY.md` groups updated

### Token compliance automation
- Rogue checks expanded: important · inlineColors · rawButtons · unauthorizedRecipes (component path bindings)
- `token-compliance-report.mjs --check` enforces ceilings + component authority bindings

### Design QA regeneration
- `token-compliance-report` · `authority-coverage-report` · `design-governance-report` re-run
- Consistency score / drift / authority reports refreshed

### Responsive
- No parallel breakpoint ladder introduced; a11y paths map to `--content-max` / `--page-pad-x` / safe-area
- Mushaf geometry untouched (SPECIAL_CASE)

## Metrics

Held at Batch2 ceilings (no debt growth):

| Signal | Value | Ceiling |
|---|---:|---:|
| boxShadowDecls | 986 | 986 |
| borderRadiusPxDecls | 392 | 392 |
| important | 4747 | 4747 |
| rawButtonFiles | 102 | 102 |
| sfTokenRefs | 1128 | floor raised |
| officialButtonImportFiles | 262 | floor 262 |

## Exits

- MODAL_AUTHORITY_PROGRESS
- TOKEN_AUTHORITY_EXTENDED
- TOKEN_COMPLIANCE_ENFORCED
- DESIGN_QA_AUTOMATION_ACTIVE
- RESPONSIVE_AUTHORITY_HELD
- DESIGN_DEBT_HELD (no ceiling rise)
