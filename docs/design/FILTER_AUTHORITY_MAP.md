# FILTER_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `FILTER_AUTHORITY_ONLY` (product) |
| Kit | `components/filters/*` · façade `design-system/FilterSystem.tsx` |

One filtering language. Prefer chips / segmented / sheet over page-local button rows.

## Approved

| Intent | Component |
|---|---|
| Single chip | `FilterChip` |
| Exclusive segmented choice | `SegmentedFilter` · `FilterChips` (wrapper) |
| Filter bar / search+filters row | `FilterBar` · `UnifiedFilterBar` · `UnifiedPrimaryFilters` |
| Advanced / mobile sheet | `FilterSheet` · `FilterToggle` · `FilterBottomSheet` |
| Applied filters | `ActiveFilters` |
| Reset / clear | `FilterResetButton` · ActiveFilters clear-all |
| Tab-like content filters | ContentTabs (tab authority) when sections — else SegmentedFilter |

## Classification

| Surface | Class |
|---|---|
| filters/* kit · FilterChips wrapper | APPROVED |
| Lesson / Hadith / Ruling filter composers using kit | APPROVED |
| Admin ReviewFilterBar / admin-v3 filters | SPECIAL_CASE |
| Page-local chip rows with hex / unique recipes | LEGACY |

## Contract

| Rule | Value |
|---|---|
| Touch | chip / control ≥ 44px |
| Active | mark + brand — not color-only |
| Spacing | shared gap (`filters.css` / identity) |
| Reset | always reachable when any filter applied |
| Empty after filter | `NoResultsState` (not Empty) |
| Mobile | prefer sheet for dense filter sets |

## Gates

`test:search-filter-state-authority`
