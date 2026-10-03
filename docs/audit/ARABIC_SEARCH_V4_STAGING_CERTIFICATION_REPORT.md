# ARABIC_SEARCH_V4_STAGING_CERTIFICATION_REPORT

Updated: 2026-10-03T15:47:24.672Z
STAGING_PROJECT_REF: dgxzcmzcapzcrvcfzjmc
PRODUCTION_PROJECT_REF: ngmvmlulzacrlicuagyp
PRODUCTION_DATABASE_MIGRATION_APPLIED: false
Packet_classification: READY_FOR_OWNER_APPROVAL

## Identity
```json
{
  "stagingRef": "dgxzcmzcapzcrvcfzjmc",
  "productionRef": "ngmvmlulzacrlicuagyp",
  "equalsProduction": false,
  "isolation": "PASS",
  "dbHost": "aws-0-ap-southeast-2.pooler.supabase.com",
  "dbIpv4": "13.238.183.126",
  "currentDatabase": "postgres"
}
```

## Baseline
```json
{
  "postgresVersion": "17.11",
  "extensions": [
    "pg_stat_statements",
    "pg_trgm",
    "pgcrypto",
    "plpgsql",
    "supabase_vault",
    "uuid-ossp"
  ],
  "schemas": [
    "auth",
    "extensions",
    "graphql",
    "graphql_public",
    "information_schema",
    "public",
    "realtime",
    "storage",
    "vault"
  ],
  "tables": [
    "trusted_sources",
    "verified_hadith_items"
  ],
  "rowCounts": {
    "verified_hadith_items": 7,
    "trusted_sources": 2
  },
  "tableSizes": [
    {
      "relname": "verified_hadith_items",
      "total": "264 kB"
    },
    {
      "relname": "trusted_sources",
      "total": "136 kB"
    }
  ],
  "policyCount": 4,
  "rpcSignatures": [
    {
      "proname": "ar_normalize",
      "args": "input text"
    },
    {
      "proname": "search_hadiths",
      "args": "q text, lim integer, p_collection text, p_chapter text, p_authenticity_class text, p_source_name text, p_narrator text, p_cursor_score double precision, p_cursor_id text"
    },
    {
      "proname": "search_sources",
      "args": "q text, lim integer, p_category text, p_source_type text, p_cursor_score double precision, p_cursor_id uuid"
    }
  ]
}
```

## Migration
```json
{
  "status": "PASS",
  "file": "20261003120000_arabic_search_hadith_source_infra_v4.sql",
  "durationMs": 888,
  "checks": {
    "pg_trgm": true,
    "ar_normalize": true,
    "search_text_col": true,
    "search_vector_col": true,
    "search_hadiths": true,
    "search_sources": true
  }
}
```

## Indexes
```json
{
  "count": 15,
  "invalidCount": 0,
  "indexes": [
    {
      "idx": "idx_hadith_filter_verified_updated",
      "indisvalid": true,
      "indisready": true,
      "size": "16 kB"
    },
    {
      "idx": "idx_hadith_rel_verified_auth_collection",
      "indisvalid": true,
      "indisready": true,
      "size": "16 kB"
    },
    {
      "idx": "idx_hadith_rel_verified_collection_chapter",
      "indisvalid": true,
      "indisready": true,
      "size": "16 kB"
    },
    {
      "idx": "idx_hadith_rel_verified_narrator",
      "indisvalid": true,
      "indisready": true,
      "size": "16 kB"
    },
    {
      "idx": "idx_hadith_rel_verified_source_name",
      "indisvalid": true,
      "indisready": true,
      "size": "16 kB"
    },
    {
      "idx": "idx_hadiths_narrator_trgm",
      "indisvalid": true,
      "indisready": true,
      "size": "24 kB"
    },
    {
      "idx": "idx_hadiths_search_trgm",
      "indisvalid": true,
      "indisready": true,
      "size": "24 kB"
    },
    {
      "idx": "idx_hadiths_search_vector",
      "indisvalid": true,
      "indisready": true,
      "size": "24 kB"
    },
    {
      "idx": "idx_hadiths_source_name_trgm",
      "indisvalid": true,
      "indisready": true,
      "size": "24 kB"
    },
    {
      "idx": "idx_hadiths_title_trgm",
      "indisvalid": true,
      "indisready": true,
      "size": "24 kB"
    },
    {
      "idx": "idx_sources_name_trgm",
      "indisvalid": true,
      "indisready": true,
      "size": "24 kB"
    },
    {
      "idx": "idx_sources_search_trgm",
      "indisvalid": true,
      "indisready": true,
      "size": "24 kB"
    },
    {
      "idx": "idx_sources_search_vector",
      "indisvalid": true,
      "indisready": true,
      "size": "24 kB"
    },
    {
      "idx": "idx_trusted_sources_filter_active_category",
      "indisvalid": true,
      "indisready": true,
      "size": "16 kB"
    },
    {
      "idx": "idx_trusted_sources_filter_active_type",
      "indisvalid": true,
      "indisready": true,
      "size": "16 kB"
    }
  ],
  "status": "PASS"
}
```

## RLS
```json
{
  "status": "PASS",
  "rpcHidesRejected": true,
  "rpcHidesDeleted": true,
  "anonHidesRejected": true,
  "anonHidesDeleted": true,
  "anonHidesInactiveSource": true,
  "serviceRoleSeesRejectedForAdminPath": true,
  "authenticatedCheck": true
}
```

## Functional
```json
{
  "status": "PASS",
  "cases": [
    {
      "name": "exact_title",
      "ok": true,
      "rowCount": 3
    },
    {
      "name": "exact_source",
      "ok": true,
      "rowCount": 3
    },
    {
      "name": "exact_narrator",
      "ok": true,
      "rowCount": 2
    },
    {
      "name": "hadith_number",
      "ok": true,
      "rowCount": 1
    },
    {
      "name": "prefix",
      "ok": true,
      "rowCount": 3
    },
    {
      "name": "typo",
      "ok": true,
      "rowCount": 2
    },
    {
      "name": "hamza",
      "ok": true,
      "rowCount": 1
    },
    {
      "name": "tashkeel",
      "ok": true,
      "rowCount": 1
    },
    {
      "name": "ta_marbuta",
      "ok": true,
      "rowCount": 1
    },
    {
      "name": "source_filter",
      "ok": true,
      "rowCount": 1
    },
    {
      "name": "pagination_cursor_no_dup",
      "ok": true,
      "page1": 2,
      "page2": 1,
      "dup": false
    },
    {
      "name": "sources_exactish",
      "ok": true,
      "rowCount": 1
    },
    {
      "name": "no_rejected_in_results",
      "ok": true,
      "rowCount": 1
    }
  ]
}
```

## Benchmark Before
```json
{
  "cases": [
    {
      "name": "title_search",
      "ok": true,
      "planningMs": 0.064,
      "executionMs": 8.933,
      "nodeType": "Function Scan",
      "actualRows": 3,
      "sharedHit": 447,
      "sharedRead": 0,
      "indexUsed": false,
      "seqScan": false
    },
    {
      "name": "narrator_search",
      "ok": true,
      "planningMs": 0.051,
      "executionMs": 4.282,
      "nodeType": "Function Scan",
      "actualRows": 2,
      "sharedHit": 2,
      "sharedRead": 0,
      "indexUsed": false,
      "seqScan": false
    },
    {
      "name": "source_search",
      "ok": true,
      "planningMs": 0.049,
      "executionMs": 3.536,
      "nodeType": "Function Scan",
      "actualRows": 0,
      "sharedHit": 132,
      "sharedRead": 0,
      "indexUsed": false,
      "seqScan": false
    },
    {
      "name": "phrase_search",
      "ok": true,
      "planningMs": 0.059,
      "executionMs": 7.67,
      "nodeType": "Function Scan",
      "actualRows": 1,
      "sharedHit": 2,
      "sharedRead": 0,
      "indexUsed": false,
      "seqScan": false
    },
    {
      "name": "typo_search",
      "ok": true,
      "planningMs": 0.055,
      "executionMs": 5.031,
      "nodeType": "Function Scan",
      "actualRows": 2,
      "sharedHit": 2,
      "sharedRead": 0,
      "indexUsed": false,
      "seqScan": false
    },
    {
      "name": "no_result_search",
      "ok": true,
      "planningMs": 0.051,
      "executionMs": 2.941,
      "nodeType": "Function Scan",
      "actualRows": 0,
      "sharedHit": 2,
      "sharedRead": 0,
      "indexUsed": false,
      "seqScan": false
    }
  ]
}
```

## Benchmark After
```json
{
  "cases": [
    {
      "name": "title_search",
      "ok": true,
      "planningMs": 0.084,
      "executionMs": 4.555,
      "nodeType": "Function Scan",
      "actualRows": 3,
      "sharedHit": 2,
      "sharedRead": 0,
      "indexUsed": false,
      "seqScan": false
    },
    {
      "name": "narrator_search",
      "ok": true,
      "planningMs": 0.052,
      "executionMs": 3.877,
      "nodeType": "Function Scan",
      "actualRows": 2,
      "sharedHit": 2,
      "sharedRead": 0,
      "indexUsed": false,
      "seqScan": false
    },
    {
      "name": "source_search",
      "ok": true,
      "planningMs": 0.048,
      "executionMs": 1.791,
      "nodeType": "Function Scan",
      "actualRows": 0,
      "sharedHit": 1,
      "sharedRead": 0,
      "indexUsed": false,
      "seqScan": false
    },
    {
      "name": "phrase_search",
      "ok": true,
      "planningMs": 0.058,
      "executionMs": 5.042,
      "nodeType": "Function Scan",
      "actualRows": 1,
      "sharedHit": 2,
      "sharedRead": 0,
      "indexUsed": false,
      "seqScan": false
    },
    {
      "name": "typo_search",
      "ok": true,
      "planningMs": 0.421,
      "executionMs": 4.554,
      "nodeType": "Function Scan",
      "actualRows": 2,
      "sharedHit": 2,
      "sharedRead": 0,
      "indexUsed": false,
      "seqScan": false
    },
    {
      "name": "no_result_search",
      "ok": true,
      "planningMs": 0.053,
      "executionMs": 2.999,
      "nodeType": "Function Scan",
      "actualRows": 0,
      "sharedHit": 2,
      "sharedRead": 0,
      "indexUsed": false,
      "seqScan": false
    }
  ],
  "comparison": [
    {
      "name": "title_search",
      "class": "IMPROVED",
      "beforeExec": 8.933,
      "afterExec": 4.555
    },
    {
      "name": "narrator_search",
      "class": "UNCHANGED",
      "beforeExec": 4.282,
      "afterExec": 3.877
    },
    {
      "name": "source_search",
      "class": "IMPROVED",
      "beforeExec": 3.536,
      "afterExec": 1.791
    },
    {
      "name": "phrase_search",
      "class": "IMPROVED",
      "beforeExec": 7.67,
      "afterExec": 5.042
    },
    {
      "name": "typo_search",
      "class": "UNCHANGED",
      "beforeExec": 5.031,
      "afterExec": 4.554
    },
    {
      "name": "no_result_search",
      "class": "UNCHANGED",
      "beforeExec": 2.941,
      "afterExec": 2.999
    }
  ],
  "status": "COMPLETE"
}
```

## Soak
```json
{
  "status": "PASS",
  "results": [
    {
      "name": "hadith_rpc_anon",
      "ok": true,
      "status": 200
    },
    {
      "name": "source_rpc_anon",
      "ok": true,
      "status": 200
    },
    {
      "name": "rapid_typing",
      "ok": true,
      "count": 5
    },
    {
      "name": "cancellation",
      "ok": true
    },
    {
      "name": "timeout_window",
      "ok": true,
      "status": 200
    },
    {
      "name": "pagination",
      "ok": true
    },
    {
      "name": "production_flag_untouched",
      "ok": true,
      "note": "Soak used Staging REST RPC directly; Production VITE_ARABIC_DB_RPC_SEARCH left disabled"
    },
    {
      "name": "empty_query",
      "ok": true,
      "status": 200
    }
  ],
  "stagingOnly": true
}
```

## Errors
- none
