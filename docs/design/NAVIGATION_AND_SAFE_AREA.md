# Navigation and Safe Area — سُنّة (Closure Wave B)

## Canonical content inset

| Token | Role |
|---|---|
| `--content-pb` | Runtime inset on `#main-content.app-main` |
| `--sf2-content-bottom-inset` | Semantic alias (Calm) → `--content-pb` |
| `--bottom-nav-height` / `--nav-chrome` | 64px chrome (touch targets preserved) |
| `--inset-bottom` | `env(safe-area-inset-bottom)` |
| `--global-back-clearance` | Extra clearance when unified back FAB visible |

**Rule:** Do not invent page-local bottom padding formulas. Prefer `var(--content-pb)` or `var(--sf2-content-bottom-inset)`.

## Bottom navigation

- Light surface via `--surface-app` (splash contract `#F7F3EB`); no drop shadow.
- Selected (light) = emerald text + subtle selected surface (not gold).
- Selected (dark) may use sparse gold via `dark-mode-recovery` (allowed on dark surfaces).
- Labels remain full Arabic; min tab height ≥ 2.75rem.
- Hidden at ≥880px (desktop uses top section bar).

## Floating back

`GlobalBackControlHost` / unified bottom-edge back remains until Wave B2 replaces route-level needs with inline prev/next + page endings. Must never be the only navigation path.

## Related WIP

`WAVE_NAVIGATION_PRAYER_STABILITY` owns atomic route-surface / prayer theme leak — merge after tokens (W1), before deep page migrations.
