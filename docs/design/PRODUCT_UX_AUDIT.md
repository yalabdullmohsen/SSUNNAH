# Product UX Audit — سُنّة (Wave 1)

**Date:** 2026-09-27  
**Scope:** Evidence-based audit; foundations only (no page redesign in this wave).  
**Inventory:** `ROUTE_COMPONENT_INVENTORY.md`

## Confirmed global defects (user + CI)

| Problem | Shared root | Wave |
|---|---|---|
| Nested cards / oversized surfaces | Multiple card CSS layers + soft-card min-heights | 1 contract → 3–8 migrate |
| Low-contrast / washed text | Fragmented tokens; some muted hex below AA | 1 `--sf2-text-*` + existing contrast gate |
| White route flash | Suspense + theme CSS timing | Prayer mitigated #2306; generalize Wave 2/5 |
| Floating controls cover content | ScrollToTop + FAB + bottom nav clearance | Wave 2 |
| Decorative grids / glossy heroes | Home hero CSS | Wave 3 (#2304 open) |
| Contrast NOT_FOUND on redesign PRs | Stale selectors after DOM change | #2304 gate fix in flight |
| Invalid search destinations | Index/route drift | #2303 merged |

## Contrast diagnosis (current)

| Baseline | Status |
|---|---|
| Main Color contrast after #2307 | Green on `a9e7bf87` (tawhid dark desc) |
| Lessons #2305 | Merged; HARD_WHITE_BG fixed |
| Homepage #2304 | Open — selector/scroll contracts |
| Preferred palette vs Foundation PR-1 | **Already aligned** (`#15382D` / `#48645A` / `#5F7168` / `#0F5C3F` / `#F8F6F1`) |

Wave 1 does **not** lower thresholds. Foundation V2 aliases PR-1 and adds status/focus/skeleton roles.

## Route-level summary

See inventory table. Highest user impact:

1. Home — hierarchy / clutter  
2. Lessons — density / actions  
3. Quran hub — priority of resume  
4. Fiqh detail — source vs editorial separation  
5. Prayer — first frame (partially shipped)  
6. Search — destination integrity (shipped P1)

## Shared component debt

- Many token CSS files loaded in sequence (`brand-v4`, `tokens`, `design-tokens`, `visual-redesign-v2`, `semantic-layer`, …).  
- Card System exists but pages still invent surfaces.  
- EmptyStateV2 adopted unevenly; loading/error not unified.

## Wave 1 deliverables

- Foundation V2 (`--sf2-*`)  
- Card System V2 taxonomy components + CSS  
- LoadingStateV2 / ErrorStateV2 + `app-state-v2.css`  
- Design docs listed in `VISUAL_MIGRATION_PLAN.md`

## Non-claims

- `SUNNAH_COMPLETE_REDESIGN_COMPLETE` — not declared  
- Physical device — `DEVICE_REQUIRED`  
- Store GO — not claimed  
