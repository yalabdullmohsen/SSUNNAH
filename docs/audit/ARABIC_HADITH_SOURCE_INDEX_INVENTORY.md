# ARABIC_HADITH_SOURCE_INDEX_INVENTORY

REAL_SCHEMA_DISCOVERED: yes  
REQUIRES_EXPLICIT_APPROVAL: true  
PRODUCTION_MIGRATION_APPLIED: false

## Physical tables

- public.verified_hadith_items — hadith corpus (spec alias: hadiths)
- public.trusted_sources — RSS/trusted sources (spec alias: sources)
- public.scholarly_sources — parallel scholarly registry (optional indexes)

## Absent entities (NOT invented)

- source_id / narrator_id / category_id / book_id / chapter_id FKs on hadiths
- hadith_tags join table
- narrators dimension table
- parent_id on trusted_sources
- description / language columns on trusted_sources

## Pre-existing indexes (from schema SQL)

- idx_verified_hadith_status (verification_status)
- idx_verified_hadith_collection (collection, hadith_number)
- idx_verified_hadith_keywords (GIN keywords)
- idx_hadith_authenticity (authenticity_class, verification_status)
- trusted_sources_url_uidx (url unique)
- idx_scholarly_sources_slug / idx_scholarly_sources_trust

## v4 added — relation/filter B-tree (partial verified)

- idx_hadith_rel_verified_auth_collection (authenticity_class, collection, hadith_number, id) WHERE verified AND deleted_at IS NULL
- idx_hadith_rel_verified_collection_chapter (collection, chapter, hadith_number, id) WHERE verified AND deleted_at IS NULL
- idx_hadith_rel_verified_source_name (source_name, id) WHERE verified AND deleted_at IS NULL
- idx_hadith_rel_verified_narrator (narrator, id) WHERE verified AND deleted_at IS NULL
- idx_hadith_filter_verified_updated (updated_at DESC, id) WHERE verified AND deleted_at IS NULL
- idx_trusted_sources_filter_active_category (category, name, id) WHERE is_active
- idx_trusted_sources_filter_active_type (source_type, name, id) WHERE is_active
- idx_scholarly_sources_filter_active_type (source_type, name, id) WHERE is_active

## v4 added — trigram GIN

- idx_hadiths_title_trgm / idx_hadiths_narrator_trgm / idx_hadiths_source_name_trgm / idx_hadiths_search_trgm
- idx_sources_name_trgm / idx_sources_search_trgm
- idx_scholarly_sources_name_trgm / idx_scholarly_sources_search_trgm

## v4 added — FTS GIN

- idx_hadiths_search_vector
- idx_sources_search_vector
- idx_scholarly_sources_search_vector

## Search documents

- verified_hadith_items.search_text (GENERATED STORED, ar_normalize concat)
- verified_hadith_items.search_vector (GENERATED STORED, weighted A/B/C/D simple)
- trusted_sources.search_text / search_vector (GENERATED STORED)
- scholarly_sources.search_text / search_vector (GENERATED STORED)
