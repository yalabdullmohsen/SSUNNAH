# Shubuhat Source Matrix

| Field | Value |
|---|---|
| Wave | SHUBUHAT_CENTER_W1 |

## Current data paths

| Path | Role | License / terms |
|---|---|---|
| `STATIC_DAWAH_SHUBUHAT` (`dawah-static-fallback.ts`) | Offline/static curated fallback | Internal editorial — must cite sources before PROVENANCE_COMPLETE |
| Supabase `dawah_shubuhat` | Live published rows when available | Editorial workflow + admin queue |
| Quran evidence refs | Quotation with ayah refs only | Never alter Quran text |

## Forbidden

- AI-invented scholarly books or page numbers
- Fabricated Hadith grades
- Hostile polemics / demeaning language
- Presenting incomplete static rows as encyclopedic authority

## W1 audit snapshot (static)

| Metric | Value |
|---|---|
| Static rows | 12 |
| Structure-valid (expected) | all with evidences |
| Named `sources[]` populated | ~1 |
| Search eligibility | 0 until provenance enrichment |

## Approved enrichment path

Source identification → approval → license → version pin → import → immutable preserve → provenance attach → deterministic validation → publication → search (only PROVENANCE_COMPLETE)
