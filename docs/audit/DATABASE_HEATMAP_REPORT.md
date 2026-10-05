# DATABASE_HEATMAP_REPORT

Generated: 2026-10-05T17:49:39.820Z

Connection: **NOT_CONNECTED**

## Schema inventory (SQL migrations)

| Metric | Value |
|---|---:|
| sqlFiles | 468 |
| createTableStatements | 614 |
| distinctTablesMentioned | 354 |
| createIndexStatements | 1008 |
| createUniqueIndexStatements | 25 |
| enableRlsStatements | 597 |
| createPolicyStatements | 830 |
| ginTrigramMentions | 96 |
| ftsMentions | 190 |
| partialIndexMentions | 72 |

## Surfaces (client cost/frequency proxies)

| Surface | Files | from() | select(*) | costProxy |
|---|---:|---:|---:|---:|
| Admin | 5 | 51 | 0 | 51 |
| Library | 4 | 23 | 0 | 23 |
| Account | 3 | 8 | 0 | 8 |
| Search | 1 | 2 | 0 | 2 |
| Lessons | 1 | 2 | 0 | 2 |
| Mushaf | 1 | 1 | 0 | 1 |
| Home | 0 | 0 | 0 | 0 |
| Quran Hub | 0 | 0 | 0 | 0 |
| Prayer | 0 | 0 | 0 | 0 |

## Top client tables

1. `lessons` — 21 .from() refs
2. `bookmarks` — 15 .from() refs
3. `categories` — 13 .from() refs
4. `sheikhs` — 12 .from() refs
5. `fawaid` — 11 .from() refs
6. `auto_imported_content` — 10 .from() refs
7. `sharia_rulings` — 10 .from() refs
8. `flashcard_reviews` — 9 .from() refs
9. `book_reading_plans` — 9 .from() refs
10. `user_notes` — 9 .from() refs
11. `qa_questions` — 9 .from() refs
12. `quiz_questions` — 9 .from() refs
13. `library_items` — 8 .from() refs
14. `transcriptions` — 8 .from() refs
15. `path_stages` — 7 .from() refs

Live latency/seq scans: **NOT_CONNECTED** (attach DATABASE_URL + pg_stat_statements).
