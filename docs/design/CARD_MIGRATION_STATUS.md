# CARD MIGRATION STATUS

| Field | Value |
|---|---|
| Captured | 2026-09-29 (Debt Reduction Wave 2) |
| Authority | `CARD_SURFACE_AUTHORITY.md` |
| Canonical | `AppCard` · `InteractiveCard` · `StatusCard` · `InsetSurface` · `ElevatedSurface` · `SectionEntryCard` / `NavigationCardV2` |
| Forbidden | CardV3 · new HubCard system · delete `soft-cards.css` before consumers=0 |

## Measured

| Metric | Count |
|---|---:|
| Product TSX soft-card **consumers** (excl. AppCard + main import) | **0** |
| `soft-cards.css` product import | `main.tsx` → `loadNonCriticalCss` (**still required** — AppCard bridge) |
| AppCard implementation | Still bridges soft-card tokens (authority) |

## Status

| Layer | Status |
|---|---|
| Authority primitives | **ACTIVE** |
| Direct soft-card className consumers | **CLEARED** (Wave 2) |
| soft-cards.css | **KEEP runtime** until AppCard no longer needs bridge |
| Map | `docs/design/SOFT_CARD_CONSUMER_MAP.md` |

## Next FIXABLE waves

1. Move AppCard off soft-cards CSS internals onto `--sf2-*` only.  
2. Drop `soft-cards.css` import when AppCard no longer emits soft-card classes.  
3. Lower visual debt ceilings only after measured drop.

## Explicit non-claim

`SOFT_CARDS_RETIRED` is **not** declared (CSS bridge remains).
