# API Secret Matrix

Names only — never commit values.

| Secret | Purpose | Required environments | Consumers | Rotation impact | Failure behavior |
|---|---|---|---|---|---|
| `CRON_SECRET` | Authenticate `/api/cron/*` and deep health | production (required) | `validateCronAuth`, cron handlers, Vercel Cron jobs | Re-configure Vercel cron Authorization / HMAC | Cron routes → 401 |
| `CRON_SECRET_PREVIOUS` | Overlap during cron secret rotation | optional | `validateCronAuth` | Drop after rotation window | N/A |
| `ADMIN_API_SECRET` | Server-side admin secret (not JWT) | production when secret-based admin tools used | `validateAdminAuth` | Update server-only env; **no** client `VITE_*` | Secret admin calls → 401 |
| `TELEGRAM_WEBHOOK_SECRET` | Telegram webhook verification | production when Telegram integration enabled | `/api/webhook/telegram`, guard | Update Telegram setWebhook secret | Webhook → 503/403 |
| `NOTIFICATION_SECRET` | Remote push send to api-server | when remote push send enabled | `notification-platform.mjs`, api-server | Update both sides | Send fails closed |
| `SUPABASE_SERVICE_ROLE_KEY` | Server DB admin client | production for write/cron | `supabase-admin.mjs`, cron/admin handlers | Rotate in Supabase + Vercel | Handlers → 503 |
| `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY` | User JWT validation | all | `user-auth.mjs`, admin JWT | Rotate carefully with clients | Auth → 503 |
| `ANTHROPIC_API_KEY` | Assistant / research AI | when AI enabled | assistant, fiqh, rag | Rotate provider key | AI → 503 |
| `OPENAI_API_KEY` | TTS / transcribe / some AI | when those features enabled | narration-tts, transcribe | Rotate provider key | Feature → 503 |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Distributed rate limits / quotas | production + preview | `rate-limit.mjs` | Rotate Upstash creds | **Fail closed** (429) |
| `VAPID_PRIVATE_KEY` | Web Push send (server) | when web push send enabled | push send path | Rotate VAPID pair + clients | Send fails |
| `VITE_VAPID_PUBLIC_KEY` | Web Push subscribe (client) | when web push enabled | client + GET push/subscribe status | Must match private | Subscribe degraded |
| `AI_FEATURE_ENABLED` | Feature flag (default on) | optional | `api-security-policy` | Set `0`/`false` to disable | AI → 503 |
| `AI_EMERGENCY_KILL_SWITCH` | Immediate AI kill (`1`) | optional emergency | `api-security-policy` | Set `1` | AI → 503 |

## Isolation rules

1. `ADMIN_API_SECRET` must **not** fall back to `CRON_SECRET`.
2. `x-vercel-cron` alone is **not** sufficient for admin auth.
3. `TELEGRAM_WEBHOOK_SECRET` is mandatory in production when the webhook route is reachable.
4. Never log secret values or JWT/Authorization headers.
5. Prefer Supabase JWT + RBAC for interactive admin UI; keep `ADMIN_API_SECRET` for machine tooling only.
