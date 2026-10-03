# DATABASE_HEATMAP_REPORT

Generated: 2026-10-03T04:39:56.921Z

Connection: **NOT_CONNECTED**

## Schema inventory (SQL migrations)

| Metric | Value |
|---|---:|
| sqlFiles | 461 |
| createTableStatements | 614 |
| distinctTablesMentioned | 354 |
| createIndexStatements | 916 |
| createUniqueIndexStatements | 25 |
| enableRlsStatements | 597 |
| createPolicyStatements | 830 |
| ginTrigramMentions | 33 |
| ftsMentions | 113 |
| partialIndexMentions | 44 |

## Surfaces (client cost/frequency proxies)

| Surface | Files | from() | select(*) | costProxy |
|---|---:|---:|---:|---:|
| Admin | 5 | 49 | 9 | 94 |
| Library | 4 | 23 | 3 | 38 |
| Account | 3 | 8 | 2 | 18 |
| Search | 1 | 2 | 1 | 7 |
| Lessons | 1 | 2 | 0 | 2 |
| Mushaf | 1 | 1 | 0 | 1 |
| Home | 0 | 0 | 0 | 0 |
| Quran Hub | 0 | 0 | 0 | 0 |
| Prayer | 0 | 0 | 0 | 0 |

## Top client tables

1. `lessons` — 20 .from() refs
2. `bookmarks` — 14 .from() refs
3. `categories` — 13 .from() refs
4. `sheikhs` — 12 .from() refs
5. `fawaid` — 11 .from() refs
6. `auto_imported_content` — 10 .from() refs
7. `sharia_rulings` — 10 .from() refs
8. `flashcard_reviews` — 9 .from() refs
9. `book_reading_plans` — 9 .from() refs
10. `qa_questions` — 9 .from() refs
11. `quiz_questions` — 9 .from() refs
12. `user_notes` — 8 .from() refs
13. `library_items` — 8 .from() refs
14. `transcriptions` — 8 .from() refs
15. `path_stages` — 7 .from() refs

Live latency/seq scans: **NOT_CONNECTED** (attach DATABASE_URL + pg_stat_statements).
