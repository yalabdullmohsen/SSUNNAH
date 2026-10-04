# STARTUP_FRAME_TIMELINE — Wave 0

**Tip:** `eb2f0bdcc` · Production MATCH  
**Source:** live CDP/Playwright summary + current `index.html` / `main.tsx` / splash boot

## Canonical phase names (proposed machine — enforced in S1)

```
HTML_CRITICAL_READY
THEME_READY
ROOT_MOUNTED
SHELL_GEOMETRY_READY
CONTENT_MINIMUM_READY
FONTS_ACCEPTABLE
VISUALLY_STABLE
WEB_SPLASH_EXITED
NATIVE_SPLASH_EXITED
```

## Observed Home cold timeline (approx, production)

```
0ms          HTML + #mj-lcp-critical + #mj-splash-critical
0–50ms       mj-theme-boot sets theme + --ui-font-scale
~692ms       FP = FCP (Home)
~692–1700ms  React chrome mounts over reserved geometry (no header/nav jump flags)
~1709ms      micro CLS: header-ticker--empty / navbar-ticker-row
~1759ms      micro CLS: ss-screen--dashboard
idle≤2500ms  loadNonCriticalCss → sheets climb 3→59
≤1400ms      splash MAX_MS safety (boot.js) if shell-stable late
~6.2s        measurement window end (elapsedMs)
```

## Marks currently emitted (code)

- `startup:js-start` · `startup:root-mounted` · `startup:theme-ready`
- `startup:fonts-ready` · `startup:session-ready` · `startup:content-ready`
- `startup:shell-ready` · `startup:stable` · `startup:native-end`
- DOM events: `mj:boot-ready` · `mj:app-painted` · `mj:shell-stable`

## Classification of timeline events

| Event | Class |
|---|---|
| FP/FCP before deferred sheets | EXPECTED |
| body 17px constant | EXPECTED (closed R2) |
| sheet count growth after idle | DEFERRED_SOFT_PAINT |
| ticker micro CLS | DEFERRED_SOFT_PAINT |
| Prayer bodyBg settle to #2a4030 | EXPECTED_ROUTE_TRANSITION |
| Native LaunchScreen color mismatch | DEVICE_REQUIRED + repository contract drift |
