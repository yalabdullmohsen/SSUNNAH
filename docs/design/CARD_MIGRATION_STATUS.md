# CARD MIGRATION STATUS

| Field | Value |
|---|---|
| Captured | 2026-09-29 |
| Authority | `CARD_SURFACE_AUTHORITY.md` |
| Canonical | `AppCard` · `InteractiveCard` · `StatusCard` · `InsetSurface` · `ElevatedSurface` · `SectionEntryCard` / `NavigationCardV2` |
| Forbidden | CardV3 · new HubCard system · delete `soft-cards.css` before consumers=0 |

## Measured

| Metric | Count |
|---|---:|
| Files matching `soft-card` / soft-cards refs | **~169** (tsx+css+tests) |
| `soft-cards.css` product import | `main.tsx` → `loadNonCriticalCss` (**still required**) |
| AppCard implementation | Still bridges soft-card tokens (authority) |

## Status

| Layer | Status |
|---|---|
| Authority primitives | **ACTIVE** |
| soft-cards.css | **KEEP runtime** until AppCard no longer needs bridge + class consumers=0 |
| Section hubs using SectionEntryCard | **PARTIAL** (MergedSectionHub etc.) |
| HadithCard / UniversityCard / SectionCard | **LEGACY_CONSUMERS** — PORT follow-up |

## Next FIXABLE waves

1. Port className `soft-card` call sites → `AppCard` / `InteractiveCard`.  
2. Move AppCard off soft-cards CSS internals onto `--sf2-*` only.  
3. Drop `soft-cards.css` import when ripgrep consumer count for product classes = 0.  
4. Lower visual debt ceilings only after measured drop.

## Explicit non-claim

`SOFT_CARDS_RETIRED` is **not** declared.
