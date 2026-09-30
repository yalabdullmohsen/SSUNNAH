# Startup Typography FOUC — Scope Manifest (PHASE 0)

**PR train:** `STARTUP-TYPO-FOUC-P0`  
**Branch:** `cursor/startup-typography-fouc-p0`  
**Base:** `origin/main` @ `369d8b17e`  
**Goal:** Lock live baseline + cascade proof for UI font-scale jump; no product fix yet.

---

## In scope

| Deliverable | Path |
|---|---|
| Live baseline | `docs/performance/STARTUP_TYPOGRAPHY_FOUC_LIVE_BASELINE.md` |
| This manifest + freeze | this file |
| Static cascade evidence gate | `artifacts/majalis/src/lib/__tests__/startup-typography-fouc-p0-gate.test.ts` |
| Script wire | `package.json` `test:startup-typography-fouc-p0` (+ layout-integrity or nav-active if appropriate) |
| Index / status pointers | `docs/REPO_INDEX.md`, `docs/release/CURRENT_PROJECT_STATUS.md` |

## Out of scope (later phases)

- Unifying `html` font-size (Phase 1)
- Fallback metrics / size-adjust (Phase 2)
- Splash lifecycle product changes (Phase 3)
- Chrome fallback parity (Phase 4)
- Home / Prayer Suspense (Phase 5–6)
- Noncritical CSS graph edits (Phase 7+)
- Mushaf QPC / geometry / audio
- Prayer calculation / adhan
- Debt ceiling raises
- Snapshot updates
- Parallel Admin FINAL-* product work in this PR

## Acceptance

1. Baseline records competing authorities and jump table.
2. Gate proves sync winner is `index.css` `16px` after `typography-app` calc.
3. Gate proves critical/HTML uses calc with `--ui-font-scale`.
4. `verify:preflight` + `verify:ci` PASS.
5. PR merged → deploy → MATCH before Phase 1 starts.

---

## IMPLEMENTATION_FROZEN

**Declared:** 2026-09-30 after baseline + evidence gate land.

After freeze: no Phase 1+ product patches in this PR; no general search expansion; Class-A fixes from this diff only; no Queued startup phases until MATCH.
