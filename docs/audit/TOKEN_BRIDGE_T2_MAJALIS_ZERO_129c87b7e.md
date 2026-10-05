# T2 — Zero-consumer `--majalis-*` alias removal

TASK_CLASSIFICATION: SHARED_PLATFORM

WEB_IMPACT: token bridge debt reduced  
IOS_APPLICATION_IMPACT: none  
APP_STORE_PRODUCT_IMPACT: none  
SHARED_PLATFORM_IMPACT: hex/rgb ceilings lowered

## Removed (var()=0, string refs=0)

- `--majalis-blue` / `--majalis-blue-deep` / `--majalis-blue-soft`
- `--majalis-shadow-lg` / `--majalis-shadow-xl`
- `--majalis-ivory`
- `--majalis-surface-hover` / `--majalis-surface-muted`
- `--majalis-warning`

Sources: `src/index.css`, `src/styles/dark-mode-recovery.css`.

## Kept with evidence

- `--majalis-success` — string authority in `color-authority.ts`
- Live `--majalis-shadow` / `--majalis-surface-2` / brass / emerald family consumers

## Metrics

| Metric | Before | After |
|---|---:|---:|
| hexInCss | 5569 | **5557** (−12) |
| rgbHslInCss | 1970 | **1961** (−9) |

NO_CEILING_RAISE · NO_NEW_TOKEN_FAMILY

Exit: ZERO_CONSUMER_ALIAS_REMOVED · BRIDGE_CONSUMERS_REDUCED · DEBT_REDUCED
