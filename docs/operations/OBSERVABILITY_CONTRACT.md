# Observability Contract — سُنّة (Phase 6)

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Rule | Telemetry failure must never block UX |
| External on-call | NOT_APPLICABLE unless owner configures |

## Required event vocabulary

| Event | When | Notes |
|---|---|---|
| `app_started` | bootstrap begins | include build id |
| `app_interactive` | first interactive frame | |
| `splash_cleared` | splash dismissed | |
| `route_load_failed` | lazy route error | safe category only |
| `chunk_recovery_attempted` | chunk recovery path | |
| `uncaught_error` | window error | dedupe + sample |
| `unhandled_rejection` | promise rejection | dedupe + sample |
| `api_request_failure` | classified API failure | no body/PII |
| `auth_session_failure` | session restore fail | |
| `storage_hydration_conflict` | Preferences/IDB conflict | |
| `sync_failure` | bookmark/progress sync | |
| `mushaf_first_usable` | reader usable | |
| `mushaf_restore_failed` | last page restore fail | |
| `bookmark_migration_failed` | key migration fail | |
| `prayer_schedule_failed` | schedule generation fail | |
| `local_notification_permission` | granted/denied | |
| `adhan_schedule_result` | scheduled/skipped counts | no audio payload |
| `audio_playback_failed` | playback error category | |
| `content_manifest_failed` | manifest/validation fail | |
| `search_index_failed` | index load fail | |
| `offline_fallback` | offline path used | |
| `update_available` | new build detected | |
| `update_recovery_result` | SW/chunk recovery | |
| `admin_sensitive_action` | admin mutation result | no unpublished content |

## Envelope fields

`event` · `ts` · `buildId` · `appVersion` · `platform` · `environment` · `routeCategory` · `errorCategory` · `correlationId?`

## Forbidden to log

JWT · cookies · Service Role · API keys · full push tokens · full email/phone · private text · raw search queries without policy · AI prompts · audio payloads · full scripture dumps · unpublished admin content · raw stacks to end users.

## Controls

- Sampling for high-frequency events  
- Deduplication for identical errors  
- Kill switch / disable without crash  
- Retention: document actual backend retention when known; else UNKNOWN → OWNER_ACTION  
