# PRODUCTION RUNBOOK (scaffold)

1. Deploy only from `main` after human merge (GitHub SoT: `yalabdullmohsen/SSUNNAH`).
2. Migrations: apply via approved SQL / workflow_dispatch — never via user HTTP.
3. Verify `/api/healthz` and `/api/readyz` after deploy.
4. Confirm Production MATCH: `https://www.ssunnah.com/version.json` → `commit` equals `origin/main` short SHA.
5. Watch for `durable_store_unavailable`, `credit_exhausted`, `504`, `http.double_response_blocked`.
6. Cron failures: check Vercel cron logs + `background_jobs` when table exists.
7. Client diagnostics: `window.__SUNNAH_PLATFORM_HEALTH__` / `__SUNNAH_BOOTSTRAP__` (see `docs/platform/OPERATIONS_PLAYBOOK.md`).

See also `ROLLBACK_RUNBOOK.md` · `docs/platform/OPERATIONS_PLAYBOOK.md`.
