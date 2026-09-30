# WAVE7 — Identity Cascade Absorption Report

| Field | Value |
|---|---|
| Branch | `cursor/final-repo-closure-wave7` |
| Baseline tip | `b0f1774d` (= production MATCH post-WAVE6) |
| Status | **IMPLEMENTED** |

## IMPLEMENTATION_FROZEN (WAVE7)

Declared after product patches below. Scope Manifest:

| | |
|---|---|
| **Goal** | Remove unify+recovery reload-to-win by absorbing winners into `final-release` tip |
| **Files** | `main.tsx` · `final-release.css` · cascade/FOUC/chrome gates · Phase0 baseline · this report |
| **Tests** | wave5-critical-fouc · identity-cascade · visual-identity-unify · dark-mode-chrome/recovery · verify:ci |
| **Out** | Deleting unify/recovery files · Card systems · Admin · Mushaf mapping · budget raises · new aggregator CSS |

## Layer classification (post-WAVE7)

| File | Sync/Deferred | Status | Notes |
|---|---|---|---|
| `theme.css` / Foundation / theme-aliases | sync | CANONICAL | unchanged |
| `brand-v4` / tokens / design-tokens / redesign-v2 | sync | ACTIVE_COMPATIBILITY | consumers > 0 |
| `visual-identity-unify.css` | **sync only** | ACTIVE_COMPATIBILITY | deferred reload **removed** |
| `dark-mode-recovery.css` | **sync only** | ACTIVE_COMPATIBILITY | deferred reload **removed** |
| `interaction-states.css` | sync + deferred | ACTIVE_COMPATIBILITY | sole remaining ALLOWED_CASCADE_REIMPORT |
| `final-release.css` | deferred | ACTIVE_LEGACY + **WAVE7 CASCADE SEAL** | tip holds unify/recovery winners |
| `sections-calm-polish` / `ssunnah-ux-polish` | sync | ACTIVE_COMPATIBILITY | unchanged |
| `m2030/*` / `design-system` | deferred | ACTIVE_LEGACY | unchanged |

## Root cause

`final-release.css` loaded late and overwrote identity tokens (`--color-text-muted`, `--shadow-soft`) and dark chrome (`bottom-nav*`) with competing `!important` rules. Product re-imported full unify + recovery after it (**reload-to-win**).

Proven pre-WAVE7:

- unify∩final selector strings = 0; class overlap = 26 (mostly complementary props).
- Token fights: `--color-text-muted` (`ink-2` vs `muted`); `--shadow-soft` (`mj-sh` vs `e-2`).
- recovery∩final class overlap = 31 (order-dependent chrome).

## Changes

1. Align `final-release` root/dark tokens to unify winners (`--mj-ink-2`, `--mj-sh`).
2. Retarget dark bottom-nav / top-section / navbar chrome to recovery `--dm-*` tokens (no new hex literals in seal).
3. Append **WAVE7 CASCADE SEAL** at end of `final-release.css` (active-tab + opacity/filter winners).
4. Remove deferred `import()` of unify + recovery from `main.tsx`.
5. Shrink sync∩deferred allowlist to `interaction-states.css` only; update gates.

## Parity checklist (automated + contract)

| Surface | Status |
|---|---|
| Light / Dark / System token seal | gate + CSS contract |
| RTL / shell geometry | unchanged sync layers |
| Bottom nav dark chrome | dark-mode-chrome-gate |
| unify radius/cards | visual-identity-unify-gate |
| No reload-to-win | wave5 + identity-cascade gates |
| Device FOUC/CLS | **DEVICE_REQUIRED** (not claimed) |

## Metrics

| Metric | Before (Phase0) | After WAVE7 | Delta |
|---|---:|---:|---|
| mainSyncCssImports | 22 | 22 | 0 |
| mainDeferredCssImports | 53 | **51** | **−2** |
| sync∩deferred allowlist | 3 | **1** | **−2** |
| reload-to-win unify/recovery | required | **removed** | improved |
| mjDeclOutsideAllowlist | 0 | 0 | held |
| hexInCss (ceiling lowered) | 8988 | **8979** | **−9** |
| important | 4787 | 4787 | held |
| boxShadowDecls | 1113 | 1113 | held |

Critical CSS gzip: sync graph unchanged (seal is inside deferred `final-release`). Budget/ceilings not raised.

## Residual

- Full retirement of unify/recovery/brand-v4/m2030 files still BLOCKED (consumers > 0).
- `interaction-states` deferred reimport remains ALLOWED (dark stack race).
- Card/shadow/radius raw debt → WAVE8.
- Admin interaction → WAVE9.
- Device evidence → WAVE13 / DEVICE_REQUIRED.

## Non-claims

No STORE GO · no FULLY COMPLETE · no DEVICE_TESTED · no new Design System / token family.
