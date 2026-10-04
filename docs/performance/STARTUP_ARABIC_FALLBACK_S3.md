# STARTUP_ARABIC_FALLBACK_S3 — PR S3

**TASK_CLASSIFICATION:** SHARED_PLATFORM  
**Program tip base:** main after S5 (`31e2092a`)

## Contract

| Face | Role | Metrics |
|---|---|---|
| Amiri | UI/reading primary | `font-display: optional` · ascent 95% · descent 25% · line-gap 0% |
| MajlisAmiriFallback | Metric-aligned local stack | size-adjust **97%** (measured) · same ascent/descent/line-gap |
| MajlisFallback | Secondary local stack | size-adjust **97%** · same overrides |

Surfaces kept in sync:

- `index.html` `#mj-lcp-critical` — `MajlisAmiriFallback` at 97% (critical budget held)
- `src/styles/critical-first-paint.css` — both fallback faces at 97%
- `src/styles/fonts-ui.css` — both fallback faces at 97%

`MajlisFallback` is not duplicated into the HTML critical block (keeps CRITICAL_CSS_BUDGET_HELD).

Evidence: `artifacts/majalis/reports/ui-fallback-metrics.json` — best 97% (Δ≈13.8) vs 105% (Δ≈33.0).

## Rules

- Do not block splash on Amiri download (`font-display: optional`).
- Do not change Quran / QPC fonts.
- Do not preload every font file.
- No blank-text strategy (`font-display: optional` / swap avoided for UI Amiri).

## Outputs

- ARABIC_FALLBACK_METRICS_ALIGNED
- FONT_METRIC_SHIFT_REDUCED
- NO_TEXT_INVISIBLE_PERIOD
- NO_QURAN_FONT_CHANGE
