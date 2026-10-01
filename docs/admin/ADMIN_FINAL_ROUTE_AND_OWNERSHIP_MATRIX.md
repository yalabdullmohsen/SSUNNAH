# Admin Final Route & Ownership Matrix — ADMIN-FINAL-1

**Measured tip:** `369d8b17e` (measurement) · conflict-resolved onto `c22a3aa2b`  
**Source of route truth:** `artifacts/majalis/src/AppRoutes.tsx` + `AdminEntryBridge` + Legacy `?section=`  
**Edge:** unauthenticated public → HTTP 404 «غير متاح» + noindex (`middleware.js` + `vercel.json`)  
**Rule:** one Canonical function owner; aliases tested; no Home redirect as public hide; no unclassified Legacy.

Classification legend: `V3_CANONICAL` · `V3_ALIAS` · `LEGACY_ACTIVE` · `LEGACY_KEEP_JUSTIFIED` · `LEGACY_MIGRATE_NOW` · `STANDALONE_ACTIVE` · `STANDALONE_MIGRATE_NOW` · `INTERNAL_TOOL` · `ADMIN_ACCESS_ONLY` · `DEPRECATED` · `ORPHAN` · `SAFE_REMOVE_CANDIDATE` · `BLOCKED` · `OWNER_ACTION`

---

## A. AppRoutes `/admin*` (42)

| URL | Surface | Center | Entity / ops | Roles (UI hint) | API | Migration | v3 alternative | Classification | Edge | Remove? |
|---|---|---|---|---|---|---|---|---|---|---|
| `/admin` | Bridge | Entry | section→Legacy; bare→v3 | AdminRouteGuard | — | entry migrated | `/admin/v3` | `ADMIN_ACCESS_ONLY` | 404 public | no |
| `/admin/legacy` | Legacy shell | All sections | full Legacy CRUD | isAdmin | mixed client/API | KEEP | v3 centers + links | `LEGACY_KEEP_JUSTIFIED` | 404 | no — consumers ≫0 |
| `/admin/v3` | v3 | Dashboard | ops overview | governance | `/api/admin/v3/*` | native | — | `V3_CANONICAL` | 404 | n/a |
| `/admin/v3/reviews` | v3 | Reviews | submissions inbox | review.* | `/api/admin/submissions`, v3 | partial unify pending | — | `V3_CANONICAL` | 404 | n/a |
| `/admin/v3/content` | v3 | Content | hub | content.* | v3 entities | hub + native CRUD | — | `V3_CANONICAL` | 404 | n/a |
| `/admin/v3/content/lessons` | v3 | Content | lessons CRUD | content.* | `/api/admin/v3/lessons` | V3 native | Legacy section KEEP | `V3_CANONICAL` | 404 | n/a |
| `/admin/v3/content/sheikhs` | v3 | Content | sheikhs CRUD | content.* | `/api/admin/v3/sheikhs` | V3 native | Legacy KEEP | `V3_CANONICAL` | 404 | n/a |
| `/admin/v3/content/fawaid` | v3 | Content | fawaid CRUD | content.* | `/api/admin/v3/fawaid` | V3 native | Legacy KEEP | `V3_CANONICAL` | 404 | n/a |
| `/admin/v3/taxonomy` | v3 | Taxonomy | categories | content.edit | `/api/admin/v3/categories` | V3 native | Legacy KEEP | `V3_CANONICAL` | 404 | n/a |
| `/admin/v3/analytics` | v3 | Analytics | platform | super/system admin | `/api/admin/analytics-platform` | PARTIAL | search-analytics Legacy | `V3_CANONICAL` | 404 | n/a |
| `/admin/v3/community` | v3 | Community | users list/roles | users.* | `/api/admin/v3/users` | V3 FINAL-3 | Legacy users | `V3_CANONICAL` | 404 | n/a |
| `/admin/v3/community/roles` | v3 | Community | roles catalog (read-only) | users.read | code catalog | V3 FINAL-3 | — | `V3_CANONICAL` | 404 | n/a |
| `/admin/v3/settings` | v3 | Settings | ops links | admin | mixed | hub | automation Legacy | `V3_CANONICAL` | 404 | n/a |
| `/admin/v3/audit` | v3 | Audit | audit read | audit.read | `/api/admin/v3/audit` | V3 native | settings link | `V3_CANONICAL` | 404 | n/a |
| `/admin/v3/review` | redirect | Reviews | — | — | — | alias | `/admin/v3/reviews` | `V3_ALIAS` | 404 | keep alias |
| `/admin/v3/users` | redirect | Community | — | — | — | alias | `/admin/v3/community` | `V3_ALIAS` | 404 | keep alias |
| `/admin/v3/notifications` | redirect | Settings | — | — | — | alias | `/admin/v3/settings` | `V3_ALIAS` | 404 | keep alias |
| `/admin/v3/automation` | redirect | Settings | — | — | — | alias | `/admin/v3/settings` | `V3_ALIAS` | 404 | keep alias |
| `/admin/v3/system` | redirect | Settings | — | — | — | alias | `/admin/v3/settings` | `V3_ALIAS` | 404 | keep alias |
| `/admin/users` | redirect | Community | — | — | — | bridge | `/admin?section=users` | `LEGACY_ACTIVE` | 404 | after community parity |
| `/admin/dashboard` | Standalone | Reviews/Home | dashboard page | admin | — | migrate/link | `/admin/v3` or review-hub | `STANDALONE_MIGRATE_NOW` | 404 | after parity |
| `/admin/review-hub` | Standalone | Reviews | local hub UI | UI only | none hub-local | unify inbox | `/admin/v3/reviews` | `LEGACY_MIGRATE_NOW` | 404 | FINAL-2 |
| `/admin/review-center` | Standalone | Reviews | automation queue | admin | lesson-automation | unify | `/admin/v3/reviews` + settings | `LEGACY_MIGRATE_NOW` | 404 | FINAL-2 |
| `/admin/automation/review` | Alias | Reviews | same as review-center | admin | lesson-automation | alias | review-center | `LEGACY_ACTIVE` | 404 | with review-center |
| `/admin/automation` | Redirect | Automation | → center | — | — | redirect | center | `LEGACY_ACTIVE` | 404 | keep |
| `/admin/automation/center` | Standalone | Automation | center | admin | many | ops domain | settings ops | `STANDALONE_MIGRATE_NOW` | 404 | FINAL-6 |
| `/admin/automation/dashboard` | Standalone | Automation | dashboard | admin | many | ops | settings | `STANDALONE_MIGRATE_NOW` | 404 | FINAL-6 |
| `/admin/automation/platform` | Standalone | Automation | knowledge engine | content.edit | majlis-knowledge-engine | ops | settings | `STANDALONE_MIGRATE_NOW` | 404 | FINAL-6 |
| `/admin/automation/sources` | Alias | Sources | sources | admin | lesson-automation | ops | `/admin/sources` | `STANDALONE_ACTIVE` | 404 | FINAL-6 |
| `/admin/sources` | Standalone | Sources | sources monitor | admin | source-monitor→lesson-automation | ops | settings | `STANDALONE_MIGRATE_NOW` | 404 | FINAL-6 |
| `/admin/autonomous-platform` | Standalone | Automation | autonomous | admin | autonomous-platform | ops | settings | `STANDALONE_MIGRATE_NOW` | 404 | FINAL-6 |
| `/admin/auto-content` | Standalone | Automation | auto content | admin | auto-content | ops | settings/content | `STANDALONE_MIGRATE_NOW` | 404 | FINAL-6 |
| `/admin/content` | Redirect | Automation | → auto-content | — | — | redirect | auto-content | `LEGACY_ACTIVE` | 404 | keep until FINAL-6 |
| `/admin/content-production` | Standalone | Automation | production dash | admin | content-production | ops | settings | `STANDALONE_MIGRATE_NOW` | 404 | FINAL-6 |
| `/admin/automation/content-production` | Alias | Automation | same | admin | content-production | alias | content-production | `STANDALONE_ACTIVE` | 404 | with parent |
| `/admin/content-import/url` | Standalone | Content import | lesson from URL | content.edit | lesson-from-url | migrate UX | content hub tool | `STANDALONE_MIGRATE_NOW` | 404 | FINAL-4/9 |
| `/admin/content-import/image` | Standalone | Content import | lesson from image | content.edit | lesson-from-image | migrate UX | content hub tool | `STANDALONE_MIGRATE_NOW` | 404 | FINAL-4/9 |
| `/admin/import` | Redirect | Content import | → url | — | — | alias | url import | `V3_ALIAS` / Legacy alias | 404 | keep |
| `/admin/integrations/instagram` | Standalone | Integrations | Instagram | content.edit | instagram-integration | ops | settings | `STANDALONE_MIGRATE_NOW` | 404 | FINAL-6 · secrets OWNER |
| `/admin/feature-status` | Standalone | System | feature health | admin | feature-health | ops | settings | `STANDALONE_MIGRATE_NOW` | 404 | FINAL-6 |
| `/admin/universities` | Standalone | Content | universities admin | content.* | client/RLS + page | migrate | content hub | `STANDALONE_MIGRATE_NOW` | 404 | FINAL-4 |
| `/admin/fiqh-review` | Redirect | — | → `/admin/v3` | — | — | dead→v3 | `/admin/v3` | `DEPRECATED` | 404 | SAFE_REMOVE_CANDIDATE after bookmark window |
| `/admin/fiqh-quality` | Redirect | — | → `/admin/v3` | — | — | dead→v3 | `/admin/v3` | `DEPRECATED` | 404 | SAFE_REMOVE_CANDIDATE after bookmark window |

**Loop check:** all redirects are one-way to a non-redirecting target or to Legacy section. No A↔B cycles observed in AppRoutes.

**Broken→Home:** none of the above redirect public/admin failure to `/`. Edge uses 404 page, not Home.

---

## B. Legacy `?section=` (operational; via `/admin` or `/admin/legacy`)

| section | Center mapping | Classification | v3 path / note |
|---|---|---|---|
| `dashboard` | Dashboard | `LEGACY_KEEP_JUSTIFIED` | `/admin/v3` |
| `submissions` | Reviews | `LEGACY_MIGRATE_NOW` | `/admin/v3/reviews` (FINAL-2) |
| `reports` | Reviews/Community | `LEGACY_KEEP_JUSTIFIED` | community/reports link |
| `scholarly-verification` | Reviews | `LEGACY_MIGRATE_NOW` | inbox filters FINAL-2 |
| `religious-calendar-review` | Reviews | `LEGACY_KEEP_JUSTIFIED` | inbox later |
| `categories` | Taxonomy | `LEGACY_KEEP_JUSTIFIED` | `/admin/v3/taxonomy` exists; Legacy until SAFE_REMOVE |
| `lessons` | Content | `LEGACY_KEEP_JUSTIFIED` | `/admin/v3/content/lessons` |
| `sheikhs` | Content | `LEGACY_KEEP_JUSTIFIED` | `/admin/v3/content/sheikhs` |
| `fawaid` | Content | `LEGACY_KEEP_JUSTIFIED` | `/admin/v3/content/fawaid` |
| `library` | Content | `LEGACY_MIGRATE_NOW` | no v3 native CRUD yet (FINAL-4) |
| `adhkar` | Content | `LEGACY_MIGRATE_NOW` | FINAL-4 |
| `miracles` | Content | `LEGACY_KEEP_JUSTIFIED` | content hub link |
| `qa` | Content | `LEGACY_KEEP_JUSTIFIED` | content hub |
| `quiz` | Content | `LEGACY_KEEP_JUSTIFIED` | content hub |
| `rulings` | Content | `LEGACY_KEEP_JUSTIFIED` | content hub |
| `annual-courses` | Content | `LEGACY_KEEP_JUSTIFIED` | content hub |
| `dawah` | Content | `LEGACY_KEEP_JUSTIFIED` | content hub |
| `week-day-facts` | Content | `LEGACY_KEEP_JUSTIFIED` | content hub |
| `arbaeen-love` | Content | `LEGACY_KEEP_JUSTIFIED` | content hub |
| `researches` | Content | `LEGACY_KEEP_JUSTIFIED` | content hub |
| `users` | Community | `LEGACY_KEEP_JUSTIFIED` | `/admin/v3/community` |
| `error-logs` | Settings | `LEGACY_KEEP_JUSTIFIED` | settings ops |
| `image-import` | Content import | `STANDALONE_MIGRATE_NOW` | import routes |
| `smart-cms` | Automation | `STANDALONE_MIGRATE_NOW` | FINAL-6 |
| `aggregator` | Automation | `STANDALONE_MIGRATE_NOW` | FINAL-6 |
| `knowledge-engine` | Automation | `STANDALONE_MIGRATE_NOW` | FINAL-6 |
| `telegram` | Integrations | `LEGACY_MIGRATE_NOW` | FINAL-6 · prompt debt |
| `prophet-stories` | Content | `LEGACY_KEEP_JUSTIFIED` | content hub |
| `islamic-stories` | Content | `LEGACY_MIGRATE_NOW` | FINAL-4 if live |
| `updates` | Content | `LEGACY_KEEP_JUSTIFIED` | content hub |
| `universities` | Content | `LEGACY_MIGRATE_NOW` | also standalone page |
| `search-analytics` | Analytics | `LEGACY_KEEP_JUSTIFIED` | analytics hub tool |
| `verified-knowledge` | Content/Review | `LEGACY_KEEP_JUSTIFIED` | settings/content |
| `knowledge-reasoning` | Automation | `STANDALONE_MIGRATE_NOW` | FINAL-6 |
| `autonomous-ai` | Automation | `STANDALONE_MIGRATE_NOW` | FINAL-6 |
| `global-reference` | Automation | `STANDALONE_MIGRATE_NOW` | FINAL-6 |
| `islamic-intelligence` | Automation | `STANDALONE_MIGRATE_NOW` | FINAL-6 |
| `open-platform` | Automation | `STANDALONE_MIGRATE_NOW` | FINAL-6 |
| `governance` | Settings | `LEGACY_KEEP_JUSTIFIED` | settings |
| `knowledge-graph` | Taxonomy/Content | `LEGACY_KEEP_JUSTIFIED` | relationships |
| `settings` | Settings | `LEGACY_KEEP_JUSTIFIED` | `/admin/v3/settings` |

---

## C. Orphans / special

| Item | Classification | Decision |
|---|---|---|
| `LearningPathsSection` + `learning-paths/*` | `ORPHAN` / `BLOCKED` | Not in live AdminPage section table. **No SAFE_REMOVE** until consumer audit (imports/dynamic). Track for FINAL-8. |
| `/internal/status` | `INTERNAL_TOOL` + `ADMIN_ACCESS_ONLY` | AdminLazyRoute; System monitoring — keep |
| Public `/admin*` without auth | Edge 404 | **Intentional** — not a product bug |

---

## D. SAFE_REMOVE_CANDIDATE

| Candidate | Conditions remaining |
|---|---|
| `/admin/fiqh-review` redirect | Prove zero bookmarks/tests; keep alias window |
| `/admin/fiqh-quality` redirect | Same |
| Full Legacy shell | **Not candidate** — consumers ≫ 0 |

**None deleted in ADMIN-FINAL-1.**

---

## E. Test references

| Gate | Covers |
|---|---|
| `admin-v3-migration-gate` | `/admin` bridge, `/admin/legacy`, nav hrefs |
| `admin-v3-shell-gate` | v3 shell centers |
| `admin-v3-p3-native-gate` | native CRUD routes |
| `admin-v3-analytics-platform-gate` | analytics route+API |
| `admin-isolation-gate` | no admin chrome on public |
| `seo-admin-privacy` | noindex |
| `admin-final-1-prevention-gate` | every AppRoutes path listed in this file |

---

## F. Ownership summary

| Function | Canonical | Legacy/Standalones |
|---|---|---|
| Dashboard | `/admin/v3` | `/admin/dashboard`, section dashboard |
| Reviews inbox | `/admin/v3/reviews` (incomplete unify) | review-hub, review-center, section submissions |
| Content CRUD (lessons/sheikhs/fawaid) | v3 native paths | Legacy sections KEEP |
| Taxonomy | `/admin/v3/taxonomy` | section categories KEEP |
| Analytics platform | `/admin/v3/analytics` | search-analytics KEEP |
| Community/users | `/admin/v3/community` | section users KEEP |
| Settings/ops | `/admin/v3/settings` | automation/*, integrations, telegram |
| Audit | `/admin/v3/audit` | — |
