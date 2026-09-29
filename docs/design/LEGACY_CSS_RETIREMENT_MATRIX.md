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
| `styles/visual-identity-unify.css` | OVERRIDE_PATCH / KEEP | **TOKEN ABSORB done** (`--mj-*` → theme-aliases); consumer rules remain |
| `styles/sections-calm-polish.css` | OVERRIDE_PATCH / KEEP | **TOKEN ABSORB done** (competing hex removed; chips → aliases) |
| `styles/typography-scale.css` | COMPATIBILITY | **TOKEN ABSORB** `--mj-fs-*` → theme-aliases |
| `styles/soft-cards.css` | MIGRATION_CANDIDATE | Soft-card inventory + AppCard ports in progress |
| `styles/dark-mode-recovery.css` | ACTIVE | Classify only — import KEEP (parity incomplete) |
| `styles/dark-mode-surfaces.css` | ACTIVE | KEEP |
| `styles/dark-design-system.css` | COMPATIBILITY | `--mj-*` remaps remain; absorb later |
| `styles/premium-dark-refine.css` | ACTIVE | KEEP — winning night `--mj-*` |
| `styles/pages/luxury-night-v2.css` | COMPATIBILITY | Deferred import KEEP |
| `styles/sunnah-identity-luxury-night.css` | COMPATIBILITY | Identity night polish KEEP |
| `styles/pages/*-legacy.css` | MIGRATION_CANDIDATE | PR-10/11 |
| `styles/m2030/*` | KEEP (ACTIVE_LEGACY) | Port home/nav then retire |
| `features/mushaf-*/*.css` | BLOCKED | Phase 11 / PR-12 only |
| Admin CSS | BLOCKED | After Admin visual PR-9 |

PR mapping: PR-6 dark · PR-10/11 legacy retirement · PR-12 mushaf boundary · PR-13 compatibility reduction.

---

## Interaction PR-9 update (2026-09-29) — safe retirement wave

| Field | Value |
|---|---|
| Tip base | after Interaction PR-8 `0b84c40bc` (#2345) |
| Policy | Prefer document + gate · delete only proven-unused · **0–3 files max** |
| Gate | `test:legacy-css-retirement` · companion `test:mushaf-css-boundary` |
| Mushaf | See `docs/design/MUSHAF_CSS_BOUNDARY.md` — **BLOCKED** for mass delete |
| Store | **HOLD** · not FULLY COMPLETE · not STORE GO |
| CSS file count (debt) | **360** after SAFE_REMOVE (−1); visual `--write-budget` applied |

### Retire-safe vs keep (concise)

| Class | Examples | Action |
|---|---|---|
| **KEEP (runtime)** | `brand-v4*` · `m2030/*` · `final-release` · SVL · Foundation `--sf-*` | Keep until ported |
| **COMPATIBILITY** | `design-tokens` · dark recovery/surfaces · `design-system.css` | Bridge only; no mass delete |
| **NEEDS_PORT / MIGRATION** | `pages/*-legacy.css` (still imported) · soft-cards | Port classes then drop import |
| **BLOCKED** | `features/mushaf-*/*.css` · `fonts-quran.css` · Admin CSS · prayer/adhan | Boundary / route ownership |
| **SAFE_REMOVE (executed PR-9)** | `homepage-ad-bar.css` · `HomepageAdBar.tsx` · `homepage-ad.ts` | Proven zero product import; header ad = `HeaderAdSlot` |
| **SAFE_REMOVE (deferred)** | `homepage-ad-dismiss.ts` (+ test) | Harmless; purge key strings remain |

### Executed deletes (this wave)

| # | Path | Proof |
|---|---|---|
| 1 | `styles/components/homepage-ad-bar.css` | Only loaded from unused `HomepageAdBar`; App/Nav use `HeaderAdSlot` |
| 2 | `components/home/HomepageAdBar.tsx` | `header-ad-gate` / `homepage-ad-bar-gate` assert absent from App |
| 3 | `config/homepage-ad.ts` | Sole consumer was HomepageAdBar (`@deprecated`) |

**Not deleted:** `brand-v4` / `m2030` / `final-release` / `*-legacy.css` / mushaf CSS / `modern-ui-refresh.css` / `design-system.css`.

