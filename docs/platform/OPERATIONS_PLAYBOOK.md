# OPERATIONS_PLAYBOOK — Platform

Companion to `docs/operations/PRODUCTION_RUNBOOK.md` and `ROLLBACK_RUNBOOK.md`.

## Canonical identities

| Item | Value |
|---|---|
| GitHub (SoT) | `yalabdullmohsen/SSUNNAH` (legacy redirect: `majalis`) |
| Production site | `https://www.ssunnah.com` |
| Version tip | `https://www.ssunnah.com/version.json` → `commit` / `shortCommit` |
| Deploy | Vercel project `majalis-majalis` on `main` (`deploymentEnabled.main = true`) |
| Auto Deploy workflow | Verifies tip after push (repo allow-list includes SSUNNAH) |

## Post-merge checklist

1. CI on `main` green (`ci-required`).
2. Vercel Production deployment for merge SHA succeeds.
3. `version.json.commit` matches `origin/main` short SHA (MATCH).
4. Spot-check `/api/healthz` and `/api/readyz`.
5. If tip stale >15m: inspect Vercel deploy logs (Auto Deploy may still be verifying).

## Failure visibility

| Signal | Where |
|---|---|
| Client render failures | ErrorBoundary UI + `error-report` local buffer + `/api/client-error` |
| Chunk / stale deploy | chunk-recovery · ChunkRecoveryToast · app-update-manager |
| Boot degradation | `window.__SUNNAH_BOOTSTRAP__` · startup FSM dataset |
| Platform aggregate | `window.__SUNNAH_PLATFORM_HEALTH__` (debug publish) |
| Search degradation | `getSearchObsSnapshot()` counters (no query text) |

## Recovery

- Soft: ErrorBoundary retry / section escape links.
- Chunk: purge + optional hard recover (no fullscreen update UI).
- Deploy: rollback via Vercel previous production deploy — see `ROLLBACK_RUNBOOK.md`.
- Never apply Production SQL from app code paths.

PLATFORM_OPERATIONALLY_READY
