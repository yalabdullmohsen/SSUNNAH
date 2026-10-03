# Visual W–Z — Search · Filter · State · Responsive

Date: 2026-10-03 · Branch: `cursor/visual-unification-wave`

## Phase W — SEARCH_AUTHORITY_ONLY

| Class | Surfaces |
|---|---|
| APPROVED | SearchInput · SearchField→SearchInput · GlobalSearchModal · SearchResultCard |
| SPECIAL_CASE | Admin search · Mushaf jump search |
| LEGACY | raw `page-search-input` DIY |

Map: `docs/design/SEARCH_AUTHORITY_MAP.md`  
Exemplar: TawbaPage → SearchInput · CSS absorb `.ss-search-input` / `.page-search-input`

## Phase X — FILTER_AUTHORITY_ONLY

Map: `docs/design/FILTER_AUTHORITY_MAP.md`  
Kit: `components/filters/*` · façade `FilterSystem.tsx`

## Phase Y — STATE_AUTHORITY_ONLY

Map: `docs/design/STATE_AUTHORITY_MAP.md`  
= Feedback V2 / STATUS language · `StateSystem.tsx` façades

## Phase Z — RESPONSIVE_SYSTEM_UNIFIED

Map: `docs/design/RESPONSIVE_AUTHORITY_MAP.md`  
SoT: `styles/breakpoints.css`

## Gate

`test:search-filter-state-authority`

## Non-claims

لا ترحيل لكل `page-search-input` · لا إعادة كتابة فلاتر Admin · لا UNIFIED_100
