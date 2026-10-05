# INDEX_AUTHORITY_REPORT

Generated: 2026-10-05T21:14:17.786Z

| Metric | Value |
|---|---:|
| createIndexStatements | 1008 |
| uniqueIndexes | 25 |
| partialIndexMentions | 72 |
| ginTrigramMentions | 96 |
| ftsMentions | 190 |
| duplicateIndexNameDefs | 30 |

- Hot filter indexes migration: ✅
- FK indexes migration: ✅
- Search index SQL: ✅

## Recommendations

- Prefer partial indexes on status IN (pending, failed) for queues
- Ensure FK columns used in joins have indexes (add_missing_fk_indexes_*)
- Search: keep pg_trgm / FTS on search_index — avoid select(*) on large corpora
- Unused indexes: DEVICE_REQUIRED via pg_stat_user_indexes

## Duplicate index name definitions (migration churn)

- `if` ×3
- `idx_governance_roles_role` ×3
- `idx_gov_audit_created` ×3
- `idx_profiles_is_owner` ×2
- `idx_profiles_is_super_admin` ×2
- `akp_content_sources_active_idx` ×3
- `akp_fingerprints_type_hash_idx` ×3
- `akp_fingerprints_source_idx` ×3
- `akp_review_queue_status_idx` ×3
- `akp_dlq_created_idx` ×3
- `akp_pipeline_runs_pipeline_idx` ×3
- `akp_logs_component_idx` ×3
- `akp_metrics_type_idx` ×3
- `akp_alerts_unresolved_idx` ×3
- `akp_stories_status_idx` ×3
- `akp_retry_queue_next_idx` ×4
- `akp_source_health_slug_idx` ×4
- `akp_source_health_status_idx` ×3
- `akp_duplicate_history_type_idx` ×4
- `idx_verified_adhkar_cat_slug` ×2

Unused indexes: NOT_CONNECTED (pg_stat_user_indexes).
