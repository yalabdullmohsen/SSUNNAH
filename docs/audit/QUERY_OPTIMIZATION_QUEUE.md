# QUERY_OPTIMIZATION_QUEUE

Generated: 2026-10-03T08:28:58.841Z

Total: **80** · P0=48 · P1=32 · select(*)=48

| Priority | Kind | Table | Path | Action |
|---|---|---|---|---|
| P0 | select_star | `auto_imported_content` | `lib/auto-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `trusted_sources` | `lib/auto-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `auto_import_logs` | `lib/auto-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `auto_import_runs` | `lib/auto-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `?` | `lib/auto-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `?` | `lib/auto-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `book_reading_plans` | `lib/book-reading-plan-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `?` | `lib/book-reading-plan-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `book_reading_plans` | `lib/book-reading-plan-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `categories` | `lib/categories-admin-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `categories` | `lib/categories-admin-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `categories` | `lib/categories-admin-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `admin_audit_logs` | `lib/cms/audit-log.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `import_jobs` | `lib/cms/supabase-cms.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `dawah_shubuhat` | `lib/dawah-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `dawah_articles` | `lib/dawah-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `new_muslim_path` | `lib/dawah-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `?` | `lib/dawah-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `dawah_contact_requests` | `lib/dawah-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `?` | `lib/learning-paths-admin-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `?` | `lib/learning-paths-admin-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `prerequisites` | `lib/learning-paths-admin-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `assessments` | `lib/learning-paths-admin-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `annual_courses` | `lib/platform-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `annual_courses` | `lib/platform-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `annual_courses` | `lib/platform-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `platform_updates` | `lib/platform-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `sharia_rulings` | `lib/platform-supabase.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `annual_courses` | `lib/platform-supabase.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `platform_updates` | `lib/platform-supabase.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `quran_circles` | `lib/quran-circles-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `researcher_profiles` | `lib/researcher-profile-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `study_sessions` | `lib/study-session-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `auto_imported_content` | `lib/unified-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `auto_imported_content` | `lib/unified-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `auto_imported_content` | `lib/unified-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `auto_imported_content` | `lib/unified-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `auto_imported_content` | `lib/unified-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `auto_imported_content` | `lib/unified-content-service.ts` | Replace select('*') with explicit columns |
| P0 | select_star | `user_progress` | `lib/user-progress-service.ts` | Replace select('*') with explicit columns |

Target: fetch only required columns and rows.
