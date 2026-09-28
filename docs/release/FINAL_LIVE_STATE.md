# FINAL LIVE STATE

| Field | Value |
|---|---|
| Captured | 2026-09-28T18:32Z |
| Source | GitHub CLI + live `version.json` (not prior reports) |

## Truth (live)

| Item | Value |
|---|---|
| `origin/main` | `2478ebd7a` — squash of #2331 (P2–P7) |
| Prior main | `dba87a606` (#2330 mushaf editor) |
| Production `version.json` | **`dba87a60`** (still) · HTTP 200 · `builtAt=2026-09-28T17:40:07.818Z` |
| Production vs main | **MISMATCH** — main ahead; production not updated |
| Store | **HOLD** |

## PRs

| PR | Role | State | Merge SHA | Notes |
|---|---|---|---|---|
| #2329 | Color contrast | **MERGED** | `eef706670` | RESOLVED · main CI was 31/31 PASS |
| #2330 | Mushaf bookmark editor | **MERGED** | `dba87a606` | RESOLVED · was production tip |
| #2331 | P2–P7 integration | **MERGED** | `2478ebd7a` | All required checks SUCCESS before squash merge |

## Deployment

| Item | Value |
|---|---|
| Method | Official Vercel Auto Deploy on `main` (`majalis-majalis`) |
| Deployment id | `dpl_FMaX3KQwHGVdkdzEHy17FkfgbcEj` / GH deployment `6717296674` |
| Status | **FAILURE** (GitHub commit status `Vercel – majalis-majalis`) |
| Auto Deploy GHA | Soft-success with `rate_limited` / SHA mismatch (does not prove Production tip) |
| Logs | Not readable without `VERCEL_TOKEN` (OWNER_ACTION / BLOCKED_ENVIRONMENT) |
| Rollback | Not required — production remains last good tip `dba87a60` |

## Stale claims

| Claim | Status |
|---|---|
| Production at `2e008c8d` | STALE |
| #2330 waiting checks | STALE — MERGED |
| #2331 waiting CI | STALE — MERGED after green required checks |
| WEB_RELEASED for P2–P7 | **NOT YET** — code on main, Production tip not `2478ebd7` |

## Active blockers

| Class | Item |
|---|---|
| BLOCKED_ENVIRONMENT | Vercel Production deploy failed for `2478ebd7`; no token to read logs |
| OWNER_ACTION | Provide/inspect Vercel build logs or redeploy from dashboard if retry fails |
| DEVICE_REQUIRED | Real iPhone/iPad matrices |
| BLOCKED_LICENSE / BLOCKED_CREDENTIAL | Store signing & asset licenses |
