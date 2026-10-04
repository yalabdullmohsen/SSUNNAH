# IOS_NATIVE_SPLASH_CONTRACT — PR S6

**TASK_CLASSIFICATION:** IOS_ONLY_WITH_SHARED_HANDOFF  
**Program tip base:** main after S2 (`45b706d00`)

## Surfaces

| Surface | Authority |
|---|---|
| WEB_SPLASH_CONTRACT | `index.html` `#mj-splash-critical` + `public/mj-launch-splash-boot.js` + `majlis-splash.ts` |
| IOS_NATIVE_SPLASH_CONTRACT | `LaunchScreen.storyboard` + `LaunchBackground.colorset` + Capacitor SplashScreen config |
| IOS_PUBLIC_MIRROR | `ios/App/App/public/mj-launch-splash-boot.js` must byte-match `public/mj-launch-splash-boot.js` |

## Canvas contract (repository)

| Mode | Shared / Web | Native LaunchBackground | Capacitor `backgroundColor` |
|---|---|---|---|
| Light | `#F8F6F1` | sRGB ≈ 0.973 / 0.965 / 0.945 | `#F8F6F1` |
| Dark | `#101614` | sRGB ≈ 0.063 / 0.086 / 0.078 | (appearance dark in colorset) |

Legacy `#F7F3EB` is retired from startup splash/capacitor/theme-color authorities.

## Handoff sequence (static)

```
NATIVE LaunchScreen (color only)
  → Capacitor SplashScreen silent cover (same canvas; launchShowDuration=0; launchAutoHide=false)
  → HTML #mj-launch-splash (branded; same canvas)
  → mj:shell-stable → WEB_SPLASH_EXITED (armNativeSplashController)
  → Capacitor hide at arm (startup:native-end) — silent cover only
```

Rules:

- No native white `systemBackgroundColor` frame before shared splash.
- Native splash hide occurs after shared shell geometry readiness for the branded HTML layer.
- Capacitor silent cover hides at arm (not a second branded splash).
- Timeout (`SPLASH_MAX_VISIBLE_MS`) is safety exit only.
- No artificial minimum delay (`SPLASH_MIN_VISIBLE_MS=0`).
- No app-version or iOS Build change in this program.

## Drift prevention

Gate `test:startup-ios-native-splash-s6` fails when:

- Web light/dark splash canvas ≠ contract constants
- Capacitor configs (root + iOS copy) ≠ `#F8F6F1`
- LaunchBackground light/dark components drift from `#F8F6F1` / `#101614`
- LaunchScreen uses white system background or branded chrome
- `public/mj-launch-splash-boot.js` ≠ `ios/App/App/public/mj-launch-splash-boot.js`

## Device hold

`PHYSICAL_IOS_STARTUP_VALIDATION_REQUIRED`

Do not claim:

- ZERO_FLICKER_ON_IOS
- IOS_STARTUP_CERTIFIED
- APP_STORE_STARTUP_CERTIFIED

without physical-device cold-start evidence (Light/Dark/System).
