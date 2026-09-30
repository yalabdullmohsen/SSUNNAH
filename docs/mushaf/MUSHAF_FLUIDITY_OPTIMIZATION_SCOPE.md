# Mushaf Fluidity Optimization — Scope Manifest

**Branch:** `cursor/mushaf-fluidity-optimization`  
**Base:** latest `origin/main`  
**Goal:** Maximize page-turn fluidity; remove user-perceived delay. Not WAVE6 reopen.

## In scope

| Area | Change |
|---|---|
| Telemetry / audit | `pointerUp` · `visualTransitionEnd` · `productUnlock` · fluidity audit harness + BEFORE/AFTER JSON |
| Verse sync | Skip ayah sync-store subscriptions on non-settled / non-current panes |
| Prefetch | Direction-aware: prefer ±1 in turn direction eager; opposite ±1 + ±2 on idle |
| Reader turn path | Skip no-op `clearPageChrome`; avoid neighborEpoch re-renders; pan path telemetry-only |
| Overlays | Keep selection/bookmarks frozen while `!pagerSettled` (strengthen sync freeze) |
| Report | `docs/mushaf/MUSHAF_FLUIDITY_OPTIMIZATION_REPORT.md` |
| Gate | `test:mushaf-fluidity-optimization` |

## Out of scope / frozen

- Quran text · tashkeel · ayah numbers · page mapping · 604 pages · 15-line geometry · QPC woff2 assets · audio mapping
- WAVE6 state machine redesign (`mushaf-page-turn-phase` ownership)
- Raising settle budget / disabling integrity gates

## Acceptance

- Measured delta on repo harness (sync-store fanout · font cache-hit path · prefetch scheduling · unlock marks)
- WAVE6 gates PASS · page-flip / checksum / mapping PASS
- Device wall-clock: DEVICE_REQUIRED residual (classified in report)

## IMPLEMENTATION_FROZEN

**YES** — product patches + audit artifacts + report landed.  
Next: focused gates → `verify:preflight` → `verify:ci` → PR Ready.
