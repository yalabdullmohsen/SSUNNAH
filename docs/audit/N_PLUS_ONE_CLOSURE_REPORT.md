# N_PLUS_ONE_CLOSURE_REPORT

Date_UTC: 2026-10-03
Program: SUNNAH_DATABASE_SEARCH_SECURITY_AND_PRODUCT_CLOSURE_PROGRAM

## Before (heuristic queue)

12 suspects in QUERY_OPTIMIZATION_QUEUE (engine static scan).

## After (manual confirmation + fixes)

| Path | Class | Result |
|---|---|---|
| lib/flashcard-service.ts | CONFIRMED | FIXED — batch upsert chunks |
| lib/guest-cloud-merge.ts | CONFIRMED | FIXED — batch bookmarks + notes |
| lib/learning-paths-admin-service.ts | CONFIRMED | FIXED — `.in()` assessments/questions |
| lib/cms/cms-service.ts | CONFIRMED | FIXED — buffered import_job_rows |
| lib/categories-admin-service.ts | CONFIRMED | FIXED (bulk) — prefetch content presence |
| views/KnowledgeGraphPage.tsx | KEEP_JUSTIFIED | unchanged |
| DailyChallengeQuiz / kuwait-lessons / lessonDeduper / prayer-notification-scheduler / user-profile-service / HadithBooksView | FALSE_POSITIVE | unchanged |

## Regression gate

`pnpm run test:n-plus-one-closure`

## Note

`database-excellence-engine.mjs` heuristic queue may still list FALSE_POSITIVE paths; this report is the authoritative classification. Engine select(*) count remains the authority for star elimination (0).
