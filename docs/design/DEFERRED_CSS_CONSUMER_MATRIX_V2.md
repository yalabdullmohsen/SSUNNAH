# DEFERRED CSS CONSUMER MATRIX V2

| Field | Value |
|---|---|
| Date | 2026-10-01 |
| Tip context | Follow-up `cursor/zero-startup-flicker-closure` after #2430 |
| Rule | No AFTER_IDLE_SAFE writer to html/body/#root/chrome/primary CTA |

| File | Class | Notes |
|---|---|---|
| `#mj-lcp-critical` / `critical-first-paint.css` | CRITICAL_TO_FIRST_PAINT | Geometry + canvas |
| `theme.css` / `typography-scale` / `index.css` | CRITICAL_TO_FIRST_PAINT | Font + canvas |
| `theme-aliases` / `visual-identity-unify` | CRITICAL_TO_FIRST_PAINT | Bridges → `--mj-*` |
| `sunnah-identity-chrome-nav.css` | COMPONENT_LOCAL | BottomNav authority (absorbed nav polish from profile-hub) |
| `profile-hub-v2.css` | ROUTE_SPECIFIC | Settings/Progress only — **not** BottomNavBar |
| `design-system` / `final-release` | AFTER_IDLE_SAFE | body/#root sealed |
| `m2030/foundation` | AFTER_IDLE_SAFE | no html/body paint |
| `m2030/navigation` | KEEP_JUSTIFIED | nav chrome tokens |
| `card-system*` / editorial* / green-surface / unify | AFTER_IDLE_SAFE | cards after idle; no body |
| `index-deferred-pages` / reading-* / islam-intro | ROUTE_SPECIFIC | not on Home idle |
| `dark-mode-*` (core) | ROUTE_SPECIFIC | dark theme / idle ensure |
| `luxury-night-v2` | AFTER_IDLE_SAFE | dark-only bundle |
| Admin CSS/JS | ADMIN_ONLY | forbidden on Home startup graph |
| Mushaf CSS | MUSHAF_SPECIAL | route graph only |
| Prayer CSS | PRAYER_SPECIAL | prefetch OK · surface via `commitRouteSurface` only |

## Closure actions in this follow-up

- BottomNav no longer imports `profile-hub-v2.css`
- Nav polish lives in `sunnah-identity-chrome-nav.css`
- Startup chrome removal waits for React header+bottom (non-immersive)
