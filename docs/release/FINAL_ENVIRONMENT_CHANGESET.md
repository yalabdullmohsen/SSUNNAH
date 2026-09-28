# FINAL ENVIRONMENT CHANGESET

| Field | Value |
|---|---|
| Generated | 2026-09-28 |
| Integration branch | `release/sunnah-final-integration-ready` |
| Tip (pre-PR) | `d8c2df3eb` |
| Base `origin/main` | `dba87a606` (contrast #2329 + mushaf editor #2330) |
| Rule | Names only · no secret values · fail-closed · no production SQL/RLS applied by agents |

## Summary

| ID | Name | Blocks web deploy? | OWNER_ACTION? |
|---|---|---|---|
| E-001 | Official Vercel project ↔ `main` | No (Auto Deploy) | Confirm official target |
| E-002 | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | No (shell works; data empty) | Confirm present in Vercel |
| E-003 | `ANTHROPIC_API_KEY` | No (assistant fail-closed) | Confirm if assistant claimed |
| E-004 | `ADMIN_API_SECRET` | No (admin API fail-closed) | Confirm for Admin v3 write |
| E-005 | `CRON_SECRET` | No (cron fail-closed) | Confirm for cron routes |
| E-006 | Telegram webhook secret | No (webhook fail-closed) | Confirm if webhook used |
| E-007 | Push / `NOTIFICATION_SECRET` / VAPID / FCM / APNs | No (push fail-closed) | P7-015 |
| E-008 | `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_URL` | No (account-delete fail-closed) | Confirm for account ops |
| E-009 | SQL / RLS migrations (this train) | **No** — none required in P2–P7 delta | None for this delta |
| E-010 | Apple / Play signing | N/A web | Yes — STORE HOLD |
| E-011 | Capacitor `server.url` | No | None (`https://www.ssunnah.com`) |

## Elements

### E-001 — Vercel production (web)

| Field | Value |
|---|---|
| Feature | Host `artifacts/majalis` |
| Present (CI evidence) | Live site + Auto Deploy on `main` historically green |
| Absence behavior | N/A |
| Blocks web | No if Auto Deploy succeeds |
| OWNER_ACTION | Confirm project is official ssunnah target |
| Rollback | Redeploy prior successful deployment / prior `main` tip |

### E-002 — Client Supabase

| Field | Value |
|---|---|
| Names | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Feature | Auth + hosted data lists |
| Absence behavior | Placeholder client · UI shell/RTL/routing work · lists empty |
| Blocks web | No |
| OWNER_ACTION | Confirm in Vercel (no value print) |
| Rollback | N/A |

### E-003 — Assistant

| Field | Value |
|---|---|
| Names | `ANTHROPIC_API_KEY` |
| Feature | `/api/assistant` |
| Absence behavior | Fail-closed (P2 security layer) |
| Blocks web | No |
| OWNER_ACTION | Confirm if assistant is production-claimed |
| Rollback | Leave disabled |

### E-004 — Admin API

| Field | Value |
|---|---|
| Names | `ADMIN_API_SECRET` (isolated from `CRON_SECRET`) |
| Feature | Admin v3 write / protected admin routes |
| Absence behavior | Fail-closed · UI may load; mutations denied |
| Blocks web | No |
| OWNER_ACTION | Confirm for Admin write path |
| Rollback | Keep fail-closed |

### E-005 — Cron

| Field | Value |
|---|---|
| Names | `CRON_SECRET` |
| Feature | `/api/cron/*` |
| Absence behavior | Fail-closed |
| Blocks web | No |
| OWNER_ACTION | Confirm if cron claimed |
| Rollback | Leave disabled |

### E-006 — Telegram webhook

| Field | Value |
|---|---|
| Names | Telegram webhook secret (see `docs/security/API_SECRET_MATRIX.md`) |
| Feature | webhook handler |
| Absence behavior | Fail-closed / rejected |
| Blocks web | No |
| OWNER_ACTION | Confirm if used |
| Rollback | Leave disabled |

### E-007 — Push

| Field | Value |
|---|---|
| Names | `NOTIFICATION_SECRET`, VAPID / FCM / APNs credentials |
| Feature | Push subscribe / delivery |
| Absence behavior | Fail-closed · no real push from this train |
| Blocks web | No |
| OWNER_ACTION | P7-015 |
| Rollback | Disable push |

### E-008 — Service role (server)

| Field | Value |
|---|---|
| Names | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` (server) |
| Feature | Account delete / privileged ops |
| Absence behavior | Fail-closed |
| Blocks web | No |
| OWNER_ACTION | Confirm for account ops |
| Rollback | Leave disabled |

### E-009 — SQL / RLS

| Field | Value |
|---|---|
| Change in P2–P7 train | **None applied / none required for web ship** |
| Backward compatibility | Additive code only; no new mandatory columns for old clients |
| Blocks web | No |
| Note | Agents must not apply SQL/RLS to production |

### E-010 — Store signing

| Field | Value |
|---|---|
| Blocks web | No |
| Blocks store | Yes → **STORE HOLD** |
| OWNER_ACTION | Apple/Play profiles · Bundle ID / applicationId decisions unchanged |

### E-011 — Capacitor server.url

| Field | Value |
|---|---|
| Value (config) | `https://www.ssunnah.com` (no localhost) |
| Blocks web | No |

## Explicit non-actions

- No production migration applied  
- No secret values written  
- No invented defaults  
- No parallel Vercel project deploy  
- No TestFlight / Play upload  
