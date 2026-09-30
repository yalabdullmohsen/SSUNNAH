# Admin Server Authorization — Closure Report (Inventory Start)

**Phase:** ADMIN-FINAL-1 (authorization matrix start)  
**Status:** `AUTH_INVENTORY_BASELINED` — **not** `ADMIN_FULLY_SECURE`  
**Tip:** `369d8b17e`  
**Authority:** Server (`lib/admin-auth.mjs` + `lib/governance/*`). UI `permissions.ts` is non-authoritative.

---

## 1. Contract template (per endpoint)

Documented fields for later FINAL-7 completion:

`endpoint` · `method` · `entity` · `action` · `required permission` · `allowed roles` · `denied roles` · `ownership` · `object-level` · `validation` · `audit` · `error contract` · `rate limit`

---

## 2. Handler inventory (34)

| Handler | Auth call | Operation permission signal | Notes |
|---|---|---|---|
| `v3.js` | `requireAdminAccess` | `hasPermission` per op | Primary CRUD authority |
| `submissions.js` | `requireAdminAccess` | `hasPermission` | Reviews |
| `analytics-platform.js` | `requireAdminAccess` + `analytics.read` | yes | Admin/super gate also in UI |
| `lesson-from-url.js` | `requireAdminAccess` + `content.edit` | yes | Import URL |
| `lesson-from-image.js` | `requireAdminAccess` + `content.edit` | yes | Import image |
| `lesson-automation.js` | `requireAdminAccess` + `content.edit` | yes | Automation |
| `source-monitor.js` | re-export → `lesson-automation` | inherited | Alias — not weak standalone |
| `smart-cms.js` | `requireAdminAccess` + `content.edit` | yes | |
| `instagram-integration.js` | `requireAdminAccess` + `content.edit` | yes | Secrets must stay server |
| `telegram.js` | `requireAdminAccess` + `content.edit` | yes | |
| `majlis-knowledge-engine.js` | `requireAdminAccess` + `content.edit` | yes | |
| `content-import.js` | `requireAdminAccess` / `requireImport` | yes | Import gate |
| `auth-context.js` | `requireAdminAccess` | context + `canImportContent` | Session context |
| `search-analytics.js` | `requireAdminAccess` | bare+admin | Tighten in FINAL-7 |
| `scholarly-verification.js` | `requireAdminAccess` | bare | |
| `auto-content.js` | `requireAdminAccess` | bare | |
| `bootstrap-owner.js` | `requireAdminAccess` | bare + owner rules | OWNER-sensitive · audit required |
| `knowledge-reasoning.js` | `requireAdminAccess` | bare | |
| `autonomous-platform.js` | `requireAdminAccess` | bare | |
| `governance.js` | `requireAdminAccess` | bare | Role change must stay server |
| `ai-agents.js` | `requireAdminAccess` | bare | |
| `autonomous-ai.js` | `requireAdminAccess` | bare | |
| `feature-health.js` | `requireAdminAccess` | bare | |
| `production-activate.js` | `requireAdminAccess` | bare | High impact |
| `islamic-intelligence.js` | `requireAdminAccess` | bare | |
| `sync-fiqh-council.js` | `requireAdminAccess` | bare | |
| `check-fiqh-links.js` | `requireAdminAccess` | bare | |
| `global-reference.js` | `requireAdminAccess` | bare | |
| `content-production.js` | `requireAdminAccess` | bare | |
| `auto-knowledge-engine.js` | `requireAdminAccess` | bare | |
| `verified-knowledge.js` | `requireAdminAccess` | bare | |
| `open-platform.js` | `requireAdminAccess` | bare | |
| `platform-bootstrap.js` | `requireAdminAccess` | bare | High impact |
| `knowledge-pipeline.js` | `requireAdminAccess` | bare | |

**Summary:** 34/34 resolve to authenticated admin gate. **11** have explicit operation-permission signals in-file. **~22** rely on session admin membership only → **RBAC fine-grain debt** (FIXABLE_IN_REPOSITORY in FINAL-7).

---

## 3. Role model (server)

From `lib/governance/config.mjs`:

| Role | Level | Key permissions |
|---|---:|---|
| `super_admin` | 100 | `*` |
| `system_admin` | 90 | system/users/audit/cron/security |
| `content_manager` | 80 | content.*/publish/archive/import/analytics.read |
| `scientific_reviewer` | 75 | review.scientific/approve/reject |
| `editor` | 70 | content.edit/create, review.editorial |
| `moderator` | 60 | content.moderate, review.editorial, users.read |
| `author` / `translator` | 50 | create/edit_own / translate |
| `dawah_counselor` | 40 | dawah assigned |
| `analytics_viewer` | 30 | analytics.read, monitoring.read |
| `read_only` | 10 | content.read, audit.read |

Legacy map: `admin→super_admin`, `sheikh→scientific_reviewer`, `user→read_only`.

Owner/bootstrap emails may receive unrestricted admin via `owner-config.mjs` — must remain auditable; **no client-granted escalation**.

---

## 4. UI vs server

| Surface | Rule |
|---|---|
| `admin-v3/permissions.ts` | Hide controls only |
| `AdminRouteGuard` | Session + admin membership for shell |
| API | Must reject 401/403 regardless of UI |
| Analytics platform UI | super_admin / system_admin / owner — server also requires `analytics.read` + role gate in handler |

**FINAL-1 prevention gate** asserts UI permission names used in v3 are a subset of documented server permission vocabulary (no novel client-only grants invented in ROLE_PERMS beyond known server names / wildcards).

---

## 5. Defensive test plan (not all executed against production)

| Case | Expected | Status |
|---|---|---|
| No session | 401 | Covered partially by existing API tests / FINAL-7 expand |
| Expired / malformed session | 401 | FINAL-7 |
| Normal user | 403 | FINAL-7 |
| `read_only` / `analytics_viewer` / weaker roles on write | 403 | FINAL-7 |
| Object ID valid but unauthorized | 403/404 per contract (no existence leak beyond contract) | FINAL-7 |
| Mass assignment / role in body | ignored; server role wins | FINAL-7 |
| Bulk mixed permissions | per-item deny | FINAL-7 |
| Raw DB / stack in JSON | redacted | FINAL-7 |
| RLS / SQL on production | **OWNER_ACTION** — not applied by agent | blocked |

No production role probing with real accounts in this phase.

---

## 6. Object-level authorization

| Entity family | Object-level proven? | Notes |
|---|---|---|
| v3 lessons/sheikhs/fawaid/categories/users | Partial via handler checks | Expand tests FINAL-3/7 |
| Submissions | Partial | Inbox FINAL-2 + FINAL-7 |
| Integrations tokens | Must never return full secrets | FINAL-6/9 |
| Bootstrap owner | Special-case | OWNER_ACTION ops + audit |

---

## 7. Closure checklist (program-level — incomplete)

- [x] Inventory of all admin handlers
- [x] Confirm session gate on all handlers (incl. re-export)
- [ ] Operation permission on every mutating endpoint
- [ ] Role matrix automated tests (12 roles × critical ops)
- [ ] Object-level tests
- [ ] Mass assignment / escalation tests
- [ ] Error redaction tests
- [ ] Audit events on role change / publish / delete / import

**Verdict this PR:** `AUTH_INVENTORY_BASELINED` · remaining work `FIXABLE_IN_REPOSITORY` + `OWNER_ACTION` for RLS.
