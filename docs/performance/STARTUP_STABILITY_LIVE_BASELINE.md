# STARTUP_STABILITY_LIVE_BASELINE — Wave 0 / PR S0

**Program:** SUNNAH_STARTUP_STABILITY_AND_ZERO_PERCEIVED_SHIFT_FINAL_PROGRAM  
**TASK_CLASSIFICATION:** SHARED_PLATFORM  
**Mode:** inventory + live measure only (no product fix in S0)  
**Measured tip:** `eb2f0bdcc` = Production `version.json` MATCH  
**Host:** `https://www.ssunnah.com`  
**Tooling:** Playwright Chromium · iPhone 12 viewport 390×844 @2x · cache disabled  
**Evidence:** `docs/performance/evidence/startup-stability-live-eb2f0bdc/`  
**Machine JSON:** `artifacts/majalis/reports/startup/STARTUP_STABILITY_LIVE_BASELINE.json`

## Platform impacts (S0)

- WEB_IMPACT: live cold-cache route matrix captured  
- IOS_APPLICATION_IMPACT: static contract inventory only (DEVICE_REQUIRED for cold start)  
- APP_STORE_PRODUCT_IMPACT: none  
- SHARED_PLATFORM_IMPACT: residual classification for Waves 1–8

## Closed core (do not reopen without STARTUP_REGRESSION_CONFIRMED)

R1–R8 from program charter remain closed on this tip:

- body font early/final = **17px** on all five routes (`fontDelta=0`)
- Home/Search/Quran/Mushaf canvas early/final = `#F8F6F1` (`backgroundDelta=0`)
- theme mutations = **0** on all five routes
- chrome geometry jumps (header/hero/nav/back) = **false**
- CLS totals all **&lt; 0.002** (far below historical Prayer 0.0538 / Home 0.0200)

## Live route matrix (default Light · scale 1.00 · cold cache)

| Route | FP ms | CLS | Sheets early→final | fontΔ | bgΔ | Class of residual |
|---|---:|---:|---|---:|---:|---|
| `/` | 692 | 0.0004 | 3→59 | 0 | 0 | DEFERRED_SOFT_PAINT (hero green 69→63; ticker CLS micro) |
| `/search` | 1020 | 0.0016 | 6→82 | 0 | 0 | DEFERRED_SOFT_PAINT (bottom-tab micro CLS) |
| `/quran-hub` | 1020 | 0.0017 | 6→87 | 0 | 0 | DEFERRED_SOFT_PAINT (skeleton replace) |
| `/mushaf` | 856 | 0.0000 | 6→46 | 0 | 0 | EXPECTED (sheet growth only) |
| `/prayer-times` | 856 | ≈0 | 6→66 | 0 | 1 | EXPECTED_ROUTE_TRANSITION + DEFERRED_SOFT_PAINT (bodyBg transparent→#2a4030; bottom color settle) |

No UNKNOWN classifications.

## Residual backlog (repository-fixable)

1. **DEFERRED_SOFT_PAINT** — large stylesheet graph after first stability (Home 3→59 … Search 6→82). Duplicate deferred imports present in `loadNonCriticalCss`.  
2. **FONT_FALLBACK_SETTLING** — Home early stack includes `Noto Naskh Arabic` then settles to `MajlisFallback` (size unchanged).  
3. **NATIVE_SPLASH_HANDOFF** — Capacitor `backgroundColor` still `#F7F3EB` while shared canvas is `#F8F6F1`; iOS public splash mirror drifts (`data-ab` clear lines).  
4. **UPDATE_RECOVERY** — code comments claim quiet recovery; Wave 5 must prove no blocking UI / single attempt with gates.  
5. **DEVICE_ONLY_UNVERIFIED** — Dark/System/font-scale matrices + physical iOS cold start.  
6. **IOS input &lt;16px** — many CSS candidates near form controls (Wave 7).  
7. **Duplicate readiness signals** — `mj:boot-ready` / `mj:shell-stable` / `mj:app-painted` + `dismissHtmlLaunchSplash` + boot script `__mjDismissSplash` (Wave 1).

## Explicit non-claims

- ZERO_FLICKER_ALL_DEVICES  
- IOS_STARTUP_CERTIFIED  
- APP_STORE_STARTUP_CERTIFIED  
- REPOSITORY_CLEAN (eradication E–J unrelated; not this program)

## Next

PR S1 — state machine + splash ownership consolidation.
