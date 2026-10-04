# STARTUP_CHUNK_RECOVERY_S5 — PR S5

**TASK_CLASSIFICATION:** SHARED_PLATFORM  
**Program tip base:** main after S6 (`9a917d62`)

## Required behavior

| Case | Behavior |
|---|---|
| FIRST_FAILURE (stale chunk, online) | one quiet SW shell purge · no auto-reload · no blocking «تحديث العرض» · no duplicate toast |
| SECOND_FAILURE (same build) | allowance exhausted · non-blocking ErrorBoundary with retry / home / user hard recover |
| OFFLINE | no reload · no allowance burn · honest offline copy · keep available content |
| CAPACITOR | allowance dual-written to sessionStorage + localStorage · no user-data wipe · no process terminate |
| CURRENT chunk non-error | `isChunkLoadError` false · no recovery path |

## Ownership

- Detect: `isChunkLoadError` / `lazyWithRetry`
- Quiet attempt: `tryRecoverFromStaleChunk` (single per buildId)
- User hard recover: `hardRecoverStaleDeploy` (preserves pathname via `location.reload`)
- UI: `ErrorBoundary` / `SectionErrorBoundary` — actionable, never «تحديث العرض»
- Toast: `ChunkRecoveryToast` → `null`

## Outputs

- CHUNK_RECOVERY_SINGLE_ATTEMPT
- NO_STARTUP_UPDATE_LOOP
- NO_PERSISTENT_BLOCKING_RECOVERY_SCREEN
- OFFLINE_RECOVERY_SAFE
