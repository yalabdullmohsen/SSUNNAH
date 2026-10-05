# T1 — Zero-consumer token alias removal

TASK_CLASSIFICATION: SHARED_PLATFORM

## Result

Removed **29** alias-only `--ds-*` / `--majalis-*` declarations with `var()` consumers = 0.

Excluded after live recount: `--ds-text` (743 uses), `--majalis-bg` (2 uses).

Kept (quality-campaign gate): `--ds-muted`, `--ds-danger`, `--ds-success` as semantic bridges in `design-tokens.css`.

## Metrics

| Metric | Before | After |
|---|---:|---:|
| hexInCss | 5571 | **5569** (−2) |
| important | 4720 | 4720 |
| cssFiles | 353 | 353 |

Ceiling hexInCss lowered to 5569. NO_CEILING_RAISE.

## Files

- `styles/ssunnah-ds-canonical.css`
- `styles/brand-v4.css`
- `styles/design-tokens.css`
- `styles/design-system.css`

Exit: ZERO_CONSUMER_ALIAS_REMOVED · BRIDGE_CONSUMERS_REDUCED · NO_NEW_TOKEN_FAMILY
