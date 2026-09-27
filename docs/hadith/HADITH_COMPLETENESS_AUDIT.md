# Hadith Completeness Audit — سُنّة

**Date:** 2026-09-27  
**Method:** Deterministic file measurement + registry cross-check  
**Import during this wave:** None

## Verdict summary

| Collection | Local | Network catalog | Completeness verdict |
|---|---:|---:|---|
| Sahih al-Bukhari | 7,580 | 7,563 | **LOCAL_COMPLETE** (validated) |
| Sahih Muslim | 7,360 | 3,033 | **LOCAL_COMPLETE** (validated; numbering ≠ CDN) |
| Arbaeen Nawawi | 42 | 42 | **LOCAL_COMPLETE** learning path |
| Curated verified | 1,740 | — | **LOCAL_CURATED_SAMPLE** (manifest aligned) |
| Sunan Abu Dawud | 9 sample / 0 full | 5,274 | **NOT_IMPORTED** full; curated sample only |
| Jami al-Tirmidhi | 20 sample | 3,956 | **NOT_IMPORTED** full |
| Sunan al-Nasai | 3 sample | 5,761 | **NOT_IMPORTED** full |
| Sunan Ibn Majah | 4 sample | 4,341 | **NOT_IMPORTED** full |
| Muwatta Malik | 0 | 1,832 | **NOT_IMPORTED** (network alias) |
| Riyad al-Salihin | 0 | — | **NOT_IMPORTED** |
| Bulugh al-Maram | 0 | — | **NOT_IMPORTED** (lessons mention only) |
| Umdat al-Ahkam | 0 | — | **NOT_IMPORTED** (science mention only) |
| Hadith Qudsi | 0 local full | 40 | **NETWORK_REFERENCE_ONLY** |
| Sahih al-Jami | 0 | — | **BLOCKED_LICENSE** |
| Silsilah | 0 | — | **BLOCKED_LICENSE** |
| Musnad Ahmad | 0 | — | **NOT_IMPORTED** |
| Sunan al-Darimi | 0 | — | **NOT_IMPORTED** |

## Local Sahihayn integrity (measured)

| Metric | Bukhari | Muslim |
|---|---:|---:|
| Declared count | 7,580 | 7,360 |
| Actual rows | 7,580 | 7,360 |
| Empty matn | 0 | 0 |
| Duplicate numbers | 0 | 0 |
| Unique numbers | 7,580 | 7,360 |
| Missing book field | 0 | 0 |
| Source version | fawazahmed0/hadith-api@1 | same |
| Edition | ara-bukhari | ara-muslim |
| Manifest skippedEmpty (import-time) | 9 | 203 |
| Offline | yes | yes |
| In-page search | yes (after load) | yes |
| Platform global search full-text | **no** (sample-50 only) | **no** |

## Curated verified integrity (measured)

| Metric | Value |
|---|---:|
| Manifest total (aligned) | **1,740** |
| Prior mismatched claim | 1,744 |
| Empty matn | 0 |
| Missing grade | 0 |
| Missing narrator | 1,079 |
| Missing chapter | 0 |
| by class | sahih 1,154 · daif 326 · mawdu 260 |

## Network catalog

Retrievable live CDN counts were **not** re-fetched in this audit wave (bounded, offline-safe). Configured catalog metadata in `HADITH_COLLECTIONS` / registry is treated as **NETWORK_REFERENCE_ONLY** until a dedicated network measurement wave records actual download counts with checksums.

## Search status

| Surface | Coverage |
|---|---|
| `/hadith/sahih` in-page | ~14,940 after client load |
| `/search` platform index | 6 hadith stub docs |
| `searchHadithCorpus` | 50 sample rows |
| Arbaeen in-page | 42 |

## Explicit non-claims

- No collection was imported in this audit.
- “Complete” here means honest availability state — not literary completeness of the Hadith corpus.
