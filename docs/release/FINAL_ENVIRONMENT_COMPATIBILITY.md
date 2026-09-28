# FINAL ENVIRONMENT COMPATIBILITY

| Field | Value |
|---|---|
| Generated | 2026-09-28 |
| Main tip | `2478ebd7a` |
| Companion | `docs/release/FINAL_ENVIRONMENT_CHANGESET.md` · `docs/security/API_SECRET_MATRIX.md` |

## Rule

Names only · fail-closed sensitive features · no production SQL/RLS by agents · no invented secrets.

## Matrix

| Name | Feature | Required web? | Required native? | Absence behavior | Fail-closed? | Blocks web ship? | External action | Verify | Rollback |
|---|---|---|---|---|---|---|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Client auth/data | For live data | Yes (Expo aliases) | Placeholder client · shell works | N/A | No | Confirm in Vercel | Owner checklist | N/A |
| `ANTHROPIC_API_KEY` | Assistant | No | No | 503 | Yes | No | Confirm if claimed | `/api` AI routes | Leave off |
| `ADMIN_API_SECRET` | Admin machine auth | No | No | 401 | Yes | No | Confirm for Admin write | Admin API | Leave off |
| `CRON_SECRET` | Cron | No | No | 401 | Yes | No | Confirm if cron claimed | cron routes | Leave off |
| `TELEGRAM_WEBHOOK_SECRET` | Telegram webhook | No | No | 403/503 | Yes | No | Confirm if used | webhook | Leave off |
| `NOTIFICATION_SECRET` / VAPID / FCM / APNs | Push | No | For remote push | Fail closed | Yes | No | P7-015 | Owner device | Disable push |
| `SUPABASE_SERVICE_ROLE_KEY` | Account delete / admin DB | No | No | 503 | Yes | No | Confirm | account-delete | Leave off |
| `UPSTASH_REDIS_*` | Rate limits | Recommended | No | Fail closed (429) | Yes | No | Confirm for prod quotas | abuse tests | Leave off |
| SQL/RLS (this train) | Schema | **None required** | N/A | N/A | N/A | No | None for delta | History filter | N/A |
| Vercel project `majalis-majalis` | Hosting | Yes | N/A | Site stale | N/A | **Yes if deploy fails** | Redeploy / fix build | `version.json` | Prior deployment |
| Apple/Play signing | Store | No | Yes | Cannot ship store | N/A | No | OWNER_ACTION | Archive | N/A |

## Web ship gate (this run)

Code on `main` is backward-compatible with fail-closed APIs. **Production tip must match `main` via official Auto Deploy.** Current mismatch (`dba87a60` vs `2478ebd7`) = WEB deploy incomplete, not a schema break.
