# Kuwait Lesson Source Matrix

| Field | Value |
|---|---|
| Wave | KUWAIT_LESSONS_MODEL_W1 |
| Ops registry | `artifacts/majalis/lib/content-ops/data/source-registry.json` |

## Allowed source classes (events)

| sourceId | Name | Type | Content | Enabled | Notes |
|---|---|---|---|---|---|
| `sunnah-official-site` | سُنّة — الموقع الرسمي | official_direct | events, metadata | yes | Owned |
| `kuwait-awqaf` | وزارة الأوقاف — الكويت | government_or_education | events, schedules, institutions | yes | Official public |
| `kuwait-university` | جامعة الكويت | government_or_education | schedules, admissions | yes | Not a primary mosque feed |

## Forbidden classes (from ops registry)

anonymous_accounts · content_mirrors · forums · user_comments · search_engine_as_final · undated_pages · terms_disallowed · undocumented_ai_pages · unofficial_social

## Current seed reality (`chunk-000.json`)

| Fact | Value |
|---|---|
| Rows | 82 |
| `status` | all `approved` |
| `delivery` | حضور فقط / كلاهما |
| `last_verified*` | **absent** on seed rows |
| `source_id` / `source_url` | **absent** on seed rows |
| `cancelled_at` | **absent** |

Implication: seed lessons remain **LIVE_DATA / EVENT_SOURCES_PARTIAL**. They may display when structure-valid, but must not claim full provenance completeness until `lastVerifiedAt` + `sourceId` are present from an approved fetch.

## Import lifecycle (events)

Source identification → approval → license/terms → version pin → structured import → immutable preserve → provenance attach → deterministic validation → publication eligibility → search index → route validation

On failure: block record, exclude from public upcoming/search as required, keep independently valid rows.

## License state

Event schedules from government/official pages: `public_official` / owned. No redistributed copyrighted lecture audio/text without permission — link-out preferred (`streamUrl` / `siteUrl`).
