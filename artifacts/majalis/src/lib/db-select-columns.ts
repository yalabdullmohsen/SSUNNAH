/**
 * Explicit PostgREST column lists for select(*) elimination.
 * Derived from TypeScript consumer types / admin UI field use.
 * Do not include nested relation syntax here — compose at call site.
 */

export const AUTO_IMPORTED_CONTENT_COLS =
  "id, external_key, title, slug, content_type, category, summary, content, source_name, source_url, original_url, tags, verification_status, status, quality_score, seo_title, seo_description, structured_data, source_verified, pipeline_stage, ai_analysis, error_details, published_at, created_at, updated_at, source_account, source_post_id, source_published_at, attribution_name, organization_name, image_url, media_type, registration_url, event_start_at, event_end_at, expires_at, review_status, content_hash, last_displayed_at, display_count, pinned";

/** Public library surfaces — omit heavy admin-only JSON blobs. */
export const AUTO_IMPORTED_CONTENT_PUBLIC_COLS =
  "id, external_key, title, slug, content_type, category, summary, content, source_name, source_url, original_url, tags, verification_status, status, quality_score, seo_title, seo_description, published_at, created_at, updated_at, source_account, attribution_name, organization_name, image_url, media_type, registration_url, event_start_at, event_end_at, expires_at, last_displayed_at, display_count, pinned";

export const TRUSTED_SOURCES_COLS =
  "id, name, source_type, url, category, trust_level, is_active, last_synced_at";

export const AUTO_IMPORT_LOGS_COLS =
  "id, run_id, source_id, status, message, pipeline_stage, error_details, duration_ms, item_title, item_external_key, imported_count, skipped_count, failed_count, created_at";

export const AUTO_IMPORT_RUNS_COLS =
  "id, trigger_type, status, sources_total, sources_ok, sources_failed, imported_count, skipped_count, failed_count, duration_ms, error_summary, started_at, finished_at";

export const ADMIN_AUDIT_LOGS_COLS =
  "id, user_id, action, table_name, record_id, content_kind, metadata, created_at";

export const IMPORT_JOBS_COLS =
  "id, content_kind, status, inserted_count, updated_count, filename, total_rows, created_at, finished_at";

export const CATEGORIES_COLS =
  "id, parent_id, slug, name, description, icon, sort_order, status, status_reason, status_changed_at, status_changed_by";

export const SHARIA_RULINGS_COLS =
  "id, external_key, title, summary, body, category, evidence, references, keywords, status, view_count, created_at, updated_at";

export const ANNUAL_COURSES_COLS =
  "id, external_key, title, summary, body, course_type, season, year, sheikh_names, mutoon, schedule, venue_name, venue_address, venue_city, map_url, registration_url, registration_open, start_date, end_date, keywords, status, view_count, archived_at, created_at, updated_at";

export const PLATFORM_UPDATES_COLS =
  "id, external_key, title, summary, body, update_type, source_type, source_id, source_url, published_at, status, created_at, updated_at";

export const DAWAH_SHUBUHAT_COLS =
  "id, category_id, slug, title, complexity_level, shubha_text, why_spread, short_answer, detailed_refutation, assumption_correction, historical_linguistic_context, evidences, sources, objections_and_responses, conclusion, updated_at, status, is_approved, created_at";

export const DAWAH_ARTICLES_COLS =
  "id, category_id, slug, title_ar, title_en, summary_ar, summary_en, body_ar, cover_image_url, tags, updated_at, status, is_approved, created_at";

export const NEW_MUSLIM_PATH_COLS =
  "id, day_number, audience, title, content_ar, content_en, status, is_approved, created_at";

export const DAWAH_QUEUE_COLS: Record<string, string> = {
  dawah_questions: "id, title, short_answer, status, created_at, updated_at",
  dawah_shubuhat: "id, title, short_answer, status, created_at, updated_at",
  dawah_articles: "id, title_ar, summary_ar, status, created_at, updated_at",
  new_muslim_path: "id, title, day_number, status, created_at, updated_at",
};

export const DAWAH_CONTACT_REQUESTS_COLS =
  "id, tracking_code, name, is_anonymous, lang, preferred_daee_gender, religious_background, country, timezone, topic, contact_method, contact_value, status, assigned_to, notes, responded_at, created_at, updated_at";

export const PROPHET_STORIES_COLS =
  "id, slug, arabic_name, citations, content, is_approved, verified_by, approved_at, created_at";

export const ISLAMIC_STORIES_COLS =
  "id, slug, title, category, era, icon, summary, full_content, key_lessons, related_figures, sources, tags, is_approved, verified_by, approved_at, created_at";

export const USER_SUBMISSIONS_COLS =
  "id, type, submitter_name, submitter_email, user_id, title, description, file_url, file_name, file_size_kb, file_mime, meta, status, reviewer_note, reviewed_at, created_at";

export const USER_PROGRESS_COLS =
  "id, user_id, content_type, content_id, content_title, content_url, progress_pct, last_position, updated_at";

export const USER_NOTES_COLS =
  "id, user_id, content_type, content_id, content_title, note_text, tags, created_at, updated_at";

export const RESEARCHER_PROFILES_COLS =
  "id, user_id, display_name, bio, institution, specialization, research_interests, publications, is_public, updated_at";

export const STUDY_SESSIONS_COLS =
  "id, user_id, duration_minutes, goal, completed, session_date, created_at";

export const FAMILY_LINKS_COLS =
  "id, parent_id, child_id, invite_code, status, created_at";

export const BOOK_READING_PLANS_COLS =
  "id, user_id, book_slug, book_title, total_pages, start_date, end_date, reading_days, daily_minutes, pace_level, include_review_days, status, current_page, progress_log, paused_at, created_at, updated_at";

export const QURAN_CIRCLES_COLS =
  "id, name, sheikh_name, level, track, mode, meeting_link, location, schedule_days, schedule_time, capacity, enrolled_count, description, cover_image, contact_info, registration_url, website_url, governorate, is_approved, is_active, created_at";

export const LEARNING_PATH_COLS =
  "id, slug, title, title_en, description, level, category, icon, sort_order, status, total_sessions, what_you_learn, legacy_estimated_hours";

export const PATH_STAGES_COLS =
  "id, path_id, slug, title, description, sort_order, status";

export const COURSES_ADMIN_COLS =
  "id, stage_id, slug, title, description, learning_goal, level, sort_order, pass_percentage, outcomes, status";

export const COURSE_UNITS_COLS = "id, course_id, title, sort_order";

export const LEARNING_ITEMS_COLS =
  "id, unit_id, item_type, title, description, content_ref_table, content_ref_id, external_url, session_estimate, minutes_estimate, weight, is_required, completion_method, completion_threshold, sort_order, status, is_approved, assessment_id";

export const COURSE_BOOKS_COLS =
  "id, learning_item_id, book_title, book_author, material_role, scope_description, inclusion_reason, source_name, source_url, license_note";

export const PREREQUISITES_COLS = "id, course_id, requires_course_id, created_at";

export const ASSESSMENTS_COLS =
  "id, scope_type, course_id, stage_id, path_id, title, pass_percentage, max_attempts, status, created_at";

export const ASSESSMENT_QUESTIONS_COLS =
  "id, assessment_id, question_type, question_text, options, correct_answer, explanation, explanation_source, points, sort_order, source_bank, is_approved";

export const TABLE_COLS: Record<string, string> = {
  learning_paths: LEARNING_PATH_COLS,
  path_stages: PATH_STAGES_COLS,
  courses: COURSES_ADMIN_COLS,
  course_units: COURSE_UNITS_COLS,
  learning_items: LEARNING_ITEMS_COLS,
  course_books: COURSE_BOOKS_COLS,
  prerequisites: PREREQUISITES_COLS,
  assessments: ASSESSMENTS_COLS,
  assessment_questions: ASSESSMENT_QUESTIONS_COLS,
};
