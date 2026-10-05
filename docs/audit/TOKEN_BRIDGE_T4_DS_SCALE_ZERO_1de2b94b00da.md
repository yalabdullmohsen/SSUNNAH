# T4 — Zero-var() DS scale/motion/type alias removal

TASK_CLASSIFICATION: SHARED_PLATFORM

## Result

Removed **48** `--ds-*` declarations with proven `var()` consumers = 0 across `src/**`.

Not touched (quality-campaign / keep-compat):

`--ds-background` · `--ds-surface` · `--ds-surfaceElevated` · `--ds-textPrimary` ·
`--ds-textSecondary` · `--ds-accent` · `--ds-border` · `--ds-muted` · `--ds-danger` ·
`--ds-success` (+ related design-tokens bridges that remain declared).

## Metrics

| Metric | Before | After |
|---|---:|---:|
| hexInCss | 5553 | **5550** (−3) |
| rgbHslInCss | 1961 | **1959** (−2) |
| important | 4720 | 4720 |
| cssFiles | 353 | 353 |

Ceiling hexInCss / rgbHslInCss lowered to measured. NO_CEILING_RAISE. NO_GATE_WEAKENING.

## Files

- `styles/ssunnah-ds-canonical.css`
- `styles/design-system.css`
- `styles/index-deferred-pages.css`

Exit: `ZERO_CONSUMER_ALIAS_REMOVED` · `BRIDGE_CONSUMERS_REDUCED` · `QUALITY_CAMPAIGN_CONTRACT_HELD` · `NO_NEW_TOKEN_FAMILY`
