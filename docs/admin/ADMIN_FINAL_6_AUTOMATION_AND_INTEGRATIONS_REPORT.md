# ADMIN-FINAL-6 — Automation and Integrations Report

| Field | Value |
|---|---|
| Phase | **ADMIN_FINAL_6** / ADMIN-FINAL-6 |
| Status | PR #2427 — awaiting CI / merge / deploy / MATCH |
| Companion | `ADMIN_FINAL_6_AUTOMATION_REPORT.md` (gate summary) |
| Authority | `GET /api/admin/v3/automation` · `AutomationHubPage` |
| Rule | رابط Legacy ≠ ترحيل كامل · لا أسرار · لا mutating من v3 |

## Native v3 surfaces

| Path | Component | API | Permission | Classification |
|---|---|---|---|---|
| `/admin/v3/automation` | AutomationHubPage | `?view=overview` | content.read | **V3_PARTIAL** |
| `/admin/v3/automation/sources` | AutomationHubPage#sources | `?view=sources` | content.read | **V3_PARTIAL** |
| `/admin/v3/automation/auto-content` | AutomationHubPage#auto-content | `?view=auto-content` | content.read | **V3_PARTIAL** |
| `/admin/v3/automation/integrations` | AutomationHubPage#integrations | `?view=integrations` | content.read | **V3_PARTIAL** |

## Tool inventory (honest)

| Tool | Route (legacy) | API | Permission | Secret dep | Classification | Notes |
|---|---|---|---|---|---|---|
| Automation hub (v3) | `/admin/v3/automation` | `/api/admin/v3/automation` | content.read | none | **ACTIVE** / V3_PARTIAL | status + matrix only |
| Sources read (v3) | `/admin/v3/automation/sources` | v3 `view=sources` | content.read | none | **ACTIVE** / V3_PARTIAL | no upsert |
| Sources manage | `/admin/sources` | lesson-automation / source-monitor | content.edit | none | **LEGACY_KEEP** / LEGACY_REQUIRED | mutating |
| Auto-content status (v3) | `/admin/v3/automation/auto-content` | v3 + pipeline stats | content.read | none | **ACTIVE** / V3_PARTIAL | no `run` |
| Auto-content run | `/admin/auto-content` | `/api/admin/auto-content` | admin | cron secrets | **LEGACY_REQUIRED** | idempotency on legacy |
| Content production | `/admin/content-production` | content-production | admin | — | **LEGACY_REQUIRED** | |
| Content import URL/image | `/admin/content-import/*` | lesson-from-url/image | content.edit | — | **LEGACY_REQUIRED** | FINAL-4/9 residual |
| Telegram status (v3) | integrations panel | v3 flags | content.read | TELEGRAM_WEBHOOK_SECRET (boolean only) | **ACTIVE** / V3_PARTIAL | no secret value |
| Telegram ops | `/admin?section=telegram` | `/api/admin/telegram` | content.edit | bot/webhook | **LEGACY_REQUIRED** | broadcast/webhook |
| Instagram status (v3) | integrations panel | Graph status flags | content.read | Graph env (boolean) | **ACTIVE** / V3_PARTIAL | no token preview |
| Instagram ops | `/admin/integrations/instagram` | instagram-integration | content.edit | Graph tokens | **LEGACY_REQUIRED** or **BLOCKED_CREDENTIAL** | OWNER_ACTION if unset |
| Knowledge Engine / MKE | `/admin/automation/platform` | majlis-knowledge-engine | content.edit | — | **LEGACY_REQUIRED** | |
| Autonomous platform | `/admin/autonomous-platform` | autonomous-platform | admin | — | **LEGACY_REQUIRED** | |
| Feature status | `/admin/feature-status` | feature-health | admin | — | **LEGACY_REQUIRED** | |
| Smart CMS / aggregators / AI engines | AdminShell sections | various | content.edit | mixed | **LEGACY_REQUIRED** / **DEPRECATED** candidates | no fake V3_COMPLETE |
| External live provider tests | — | — | — | prod credentials | **BLOCKED_CREDENTIAL** | need test env + OWNER |

## Contracts enforced in v3 automation entity

| Contract | Status |
|---|---|
| Server-side `requireAdminAccess` | YES |
| GET-only (no run/webhook/broadcast/upsert) | YES |
| No secrets / no token preview in JSON | YES |
| Audit on sources/auto-content reads | YES (best-effort) |
| Permission from body | NO (denied by design) |
| Public trigger | NO |
| Infinite polling | NO (UI fetch once) |
| Wide mutation confirmation | N/A on v3 (mutations Legacy) |
| Raw provider errors | sanitized via sendSafeError / userMessageAr |

## Regression gate

```bash
pnpm --filter @workspace/majalis run test:admin-final-6-automation
```

Prevents: automation entity without auth · mutating verbs in handleAutomation · AppRoutes redirect of `/admin/v3/automation` to settings · missing classification report.

## Residual honesty

**وجود رابط إلى Legacy لا يُعد ترحيلًا كاملًا** (not a full migration / formerly V3_LINK_ONLY for Sources).

Do not claim full admin security, zero residual risk, Instagram complete migration, or automation fully migrated.

## Follow-ups

- ADMIN-FINAL-7 Authorization matrix + IDOR/mass-assignment gates
- Legacy SAFE_REMOVE only after parity + consumer=0
