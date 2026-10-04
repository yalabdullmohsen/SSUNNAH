# TABLE_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-04 |
| Exit | `TABLE_AUTHORITY_ONLY` (product) |
| Canonical | `artifacts/majalis/src/components/ui/table.tsx` |
| Shared recipe | `artifacts/majalis/src/styles/ssunnah-card-unify.css` (`.ss-data-table`) |
| Wave | Eradication **PR E / Wave 2** |

No new table framework. Admin grids stay SPECIAL_CASE until admin-v3 wave.

## Approved

| Piece | Source |
|---|---|
| `Table` · `TableHeader` · `TableBody` · `TableRow` · `TableHead` · `TableCell` · `TableCaption` | `ui/table.tsx` |
| Product density / borders / hover | `.ss-data-table` (+ tokens `sf`/`mj`) |
| Empty / loading around tables | Feedback V2 (`EmptyStateV2` · `LoadingStateV2` · `NoResultsState`) |

## Classification

| Surface | Class | Notes |
|---|---|---|
| Product compare / stats / content tables using `ui/table` or `.ss-data-table` | **CANONICAL_AUTHORITY** / APPROVED | New work must use these |
| `UniversitiesComparePage` · `AnnualCourseDetailView` · `ProphetStoriesPage` CompareView | **APPROVED_VARIANT** | `ui/table` + `.ss-data-table` (+ page modifiers) |
| `content-detail-table` class on AnnualCourse | **ABSORB** bridge alias | Visual recipe owned by `.ss-data-table`; page CSS duplicate removed |
| `nb-table` modifiers (`__row--azm`, `__row--clickable`, `__name`) | **KEEP_TEMPORARILY_WITH_EVIDENCE** | Page-local prophet chrome on top of authority |
| `.quran-numbers-table` CSS (no TSX consumer) | **DEAD_WITH_PROOF** | Orphan page CSS; delete in Wave J after dynamic-selector proof |
| `admin-v3` `.av3-table*` · legacy `.admin-table` · section CRUD tables | **SPECIAL_CASE** | ADMIN_ONLY boundary |
| `PrayerAnnualTimetable` immersive | **SPECIAL_CASE** | Prayer chrome / contrast locked |
| Mushaf | **SPECIAL_CASE** | Not a data-grid surface |
| `InternalStatusPage` `.ds-table` | **SPECIAL_CASE** | Internal tooling only |

## Visual contract

| Rule | Value |
|---|---|
| Header cell | `TableHead` · min-height ≥ 40px · muted ink |
| Body cell | `TableCell` · padding token rhythm |
| Row hover | `hover:bg-muted/50` / `.ss-data-table` hover mix |
| Selected | `data-[state=selected]` |
| Borders | `--mj-hairline` / `--sf-hairline` — no page-local hex |
| Horizontal scroll | wrapper `overflow-x: auto` + touch scrolling (`.ss-data-table-wrap`) |
| Empty | never blank white void — Feedback V2 |

## Inventory (measured 2026-10-04 @ `c843712d` tip + Wave 2)

| Kind | Classification | Count |
|---|---|---:|
| Product `ui/table` + `.ss-data-table` | APPROVED | 3 pages |
| Native admin `<table>` | SPECIAL_CASE | 12 |
| Prayer annual | SPECIAL_CASE | 1 |
| Internal `.ds-table` | SPECIAL_CASE | 1 |
| Orphan `.quran-numbers-table` CSS | DEAD_WITH_PROOF | 1 family |

## Gates

```bash
pnpm --filter @workspace/majalis run test:table-list-authority
pnpm --filter @workspace/majalis run test:form-feedback-authority
```
