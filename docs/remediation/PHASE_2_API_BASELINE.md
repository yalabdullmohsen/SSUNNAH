# PHASE 2 API BASELINE — Security Hardening

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Branch | `cursor/api-security-hardening-p2` |
| Tip (Phase 1) | `1ba918c50` |
| Worktree | `/Users/alabdullmohsen/wt-api-security-p2` |
| Product API entry | `artifacts/majalis/api/index.js` → `lib/api-dispatch.mjs` |
| Inventory JSON | `docs/remediation/PHASE_2_API_INVENTORY.json` |

## Commands (measured)

| Command | Result |
|---|---|
| `pnpm run typecheck` | **Pass** |
| `node artifacts/majalis/scripts/test-cron-auth.mjs` | **Pass** (8/8) |
| `node lib/__tests__/p0-reliability-failclosed.test.mjs` | **Pass** |
| `node lib/__tests__/p0-security-runtime-ddl.test.mjs` | **Pass** |
| `node lib/__tests__/assistant-safety.test.mjs` | Exit 0 · report: **48 pass / 7 fail** (PRE_EXISTING at tip — not introduced by Phase 2) |
| `PORT=24216 BASE_PATH=/ pnpm --filter @workspace/majalis run build` | **Pass** · `builtAt` `2026-09-28T11:38:53.702Z` · commit `1ba918c5` |
| `pnpm run verify:preflight` | **Pass** (0.6s) |
| `pnpm run verify:ci` (tip before code edits) | **Fail** — `build must not dirty tree` (Class C: inventory/baseline docs written while build ran; typecheck+build themselves passed earlier). Not a product PRE_EXISTING gate failure. |

## Registry summary (from inventory script)

| Metric | Count |
|---|---:|
| Routes in `API_ROUTES` | 135 |
| Handlers missing on disk | 0 |
| Explicit `securityClass` on routes | **0** |
| Broken root `api/*.js` re-exports | **6** |
| Sensitive routes without route-level rateLimit | 79 |

### Broken root re-exports (proven)

All re-export targets under `artifacts/majalis/api/{assistant,healthz,prayer-times,test-anthropic,cron/...}` are **MISSING**. Only `artifacts/majalis/api/index.js` (+ `_deps.mjs`, `lessons/`) exists.

| File | Target | Exists |
|---|---|---|
| `api/assistant.js` | `artifacts/majalis/api/assistant.js` | no |
| `api/assistant/health.js` | `artifacts/majalis/api/assistant/health.js` | no |
| `api/cron/sync-data.js` | `artifacts/majalis/api/cron/sync-data.js` | no |
| `api/healthz.js` | `artifacts/majalis/api/healthz.js` | no |
| `api/prayer-times.js` | `artifacts/majalis/api/prayer-times.js` | no |
| `api/test-anthropic.js` | `artifacts/majalis/api/test-anthropic.js` | no |

Production Vercel path uses `artifacts/majalis` + rewrite to `/api/index` — root `api/` stubs are **orphan/broken** for monorepo-root deployment.

## Critical findings (code-backed, pre-change)

1. **No central security classification** — `API_ROUTES` has rateLimit/allowGet only; unknown routes return 404 (not fail-closed classification).
2. **`ADMIN_API_SECRET` falls back to `CRON_SECRET`** — `getEnvConfig()` in `lib/env-config.mjs` (`pick("ADMIN_API_SECRET", "CRON_SECRET", ...)`).
3. **Telegram webhook open when secret unset** — `webhook/telegram.js`: auth only if `TELEGRAM_WEBHOOK_SECRET` is non-empty.
4. **`x-vercel-cron` + non-production allow-open paths** exist in `validateCronAuth` / `validateAdminAuth`.
5. **Public writes** (`submissions`, `client-error`, `push/subscribe`, RUM) have partial validation; submissions can return Supabase `error.message` to client.
6. **Upstash fail-closed in production** — already in `rate-limit.mjs` (`allowed: false` when Redis missing/error). IP-only keying remains.
7. **`test-anthropic`** — `blockInProduction` present (good); still listed in public registry.
8. **Push unsubscribe** deletes by endpoint without JWT ownership check.

## Data classification (inferred — not yet enforced)

| Class | Examples |
|---|---|
| PUBLIC_READ | healthz, search, prayer-times, public-config, feed, sitemap |
| PUBLIC_WRITE | submissions, researches/submit, client-error*, rum, web-vitals, push/subscribe |
| AUTHENTICATED_USER | citations, account/*, reading-sync (partial) |
| COST_SENSITIVE | assistant, fiqh-research, narration/tts, transcribe, rag |
| ADMIN | `/api/admin/*` |
| CRON | `/api/cron/*` |
| WEBHOOK | `/api/webhook/telegram` |
| INTERNAL_ONLY | `/api/internal/status` |
| DISABLED_IN_PRODUCTION | `/api/test-anthropic` |

## PRE_EXISTING failures

- `assistant-safety.test.mjs`: 7 failures reported while process exit 0 — recorded at tip `1ba918c50` before Phase 2 edits.

## Constraints for implementation

- No push / no merge to main / no Vercel deploy / no production SQL.
- No CAPTCHA or new external services.
- Guest public writes remain where product requires them, with hardening.
