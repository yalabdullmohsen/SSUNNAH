# U3 READY PACK — Light / Dark / System Single Pipeline

| Field | Value |
|-------|-------|
| Phase | **U3** Light, Dark and System Single Pipeline |
| Status | **READY_PACK_COMPLETE** (preparation) |
| Execution | **LOCKED** until U2 = MERGED_AND_DEPLOYED + MATCH + Smoke |
| Depends on | U2 `TOKEN_CONTRACT_STABLE` |
| Exit | `DARK_LIGHT_UNIFIED` · production `themeMutAfterFP = 0` |
| Policy | CEP/PEOP — PREPARATION ONLY until unlock |

## 1. Scope

**In:** Theme writers inventory · boot-before-paint · ThemePreference sole post-boot writer · ensure-dark-layers = CSS load only · absorb cosmetic dark layers into theme/aliases/foundation · route-surface / prayer / mushaf boundaries.

**Out:** Mushaf appearance SoT · Prayer calc · Admin theme fork · new Theme v3 · raising flicker thresholds · U4 chrome CLS (prep only).

## 2. File Inventory

| Path | Class |
|------|-------|
| `artifacts/majalis/index.html` (theme boot) | WRITE audit |
| `src/lib/theme-preference.ts` | CANONICAL writer |
| `src/components/ThemePreferenceProvider*` | CANONICAL |
| `src/lib/boot-sequence.ts` | Boot sync |
| `src/lib/ensure-dark-layers.ts` | CSS loader only |
| `src/lib/route-surface.ts` | Surface commit · no product theme flip |
| `src/App.tsx` data-theme attrs | Must not fight preference |
| `dark-mode-recovery.css` · `dark-mode-surfaces.css` · `dark-design-system.css` · `premium-dark-refine.css` · `luxury-night*` · `sunnah-identity-luxury-night*` | ABSORB / KEEP_JUSTIFIED |
| `theme.css` · `theme-aliases.css` · foundation | Absorb target |

## 3. Ownership Matrix

| Concern | Authority |
|---------|-----------|
| First paint theme | index.html boot |
| Runtime preference | `theme-preference.ts` only |
| Dark CSS load | `ensure-dark-layers` (no DOM theme mutate) |
| Route immersive | `route-surface` / prayer / mushaf — not product theme |
| System | `preference=auto` only |

## 4–6. Consumer / Authority / Legacy

- Writers: boot · preference · provider · App attrs · floating/back (must not rewrite theme if equal) · page-local effects (eliminate).
- Legacy dark kits: ACTIVE_COMPATIBILITY until cosmetic-only + no FP repaint.
- Reuse: `DARK_MODE_AUTHORITY.md` · `ZERO_STARTUP_FLICKER_*` · U2 matrix.

## 7–11. Impacts

| Area | Note |
|------|------|
| Security | none |
| A11y | contrast Light/Dark/System |
| Perf | themeMutAfterFP=0 · no deferred identity repaint |
| Routes | Home Search QuranHub Mushaf Prayer Lessons Hadith Fiqh Settings Auth |
| Admin | OUT |

## 12. Test Matrix

Cold Light/Dark · System Light/Dark · toggle · refresh · deep link · RTL · listed routes · `zero-startup-flicker-gate` · `dark-mode-authority` · Color contrast · production measure themeMutAfterFP=0.

## 13–15. Rollback / Deploy / Smoke

CSS/theme only · revert squash · smoke 390×844 Light+Dark+System on `/` `/search` `/quran-hub` `/mushaf` `/prayer-times`.

## 16. Exit → `DARK_LIGHT_UNIFIED`

Single pipeline · themeMutAfterFP=0 on prod · no parallel writers · gates green · MATCH+Smoke.
