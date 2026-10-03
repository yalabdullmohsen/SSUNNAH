# SEARCH_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `SEARCH_AUTHORITY_ONLY` (product) |
| Architecture | `docs/design/UNIFIED_SEARCH_ARCHITECTURE.md` |
| Façades | `design-system/SearchSystem.tsx` · `FormFields.SearchInput` |

One search language. Global discovery via `/search` + GlobalSearchModal; in-page fields via `SearchInput`.

## Approved

| Intent | Component / path |
|---|---|
| Search field | `SearchInput` (FormFields) · `SearchField` compat → SearchInput |
| Global / command search | `GlobalSearchModal` → `/search` · `runAppSearch` |
| Result cards | `SearchResultCard` |
| Suggestions / history | product search UX (`SearchSuggestions` · search-history) |
| Highlighting | `highlightOriginalParts` / `.srch-hl` |
| Empty / no results | `NoResultsState` · `EmptyStateV2` (state authority) |
| Filters on search | Filter authority (`SegmentedFilter` / scopes) |

## Classification

| Surface | Class |
|---|---|
| SearchInput · SearchResultCard · GlobalSearchModal · unified-local /search | APPROVED |
| SearchField (mj) wrapping SearchInput | APPROVED (compat) |
| Admin search chrome | SPECIAL_CASE |
| Mushaf / quran jump search sheets | SPECIAL_CASE |
| Raw `<input type=search class=page-search-input>` DIY | LEGACY — migrate when touched |

## Contract

| Rule | Value |
|---|---|
| Field height | ≥ `--touch-min` (44px) |
| Font size mobile | ≥ 16px (no iOS zoom) |
| Clear action | optional IconButton via SearchInput `onClear` |
| Results layout | `SearchResultCard` family language |
| Loading / empty | Feedback V2 / STATE map |
| No auto-nav on single hit | gated (`search-no-autonav`) |

## Gates

`test:search-filter-state-authority`
