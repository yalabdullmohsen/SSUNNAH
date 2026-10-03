# PERFORMANCE_EXCELLENCE_PROGRAM — سُنّة

| Field | Value |
|---|---|
| Status | **ACTIVE** |
| Date | 2026-10-03 |
| Exit | `PERFORMANCE_EXCELLENCE_ENGINE` |
| Script | `artifacts/majalis/scripts/performance-excellence-engine.mjs` |
| Gate | `test:performance-excellence` |

**Numbers first. No speculative fixes.** Wall-clock CPU/network/FPS remain DEVICE_REQUIRED unless already measured in baseline docs.

## Phases BF–BJ

| Phase | Output |
|---|---|
| REACT_RENDER_COST_AUDIT | `RENDER_COST_REPORT` |
| MUSHAF_PERFORMANCE_DEEP_DIVE | `MUSHAF_BOTTLENECK_REPORT` |
| STARTUP_PERFORMANCE_ELIMINATION | `STARTUP_PERFORMANCE_REPORT` |
| NETWORK_EFFICIENCY_PROGRAM | `NETWORK_EFFICIENCY_REPORT` |
| PERFORMANCE_BUDGET_ENFORCEMENT | `PERFORMANCE_BUDGET_REPORT` · `PERFORMANCE_DRIFT_ALERTS` |

## Existing CI budgets (do not weaken)

| Hook | Role |
|---|---|
| `test:bundle-budget` | Entry JS ≤120 KiB gzip · CSS ≤100 · icons ≤30 |
| `check-performance-budget.mjs` | `performance-budget.json` + LHCI thresholds |
| `test:critical-css-budget` | Critical CSS ≤60 KiB gzip |
| `test:lhci-budget` | Home mobile vitals |

## Non-claims

لا UNIFIED_100 · لا ادّعاء تحسّن زمن بدون قياس جهاز · Mushaf SPECIAL_CASE.
