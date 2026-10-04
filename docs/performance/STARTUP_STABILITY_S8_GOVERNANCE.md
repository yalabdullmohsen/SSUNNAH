# STARTUP_STABILITY_S8_GOVERNANCE — PR S8

**TASK_CLASSIFICATION:** SHARED_PLATFORM  
**Program tip base:** main after S7 (`77a1c165`)

## Governance surface (single)

Do not create a parallel reporting framework. Permanent gates hang from:

`pnpm --filter @workspace/majalis run test:boot-load-failure`

which includes S0–S7 startup gates.

Tracked (privacy-safe):

- font size / background / CSS sheet counts early→stable (live baseline reports)
- theme mutation count (live baseline)
- startup event order (`STARTUP_STATE_MACHINE_SINGLE`)
- splash exit reason / ownership (`armNativeSplashController`)
- route / theme / font scale matrices (S0 reports)
- CLS / late visible restyle (S2)
- chunk recovery attempts (S5)
- native splash contract (S6)
- input floor (S7)

## Permanent prevents

- absolute html font-size
- deferred html/body font/background authority
- splash exit before shell geometry (normal path)
- multiple normal-path splash hide owners
- unbounded chunk reload
- iOS/public splash pipeline drift
- input font-size regression on compact widths
- critical CSS budget raise

## Device hold

`PHYSICAL_IOS_STARTUP_VALIDATION_REQUIRED`  
`PHYSICAL_DARK_SYSTEM_LIVE_VALIDATION_REQUIRED`  
`PHYSICAL_IOS_INPUT_KEYBOARD_VALIDATION_REQUIRED`

Do not claim ZERO_FLICKER_ON_IOS / IOS_STARTUP_CERTIFIED / APP_STORE_STARTUP_CERTIFIED without device evidence.

## Outputs

- STARTUP_REGRESSION_GOVERNANCE_EXPANDED
- CORE_STARTUP_SHIFT_PREVENTED
- UPDATE_LOOP_REGRESSION_PREVENTED
- IOS_HANDOFF_DRIFT_PREVENTED
- UNKNOWN_STARTUP_DEBT = 0
- STARTUP_REPOSITORY_STABILITY_COMPLETE_WITH_DEVICE_HOLD
