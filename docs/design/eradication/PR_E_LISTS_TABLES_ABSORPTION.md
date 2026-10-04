# PR E / Wave 2 — Lists + Tables consolidation

TASK_CLASSIFICATION: SHARED_PLATFORM  
Program tip base: `c843712d` (Wave 1C MERGED_AND_DEPLOYED · Production MATCH)  
Exit marker: `LIST_TABLE_AUTHORITY_CONSOLIDATED`

## Platform impacts

- WEB_IMPACT: ProphetStories compare table on `ui/table` + `.ss-data-table`; dead ListRow removed; duplicate `.content-detail-table` recipe deleted from reading shell
- IOS_APPLICATION_IMPACT: shared WebView CSS/JS only; no native binary; no Build
- APP_STORE_PRODUCT_IMPACT: none
- SHARED_PLATFORM_IMPACT: LIST/TABLE authority maps + gate hardened for PR E

## Forbidden assumptions (explicit)

- WEB_PASS ≠ IOS_PASS
- IOS_BUILD_PASS ≠ APP_STORE_READY
- No App Store / TestFlight / Production SQL / Quran / prayer / search ranking edits

## What changed

### Tables
1. `ProphetStoriesPage` CompareView: raw `<table className="nb-table">` → `Table`/`TableHeader`/… + `className="ss-data-table nb-table"`
2. Retained page modifiers: `nb-table__row--azm`, `nb-table__row--clickable`, `nb-table__name`, `nb-table__azm`, `nb-table__count` (KEEP_TEMPORARILY_WITH_EVIDENCE)
3. `.content-detail-table` duplicate block removed from `content-reading-shell.css` — recipe owned by `.ss-data-table` + unify absorb alias
4. `AnnualCourseDetailView` already APPROVED (`ui/table` + `ss-data-table content-detail-table`)
5. `UniversitiesComparePage` already APPROVED

### Lists
1. `ListRow` in `mj.tsx` / `ui-common` — **DEAD_WITH_PROOF** and removed (rg: zero TSX consumers outside definition/re-export; also listed in `docs/refactor/unused-exports.md`)
2. Canonical façades unchanged: `SimpleList` · `InteractiveList` · `NavigationList` · `ResultList` · `SettingsList`

### Orphans classified (not deleted without Wave J proof)
| Item | Class | Evidence |
|---|---|---|
| `.quran-numbers-table*` CSS | DEAD_WITH_PROOF | No TSX class consumer; page uses cards |
| `.mj-row` theme CSS | DEAD_WITH_PROOF | Only served removed ListRow |
| Admin `*-table` natives | SPECIAL_CASE | ADMIN_ONLY |
| `PrayerAnnualTimetable` | SPECIAL_CASE | Prayer chrome locked |

## Authority destinations

| Family | Destination |
|---|---|
| Product data tables | `ui/table` + `.ss-data-table` |
| Settings / nav lists | `NavigationList` / `SettingsList` |
| Content / result lists | `SimpleList` / `ResultList` / `VirtualList` |
| Admin grids | SPECIAL_CASE (out of PR E code move) |

## Outputs

- LIST_TABLE_AUTHORITY_CONSOLIDATED
- PROPHET_COMPARE_ON_TABLE_AUTHORITY
- CONTENT_DETAIL_TABLE_RECIPE_DEDUPLICATED
- LISTROW_DEAD_WITH_PROOF_REMOVED
- NO_BASELINE_CEILING_RAISE
- NO_QURAN_INTEGRITY_CHANGE
- NO_PRAYER_SEMANTICS_CHANGE

## Gates

```bash
pnpm --filter @workspace/majalis run test:table-list-authority
pnpm --filter @workspace/majalis run verify:preflight
```

## Rollback

Revert this PR. No Production SQL, no binary, no token-family addition.
