# MUSHAF_FLUIDITY_IMPLEMENTATION_PLAN

Status: MEASUREMENTS_FIRST · no Quran text/page/ayah/604 changes  
Base tip: production MATCH `bb76d0f3` (pre endgame merge) · refresh after deploy  
Authority: SUNNAH_AUTONOMOUS_ENDGAME_MODE · Phase E  
Baseline refs: `docs/mushaf/WAVE6_MUSHAF_FLUIDITY_BASELINE.md` · turn telemetry hooks already in tree

## Scope

Instrument and measure only:

1. page turn latency (gesture → paint of target page)
2. lock duration (interaction lock while turning)
3. font readiness (QPC page font loaded before paint)
4. subscription cost (React subscribers / store listeners per turn)
5. neighbor rendering cost (prefetch ±1 page mount/paint)

## Non-goals

- No Quran text edits
- No page/ayah mapping changes
- No 604 structure changes
- No visual redesign in this plan phase

## Telemetry hooks (activate)

| Metric | Hook site | Unit |
|---|---|---|
| page_turn_ms | MushafReaderPage / page controller turn commit | ms |
| lock_ms | interaction lock acquire→release | ms |
| font_ready_ms | useQpcPageFont ready flag | ms |
| subscription_count | mushaf store listener cardinality at turn | count |
| neighbor_render_ms | adjacent page mount/paint | ms |

Proposed module: `artifacts/majalis/src/features/mushaf-shared/mushaf-fluidity-telemetry.ts`  
Emit to `performance.measure` + optional `window.__mjMushafFluidity` ring buffer (dev/LHCI only).

## Sample plan

- Device: iPhone-class 390×844
- Pages: 1, 2, 3, 283, 600
- Turns: 20 consecutive forward + 20 backward (cold font + warm font)
- Record p50/p95 for each metric

## Exit for this phase

`MUSHAF_FLUIDITY_IMPLEMENTATION_PLAN` published with hook map + sample protocol.  
Optimizations = follow-up after baseline numbers exist.
