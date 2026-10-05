# QUERY_OPTIMIZATION_QUEUE

Generated: 2026-10-05T17:49:39.820Z

Total: **11** · P0=0 · P1=11 · select(*)=0

| Priority | Kind | Table | Path | Action |
|---|---|---|---|---|
| P1 | n_plus_one_suspect | `?` | `components/quiz-game/DailyChallengeQuiz.tsx` | Batch fetch / join / .in() instead of per-item query |
| P1 | n_plus_one_suspect | `?` | `lib/categories-admin-service.ts` | Batch fetch / join / .in() instead of per-item query |
| P1 | n_plus_one_suspect | `?` | `lib/cms/cms-service.ts` | Batch fetch / join / .in() instead of per-item query |
| P1 | n_plus_one_suspect | `?` | `lib/flashcard-service.ts` | Batch fetch / join / .in() instead of per-item query |
| P1 | n_plus_one_suspect | `?` | `lib/guest-cloud-merge.ts` | Batch fetch / join / .in() instead of per-item query |
| P1 | n_plus_one_suspect | `?` | `lib/kuwait-lessons.ts` | Batch fetch / join / .in() instead of per-item query |
| P1 | n_plus_one_suspect | `?` | `lib/lessons/lessonDeduper.ts` | Batch fetch / join / .in() instead of per-item query |
| P1 | n_plus_one_suspect | `?` | `lib/prayer-notification-scheduler.ts` | Batch fetch / join / .in() instead of per-item query |
| P1 | n_plus_one_suspect | `?` | `lib/user-profile-service.ts` | Batch fetch / join / .in() instead of per-item query |
| P1 | n_plus_one_suspect | `?` | `pages/hadith/ui/HadithBooksView.tsx` | Batch fetch / join / .in() instead of per-item query |
| P1 | n_plus_one_suspect | `?` | `views/KnowledgeGraphPage.tsx` | Batch fetch / join / .in() instead of per-item query |

Target: fetch only required columns and rows.
