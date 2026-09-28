# Release Rollout and Rollback — Phase 6

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Execution | **NOT executed** by this phase |
| Store | HOLD |

## Pin

| Item | Value |
|---|---|
| RC branch | `cursor/release-rc-stabilization-p6` |
| Commit | fill from `release:verify` report |
| Build id | `dist/version.json` |
| Schema compatibility | no hosted SQL applied in this phase |
| Content compatibility | Phase 4 manifests/shards |

## Pre-release (owner)

1. `pnpm run release:verify` PASS  
2. License matrix no BLOCKED_LICENSE for store flavor  
3. Device matrices signed  
4. Signing + ASC/Play ready  

## Staged rollout

Use platform defaults (TestFlight → phased / Play staged) — **no invented percentages**. Watch: crash-free, chunk recovery, prayer schedule failures, API 5xx, blank screen reports.

## Stop / rollback triggers

- Critical mushaf/text integrity issue  
- Prayer schedule mass failure  
- Secret exposure  
- Auth lockout  
- Uncaught error spike correlated to build id  

## Rollback capabilities

| Layer | Method | Limitation |
|---|---|---|
| Web | redeploy previous commit on Vercel | OWNER / EXTERNAL |
| Content | pin previous manifests/checksums | |
| API | keep backward compatible handlers | never delete needed binary APIs |
| Feature kill switches | only if implemented & tested | |
| Native binary | **cannot** remove from devices | ship fixed build |

## Communication

Template: build id · impact · mitigation · next update — no user PII.
