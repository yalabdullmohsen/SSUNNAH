# Incident Response Runbook — سُنّة (Phase 6)

**Scope:** Operational guide. Does not claim external paging/on-call exists.

## Common incidents

| Incident | First checks | Mitigations | Escalate |
|---|---|---|---|
| Startup outage / blank screen | `version.json`, SW, chunk errors, RUM `uncaught_error` | force reload, clear SW, pin previous web deploy | OWNER if prod down |
| API outage | `/api/readyz`, Vercel logs | degrade features; keep Mushaf offline if cached | OWNER + hosting |
| Supabase outage | auth/data errors | guest/read-only modes; no Service Role from client | OWNER / Supabase status |
| Search outage | index manifest / worker | hide search or show offline message | |
| Mushaf regression | checksum gates, page mapping, device reports | rollback web; native binary cannot be pulled | OWNER + DEVICE |
| Prayer scheduling regression | schedule fingerprints, permission state | disable notifications safely; do not invent times | OWNER + DEVICE |
| Notification outage | OS settings, exact alarm, Focus | document OS limits; no false guarantees | DEVICE_REQUIRED |
| Corrupted content update | manifest checksum, rollback content pin | content rollback plan | |
| Security incident | secret scan, auth logs | rotate secrets (OWNER), revoke sessions | OWNER immediately |
| Bad release | build id correlation | web rollback; feature kill switches; native limitation | OWNER |

## Evidence to collect (no secrets)

- build id / commit  
- platform / OS version  
- route category  
- correlation id  
- safe error category  
- reproduction steps  
- whether DEVICE_REQUIRED  

## Decision

Rollback vs hotfix vs HOLD store — owner authority for store/binary.
