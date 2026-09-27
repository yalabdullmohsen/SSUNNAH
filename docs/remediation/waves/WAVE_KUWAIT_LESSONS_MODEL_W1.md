# WAVE — Kuwait Lessons Model W1

| Field | Value |
|---|---|
| Branch | `cursor/kuwait-lessons-model-w1` |
| Base | `origin/main` @ Registry Gaps (#2320) |
| Programs | 4 (data model · source matrix · validation) |

## Scope Manifest

| Field | Value |
|---|---|
| Wave | KUWAIT_LESSONS_MODEL_W1 |
| Priority | P1 |
| Objective | Canonical event contract without fabricating lessons |
| Previous wave | PLATFORM_REGISTRY_GAPS_W1 |
| Confirmed defects | No lastVerified/source/cancel contract; product audit open |
| Root cause | Runtime model without Program 4 SSOT docs/validation |
| Sections | kuwait-lessons |
| Routes | `/lessons` (canonical) — no route invent |
| Content impact | Mapping only; seed JSON unchanged |
| Religious-content impact | None |
| Search / nav / visual / Capacitor | None intentional |
| Rollback | Revert commit |
| Focused tests | kuwait-lessons-quality + model-contract gate |
| Full verification | verify:preflight → verify:ci |
| External blockers | None |

## Delivered

- Docs: `KUWAIT_LESSON_DATA_MODEL.md` · `SOURCE_MATRIX.md` · `VALIDATION.md`
- `kuwait-lesson-contract.ts` + extended `KuwaitLessonRecord` mapping
- `cancelledAt` archives from upcoming
- Contract gate wired into `test:kuwait-lessons-quality`

## Explicit non-changes

- No fabricated events or verification timestamps
- No UI filter-bar rebuild
- No prayer algorithm edits

## Next safe waves

1. Persist `source_id` / `last_verified_at` on import jobs from approved sources
2. UI filters: today/tomorrow/week + attendance chips
3. Notify-on-change + follow scholar/mosque
