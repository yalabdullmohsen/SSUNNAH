# WAVE6 — Real Device Test Matrix

**Status:** DEVICE_REQUIRED — not executed in this automation pass.  
**Do not mark PASS without owner device evidence.**

## Devices (owner inventory)

| Device | Runtime | Status |
|---|---|---|
| iPhone modern | Safari / PWA / Capacitor iOS | DEVICE_REQUIRED |
| iPhone smaller/older | Safari / Capacitor iOS | DEVICE_REQUIRED |
| iPad | Safari / Capacitor iOS | DEVICE_REQUIRED |
| Android mid | Chrome / Capacitor Android | DEVICE_REQUIRED |
| Android recent | Chrome / Capacitor Android | DEVICE_REQUIRED |

## Cases

- Cold start · warm start  
- 25 turns · 100 turns  
- With / without audio · Mini Player  
- Light / Dark / System · portrait / landscape · Large Text  
- VoiceOver / TalkBack  
- Offline cached · poor network · background/resume  
- Page 1 · middle · 604 boundaries  
- Swipe over text · arrows · scrubber (safe) · Chrome toggle  

## Metrics to record

| Metric | Pass heuristic (informal) |
|---|---|
| touch → first move | Feels immediate; no long dead zone |
| pointerup → transitionend | Matches ~SETTLE_MS (220) when motion on |
| transitionend → unlock | Short when font cached; no deadlock |
| total turn | No long freeze after visual settle |
| wrong page / blank / wrong font | Must be zero |
| audio desync | None |
| memory after 100 turns | No crash / hang |
| missed swipe | Lower than pre-WAVE6 subjective baseline |

## Logging

Fill a row per device run. Until then every cell remains **DEVICE_REQUIRED**.

| Device | Date | Build SHA | 25-turn | 100-turn | Notes |
|---|---|---|---|---|---|
| — | — | — | DEVICE_REQUIRED | DEVICE_REQUIRED | — |
