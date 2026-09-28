# API Security — Source of Truth

Product entry (production):

`artifacts/majalis/api/index.js` → `artifacts/majalis/lib/api-dispatch.mjs`

## Classification

Every `API_ROUTES` prefix **must** appear in `lib/api-security-registry.mjs` with one of:

`PUBLIC_READ` · `PUBLIC_WRITE` · `AUTHENTICATED_USER` · `ADMIN` · `CRON` · `WEBHOOK` · `INTERNAL_ONLY` · `DISABLED_IN_PRODUCTION`

Unclassified routes fail closed in production (404).

## Guard stack

1. `enforceApiSecurity` — method / CORS / body size / Content-Type / class rate limit / class auth
2. Route-level `rateLimit` (Upstash; fail-closed in production)
3. Cost gate for AI/TTS (`api-cost-guard.mjs`)
4. Handler domain auth / RBAC

## Secrets

See `docs/security/API_SECRET_MATRIX.md`.  
`ADMIN_API_SECRET` does **not** fall back to `CRON_SECRET`.

## Compatibility stubs

Root monorepo `api/*.js` re-export `artifacts/majalis/lib/api-handlers/*` (legacy entrypoints).  
Do not introduce competing route tables.
