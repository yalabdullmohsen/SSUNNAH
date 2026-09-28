# Kuwait Lesson Validation

| Field | Value |
|---|---|
| Wave | KUWAIT_LESSONS_MODEL_W1 |
| Quality gate (existing) | `kuwait-lessons-quality-gate.test.ts` |
| Contract gate (new) | `kuwait-lessons-model-contract-gate.test.ts` |
| Helpers | `validateKuwaitLessonContractFields`, `isEligibleAsUpcoming`, `publicScheduleLabel` |

## Deterministic rules

| Rule | Behavior |
|---|---|
| Unique `id` | Fail seed if duplicate |
| Non-empty title + speaker | Fail seed for in-person Kuwait rows |
| Mosque required for Kuwait in-person | Fail if missing |
| Non-Kuwait without course/archive class | Fail |
| Placeholder speaker | Fail for Kuwait in-person |
| Expired / cancelled | Not in `active` upcoming (`isExpired` / `cancelledAt`) |
| `lastVerifiedAt` if present | Must parse as ISO/date |
| Cancelled + PUBLISHED | Contract issue `CANCELLED_PUBLISHED` |
| Invented verification | **Forbidden** — absence is valid; completeness stays PARTIAL |

## Public schedule labels

| State | Label |
|---|---|
| `cancelledAt` set | `cancelled` |
| `scheduleChangeNote` set | `changed` |
| else | `scheduled` |

## Publication eligibility (honesty)

| Condition | Pipeline / product |
|---|---|
| Structure OK, seed/approved, not cancelled | may show as published event |
| Missing `lastVerifiedAt` / `sourceId` | `EVENT_SOURCES_PARTIAL` — not PROVENANCE_COMPLETE |
| Cancelled | `CANCELLED` — archive only |
| Schedule note | `SCHEDULE_CHANGED` — show change label |

## Focused tests

```bash
pnpm --filter @workspace/majalis run test:kuwait-lessons-quality
pnpm --filter @workspace/majalis exec node --import tsx src/lib/__tests__/kuwait-lessons-model-contract-gate.test.ts
```
