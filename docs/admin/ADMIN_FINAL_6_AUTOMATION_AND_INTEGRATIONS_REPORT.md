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

## LHCI FAILURE ROOT CAUSE

| Field | Value |
|---|---|
| Failed CI run | `36823098327` (first attempt on head `efbbe82e`) |
| Failed LHCI artifact | `lhci-home-reports` id `11144765268` |
| Passing rerun (same run, `--failed` once) | LHCI job `110246039381` · artifact id `11144716627` |
| Base main compare | tip `021001e6` · run `36821200673` · artifact `11144061322` |
| Classification | **LHCI_FLAKE** (TBT variance under simulate throttling) |
| Not | PR_REGRESSION · ROUTE_GRAPH_LEAK · ADMIN_BUNDLE_LEAK · CSS_GRAPH_LEAK · MISCONFIGURED_AUDIT · EXISTING_MAIN_FAILURE |

### Audit that returned 0,0,0 (expected ≥1)

**Name:** `forced-reflow-insight` (title: «Forced reflow»)  
**Assertion:** `["warn", { minScore: 1 }]` in `artifacts/majalis/scripts/lhci-thresholds.cjs`  
**Observed:** score `0` on PR fail, PR pass, and main — **warning only**, not the hard fail.  
Not a schema/misconfiguration issue; Lighthouse emits the insight with score 0 when forced reflow is detected.

### Hard fail (error)

**`total-blocking-time`** — `["error", { maxNumericValue: 2100 }]` — **threshold not raised**.

| Set | TBT runs (ms) | Median | vs 2100 |
|---|---|---:|---|
| PR fail | 2301 / 2243 / 2311 | **2301** | FAIL |
| PR rerun pass | 1596 / 1715 / 1711 | **1711** | PASS |
| main `021001e6` | 2044 / 2086 / 2051 | **2051** | PASS |

### Warnings (unchanged across fail/pass/main — not blockers)

| Audit | Assertion | Fail / Pass / Main |
|---|---|---|
| `unused-css-rules` | warn ≤80 (LHCI unit) | found ~150 / 150 / same class · savings bytes **39141** identical |
| `unused-javascript` | warn ≤500 | found ~860–1020 · savings ~**138k** identical class |
| `categories:performance` | warn ≥0.7 | ~0.47–0.48 warn |
| `forced-reflow-insight` | warn ≥1 | **0,0,0** on all sets |

Largest unused CSS (all sets): `assets/index-*.css` (~39 KiB wasted).  
Largest unused JS (all sets): `supabase-*.js`, `index-*.js`, `react-dom-*.js`, `AppRoutes-*.js` — **not** Automation/Admin v3 modules.

### Home graph vs FINAL-6

| Check | Result |
|---|---|
| `AutomationHub*` / `admin-v3` network on `/` | **absent** (fail + pass + main) |
| Pre-existing admin-ish on `/` | `AdminInlineEdit` · `admin-api` · `adhkar-admin` — **same on main** (not introduced by FINAL-6) |
| AppRoutes transfer delta PR vs main | **+52 bytes** only |
| Total transfer delta | **~+40 bytes** |
| AdminV3App load path | `lazyWithRetry(() => import("@/admin-v3/AdminV3App"))` + `AdminLazyRoute` only |

### Implemented fix

**None in product code** — root cause is CI TBT simulate variance (LHCI_FLAKE).  
Single allowed failed-job rerun produced three runs all ≤2100 (median 1711).  
Thresholds / budgets / must-not-skip / warn→error conversions: **unchanged**.

### Verification runs

1. Focused gates: `test:admin-final-6-automation` (local) ✅  
2. CI first attempt: LHCI FAIL (TBT) → Verify/ci-required downstream FAIL  
3. One `--failed` rerun: LHCI / Verify build / ci-required **SUCCESS**  
4. Artifact compare fail vs pass vs main as above  
5. Independent confirmation: rerun artifact TBT median **1711** ≤ 2100  

### Confirmation

Thresholds were **not** raised. No Admin JS/CSS from FINAL-6 entered the public initial graph. Merge only after required checks green on current head.

## Follow-ups

- ADMIN-FINAL-7 Authorization matrix + IDOR/mass-assignment gates — **after** `ADMIN_FINAL_6_MERGED_AND_DEPLOYED`
- Legacy SAFE_REMOVE only after parity + consumer=0
- Pre-existing home `AdminInlineEdit` / `adhkar-admin` idle graph: follow-up (not FINAL-6 scope)
