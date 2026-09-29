# DARK BRIDGE REDUCTION REPORT — PR2 (Token Absorb)

| Field | Value |
|---|---|
| Date | 2026-09-29 |
| Branch | `cursor/final-internal-closure-pr2` |
| Status | **IMPROVED** — `--mj-*` remaps absorbed; imports KEEP |

Companion: `docs/audit/SUNNAH_FINAL_INTERNAL_CLOSURE_PR2.md` · authority `docs/design/DARK_MODE_AUTHORITY.md`.

## Classification

| File | Class | `--mj-*` decls outside allowlist | Action |
|---|---|---:|---|
| `dark-mode-recovery.css` | **ACTIVE** | **0** (was 7) | KEEP import · `--dm-*` + chrome · no `--mj-*` |
| `dark-mode-surfaces.css` | **ACTIVE** | 0 | KEEP |
| `dark-design-system.css` | **COMPATIBILITY** | **0** (was 8) | KEEP · consumer patches only |
| `premium-dark-refine.css` | **ACTIVE** | **0** (was 15) | KEEP · `--pd-*` polish only |
| `pages/luxury-night-v2.css` | **COMPATIBILITY** | 0 | KEEP deferred |
| `sunnah-identity-luxury-night.css` | **COMPATIBILITY** | — | KEEP |
| `components/dark-emerald-menus.css` | **COMPATIBILITY** | 0 | KEEP menus |

**REMOVE_CANDIDATE:** none. **BLOCKED:** mushaf reader · admin · prayer calc.

## Absorb (PR2)

| Former site | Decls removed | Destination |
|---|---:|---|
| `premium-dark-refine.css` | 15 | `theme.css` contract + `theme-aliases` night + HDR |
| `dark-design-system.css` | 8 | aliases (HDR `@media`) · no bridge `--mj-*` |
| `dark-mode-recovery.css` | 7 | aliases live-bind `--mj-bg` ← `--surface-app` (recovery still sets `--surface-app`) |

**mjDeclOutsideAllowlist:** 30 → **0**.

## Import removal

**Not done** — recovery / surfaces / refine / design-system still required for `--dm-*` / `--pd-*` and selector leak-fixes. File delete deferred until REMOVE_CANDIDATE with proof.

## Smoke (authority)

| Route | Light | Dark | System |
|---|---|---|---|
| Home / Search / Prayer / Quran Hub / Hadith / Lessons / Settings | OK | OK (aliases = contract) | OK via `auto` |
| Mushaf | OK | MUSHAF_SPECIAL appearance | OK |

No FOUC intent: competing `#121816` aliases night canvas removed; `--mj-bg` tracks `--surface-app`.

## Verdict

IMPROVED · outside decls −30 · bridge **imports** KEEP · ceilings lowered via `--write-budget`.
