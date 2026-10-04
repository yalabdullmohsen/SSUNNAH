# PR G / Wave 4 — Navigation · Tabs · Search · Filters

TASK_CLASSIFICATION: SHARED_PLATFORM  
Program tip base: `97f6618d` (Wave 3 / PR F MERGED_AND_DEPLOYED · Production MATCH)  
Exit marker: `NAV_TABS_SEARCH_FILTERS_WAVE_G_ADVANCED`

## Platform impacts

- WEB_IMPACT: Quran Engine + Prophet story tabs on `ContentTabs`; Quran Numbers filters on `SegmentedFilter`
- IOS_APPLICATION_IMPACT: shared WebView only; no Build
- APP_STORE_PRODUCT_IMPACT: none
- SHARED_PLATFORM_IMPACT: TAB/FILTER authority maps + gate hardened

## What changed

| Surface | From | To | Class |
|---|---|---|---|
| `QuranEnginePage` mode nav | raw Button strip | `ContentTabs` pill | APPROVED |
| `ProphetStoryTabs` | DIY Button tablist | `ContentTabs` pill façade | APPROVED |
| `QuranNumbersView` theme/group | DIY role=tablist Buttons | `SegmentedFilter` | APPROVED (filter intent) |
| Search on Numbers | already `SearchInput` (PR F) | unchanged | APPROVED |

## Residual classification

| Bucket | Class | Evidence |
|---|---|---|
| Remaining ~60 page-local `role=tablist` | LEGACY → migrate when touched | Inventory via gate + WAVE4 JSON |
| Admin / review-hub tabs | SPECIAL_CASE_WITH_EVIDENCE | ADMIN_ONLY |
| Mushaf chrome tabs | SPECIAL_CASE_WITH_EVIDENCE | MUSHAF_SPECIAL |
| BottomNavBar | KEEP_JUSTIFIED / APPROVED | Navigation authority |
| GlobalSearchModal overlay div onClick | KEEP_JUSTIFIED_WITH_EVIDENCE | EVENT_DELEGATION |

## Outputs

- ENGINE_NAV_ON_CONTENT_TABS
- PROPHET_TABS_ON_CONTENT_TABS
- QURAN_NUMBERS_FILTERS_ON_SEGMENTED_FILTER
- NO_BASELINE_CEILING_RAISE
- NO_QURAN_INTEGRITY_CHANGE
- NO_SEARCH_RANKING_CHANGE

## Gates

```bash
pnpm --filter @workspace/majalis run test:tab-nav-authority
pnpm --filter @workspace/majalis run test:search-filter-state-authority
pnpm run verify:preflight && pnpm run verify:ci
```

## Rollback

Revert this PR. No SQL / binary / Quran text / prayer / search ranking edits.
