# TABLE_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `TABLE_AUTHORITY_ONLY` (product) |
| Canonical | `artifacts/majalis/src/components/ui/table.tsx` |
| Shared recipe | `artifacts/majalis/src/styles/ssunnah-card-unify.css` (`.ss-data-table`) |

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
| Product compare / stats / content tables using `ui/table` or `.ss-data-table` | APPROVED | New work must use these |
| `UniversitiesComparePage` · `AnnualCourseDetailView` | APPROVED | `ui/table` + `.ss-data-table` |
| `quran-numbers` · prophet `nb-table` · residual `content-detail-table` CSS | LEGACY → absorb | Shared hairline/padding via unify CSS |
| `admin-v3` `.av3-table*` · legacy `.admin-table` · section CRUD tables | SPECIAL_CASE | ADMIN_ONLY boundary |
| `PrayerAnnualTimetable` immersive | SPECIAL_CASE | Prayer chrome / contrast locked |
| Mushaf | SPECIAL_CASE | Not a data-grid surface |

## Visual contract

| Rule | Value |
|---|---|
| Header cell | `TableHead` · min-height ≥ 40px · muted ink |
| Body cell | `TableCell` · padding token rhythm |
| Row hover | `hover:bg-muted/50` / `.ss-data-table` hover mix |
| Selected | `data-[state=selected]` |
| Borders | `--mj-hairline` / `--sf-hairline` — no page-local hex |
| Horizontal scroll | wrapper `overflow-x: auto` + touch scrolling |
| Empty | never blank white void — Feedback V2 |

## Inventory (measured 2026-10-03)

| Kind | Files | Elements (approx) |
|---|---:|---:|
| Native `<table>` / `ui/table` consumers | 18 | 20 |
| Admin / admin-v3 | 12 | SPECIAL_CASE |
| Product / internal | 6 | APPROVED or LEGACY absorb |

## Gates

```bash
pnpm --filter @workspace/majalis run test:table-list-authority
pnpm --filter @workspace/majalis run test:form-feedback-authority
```
