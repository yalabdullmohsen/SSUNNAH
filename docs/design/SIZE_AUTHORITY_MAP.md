# SIZE_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `SIZE_AUTHORITY_ONLY` |
| Code | `artifacts/majalis/src/lib/size-authority.ts` |

One sizing language for controls and chrome. Touch floor = 44px.

## Approved dimensions

| Surface | Token / rule |
|---|---|
| Touch / control height | `--touch-min` (44) · `--touch-comfortable` (48) |
| Buttons | `Button` sizes small/medium/large → ≥ touch-min |
| Form fields | `Input` / `SearchInput` min-h-11 / `--touch-min` |
| Icon boxes | `--sf2-icon-box` · `--sf2-icon-box-sm` |
| Icon glyphs | 16 / 18 / 22 / 24 (`ICON_SIZE_SCALE`) |
| Tabs | `--ss-tab-min-height` |
| Table header | ≥ 2.5rem (`.ss-data-table th`) |
| Modal width | `max-w-lg` default (modal authority) |
| Chips / badges | min-height touch-min for interactive chips |
| Bottom nav | `--bottom-nav-height` |
| Radius | `--sf-radius-control` · `--radius-card` |

## Classification

| Surface | Class |
|---|---|
| touch tokens · Button/Input sizes · sf2 icon boxes | APPROVED |
| Hard-coded `44px` that should be `var(--touch-min)` | LEGACY → absorb |
| Mushaf page/ayah chrome sizes | SPECIAL_CASE |
| Admin dense table rows | SPECIAL_CASE |

## Forbidden

- Controls < 44×44 interactive hit area (product)
- Parallel icon scale kits per page
- Modal width recipes outside Dialog/Sheet authority

## Gates

`test:spacing-size-a11y-contrast-authority` · button / form / tab gates
