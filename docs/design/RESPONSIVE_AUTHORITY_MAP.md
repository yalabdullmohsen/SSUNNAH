# RESPONSIVE_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `RESPONSIVE_SYSTEM_UNIFIED` |
| Source of truth | `styles/breakpoints.css` · `docs/design/RESPONSIVE_AND_SAFE_AREA_SPEC.md` |

One breakpoint ladder. Do not invent parallel px grids in page CSS.

## Approved tokens

| Token | Value |
|---|---|
| `--bp-xs` … `--bp-lg` | phone band 320–430 |
| `--bp-tablet` / `--bp-ipad-air` | 768 / 834 |
| `--bp-desktop` / `--bp-laptop*` | 1024+ |
| `--content-max` / `--content-max-wide` | reading measure |
| `--page-pad-x` · `--touch-min` | padding + touch |
| Safe area | `env(safe-area-inset-*)` · chrome insets |

## Behavior contract

| Surface | Rule |
|---|---|
| Navigation | BottomNav mobile · drawer/side on larger — nav authority |
| Cards | scale via surface tokens · no page-unique card breakpoints |
| Tables | horizontal scroll / stack — table authority |
| Forms | full-width controls · SearchInput ≥16px mobile |
| Modals / sheets | center dialog desktop · AppBottomSheet mobile preference |
| Typography | identity scale · no ad-hoc media font kits |
| Mushaf | SPECIAL_CASE layout bands |

## Classification

| Surface | Class |
|---|---|
| breakpoints.css · page-shell measure · safe-area chrome | APPROVED |
| ios-edge / ipad-responsive helpers consuming tokens | APPROVED |
| Hard-coded `@media (max-width: Npx)` parallel ladders | LEGACY |
| Mushaf reader geometry | SPECIAL_CASE |

## Forbidden

- Second breakpoint scale in a feature CSS file
- Ignoring BottomNav / safe-area on sticky filters
- Desktop-only patterns that break 390/430 phone

## Gates

`test:search-filter-state-authority` · existing responsive / safe-area gates
