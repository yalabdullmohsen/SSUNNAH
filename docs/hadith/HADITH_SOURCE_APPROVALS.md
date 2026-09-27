# Hadith Source Approvals — سُنّة

**Date:** 2026-09-27  
**Approver role:** Project owner (source/license decisions) — not per-record manual review

## Approved for local distribution

### 1) fawazahmed0/hadith-api@1 — Sahihayn mirror

| Field | Value |
|---|---|
| Source | https://github.com/fawazahmed0/hadith-api |
| Pinned version | `@1` (recorded in `public/data/hadith/manifest.json`) |
| Editions shipped | `ara-bukhari`, `ara-muslim` |
| License basis | MIT for packaging; classical matn |
| Local paths | `public/data/hadith/bukhari.json`, `muslim.json` |
| Classification model | `sahih-by-collection` |
| Owner decision | Allowed for local lazy-loaded mirror (see LICENSE_RISKS.md) |
| Status | `SOURCE_APPROVED` · `LICENSE_APPROVED` · `PUBLISHED` |

### 2) Curated verified seed (`hadith-verified`)

| Field | Value |
|---|---|
| Path | `public/data/hadith-verified/` |
| Scope | Educational/classified **sample** (1,740 rows after count alignment) |
| Grades | Copied/attributed only; never AI-inferred |
| Status | `APPROVED_WITH_ATTRIBUTION` · `PUBLISHED` as sample |

### 3) Arbaeen Nawawi learning seed

| Field | Value |
|---|---|
| Path | `src/lib/arbaeen-nawawi-seed.ts` |
| Count | 42 |
| Status | `APPROVED_WITH_ATTRIBUTION` · learning path · `PUBLISHED` |

## Network reference only (not local full import)

- CDN editions exposed on `/hadith/books` via `hadith-cdn-service`
- May be browsed online; must show يتطلب اتصالًا / بحسب ترقيم المصدر
- Status: `NETWORK_REFERENCE_ONLY`

## Explicitly not approved for full local redistribution (until new owner decision)

- Full contemporary takhrij corpora (e.g. Silsilah, Sahih al-Jami wholesale)
- Full mawduat printed editions under modern copyright
- Books listed in `HADITH_IMPORT_QUEUE.md` without a new license row

## Automatic blocking (no AI religious judgment)

Use statuses: `BLOCKED_SOURCE_CONFLICT` · `BLOCKED_GRADING_CONFLICT` · `BLOCKED_NUMBERING_CONFLICT` · `BLOCKED_ATTRIBUTION` · `BLOCKED_LICENSE` · `BLOCKED_INTEGRITY` · `BLOCKED_UNKNOWN`

Blocked rows: exclude from manifests, search indexes, and public routes; report technical id + reason only.

## Change log

| Date | Change |
|---|---|
| 2026-09-27 | Documented approvals; aligned hadith-verified manifest counts 1744→1740 (metadata only) |
