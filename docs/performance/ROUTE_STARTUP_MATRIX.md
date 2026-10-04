# ROUTE_STARTUP_MATRIX — Wave 0

**Tip:** `eb2f0bdcc` · Light · scale 1.00 · 390×844 · cold cache · production

## Measured

| Route | FP | CLS | themeMut | font early→final | bg early→final | Residual class |
|---|---:|---:|---:|---|---|---|
| `/` | 692 | 0.0004 | 0 | 17→17 | F8F6F1→F8F6F1 | DEFERRED_SOFT_PAINT |
| `/search` | 1020 | 0.0016 | 0 | 17→17 | F8F6F1→F8F6F1 | DEFERRED_SOFT_PAINT |
| `/quran-hub` | 1020 | 0.0017 | 0 | 17→17 | F8F6F1→F8F6F1 | DEFERRED_SOFT_PAINT |
| `/mushaf` | 856 | 0.0000 | 0 | 17→17 | F8F6F1→F8F6F1 | EXPECTED |
| `/prayer-times` | 856 | ≈0 | 0 | 17→17 | transparent→#2a4030 | EXPECTED_ROUTE_TRANSITION |

## Not measured live in S0 (classified DEVICE_REQUIRED / UNMEASURED_LIVE)

- Dark / System light / System dark cold starts  
- Font scales 0.85 / 0.92 / 1.08 / 1.16 / 1.35 live paint  
- Tablet / desktop viewports  
- Warm cache vs cold  
- Authenticated route fixtures  
- Representative content deep route beyond hubs  
- Capacitor physical cold start  

Static contracts for font-scale and dark first-frame remain enforced by existing gates (`startup-typography-fouc-*`, `theme-boot-light-default`, dark chrome gates). Live gaps are scheduled for Waves 3–4 + physical validation — **not UNKNOWN**.
