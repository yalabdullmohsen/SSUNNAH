# NETWORK_EFFICIENCY_REPORT

Generated: 2026-10-03T08:57:24.640Z

| Signal | Count |
|---|---:|
| supabaseFromApprox | 535 |
| fetchApprox | 2 |
| refetchInterval | 0 |
| setInterval | 3 |
| selectStar | 48 |

## Findings

- **P0** overfetch: select('*') ×48
- **P1** dedupe: Prefer React Query / single-flight (existing lessons-inflight-dedup gates)

## Hot files

- `lib/supabase.ts` w=320 from×160
- `lib/dawah-service.ts` w=114 select*×5 from×32
- `lib/learning-paths-admin-service.ts` w=98 select*×4 from×29
- `lib/learning-paths-service.ts` w=92 from×46
- `lib/categories-admin-service.ts` w=80 select*×3 from×25
- `lib/platform-supabase.ts` w=80 select*×3 from×25
- `lib/unified-content-service.ts` w=76 select*×6 from×8
- `lib/auto-content-service.ts` w=72 select*×6 from×6
- `lib/book-reading-plan-service.ts` w=60 select*×3 from×15
- `views/FamilyModePage.tsx` w=56 select*×3 from×13
- `lib/platform-content-service.ts` w=52 select*×4 from×6
- `lib/cms/supabase-cms.ts` w=32 select*×1 from×11
- `lib/cms/cms-service.ts` w=26 from×13
- `lib/flashcard-service.ts` w=24 from×12
- `lib/vault-service.ts` w=24 select*×1 from×7
