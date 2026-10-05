# Token Bridge T5 — zero-consumer DS surface/state aliases

TASK_CLASSIFICATION: SHARED_PLATFORM

## Removed (6) — declaration-only, zero `var()` consumers

- `--ds-backgroundSubtle`
- `--ds-borderStrong`
- `--ds-disabled`
- `--ds-overlay`
- `--ds-skeletonBase`
- `--ds-skeletonHighlight`

## Held

- Quality-campaign: muted / danger / success (+ background/surface/text/accent/border)
- Governance: `--ds-durationFast` → `--motion-fast`

## Metrics

| Metric | Before | After |
|---|---:|---:|
| hexInCss | 5550 | **5546** |

Ceilings lowered. NO_GATE_WEAKENING. NO_CEILING_RAISE.

Gate: `pnpm run test:token-bridge-t5`
