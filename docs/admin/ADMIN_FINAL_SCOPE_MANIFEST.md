# ADMIN-FINAL-1 — Scope Manifest

**PR:** `ADMIN-FINAL-1`  
**Branch:** `cursor/admin-final-1-baseline`  
**Base:** latest `origin/main` at start (`369d8b17e`)  
**Goal:** Live baseline + route/ownership truth + authorization inventory matrix + initial prevention gates.  
**Posture:** `WEB_RELEASED_NATIVE_HOLD`

---

## Objective

Lock an honest live inventory and classification so later ADMIN-FINAL-* PRs migrate, harden, and retire Legacy without parallel work or false SAFE_REMOVE.

## In scope (this PR only)

| Item | Deliverable |
|---|---|
| Live baseline | `docs/admin/ADMIN_FINAL_MIGRATION_AND_SECURITY_BASELINE.md` |
| Scope + freeze | this file + `IMPLEMENTATION_FROZEN` |
| Route & ownership matrix | `docs/admin/ADMIN_FINAL_ROUTE_AND_OWNERSHIP_MATRIX.md` |
| Server auth inventory (matrix start, not closure claim) | `docs/security/ADMIN_SERVER_AUTHORIZATION_CLOSURE_REPORT.md` |
| Initial prevention gate | `artifacts/majalis/src/lib/__tests__/admin-final-1-prevention-gate.test.ts` + package script wire |
| Index / current status pointers | `docs/REPO_INDEX.md`, `docs/release/CURRENT_PROJECT_STATUS.md` (tip sync only) |

## Out of scope (explicit)

- Reviews Inbox unification (ADMIN-FINAL-2)
- Content/Taxonomy/Users CRUD completion (ADMIN-FINAL-3)
- Library/Adhkar/Universities migration (ADMIN-FINAL-4)
- Prompt/confirm removal product changes (ADMIN-FINAL-5)
- Automation/integrations product moves (ADMIN-FINAL-6)
- Full audit completeness + deep API role matrix tests (ADMIN-FINAL-7)
- Legacy SAFE_REMOVE deletions (ADMIN-FINAL-8)
- Mobile polish product changes (ADMIN-FINAL-9)
- Final audit report `SUNNAH_ADMIN_V3_FINAL_…` (ADMIN-FINAL-AUDIT)
- Production SQL/RLS, secrets, destructive smoke
- Raising debt ceilings / lowering floors
- Historical report rewrites
- New Admin Design System / parallel Button/Card/Form systems
- Force push / hard reset / git clean / admin bypass

## Acceptance criteria (FINAL-1)

1. Baseline counts measured from live tip and recorded.
2. Every `AppRoutes` `/admin*` path classified in Route Matrix.
3. Every admin API handler listed with auth posture (session gate vs operation permission).
4. Prevention gate PASS: no admin CSS in `main.tsx`; v3 has zero prompt/confirm/alert; every handler resolves to `requireAdminAccess`; every route path appears in matrix doc.
5. `verify:preflight` + `verify:ci` PASS.
6. PR merged to `main`; Auto Deploy SUCCESS; production `version.json` MATCH tip (Delivery).
7. No security/authorization regression vs tip.
8. No Legacy deletion.

## Tests

- New: `pnpm --filter @workspace/majalis run test:admin-final-1-prevention`
- Existing smoke (focused): `test:admin-v3-migration`, `test:admin-isolation-gate`, `admin-v3-shell` (as needed)
- Full: `pnpm run verify:preflight` then `pnpm run verify:ci`

## Stop conditions

- Patch fails twice on same root → `BLOCKED_WITH_EVIDENCE`
- Need to raise ceilings / weaken gates → stop
- Need prod SQL/secrets → `OWNER_ACTION`, stop product change
- Parallel stage temptation → refuse; wait MATCH

---

## IMPLEMENTATION_FROZEN

**Declared:** 2026-09-30 — after Scope Manifest + baseline + route matrix + auth inventory + prevention gate land.

After this marker:

- No general search expansion
- No requirements from later ADMIN-FINAL-* phases
- No files outside this manifest
- No opportunistic cleanup
- No starting ADMIN-FINAL-2 until this PR is MERGED + MATCH + smoke-clean

Focused verification and Class-A fixes from this diff only remain allowed until Delivery completes.
