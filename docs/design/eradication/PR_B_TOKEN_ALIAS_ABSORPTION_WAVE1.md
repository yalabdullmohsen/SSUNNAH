# PR B — Token alias / Hex-fallback absorption wave 1

**Program:** SUNNAH_FULL_APPLICATION_LAYER_ERADICATION_AND_SINGLE_VISUAL_AUTHORITY  
**TASK_CLASSIFICATION:** SHARED_PLATFORM

## Scope

Strip unsafe `var(--token, #hex)` fallbacks where `--token` is already provided by the sync cascade (`--sf-*` / `--ss-*` / `--mj-*` and established theme aliases). No fourth token family. No layer file deletion in this PR.

## Files touched

- `styles/section-cards-theme.css`
- `styles/visual-enrichment.css`
- `styles/interaction-states.css`
- `styles/modern-ui-refresh.css`
- `styles/ssunnah-ds-canonical.css`
- `styles/ssunnah-ux-polish.css`
- (inspected) `styles/card-matte-unify.css`, `styles/sections-calm-polish.css`

## Measured delta

| Metric | Before | After |
|---|---:|---:|
| Hex in CSS (global) | 6432 | 6189 |
| Unsafe Hex fallbacks (global) | 3333 | 3090 |
| Wave files Hex fallbacks | 275 | 32 |
| Wave files Hex literals | 341 | 98 |

Debt ceiling `hexInCss` lowered to **6189** (no raise). Sync CSS imports remain **14**.

## Platform impacts

- WEB_IMPACT: Shared identity layers resolve colors via tokens only (fewer literal fallbacks).
- IOS_APPLICATION_IMPACT: Same WebView CSS cascade; no Capacitor-only change. Device proof still required for visual claims.
- APP_STORE_PRODUCT_IMPACT: No store actions; release risk not increased.
- SHARED_PLATFORM_IMPACT: Strengthens single-authority token consumption.

## Validation

`test:visual-system-debt-budget` · `test:global-design-system-authority` · `test:identity-cascade-collapse` · `test:application-layer-eradication` · `verify:ci`
