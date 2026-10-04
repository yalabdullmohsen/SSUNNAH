# STARTUP_DARK_SYSTEM_S4 — PR S4

**TASK_CLASSIFICATION:** SHARED_PLATFORM  
**Program tip base:** main after S3 (`a1c991e2`)

## First-frame contract

| Mode | Before paint owner | Canvas | Classes |
|---|---|---|---|
| Light | `mj-theme-boot` | `#F8F6F1` | `light theme-light` |
| Dark | `mj-theme-boot` + `#mj-dark-elevated-boot` tokens | `#101614` | `dark theme-dark` + `data-theme=dark` |
| System light | `auto` + `prefers-color-scheme: light` | light path | light |
| System dark | `auto` + `prefers-color-scheme: dark` | dark path | dark |

Rules:

- No light flash before dark when stored preference is dark/auto-dark.
- Critical CSS already paints `html[data-theme=dark]` canvas `#101614`.
- Deferred dark layers load via `ensureDarkLayersForBoot` only when boot is dark.
- Theme mutations: boot sets theme once; React provider does not re-toggle on mount unless preference changes.
- System auto re-syncs on `prefers-color-scheme` change and on `visibilitychange` (Capacitor resume).
- Live Dark/System paint matrix remains **DEVICE_REQUIRED / LIVE_PARTIAL** until physical capture.

## Outputs

- DARK_FIRST_FRAME_READABLE
- SYSTEM_FIRST_FRAME_CORRECT
- THEME_MUTATIONS_MINIMIZED
- NO_LIGHT_FLASH_BEFORE_DARK
- PHYSICAL_DARK_SYSTEM_LIVE_VALIDATION_REQUIRED
