# Startup Typography FOUC — Phase 1 Scope

**PR:** `STARTUP-TYPO-FOUC-P1`  
**Branch:** `cursor/startup-typography-fouc-p1`  
**Base:** `origin/main` @ `a688c5fa9` (P0 MATCH on production)  
**Goal:** Single canonical `html` font-size authority for the full boot→stable lifecycle.

## Cause

P0 proved sync winner was `index.css` `font-size: 16px` after `typography-app` calc. Deferred `design-system.css` also set `html { font-size: var(--ds-base) }` (`16px`).

## In scope

| File | Change |
|---|---|
| `src/index.css` | `html` font-size → `calc(100% * var(--ui-font-scale, 1))` |
| `src/styles/design-system.css` | same formula (no absolute `--ds-base` on html) |
| Gate | update P0 evidence gate → P1 closure assertions |
| Docs | this scope + short phase note in baseline addendum |

## Out of scope

- size-adjust metrics (Phase 2)
- Splash / chrome / home / prayer geometry (Phases 3–6)
- Mushaf QPC / prayer calc / adhan
- Raising debt ceilings
- New typography system

## Acceptance

1. No sync/deferred CSS sets competing absolute `html { font-size: 16px }` or `var(--ds-base)` on `html`.
2. Critical + typography-app + index + design-system share the same calc formula.
3. Gate PASS for scales 0.92 / 1.00 / 1.08 / 1.16 (static contract).
4. `verify:preflight` + `verify:ci` PASS → merge → MATCH.

## IMPLEMENTATION_FROZEN

Declared after the patches above land. No Phase 2+ in this PR.
