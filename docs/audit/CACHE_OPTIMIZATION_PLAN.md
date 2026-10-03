# CACHE_OPTIMIZATION_PLAN

Generated: 2026-10-03T08:28:58.841Z

## React Query

| Field | Value |
|---|---|
| defaults present | true |
| staleTime ms | 300000 |
| gcTime ms | 900000 |
| useQuery sites ≈ | 5 |
| custom staleTime files | 4 |
| duplicate fetch risk | HIGH |

## Realtime

- channel(): 0
- subscribe(): 10

## Opportunities

- **P0** Lessons / content lists: Ensure list queries share queryKeys + staleTime; avoid select(*)
- **P1** Prayer: Keep prayer computation local; cache location/day — avoid polling DB
- **P1** Search: Cache normalized query results briefly; prefer search_index over wide selects
- **P2** Admin CRUD: Invalidate targeted queryKeys only after mutations
