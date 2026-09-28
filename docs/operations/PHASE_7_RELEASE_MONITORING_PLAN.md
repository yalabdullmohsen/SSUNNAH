# PHASE 7 — Release Monitoring Plan

| Field | Value |
|---|---|
| Generated | 2026-09-28 |
| Rule | Do not invent dashboards/alerts that do not exist |
| Related | `docs/operations/OBSERVABILITY_CONTRACT.md` · `INCIDENT_RESPONSE_RUNBOOK.md` · `RELEASE_ROLLOUT_AND_ROLLBACK.md` |

## Correlation key

| Key | Source |
|---|---|
| `build id` / commit | `version.json` · RC `build-manifest.json` |
| Client events | `lib/ops-telemetry` ring + any configured endpoint (privacy-safe) |

## Signals

| Metric / event | Release baseline | Signal source | Severity | Stop condition | Rollback trigger | Owner placeholder | Evidence path | Limitations |
|---|---|---|---|---|---|---|---|---|
| `app_started` | Expected after cold start | Client telemetry contract | Medium | Spike in missing starts vs sessions | If correlated with blank screens | Ops | OBSERVABILITY_CONTRACT | Sampling may undercount |
| `chunk_recovery_attempted` | Near-zero on healthy deploy | Client | High | Sustained rise after deploy | Yes if users stuck | Ops | chunk-recovery code | Needs build-id filter |
| Blank / reload loop reports | Zero Critical | Support + ErrorBoundary | Critical | Confirmed loop on prod | Immediate web rollback | Eng | ErrorBoundary · runbook | Manual intake |
| API 5xx (health/ready) | Unknown hosted SLOs | `/api/healthz` probes if configured | High | Sustained 5xx | Consider rollback | Ops | EXTERNAL if no probe | No invented dashboard |
| Auth failures | Pre-release unknown | Supabase logs (OWNER) | High | Lockout pattern | Pause auth changes | Owner | OWNER_ACTION logs | Not in repo |
| Search / content manifest fail | Near-zero | Client + CDN | High | Manifest 404 spike | Pin prior manifests | Eng | content gates | CDN logs EXTERNAL |
| `mushaf_first_usable` delay | Baseline from lab only | Client | Medium | Extreme regression reports | Investigate before store | QA | DEVICE_REQUIRED for real | Lab ≠ device |
| Bookmark / migration failures | Near-zero automated | Client | Critical | Data loss reports | Stop rollout · hotfix | Eng | persistence tests | Device evidence required |
| `prayer_schedule_failed` | Near-zero | Client | Critical | Mass schedule fail | Rollback / kill schedule feature if exists | Eng | prayer gates | Device delivery separate |
| `adhan_schedule_result` failures | Near-zero unit | Client | Critical | Mass miss | Do not claim audio OK | Eng | prayer matrix | Terminated = DEVICE_REQUIRED |
| Admin sensitive action fail | Near-zero | Admin audit | High | Privilege anomalies | Lock admin | Sec | Admin gates | Hosted logs OWNER |
| Secret exposure | Zero | Dist secret scan + runtime | Critical | Any hit | Immediate rollback | Sec | release:verify | Heuristic scan |

## Kill switches

Only document switches that exist in code. Do **not** invent remote kill switches. If none proven for a surface, limitation = manual rollback via prior web commit.

## Alert destinations

| Destination | Status |
|---|---|
| On-call pager | **NOT_APPLICABLE** unless owner configured (unknown) |
| GitHub Actions failure mail | Exists for CI only |
| External APM | UNKNOWN / not claimed |

## Window recommendation (when web ships)

- First 2 hours: watch chunk recovery + blank reports + healthz  
- First 24 hours: auth + search/content + mushaf restore complaints  
- Native: monitoring plan applies after TestFlight — still STORE HOLD here  

## Non-claims

This document does not assert that external monitoring is running.
