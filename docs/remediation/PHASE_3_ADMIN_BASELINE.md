# PHASE 3 ADMIN BASELINE — Admin v3 Native CRUD

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Branch | `cursor/admin-v3-crud-p3` |
| Tip (Phase 1+2) | `45d432a62` |
| Worktree | `/Users/alabdullmohsen/wt-admin-v3-p3` |
| Product | `artifacts/majalis` |

## Commands (measured — before code edits)

| Command | Result |
|---|---|
| `pnpm run typecheck` | **Pass** |
| `node --import tsx src/lib/__tests__/admin-v3-migration-gate.test.ts` | **Pass** |
| `node --import tsx src/lib/__tests__/admin-v3-centers-gate.test.ts` | **Pass** (centers=6 contentTools=14) |
| `node --import tsx src/lib/__tests__/admin-v3-shell-gate.test.ts` | **Pass** |
| `pnpm run verify:preflight` | **Pass** (0.6s) |
| `PORT=24216 BASE_PATH=/ pnpm --filter @workspace/majalis run build` | **Pass** · commit stamp `45d432a6` |
| `pnpm run verify:ci` | **Pass** (288.2s) |

## Architecture snapshot (code-backed)

| Piece | Path | Finding |
|---|---|---|
| Entry | `AdminEntryBridge.tsx` | `/admin` → `/admin/v3`; `?section=` → Legacy |
| v3 shell | `admin-v3/AdminV3Shell.tsx` | Sidebar + mobile nav; links Legacy |
| v3 centers | `centers/catalog.ts` | **All tools = legacy hrefs**; no native CRUD |
| v3 app | `AdminV3App.tsx` | Overview OR CenterWorkspace (tool cards only) |
| Legacy CRUD | `views/AdminPage.tsx` + `views/admin/*Section.tsx` | Real list/create/edit/delete |
| Client data | `lib/supabase.ts` `admin*` helpers | Lessons/sheikhs/fawaid/users via RLS |
| Categories | `lib/categories-admin-service.ts` | Direct Supabase |
| Submissions API | `/api/admin/submissions` | GET list + POST approve/reject |
| Server auth | `lib/admin-auth.mjs` | JWT + governance roles; fine-grained perms sparse |
| v3 audit | `admin-v3/audit-events.ts` | **sessionStorage only** — not server audit |
| Permission labels | catalog `admin.read` / `content.write` / `review.decide` | **UI labels ≠ server RBAC** (`content.edit`, `review.approve`, …) |

## Feature inventory (pre-change)

| feature_id | Legacy route | v3 route | status | ops | API | risk |
|---|---|---|---|---|---|---|
| overview | `/admin` | `/admin/v3` | V3_NATIVE (shell) | view | none | low |
| reviews_inbox | review-hub, `?section=submissions` | `/admin/v3/reviews` | V3_LINKS_TO_LEGACY | review via Legacy | `/api/admin/submissions` | high |
| lessons | `?section=lessons` | content → lessons | V3_LINKS_TO_LEGACY | full CRUD Legacy | client Supabase | high |
| sheikhs | `?section=sheikhs` | content → sheikhs | V3_LINKS_TO_LEGACY | full CRUD Legacy | client Supabase | med |
| fawaid | `?section=fawaid` | content → fawaid | V3_LINKS_TO_LEGACY | full CRUD Legacy | client Supabase | med |
| taxonomy | `?section=categories` | `/admin/v3/taxonomy` | V3_LINKS_TO_LEGACY | full CRUD Legacy | client Supabase | med |
| users | `?section=users` | `/admin/v3/community` | V3_LINKS_TO_LEGACY | list + role | client + governance API | high |
| notifications | telegram / instagram | settings tools | V3_LINKS_TO_LEGACY | manage | `/api/admin/telegram` etc. | med |
| analytics | search-analytics | `/admin/v3/analytics` | V3_LINKS_TO_LEGACY | read | search-analytics API | low |
| automation | `/admin/automation/*` | settings tools | LEGACY_REQUIRED | manage | many admin APIs | med |
| audit | — | `/admin/v3/audit` | V3_NATIVE (local) | read local | none persisted | low |
| learning_paths | file exists | — | ORPHAN | — | — | low |

## Critical gaps for Phase 3

1. No native Review Inbox CRUD in v3 (catalog cards only).
2. No `/api/admin/lessons|sheikhs|fawaid|categories|users` — entity CRUD bypasses central API auth/audit.
3. Dual permission vocabularies (v3 catalog vs server RBAC).
4. `isAdmin` client gate is coarse; API often only `requireAdminAccess` without operation permission.
5. Legacy must stay; delete **NOT READY** (`ADMIN_V3_MIGRATION_REPORT.md`).

## Constraints

- No merge / no push / no deploy / no production SQL/RLS.
- No mushaf / prayer local notifications / religious text edits.
- No Legacy Admin deletion.
- Guest public app must remain unaffected.

## PRE_EXISTING

- None recorded for Admin v3 gates at tip `45d432a62`.
- Phase 2 note: `assistant-safety.test.mjs` 48/7 internal report with exit 0 — outside Admin scope.
