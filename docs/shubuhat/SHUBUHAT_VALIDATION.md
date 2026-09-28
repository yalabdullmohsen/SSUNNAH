# Shubuhat Validation

| Field | Value |
|---|---|
| Wave | SHUBUHAT_CENTER_W1 |
| Helpers | `validateShubuhatStructure`, `shubuhatCompletenessTier`, `isShubuhatSearchEligible` |
| Gate | `shubuhat-center-w1-gate.test.ts` |

## Rules

1. Every static row must pass structural validation (title, question, short, detailed, evidence, updated_at).
2. Empty `sources[]` → `PROVENANCE_PARTIAL` (allowed to display with limitation UI).
3. `isShubuhatSearchEligible` false unless `PROVENANCE_COMPLETE`.
4. Product section `tafnid-shubuhat` canonical route = `/discover-islam/doubts`.
5. Nav seed `shubuhat` exists and is live.
6. Alias `/shubuhat` redirects to canonical list.
7. Docs present under `docs/shubuhat/`.

## Focused tests

```bash
pnpm --filter @workspace/majalis exec node --import tsx src/lib/__tests__/shubuhat-center-w1-gate.test.ts
pnpm --filter @workspace/majalis run test:sections-gates
```
