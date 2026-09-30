# WAVE5 — CSS Import Graph (`main.tsx`)

**Tip measured:** `24b513cab` (+ WAVE5 patches)  
**Sync:** 22 · **Deferred call sites:** 53 · **Unique deferred:** 50

## Sync (initial critical graph)

| Import | Class |
|---|---|
| `fonts-ui.css` | REQUIRED_FIRST_PAINT |
| `app/styles/theme.css` | REQUIRED_THEME_BOOT |
| `sunnah-foundation-tokens.css` | REQUIRED_THEME_BOOT |
| `sunnah-foundation-v2.css` | REQUIRED_THEME_BOOT |
| `ssunnah-theme-api.css` | REQUIRED_THEME_BOOT |
| `brand-v4.css` | SHARED_RUNTIME / COMPATIBILITY |
| `tokens.css` | REQUIRED_THEME_BOOT |
| `design-tokens.css` | REQUIRED_THEME_BOOT |
| `visual-redesign-v2-tokens.css` | REQUIRED_THEME_BOOT |
| `sunnah-identity-reset.css` | REQUIRED_FIRST_PAINT / REQUIRED_RTL |
| `breakpoints.css` | REQUIRED_SHELL_GEOMETRY |
| `typography-scale.css` | REQUIRED_FIRST_PAINT |
| `typography-app.css` | REQUIRED_FIRST_PAINT |
| `index.css` | SHARED_RUNTIME (trimmed DEAD_PROVEN in WAVE5) |
| `theme-aliases.css` | REQUIRED_THEME_BOOT |
| `semantic-layer-tokens.css` | REQUIRED_THEME_BOOT |
| `visual-layer-contrast-fix.css` | REQUIRED_THEME_BOOT / a11y |
| `visual-identity-unify.css` | REQUIRED_FIRST_PAINT (+ ALLOWED_CASCADE_REIMPORT deferred) |
| `sections-calm-polish.css` | SHARED_RUNTIME |
| `ssunnah-ux-polish.css` | SHARED_RUNTIME |
| `interaction-states.css` | REQUIRED_FOCUS (+ ALLOWED_CASCADE_REIMPORT deferred) |
| `dark-mode-recovery.css` | REQUIRED_THEME_BOOT (+ ALLOWED_CASCADE_REIMPORT deferred) |

## Conditional boot (dark only, before idle)

| Import | Class |
|---|---|
| `dark-mode-surfaces.css` | REQUIRED_THEME_BOOT (dark) · also DEFER_SAFE idle |
| `dark-design-system.css` | REQUIRED_THEME_BOOT (dark) |
| `premium-dark-refine.css` | REQUIRED_THEME_BOOT (dark) |
| `pages/luxury-night-v2.css` | DEFER_SAFE / ROUTE-adjacent night polish |

## Deferred (`loadNonCriticalCss` / idle)

| Group | Class |
|---|---|
| z-index / motion / m2030 / green-surface / card systems / editorial / design-system / final-release | DEFER_SAFE / SHARED_RUNTIME |
| `visual-identity-unify` · `dark-mode-recovery` after `final-release` | DUPLICATED / ALLOWED_CASCADE_REIMPORT (identity win) |
| `interaction-states` after dark deferred stack | DUPLICATED / ALLOWED_CASCADE_REIMPORT |
| `fonts-ui-bold` (20s) · capacitor / ios-edge | DEFER_SAFE |

## WAVE5 removal from critical `index.css`

DEAD_PROVEN (no TSX/`className` consumers): legacy home cards, kuwait card chrome, notif panel, mj-tabs/menu leftovers, bare prayer-status/tracker/time-cell blocks, bare `.prayer-countdown`, site-footer-brand, etc.  
**Kept:** `home-kuwait-grid` (HomeUpcoming*), `navbar-admin-link`, `prayer-rank-card`, content-hub/assistant/live shell rules.

## Not deferred (contract)

Theme tokens · page background · RTL · shell geometry · Header/BottomNav geometry · focus foundations · `dark-mode-recovery` sync.
