# STARTUP_STATE_MACHINE_SINGLE — PR S1

**TASK_CLASSIFICATION:** SHARED_PLATFORM  
**Program tip base:** main after S0 (`51a122b9`)

## Single machine

```
HTML_CRITICAL_READY
  → THEME_READY                 (mj-theme-boot inline)
  → ROOT_MOUNTED                (startup:root-mounted)
  → SHELL_GEOMETRY_READY        (startup chrome reservations + markAppShellStable geometry)
  → CONTENT_MINIMUM_READY       (startup:content-ready / first route shell)
  → FONTS_ACCEPTABLE            (fonts.check Amiri OR MAX wait — never indefinite)
  → VISUALLY_STABLE             (mj:shell-stable / startup:stable)  ※ not every deferred sheet
  → WEB_SPLASH_EXITED           (dismiss #mj-launch-splash)
  → NATIVE_SPLASH_EXITED        (Capacitor SplashScreen.hide — armed immediately silent)
```

## Ownership (one owner per transition)

| Transition | Owner |
|---|---|
| HTML_CRITICAL_READY | `index.html` critical styles |
| THEME_READY | `mj-theme-boot` inline |
| ROOT_MOUNTED | `main.tsx` createRoot |
| SHELL_GEOMETRY_READY | `#mj-startup-*` + App shell |
| CONTENT_MINIMUM_READY | route shell / boot-readiness |
| FONTS_ACCEPTABLE | boot.js fonts.check + soft/hard caps |
| VISUALLY_STABLE | `markAppShellStable()` → `mj:shell-stable` |
| WEB_SPLASH_EXITED | **Primary after arm:** `dismissHtmlLaunchSplash` via `armNativeSplashController` on `mj:shell-stable` or timeout |
| WEB_SPLASH_EXITED | **Pre-bundle safety only:** `mj-launch-splash-boot.js` until bundle overrides `__mjDismissSplash` |
| NATIVE_SPLASH_EXITED | `hideCapacitorSplash` inside `armNativeSplashController` (immediate silent) |

## Rules

- Timeout (`SPLASH_MAX_VISIBLE_MS=1400`) is safety exit, not success path.
- No artificial MIN delay (`SPLASH_MIN_VISIBLE_MS=0`).
- Visually stable ≠ all deferred decorative CSS loaded.
- Native silent cover hides at arm; branded HTML splash waits for shell-stable.
- AppStartupController states (NATIVE_LAUNCH→…→INTERACTIVE) remain the app-level machine; this doc is the paint/splash machine that gates splash hide.

## Duplicate signals (kept with roles)

| Signal | Role |
|---|---|
| `mj:boot-ready` | theme/fonts/storage readiness (not splash hide alone) |
| `mj:app-painted` | first React paint hint for boot.js |
| `mj:shell-stable` | **authoritative** splash hide trigger after arm |
| `startup:*` marks | observability only |
