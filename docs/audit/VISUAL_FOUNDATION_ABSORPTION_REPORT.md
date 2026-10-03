# VISUAL_FOUNDATION_ABSORPTION_REPORT

| Field | Value |
|-------|-------|
| Status | `VISUAL_FOUNDATION_ABSORBED` (partial→improved) |
| Date UTC | 2026-10-03 |
| Prior class | `UNIFIED_PARTIAL` |
| Authority | sunnah-foundation-tokens · WAVE7 FOUC gates · identity cascade |

## Goals addressed

| Goal | Result |
|------|--------|
| Absorb legacy compatibility layers | `sins-rights` page: inline color styles → `sins-rights.css` tokenized rules |
| Remove obsolete reload dependencies | No new reload-to-win; WAVE7 / U8 gates still forbid unify/recovery reload-to-win after final-release |
| Single foundation authority | `--sf-*` / `--ss-*` floors held/raised; `mjDeclOutsideAllowlist = 0` |
| Preserve visual parity | RTL / Light / Dark / contrast / snapshots — no intentional visual redesign |

## Absorption delta (this wave)

- `SinsAndRightsPage.tsx` — removed inline `style={{ color / background }}` drift; classes in `sins-rights.css`.
- Foundation sync imports in `main.tsx` unchanged (ATF: foundation + theme + interaction-states).
- Deferred identity inventory remains KEEP_JUSTIFIED (U8).

## Preserved

- RTL · Light · Dark · contrast gates · visual snapshots · Mushaf CSS boundary

## Remaining (classified)

| Item | Class |
|------|-------|
| Deferred unify/recovery CSS (54 deferred imports) | KEEP_JUSTIFIED (LHCI unused-css) |
| theme-aliases / soft-card retirement compat vars | KEEP_JUSTIFIED |
| Page-local CSS volume (hex/!important stock) | VISUAL_DEBT_REDUCTION (ceilings held) |
| Device screenshot parity | DEVICE_REQUIRED |

## Exit

```text
VISUAL_FOUNDATION_ABSORBED
UNIFIED_PARTIAL_IMPROVED
NO_RELOAD_TO_WIN_REGRESSION
SNAPSHOT_PARITY_PRESERVED
```
