# ADMIN-FINAL-6 — Automation & Integrations Closure Report

| Field | Value |
|---|---|
| Phase | **ADMIN_FINAL_6** / ADMIN-FINAL-6 |
| Status | Implemented pending merge |
| Authority | `/api/admin/v3/automation` (GET read-only) · `AutomationHubPage` |
| Rule | رابط Legacy ≠ ترحيل كامل · لا أسرار في الاستجابة · لا mutating من v3 |

## Scope

Native v3 surfaces:

| Path | Role | Classification |
|---|---|---|
| `/admin/v3/automation` | Hub + classification matrix | **V3_PARTIAL** |
| `/admin/v3/automation/sources` | Read-only trusted sources list | **V3_PARTIAL** (was V3_LINK_ONLY) |
| `/admin/v3/automation/auto-content` | Stats/health only | **V3_PARTIAL** |
| `/admin/v3/automation/integrations` | Telegram/Instagram config flags | **V3_PARTIAL** status |

API: `GET /api/admin/v3/automation?view=overview|sources|auto-content|integrations`

## Honest residual matrix

| Surface | Classification | Why residual | Retirement condition |
|---|---|---|---|
| Sources upsert/toggle/run-monitor | **LEGACY_REQUIRED** | mutating + connectors | Native write + gates + consumer=0 |
| Auto-content `run` | **LEGACY_REQUIRED** | side-effect sync | Dedicated mutation contract + audit |
| Telegram webhook/broadcast/review | **LEGACY_REQUIRED** | secrets + side effects | FINAL-7 authz + OWNER secrets |
| Instagram Graph ops | **LEGACY_REQUIRED** or **BLOCKED_CREDENTIAL** | OWNER secrets | Secrets configured + validated |
| Automation engines (MKE/AKP/CMS/…) | **LEGACY_REQUIRED** | product depth | Separate migration waves |
| Feature-status / production dash | **LEGACY_REQUIRED** | ops tooling | Keep until SAFE_REMOVE |

**وجود رابط إلى Legacy لا يُعد ترحيلًا كاملًا** (not a full migration / formerly V3_LINK_ONLY for Sources).

## Security notes (defensive)

- No `accessTokenPreview`, bot tokens, or webhook secrets in v3 automation responses.
- Automation entity is **GET-only**; `run` / `set-webhook` / `broadcast` / `upsert-source` stay on legacy handlers.
- `requireAdminAccess` + `content.read` (or admin/*) required.
- Instagram missing config → **BLOCKED_CREDENTIAL** + **OWNER_ACTION**.

## Forbidden claims

Do not claim full admin security, zero residual risk, Instagram complete migration, or automation fully migrated.

## Gates

```bash
pnpm --filter @workspace/majalis run test:admin-final-6-automation
```

## Follow-ups

- ADMIN-FINAL-7 Authorization & IDOR/mass-assignment contracts
- Legacy Admin SAFE_REMOVE only after consumer=0 + parity
