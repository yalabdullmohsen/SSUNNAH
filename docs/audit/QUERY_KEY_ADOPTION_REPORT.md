# QUERY_KEY_ADOPTION_REPORT

Date_UTC: 2026-10-03
Program: PR_2497_FINALIZATION_AND_STAGING_DATABASE_CLOSURE
Main_at_start: 150b0d70 (includes #2497 + #2498)

## Inventory (React Query in artifacts/majalis/src)

| Site | Before | After | Class |
|---|---|---|---|
| entities/scholar/hooks.ts | CANONICAL (queryKeys) | CANONICAL | CANONICAL_QUERY_KEY |
| entities/book/hooks.ts | CANONICAL | CANONICAL | CANONICAL_QUERY_KEY |
| lib/adhkar-service.ts | LEGACY literal | queryKeys.adhkar.published | MIGRATION_REQUIRED → DONE |
| views/admin/ContentFileImport.tsx | LEGACY invalidate ["adhkar"]/["fawaid"] | queryKeys.adhkar.root / fawaid.root | MIGRATION_REQUIRED → DONE |
| components/AuthProvider.tsx | queryClient.clear on logout/SIGNED_OUT | + clear on account switch | CANONICAL |
| pages/account/ui/SearchView.tsx | AbortController + seq (local state, not RQ) | unchanged | LOCAL_JUSTIFIED |
| lib/arabic-db-search.ts | searchGeneration stale drop | unchanged | LOCAL_JUSTIFIED |

## Counts

- useQuery sites under src: 5 (scholars×2, books×2, adhkar×1) — all canonical
- invalidateQueries sites: ContentFileImport — canonical
- Legacy literal queryKey/invalidate outside tests: 0 (gate)

## Gate

`pnpm run test:query-key-authority`
`pnpm run test:mutation-invalidation-contract`

## Non-claims

- Not every future feature must use React Query; LOCAL_JUSTIFIED controllers remain valid.
- Staging live invalidation timing NOT measured (BLOCKED_CREDENTIAL_STAGING).
