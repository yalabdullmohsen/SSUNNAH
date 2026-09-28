# Legacy CSS Retirement Matrix — Phase 5

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Branch | `cursor/design-ux-a11y-p5` |
| Rule | No `SAFE_REMOVE_CANDIDATE` deletion in Phase 5 |

Statuses: **KEEP** · **MIGRATED** · **COMPATIBILITY** · **SAFE_REMOVE_CANDIDATE** · **BLOCKED**

Measured source inventory (2026-09-28, worktree): **347** CSS files under `artifacts/majalis/src/styles` (+ nested); see baseline for totals.

## Foundation / Phase 5 additions

| File | Bytes | Status | Notes |
|---|---:|---|---|
| `sunnah-foundation-tokens.css` | 8579 | KEEP (CANONICAL) | `--sf-*` SoT |
| `sunnah-foundation-v2.css` | 7856 | KEEP (CANONICAL) | `--sf2-*` |
| `z-index-layers.css` | 513 | KEEP (CANONICAL) | Phase 5 |
| `motion-policy.css` | 850 | KEEP (CANONICAL) | Phase 5 |
| `page-container.css` | 1219 | KEEP (CANONICAL) | Phase 5 |
| `app-state-v2.css` | 3056 | KEEP (CANONICAL) | Unified states |
| `fonts-ui.css` | 3968 | KEEP (CANONICAL) | Amiri UI |
| `critical-first-paint.css` | 8914 | KEEP | Boot critical |

## Compatibility / migration

| File | Bytes | Status | Notes |
|---|---:|---|---|
| `design-tokens.css` | 11630 | COMPATIBILITY | `--ss-*` bridges |
| `visual-redesign-v2-tokens.css` | 7211 | COMPATIBILITY | No new consumers |
| `dark-design-system.css` | 21052 | COMPATIBILITY | Dark remap aids |
| `dark-mode-recovery.css` | 24623 | COMPATIBILITY | Conflict patches |
| `dark-mode-surfaces.css` | 35792 | COMPATIBILITY | Surface remaps |
| `brand-v4-contrast-fixes.css` | 26950 | COMPATIBILITY | Contrast gate support |
| `design-system.css` | 83975 | SAFE_REMOVE_CANDIDATE | Large overlap with Foundation; **do not delete** until unused proof + screenshots |
| `modern-ui-refresh.css` | (present) | SAFE_REMOVE_CANDIDATE | Opt-in leftovers |
| `card-system.css` (v1) | (present) | COMPATIBILITY | V2 preferred (`card-system-v2.css`) |

## Legacy required (keep)

| File / tree | Bytes | Status | Notes |
|---|---:|---|---|
| `brand-v4.css` | 20007 | KEEP | Still referenced in cascade |
| `brand-v4-components.css` | 12359 | KEEP | Component chrome |
| `final-release.css` | 73213 | KEEP | Release overrides still live |
| `styles/m2030/` | tree | KEEP | Campaign layer; migrate consumers first |
| `admin.css` | 165191 | BLOCKED | Admin route-specific; out of public unify delete path |
| `fonts-quran.css` | 1617 | BLOCKED | Mushaf / scripture |
| Mushaf page CSS | many | BLOCKED | Immersive reader boundary |
| Prayer / adhan CSS | many | BLOCKED | Worship timing UX boundary |

## Classification guide for remaining files

| Pattern | Default status |
|---|---|
| `pages/*.css` route-scoped | KEEP / ROUTE_SPECIFIC |
| `components/*.css` still imported | KEEP until unused |
| Duplicate card/soft-card washes | SAFE_REMOVE_CANDIDATE after hub migration |
| Dynamic class builders | BLOCKED without allowlist |

## Retirement process (later phase)

1. Prove zero selectors used (static + dynamic allowlist).
2. Screenshot + visual regression green.
3. Move to SAFE_REMOVE only after (1)+(2); delete in a dedicated PR.

Phase 5 **does not** delete SAFE_REMOVE_CANDIDATE entries.

---

## Visual System Program — PR-1 update (2026-09-28)

| Field | Value |
|---|---|
| Full-tree CSS files (`src/**/*.css`) | **361** (inventory script) |
| Policy | No mass delete · port → parity → drop import → SAFE_REMOVE |
| Debt gate | `test:visual-system-debt-budget` (ceilings must not rise) |

### Additional classifications (program waves)

| Path / layer | Status | Next wave |
|---|---|---|
| `styles/visual-identity-unify.css` | OVERRIDE_PATCH / KEEP | Absorb → retire PR-10/11 |
| `styles/sections-calm-polish.css` | OVERRIDE_PATCH / KEEP | Absorb → retire |
| `styles/soft-cards.css` | MIGRATION_CANDIDATE | Cards PR-3 |
| `styles/pages/*-legacy.css` | MIGRATION_CANDIDATE | PR-10/11 |
| `styles/m2030/*` | KEEP (ACTIVE_LEGACY) | Port home/nav then retire |
| `features/mushaf-*/*.css` | BLOCKED | Phase 11 / PR-12 only |
| Admin CSS | BLOCKED | After Admin visual PR-9 |

PR mapping: PR-6 dark · PR-10/11 legacy retirement · PR-12 mushaf boundary · PR-13 compatibility reduction.
