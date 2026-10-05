# PERFORMANCE_BUDGET_REPORT

Generated: 2026-10-05T17:15:47.805Z

## Declared budgets

| Budget | Value |
|---|---|
| JS initial gzip (perf JSON) | 250 KiB |
| CSS initial gzip (perf JSON) | 80 KiB |
| Entry JS gzip (build gate) | 120 KiB |
| Mushaf route JS soft | 40 KiB |
| Critical CSS gzip | 60 KiB |
| LCP | 2500 ms |
| CLS | 0.05 |

## Live bundle

- entryJsGzipKiB: **104.09** KiB
- cssGzipKiB: **28.71** KiB
- mushafPageJsGzipKiB: **30.41** KiB

## PERFORMANCE_DRIFT_ALERTS

- none

## CI hooks

- pnpm --filter @workspace/majalis run test:bundle-budget (post-build)
- node scripts/check-performance-budget.mjs
- node scripts/test-critical-css-budget.mjs
- test:lhci-budget / verify:lhci-threshold-calibration
- test:performance-excellence (this engine — static + alerts)
