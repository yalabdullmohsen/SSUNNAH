# SUNNAH_DATABASE_HEALTH_SCORECARD

Generated: 2026-10-03T04:39:56.921Z

## Overall: **66** · **NEEDS_WORK**

| Dimension | Score | Rating | Note |
|---|---:|---|---|
| performance | 46 | CRITICAL | static proxies only |
| indexes | 90 | EXCELLENT |  |
| RLS | 88 | EXCELLENT | policy audit pattern clean |
| search | 85 | EXCELLENT |  |
| realtime | 80 | GOOD | channels=0 subscribe=10 |
| costs | 44 | CRITICAL | select(*) and hot table frequency as cost proxies |
| schema_quality | 45 | CRITICAL |  |
| scalability | 50 | NEEDS_WORK | Needs pagination discipline + live stats |

Ratings: EXCELLENT ≥85 · GOOD ≥70 · NEEDS_WORK ≥50 · CRITICAL <50

## Non-claims

- NOT live pg_stat without DATABASE_URL
- Client proxies ≠ server latency
- No UNIFIED_100
