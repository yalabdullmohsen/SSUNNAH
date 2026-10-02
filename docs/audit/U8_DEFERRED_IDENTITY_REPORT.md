# T-045 — U8 Deferred Identity Report

| Field | Value |
|-------|-------|
| Phase | `T-045 U8_DEFERRED_IDENTITY` |
| Date (UTC) | `2026-10-02` |
| Base | T-044 tip (`BACK_AUTHORITY_ONLY` + `FLOATING_LAYER_CERTIFIED`) |
| Evidence | `docs/audit/evidence/t045-u8-deferred-identity/` |
| SoT | `docs/design/LEGACY_CSS_RETIREMENT_MATRIX.md` · `docs/design/WAVE7_IDENTITY_CASCADE_ABSORPTION_REPORT.md` |
| Exit | **`DEFERRED_IDENTITY_ABSORBED_OR_JUSTIFIED`** → **PASS** |

Forbidden (held): no new Design/Theme/Token system · no sync→deferred debt hide · no layer delete without Consumer Map.

Prerequisite: `docs/audit/U7_BACK_AUTHORITY_REPORT.md` = `BACK_AUTHORITY_ONLY`.

---

## 1. Identity Inventory

Measured from `artifacts/majalis/src/main.tsx` + `ensure-dark-layers.ts` (live).

| Lane | Count | Decision |
|------|------:|----------|
| Sync (`main` static imports) | **15** | `CRITICAL_TO_FIRST_PAINT` |
| Deferred (`loadNonCriticalCss` + native + bold fonts) | **49** | `AFTER_IDLE_SAFE` / `COMPONENT_LOCAL` / `ROUTE_SPECIFIC` — each **`KEEP_JUSTIFIED`** |
| Dark ensure (single loader) | **6** | `KEEP_JUSTIFIED` |

### Identity families

| Family | Paths (runtime) | Classification |
|--------|-----------------|---------------|
| **brand-v4** | `brand-v4.css` (sync) · `brand-v4-components.css` · `brand-v4-contrast-fixes.css` (deferred) | ACTIVE_COMPATIBILITY / KEEP |
| **final-release** | `final-release.css` (deferred tip) | ACTIVE_LEGACY + **WAVE7 CASCADE SEAL** |
| **visual-redesign** | `visual-redesign-v2-tokens` · `visual-refresh-v1` · `visual-enrichment` · `visual-layer-contrast-fix` (deferred) · `visual-identity-unify` (sync) | COMPATIBILITY / OVERRIDE_PATCH |
| **m2030** | `m2030/{foundation,navigation,interactions,pages}.css` (deferred; pages non-home) | ACTIVE_LEGACY |
| **token compatibility** | sync: `design-tokens` · `theme-aliases` · `semantic-layer-tokens` · `ssunnah-theme-api` · deferred: `tokens` · `ssunnah-semantic-tokens` · `ssunnah-ds-canonical` · editorial tokens | COMPATIBILITY bridges; Foundation `--sf-*` SoT |
| **dark compatibility** | `dark-mode-recovery` · `dark-mode-surfaces` · `dark-design-system` · `premium-dark-refine` · `luxury-night-v2` · `sunnah-identity-luxury-night` | ACTIVE_COMPATIBILITY via **ensure-dark-layers** only |
| **deferred identity layers** | `sunnah-identity-reset` · `sections-calm-polish` · `ssunnah-ux-polish` · SVL · geometry · green-surface · `design-system` · `final-release` · `modern-ui-refresh` | KEEP_JUSTIFIED (matrix + consumers>0) |

Full itemization: `evidence/t045-u8-deferred-identity/inventory.json` (`keep: KEEP_JUSTIFIED` on every deferred + dark entry).

`unjustifiedDeferred`: **[]**.

---

## 2. Absorption Summary

U8 does **not** invent a new Foundation absorb path. Duplicate identity/cascade winners were already absorbed in **WAVE7**:

| Absorbed | Into | Status | Consumer Map / proof |
|----------|------|--------|----------------------|
| `visual-identity-unify` token/chrome winners | `final-release.css` **WAVE7 CASCADE SEAL** | ABSORBED_PRIOR_WAVE7 | `visual-identity-unify-gate` · seal marker present |
| `dark-mode-recovery` chrome winners | CASCADE SEAL + `ensure-dark-layers` | ABSORBED_PRIOR_WAVE7 | `dark-deferred-absorb-gate` · single loader |
| Deferred reload of unify/recovery after `final-release` | **removed** from `loadNonCriticalCss` | REMOVED_PRIOR_WAVE7 | `wave5-critical-fouc-gate` · `zero-startup-flicker-gate` |

Absorbable duplicates remaining as **file-level** retirement (`design-system` SAFE_REMOVE_CANDIDATE, m2030 campaign, brand-v4*) stay **KEEP_JUSTIFIED** until unused proof + screenshots (LEGACY matrix). No delete in this phase.

Color / spacing / typography ownership for first paint remains sync Foundation (`sunnah-foundation-tokens` / `v2` / `theme` / `theme-aliases` / typography-*). Deferred token files are bridges only.

---

## 3. Deferred Layers Kept

All **49** deferred + **6** dark layers = **`KEEP_JUSTIFIED`** with documented reason in inventory.

Notable KEEP rationales:

| Layer | Why KEEP (not remove) |
|-------|------------------------|
| `final-release.css` | Runtime tip + CASCADE SEAL; consumers/gates depend on order after `design-system` |
| `design-system.css` | Large overlap SAFE_REMOVE_CANDIDATE — blocked until unused proof |
| `brand-v4-*` deferred | Component/contrast bridges; sync `brand-v4.css` holds ATF tokens |
| `m2030/*` | ACTIVE_LEGACY campaign classes on Home/shell — port consumers first |
| Dark six | Theme-switch / dark boot; single loader prevents false reload-to-win |
| Route-gated eight | Non-home / reading-shell only — not global fake-defer |

`ACTIVE_COMPATIBILITY` layers: **PRESENT** and **JUSTIFIED** (not hidden by lane move).

---

## 4. Removed Layers

| Scope | Files |
|-------|-------|
| This phase (U8) | **none** — Consumer Map incomplete for SAFE_REMOVE candidates |
| Prior WAVE7 (documented, not re-deleted) | Deferred re-import of `visual-identity-unify.css` + `dark-mode-recovery.css` after `final-release` |

`DEAD_PROVEN` this phase: **0** file deletions.

---

## 5. First Paint Review

**Sync ATF contract (15):** fonts-ui · theme · foundation tokens/v2 · ssunnah-theme-api · brand-v4 · design-tokens · breakpoints · typography-scale/app · index · theme-aliases · semantic-layer-tokens · visual-identity-unify · interaction-states.

Surfaces covered without deferred dependency for first paint:

| Surface | Owner |
|---------|-------|
| `html` / `body` / `:root` | theme + Foundation + aliases + unify (sync) |
| Header / chrome boot | `critical-first-paint` + sync identity |
| Hero / primary CTA | sync brand + Home shell / `m2030/home` with route |
| Bottom nav | sync + critical shell; dark chrome via ensure-dark / CASCADE SEAL |

`firstPaintMisplacedDeferred`: **[]** — no deferred file is the sole ATF writer for those surfaces. Deferred files that *mention* `:root`/chrome are KEEP_JUSTIFIED under critical CSS gzip budget (≤60KiB) and/or route gating (`!isHome` / `wantsReadingShell` / `isNative`).

---

## 6. Visual Regression Review

| Check | Result |
|-------|--------|
| Reload-to-win unify/recovery after `final-release` | **absent** (`reloadToWinPresent: false`) |
| WAVE7 CASCADE SEAL in `final-release.css` | **present** |
| Sync import counts | 15 → **15** (no debt hide via sync→deferred) |
| Deferred import counts | 49 → **49** |
| Dark loader | single `ensure-dark-layers` (no idle duplicate reimport of same modules) |
| Visual debt ceilings | unchanged this phase (no CSS mass edit) |
| Device FOUC/CLS numeric | **not claimed** (DEVICE_REQUIRED remains outside U8) |

---

## 7. Final Metrics

| Metric | Before (stated) | After (measured) |
|--------|----------------:|-----------------:|
| `mainSyncCssImports` | 15 | **15** |
| `mainDeferredCssImports` | 49 | **49** |
| `darkEnsureImports` | 6 | **6** |
| Deferred without `KEEP_JUSTIFIED` | (unjustified risk) | **0** |
| Absorbed (documented) | WAVE7 seal | held |
| Removed this phase | — | **0** |
| `reloadToWinPresent` | false (WAVE7) | **false** |
| `ACTIVE_COMPATIBILITY` | PRESENT | PRESENT + JUSTIFIED |

Evidence: `summary.json` · `inventory.json`.

---

## 8. Exit Decision

| Criterion | Status |
|-----------|--------|
| Identity inventory complete | ✅ |
| Duplicates absorbed into Foundation/seal **or** KEEP_JUSTIFIED | ✅ |
| Every deferred layer has documented `KEEP_JUSTIFIED` | ✅ |
| No sync→deferred debt hide | ✅ |
| No delete without Consumer Map | ✅ |
| First-paint contract reviewed | ✅ |
| Reload-to-win absent | ✅ |
| Exit code | **`DEFERRED_IDENTITY_ABSORBED_OR_JUSTIFIED`** |

**Final Decision: PASS** — `DEFERRED_IDENTITY_ABSORBED_OR_JUSTIFIED`.

Gate: `pnpm --filter @workspace/majalis run test:u8-deferred-identity`.

Do **not** start U9 Route Matrix / Store Release / TestFlight until this exit is on `main`.
