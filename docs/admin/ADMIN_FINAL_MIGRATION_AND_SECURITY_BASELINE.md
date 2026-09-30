# Admin Final Migration & Security Baseline — ADMIN-FINAL-1

**Phase:** 0 — Live Admin Baseline  
**PR train:** `ADMIN-FINAL-1`  
**Branch:** `cursor/admin-final-1-baseline`  
**Measured tip:** `369d8b17e` (`origin/main` at measurement)  
**Conflict-resolved tip:** `c22a3aa2b` (main after Startup Typography FOUC P1; Admin/API/Routes inventory unchanged by that tip — counts below remain valid)  
**Product root:** `artifacts/majalis`  
**Release posture:** `WEB_RELEASED_NATIVE_HOLD`  
**Program target:** `ADMIN_V3_OPERATIONALLY_COMPLETE` (not claimed here)  
**Explicit non-claims:** no `ADMIN_FULLY_SECURE` · no `ZERO_SECURITY_RISK` · no `FULLY COMPLETE` · no `STORE GO` · no `WCAG CERTIFIED` · no `DEVICE_TESTED`

---

## 1. Live reference state

| Field | Evidence |
|---|---|
| `origin/main` tip | `369d8b17e` — «تحسين نعومة تقليب المصحف — Fluidity Optimization» |
| Production `version.json` from this agent network | **UNREACHABLE** — HTTP `441` on `https://sunnah.app/version.json` (egress/policy). Not treated as deploy failure. MATCH verification deferred to Delivery after PR merge via authorized channel. |
| Open Admin PRs (public GitHub API, unauthenticated) | `2` open PRs total on repo; **0** open titles/refs matching `admin` at measurement |
| Active Admin worktrees | `/tmp/majlis-admin-final-1` @ `cursor/admin-final-1-baseline`; `/Users/.../wt-admin-v3-p3` @ `cursor/admin-v3-crud-p3` (stale relative to tip — not used) |
| Edge public isolation | `artifacts/majalis/middleware.js` — unauthenticated `/admin*` → HTTP **404** «غير متاح» + noindex headers in `vercel.json` |
| Admin SPA entry | `AdminLazyRoute` → `AdminRouteGuard` (lazy). Public home must not mount Admin shell. |

**Conflict with stale docs:** `docs/release/CURRENT_PROJECT_STATUS.md` previously listed tip `37257cd19` / MATCH — **live git tip is `369d8b17e`**. Historical reports not rewritten; status docs updated in this PR only where they are current-state files.

---

## 2. Inventory counts (live filesystem + ripgrep)

| Metric | Count | Notes |
|---|---:|---|
| Admin v3 files (`src/admin-v3/**`) | **25** | Shell + centers + domains + permissions |
| Legacy Admin views (`src/views/admin/**`) | **67** | Includes orphan learning-paths |
| Admin components (`src/components/admin/**`) | **15** | Review hub + shared admin UI |
| AppRoutes `/admin*` path entries | **42** | unique |
| v3 path entries (incl. redirects) | **16** | Canonical + aliases |
| Legacy / standalone path entries | **26** | Keep until SAFE_REMOVE |
| Standalone operational pages (non-`?section=`) | **~15** | automation, import, instagram, universities, … |
| API handlers (`lib/api-handlers/admin/**`) | **34** | includes `source-monitor.js` re-export |
| Handlers calling `requireAdminAccess` | **33** source files + 1 re-export of authenticated module | `source-monitor.js` → `lesson-automation.js` |
| Handlers with **explicit** permission / `hasPermission` / `requireImport` signal | **11** | remainder: bare session+admin gate only |
| Handlers with **no** `requireAdminAccess` in file | **0** (after re-export resolution) | Presence ≠ fine-grained RBAC |
| Raw `<button>` in Admin v3 | **0** | Interaction authority holding |
| Raw `<button>` in Legacy admin views+components | **264** | Debt — ADMIN_ONLY |
| `div`/`span` `onClick` (admin trees) | **10** | Classify in FINAL-5/7 |
| Native `<select>` (admin trees) | **87** | Many NATIVE_JUSTIFIED / LEGACY_KEEP |
| `prompt(` in Legacy admin | **7** | Categories, LearningPaths, Telegram |
| `confirm(` in Legacy admin | **32** | Destructive + bulk |
| `alert(` in Legacy admin | **25** | Validation / errors |
| `prompt`/`confirm`/`alert` in Admin v3 | **0** | Gate will freeze |
| Missing `type` on `<button>` (admin trees) | **0** | Holding |
| Unnamed IconButton in v3 | **0** observed | No IconButton usage in v3 tree |
| Admin CSS files | **9** | see §4 |
| Admin CSS imported from `main.tsx` | **0** | Gate will freeze |
| Admin CSS via lazy Admin surface | `admin-gate.css` (guard), `admin-v3-shell.css`, `admin.css` (legacy page) | Loaded only under AdminLazyRoute path |
| Debt budget ceilings (interaction) | rawButtonFiles **183** / elements **672** / divSpanOnClick **59** | **Not raised** this PR |
| Visual debt ceilings | unchanged | **Not raised** this PR |

---

## 3. Architecture snapshot

### Admin v3 (canonical shell)

Paths: `/admin/v3/*` via `AdminV3App` / `AdminV3Router` / `AdminV3Shell`.

Centers: Dashboard · Reviews · Content · Taxonomy · Analytics · Community · Settings · Audit (route `/admin/v3/audit`).

Entry: `/admin` → `AdminEntryBridge` (section → Legacy; bare → `/admin/v3`).

### Legacy Admin

- `/admin/legacy` + `/admin?section=*`
- Standalone routes listed in Route Matrix
- CRUD still required for Library, Adhkar, Stories, Universities ops, Integrations, Automation hubs

### Server authority

- `lib/admin-auth.mjs` → `requireAdminAccess` / `hasPermission`
- Role catalog: `lib/governance/config.mjs` (`ROLES`)
- UI map: `src/admin-v3/permissions.ts` — **documentation + UI hide only; not security authority**

### Public isolation

- Edge middleware 404 for visitors without authorized access cookie/session path
- `X-Robots-Tag: noindex, nofollow` on `/admin` and `/admin/(.*)`
- SEO privacy tests: `seo-admin-privacy.test.ts`
- **Forbidden:** redirecting public visitors to Home to hide Admin

---

## 4. Admin CSS inventory

| File | Load path | Public Initial Graph |
|---|---|---|
| `styles/components/admin-gate.css` | `AdminRouteGuard` | Must remain lazy-only |
| `styles/pages/admin-v3-shell.css` | `AdminV3Shell` | lazy |
| `styles/admin.css` | `AdminPage` (Legacy) | lazy |
| `styles/components/admin-inline-edit.css` | admin inline edit | admin-gated |
| `styles/pages/admin-shell.css` | Legacy shell | lazy |
| `styles/pages/admin-review-hub.css` | review-hub | lazy |
| `styles/pages/admin-categories.css` | categories | lazy |
| `styles/pages/universities-admin.css` | universities | lazy |
| `styles/pages/prophet-stories-admin.css` | prophet stories admin | lazy |

`index.css` contains `.navbar-admin-link` only (nav affordance), not Admin shell CSS.

---

## 5. Security baseline findings (defensive, non-exploit)

| Finding | Class | Phase owner |
|---|---|---|
| 22+ handlers: session admin gate without operation-level permission argument | FIXABLE_IN_REPOSITORY | ADMIN-FINAL-7 / auth phases |
| UI permissions may diverge from server `ROLES` expansions (must not grant beyond server) | FIXABLE_IN_REPOSITORY | FINAL-1 matrix + later parity tests |
| Legacy `prompt`/`confirm`/`alert` in live CRUD | FIXABLE_IN_REPOSITORY | ADMIN-FINAL-5 |
| Multiple Reviews surfaces (v3 inbox + review-hub + review-center + submissions section) | FIXABLE_IN_REPOSITORY | ADMIN-FINAL-2 |
| Library / Adhkar / Stories still Legacy-required | LEGACY_KEEP_JUSTIFIED until parity | ADMIN-FINAL-4 |
| LearningPathsSection orphan (on disk, not in live section table) | ORPHAN / BLOCKED | Route Matrix |
| Production RLS / SQL changes | OWNER_ACTION | never in agent |
| Staging admin journeys | OWNER_ACTION / DEVICE_REQUIRED | Phase 20 |
| `version.json` probe HTTP 441 from agent egress | EXTERNAL measurement limit | Delivery MATCH via authorized path |

**No production exploitation, no real-user role tests, no destructive prod mutations performed.**

---

## 6. Existing gates (keep; do not weaken)

- `test:admin-v3-shell` · `centers` · `migration` · `p3-native` · `analytics-platform` · `interaction-authority`
- `admin-isolation-gate` · `admin-display-text` · `admin-unicode-jsx`
- `test:wave9-admin-interaction`
- `layout-integrity-guard` (aggregates several)
- **New in FINAL-1:** `admin-final-1-prevention-gate.test.ts`

---

## 7. Baseline verdict

| Verdict | Value |
|---|---|
| Program stage | **BASELINE_LOCKED** for ADMIN-FINAL-1 |
| Operational completeness | **NOT** `ADMIN_V3_OPERATIONALLY_COMPLETE` |
| Legacy | **HOLD** — consumer count ≫ 0 |
| Security posture | Hardening in progress; server gate present; fine-grained RBAC incomplete |
| Next PR after MATCH | `ADMIN-FINAL-2` Reviews Inbox Unification only |

---

## 8. Evidence commands (reproducible)

```bash
cd "$(git rev-parse --show-toplevel)"
git fetch origin main && git rev-parse origin/main
find artifacts/majalis/src/admin-v3 -type f | wc -l
find artifacts/majalis/src/views/admin -type f | wc -l
rg -n 'path="/admin' artifacts/majalis/src/AppRoutes.tsx | wc -l
rg -c '\bprompt\s*\(' artifacts/majalis/src/views/admin | awk -F: '{s+=$2}END{print s+0}'
rg -n '<button\b' artifacts/majalis/src/admin-v3 | wc -l
rg -n 'requireAdminAccess' artifacts/majalis/lib/api-handlers/admin -l | wc -l
```
