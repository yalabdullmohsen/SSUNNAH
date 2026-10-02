# MUSHAF_FLUIDITY_PLAN — Measured opportunities only

| Field | Value |
|-------|-------|
| Tip | `0c4e808f` |
| Authority | `docs/mushaf/MUSHAF_HEAVINESS_AND_PAGE_TURN_REPORT.md` |
| U4 note | `/mushaf` startup CLS = 0 on tip (chrome stable); fluidity ≠ startup CLS |
| Forbidden | Quran text · mapping · ayah positions · 604 · 15-line · QPC SoT rewrite |

## Measured architecture facts

1. Production path `/mushaf` → NewMushafReader → ≤3 page boards of per-word DOM.
2. 604 QPC WOFF2 fonts (~158 KiB avg) · `fontReady` gates product unlock.
3. Dual lock: visual settle (~220ms) + font/layout/displayView (up to ~2800ms).
4. Per-word subscriptions for selected/playing/search amplify cost with audio.

## Telemetry (existing flags — measure before optimize)

- `mushaf-turn-telemetry=1`
- `mushaf-experience-perf=1`
Capture: touch→translate · pointerup→transitionend · transitionend→finish · dropped frames · ×25/100 · with/without recitation.

## Optimization candidates (only after device/local numbers)

| ID | Opportunity | Risk | Gate |
|----|-------------|------|------|
| F1 | Separate visual lock from product lock | Medium | mushaf-gates + device turns |
| F2 | Prefetch fonts ±2 on idle | Medium | network/cache budgets |
| F3 | Lift ayah subscriptions above word nodes | Medium–High | audio highlight correctness |
| F4 | Defer non-visible neighbor paint | Medium | pager correctness |
| F5 | Isolate audio snapshots from word tree | Medium | player sync |
| F6 | Tune slop/ignore after measurement only | Low–Medium | gesture regressions |

## Exit for this phase

`MUSHAF_FLUIDITY_PLAN` documented — **no speculative rewrite shipped in this program turn**.
Next executable mushaf work = run telemetry on tip build, then one measured PR.
