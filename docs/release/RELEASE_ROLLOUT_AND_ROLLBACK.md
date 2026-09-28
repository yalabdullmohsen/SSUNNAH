# Release Rollout and Rollback — Phase 6/7 / final remediation

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Store | **HOLD** |
| Web code on `main` | `2478ebd7a` (#2331) |
| Web Production tip | `dba87a60` (last successful Auto Deploy) |
| Web tip match | **NO** — Vercel deploy for `2478ebd7` failed |

## Pin

| Item | Value |
|---|---|
| Intended Production SHA | `2478ebd7a7e7e91d96b6bd27df28138e15236bed` |
| Last good Production SHA | `dba87a606c321437a79acb01b4203f56480d50db` |
| Failed deployment | `dpl_FMaX3KQwHGVdkdzEHy17FkfgbcEj` |
| Schema compatibility | no hosted SQL applied in P2–P7 delta |
| Content compatibility | Phase 4 manifests/shards · fail-closed APIs |

## Rollback status

| Item | Value |
|---|---|
| Rollback executed? | **No** — Production never advanced to failed tip |
| Effective state | Production remains last good (`dba87a60`) |
| Re-deploy path | Official Vercel Auto Deploy on next successful `main` build / dashboard Redeploy |
| Forbidden | Parallel unofficial Vercel project · admin bypass · force push |

## Stop / rollback triggers (if tip advances)

- Critical mushaf/text integrity issue  
- Blank screen / reload loop  
- Secret exposure  
- Auth lockout / Admin exposure  
- Uncaught error spike correlated to build id  

## Store

**HOLD** — no TestFlight / Play upload in this task.
