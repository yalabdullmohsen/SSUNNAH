# STARTUP_IOS_INPUT_ZOOM_S7 — PR S7

**TASK_CLASSIFICATION:** SHARED_PLATFORM_WITH_IOS_BEHAVIOR  
**Program tip base:** main after S4 (`18c88582`)

## Contract

- Focusable text controls in the shipped app use ≥ 16px on compact widths.
- Form Authority: `text-base` + `md:text-sm` on `Input` / `Textarea` / `Select`.
- Authority CSS floor in `sunnah-identity-forms-filters.css` `@media (max-width: 879px)`.
- Viewport must **not** disable user zoom (`user-scalable=no` / `maximum-scale` forbidden).
- Admin-only dense controls remain out of the iOS app surface (KEEP_JUSTIFIED).
- Mushaf geometry / Quran fonts unchanged.

## Outputs

- IOS_INPUT_AUTO_ZOOM_RISK_ZERO_IN_REPOSITORY
- NO_USER_ZOOM_DISABLED
- FORM_AUTHORITY_HELD
