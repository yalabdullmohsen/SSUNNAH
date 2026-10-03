# Visual M–O — Tables · Lists · Data presentation

Date: 2026-10-03 · Branch: `cursor/visual-unification-wave`

## Phase M — Tables

| Class | Surfaces |
|---|---|
| APPROVED | `ui/table` + `.ss-data-table` (in `ssunnah-card-unify.css`) |
| LEGACY→absorb | content-detail / quran-numbers / nb-table borders → hairline tokens |
| SPECIAL_CASE | admin-v3 `.av3-table` · legacy admin CRUD · prayer annual · mushaf |

`UniversitiesComparePage` migrated to `Table*` primitives + `.ss-data-table`.

Map: `docs/design/TABLE_AUTHORITY_MAP.md` · Exit: **TABLE_AUTHORITY_ONLY** (product)

## Phase N — Lists

Façades in `ListSystem.tsx`:

| Name | Equivalent |
|---|---|
| SimpleList | ContentRow shell |
| InteractiveList | interactive row shell |
| NavigationList | SettingsList |
| ResultList | VirtualList |

Map: `docs/design/LIST_AUTHORITY_MAP.md` · Exit: **LIST_AUTHORITY_ONLY** (product)

## Phase O — Data presentation

`docs/design/DATA_PRESENTATION_AUTHORITY.md` — cards/tables/lists/badges/chips hierarchy.  
Exit: **DATA_PRESENTATION_UNIFIED** (contract + first absorbs)

## Gates

`test:table-list-authority` (wired into `test:sunnah-ui-refinement`)
