# FINAL CLOSURE — LIVE BASELINE LOCK

| Field | Value |
|---|---|
| Status | **LIVE_BASELINE_LOCKED** |
| Captured | 2026-10-01T02:26Z |
| Program | [`SUNNAH_FINAL_CLOSURE_PROGRAM.md`](./SUNNAH_FINAL_CLOSURE_PROGRAM.md) |
| Worktree | `/tmp/majlis-final-closure-p0` · branch `cursor/final-closure-live-baseline` |

## EXECUTIVE LOCK

```text
origin/main     = 14b30de60
production      = 14b30de6  (version.json)
main = production = MATCH
general status  = WEB_RELEASED_NATIVE_HOLD
next phase      = PHASE 1 — Route Feedback Priority Closure
```

### Delta vs prior documented tip (`2a4e3985`)

| Item | Prior doc | Live now |
|---|---|---|
| origin/main | `2a4e3985` (Back P7) | `14b30de60` (#2416 docs seal) |
| production | `2a4e3985` | `14b30de6` |
| commits ahead of `2a4e3985` | — | **1** (docs only: P7 seal + program lock) |
| Critical CSS gzip (prod) | ~55686–55766 | **55738** ≤ 61440 · margin **5702** |
| Product code tip | Back P7 | unchanged vs P7 (seal docs only) |

## MAIN / PRODUCTION / DEPLOY

| Check | Result |
|---|---|
| `git rev-parse origin/main` | `14b30de60a41e93123592c24a113df35ea562218` |
| `https://www.ssunnah.com/version.json` | `commit` / `shortCommit` = `14b30de6` |
| Auto Deploy main → production | SUCCESS (run on `14b30de60`) |
| CI on main tip | SUCCESS |
| Failed / queued required checks on tip | none observed |

## PRs / BRANCHES / WORKTREES

| Item | Classification |
|---|---|
| PR **#2416** | **MERGED** → `14b30de60` (docs: Back P7 seal + program) |
| PR **#2299** | OPEN · native widgets · **EXTERNAL / DEVICE_REQUIRED** · out of web Phase 0–1 |
| PR **#1791** | OPEN draft · mobile offline-first · **EXTERNAL / DEVICE_REQUIRED** |
| Open web closure PRs for Phase 0/1 | **none** (this branch creates Phase 0) |
| Superseded closure worktrees | many under `/tmp/majlis-*` / `wt-*` — historical; do not resume |
| Stashes | present on primary checkout — **noise**; Phase work uses clean worktree only |

## INTERACTION (live inventory `@ 14b30de60`)

| Metric | Measured | Ceiling |
|---|---:|---:|
| rawButtonFiles | 168 | 168 |
| rawButtonElements | 650 | 650 |
| officialButtonImportFiles | 202 | floor 202 |
| iconButtonConsumerFiles | 33 | — |
| actionButtonConsumerFiles | 7 | floor 7 |
| divSpanOnClick | 59 | 59 |
| formButtonsMissingType | 0 | 0 |
| floatingControlFileMentions | 10 | 10 |
| buttonRelatedImportantApprox | 1258 | 1258 |
| buttonRelatedHexApprox | 1708 | 1708 |

Source: `pnpm`/`node scripts/interaction-system-inventory.mjs` · budgets in `interaction-system-debt-budget.json`.

## VISUAL (live inventory `@ 14b30de60`)

| Metric | Measured | Ceiling / note |
|---|---:|---|
| cssFiles | 356 | 356 |
| mainSyncCssImports | 22 | — |
| mainDeferredCssImports | 43 | — |
| important | 4784 | 4784 |
| hexInCss | 8905 | 8905 |
| rgbHslInCss | 2124 | 2124 |
| inlineColorStyleMatches | 48 | 48 |
| boxShadowDecls | 1113 | 1113 |
| zIndexRawDecls | 258 | 258 |
| borderRadiusPxDecls | 1258 | 1258 |
| mjDeclOutsideAllowlist | 0 | 0 |
| mjTokenRefs / sf / ss | 9950 / 757 / 724 | floors sf/ss held |
| soft-cards.css | **REMOVED** | — |
| Critical CSS gzip (prod `index-CWNWtpam.css`) | **55738** | budget 61440 · margin 5702 |

## ROUTES

| Field | Value |
|---|---|
| Matrix | `docs/audit/ROUTE_QUALITY_MATRIX.json` |
| totalRoutes | **415** |
| publicRoutes | **372** |
| adminRoutes | **42** |
| Matrix `mainTip` stamp | `2aa5dc8a` (stale stamp — live tip is `14b30de60`; Phase 1 refreshes priority rows) |
| loading COMPLETE / PENDING | 29 / 375 |
| empty COMPLETE / PENDING | 24 / 375 |
| error COMPLETE / PENDING | 28 / 375 |
| offline COMPLETE | 1 (most priority = PARTIAL) |
| permissionDenied / rateLimited | **UNSET ×415** |
| WAVE4 priority tested (approx COMPLETE L/E/E) | ~15–24 routes; long-tail PENDING honest |

### Priority routes snapshot (Phase 1 input)

| Path | Class | loading | empty | error | offline | noResults | Gap for Phase 1 |
|---|---|---|---|---|---|---|---|
| `/` | ACTIVE_PUBLIC_HIGH_TRAFFIC | COMPLETE | COMPLETE | COMPLETE | PARTIAL | N/A | offline + evidence pack |
| `/search` | ACTIVE_PUBLIC_HIGH_TRAFFIC | COMPLETE | N/A | COMPLETE | COMPLETE | COMPLETE | evidence pack hardening |
| `/quran-hub` | ACTIVE_PUBLIC_HIGH_TRAFFIC | COMPLETE | PARTIAL | PARTIAL | PARTIAL | PARTIAL | **priority close** |
| `/mushaf` | MUSHAF_SPECIAL | COMPLETE | COMPLETE | COMPLETE | PARTIAL | N/A | MUSHAF_SPECIAL + offline |
| `/mushaf/bookmarks` | MUSHAF_SPECIAL | COMPLETE | COMPLETE | COMPLETE | PARTIAL | N/A | same |
| `/prayer-times` | PRAYER_SPECIAL | COMPLETE | COMPLETE | COMPLETE | PARTIAL | N/A | PRAYER_SPECIAL |
| `/lessons` | ACTIVE_PUBLIC_HIGH_TRAFFIC | COMPLETE | COMPLETE | COMPLETE | PARTIAL | COMPLETE | offline + evidence |
| `/hadith` | ACTIVE_PUBLIC_HIGH_TRAFFIC | COMPLETE | COMPLETE | COMPLETE | PARTIAL | COMPLETE | offline + evidence |
| `/fiqh` | ACTIVE_PUBLIC_HIGH_TRAFFIC | COMPLETE | COMPLETE | COMPLETE | PARTIAL | COMPLETE | offline + evidence |
| `/adhkar` | ACTIVE_PUBLIC_HIGH_TRAFFIC | COMPLETE | COMPLETE | COMPLETE | PARTIAL | N/A | offline + evidence |
| `/settings` | ACTIVE_PUBLIC_SECONDARY | COMPLETE | N/A | PARTIAL | PARTIAL | N/A | error/offline |
| `/my-learning` | ACTIVE_PUBLIC_HIGH_TRAFFIC | COMPLETE | COMPLETE | COMPLETE | PARTIAL | N/A | offline |
| `/login` | AUTH | COMPLETE | N/A | COMPLETE | PARTIAL | N/A | offline |
| `/register` | AUTH | COMPLETE | N/A | COMPLETE | PARTIAL | N/A | offline |

**COMPLETE without evidence pack is forbidden in Phase 1** (gate required).

## ADMIN

| Source | `docs/admin/ADMIN_FINAL_ROUTE_AND_OWNERSHIP_MATRIX.md` |
|---|---|
| ADMIN-FINAL-1 | CLOSED (edge 404 public, matrix, v3 core hubs) |
| ADMIN-FINAL-2+ | OPEN (Reviews inbox unify → CRUD → dialogs → automation → authz) |
| Legacy | `LEGACY_KEEP_JUSTIFIED` / `LEGACY_MIGRATE_NOW` — consumers ≫0 |
| Browser dialogs (admin views, approx) | prompt≈7 · confirm(string)≈23 · alert≈25 → Phase ADMIN-FINAL-5 |
| Public `/admin` `/admin/v3` | HTTP **404** (expected isolation) |

## MUSHAF

| Item | Live |
|---|---|
| `mushaf-madinah.css` import | **LIVE** from `NewMushafReader.tsx` + `VerifiedMushafReader.tsx` |
| Bridge status | OPEN → Phase 10 |
| Integrity gates | present (604, mapping, geometry, CSS boundary, WAVE6 contracts) — do not weaken |
| Quran text / QPC / 604 / 15-line | **untouched** |

## DARK / IDENTITY / STARTUP (closed scopes — do not reopen)

| Item | Status |
|---|---|
| Startup Typography P0/P1/P2 | CLOSED · size-adjust 97% gated |
| Dark deferred loader | CLOSED |
| Identity / Cards / Buttons residual prior phases | CLOSED within scope |
| Back Authority P7 | **BACK_P7_MERGED_AND_DEPLOYED** |
| reload-to-win | removed |
| ACTIVE_LEGACY page CSS count (prior claim) | 0 (re-verify only if regression) |

## SECURITY / DEVICE / OWNER (boundary)

| Item | Status |
|---|---|
| Device QA register | DEVICE_REQUIRED dominant (`docs/audit/DEVICE_QA_REGISTER.md`) |
| Store / signing / licenses | OWNER_ACTION / BLOCKED_LICENSE — out of Phase 0–1 |
| SQL/RLS on production | **not applied** in this program |
| Claims forbidden without evidence | STORE GO · FULLY COMPLETE · ZERO_SECURITY_RISK · DEVICE_TESTED · WCAG CERTIFIED |

## PRODUCTION SMOKE (captured at lock)

| Path | HTTP |
|---|---|
| `/` `/search` `/quran-hub` `/mushaf` `/mushaf/bookmarks` `/prayer-times` `/lessons` `/hadith` `/fiqh` `/adhkar` `/settings` `/my-learning` `/login` `/register` | **200** |
| `/admin` `/admin/v3` | **404** (expected) |
| `/api/healthz` `/version.json` | **200** · version = `14b30de6` |

## PHASE GATE

```text
LIVE_BASELINE_LOCKED = YES
Next executable phase = PHASE 1 Route Feedback Priority
Must start from tip after this Phase 0 merges + MATCH
No parallel phases
```
