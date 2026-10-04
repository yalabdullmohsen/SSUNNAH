# PLATFORM_BASELINE

**Phase:** `SUNNAH_PLATFORM_AND_ARCHITECTURE_EXCELLENCE_PROGRAM`  
**Base tip:** `6b137c422` (post product polish)

## Inventory

| Domain | Primary ownership | Class |
|---|---|---|
| App shell / routes | `main.tsx` · `App.tsx` · `AppRoutes.tsx` · `src/app/routes/*` | HEALTHY |
| Feature pages | `src/pages/{quran,worship,fiqh,hadith,lessons,library,account}` | HEALTHY |
| Mushaf reader | `src/features/mushaf-reader` · `mushaf-madinah` | SPECIAL_CASE |
| Shared query cache | `query-client.ts` · `query-keys.ts` · RequestManager | HEALTHY |
| Global React state | Providers in `App.tsx` (theme/font/lang/prefs/auth/prayer) | HEALTHY |
| Startup / boot | `app-startup-controller` · `boot-sequence` · `app-bootstrap-pipeline` | HEALTHY |
| Error resilience | `ErrorBoundary` · `SectionErrorBoundary` · `lazy-with-retry` · chunk-recovery | HEALTHY |
| Client observability | `error-report` · `search-observability` · `rum-telemetry` · `platform-health` | HEALTHY |
| Design authorities | design-system · foundation tokens · Feedback V2 | HEALTHY |
| Product governance | PRODUCT_COMPLETENESS · runtime excellence · visual gates | HEALTHY |
| Perf budgets | bundle · LHCI · mushaf measure · architecture-excellence PR-1 | HEALTHY |
| Deploy / ops | Vercel main deploy · `version.json` MATCH · workflows | NEEDS_CONSOLIDATION → fixed SSUNNAH |
| Quran content / mapping | core + seed integrity gates | KEEP_JUSTIFIED |
| Prayer calculations | prayer engine gates | KEEP_JUSTIFIED |
| Search ranking | search quality gates | KEEP_JUSTIFIED |
| Admin V3 | `admin-v3/*` | SPECIAL_CASE |
| Production SQL | supabase migrations (manual) | KEEP_JUSTIFIED |

## Classification summary

| Class | Count (program scope) |
|---|---|
| HEALTHY | 12 |
| NEEDS_CONSOLIDATION | 0 (after SSUNNAH workflow unblock) |
| SPECIAL_CASE | 2 |
| KEEP_JUSTIFIED | 4 |

## Success markers

- ARCHITECTURE_BOUNDARIES_CLEAR
- STATE_ARCHITECTURE_MATURE
- OBSERVABILITY_MATURE
- ERROR_RESILIENCE_IMPROVED
- PERFORMANCE_GOVERNANCE_MATURE
- DEVELOPER_EXPERIENCE_IMPROVED
- REPOSITORY_SIMPLIFIED
- PLATFORM_OPERATIONALLY_READY
- NO_DEBT_CEILING_RAISE

UNKNOWN_PLATFORM_DEBT = 0
