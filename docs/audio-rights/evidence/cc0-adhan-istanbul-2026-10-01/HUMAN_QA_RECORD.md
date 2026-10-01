# Istanbul Adhan — Human QA Record (T-027)

| Field | Value |
|-------|-------|
| Decision | **`CC0_ADHAN_REJECTED_QUALITY`** |
| Candidate status before | `CC0_ADHAN_CANDIDATE` |
| Approved for release | **NO** |
| Review date (UTC) | `2026-10-01T20:55:00Z` |
| Reviewer | Agent technical QA + completeness gate (no AI voice edit) |
| Physical device sign-off | **FAIL** — not eligible for phone/AirPods/notification PASS after completeness FAIL |

## Identity (required fields)

| # | Field | Value |
|---|-------|-------|
| 1 | Original filename | `Adhan_in_Istanbul.webm` |
| 2 | Source URL | https://commons.wikimedia.org/wiki/File:Adhan_in_Istanbul.webm |
| 3 | License URL | https://creativecommons.org/publicdomain/zero/1.0/ |
| 4 | Author / Uploader | Viceskeeni2 (Own work) |
| 5 | Retrieval date | `2026-10-01T15:50:28Z` |
| 6 | SHA-256 (WebM) | `ba0d10961d2ea2ebcb5f255383ae7dc60d980e8cfe9dab425b1ac7c85eb3e99a` |
| 6b | SHA-256 (AAC extract) | `5bb503354769bc6456f13d404e8683ef66185e6673acb950da7b9e5a280d1e75` |
| 7 | Duration | **50.085 s** |
| 8 | Audio format | AAC in M4A · mono (extract); source WebM Opus+video stripped |
| 9 | Sample rate | **44100 Hz** |
| 10 | Loudness metrics | peak **−0.48 dBFS** · RMS **−20.95 dBFS** · crest **10.55** · clipNearFS **0** · silenceRatio **0.170** · continuous energy 50/50 s (see `TECHNICAL_METRICS.json`) |
| 11 | Human listening review | Completeness **FAIL** (see checklist). Device clarity items **FAIL** (blocked by completeness). |

Processing constraints honored: no AI voice replacement · no wording edit · no phrase cut/splice · no content rewrite. Extract only: strip video · Opus→AAC mono 44.1 kHz.

## Human review checklist

| Check | Result | Evidence |
|-------|--------|----------|
| اكتمال ألفاظ الأذان | **FAIL** | Duration **50.085 s** continuous outdoor capture — too short for a complete traditional adhan phrase set; pre-flagged in `CANDIDATE_REPORT.md` («risk of incomplete phrases»). Compare: store-usable alerts require complete phrases or OS default. |
| عدم وجود كلام إضافي | **FAIL** | Outdoor field WebM; ambient/non-adhan content risk cannot be cleared for release without phrase-complete PASS. |
| عدم وجود إعلان | **PASS** | Commons own-work CC0 page; no ad markers in metadata / API. |
| عدم وجود ضوضاء شديدة | **FAIL** | Continuous energy every second (no clean phrase gaps); outdoor ambient profile unsuitable as polished notification asset. |
| عدم وجود تقطيع | **PASS** | No silence gaps ≥1 s in PCM energy map (`silenceGapsSec: []`). |
| عدم وجود خلل تقني | **PASS** | Valid AAC mono 44.1 kHz · SHA matches · no hard clip samples. |
| وضوح مقبول على سماعة هاتف | **FAIL** | Not certified — completeness FAIL blocks device approval. |
| وضوح مقبول على AirPods | **FAIL** | Not certified — completeness FAIL blocks device approval. |
| وضوح مقبول لإشعار تطبيق | **FAIL** | Incomplete adhan must not ship as store notification sound. |

**Checklist aggregate:** **FAIL** (any required completeness/clarity FAIL ⇒ reject quality).

## Decision matrix application

```text
CC0_ADHAN_REJECTED_QUALITY
```

Release impact (v1):

- Use **System Notification Sound** (`system-default`) for store prayer alerts.
- Do **not** bundle Istanbul extract in `public/audio`, iOS Sounds, Watch, Widget, or offline packs.
- Do **not** use UNKNOWN / INTERNAL / MISSING_EVIDENCE packs as substitute.
- Existing CC0 field packs remain separately classified (`CC0_APPROVED` for web; store binary policy per audio allowlist).

## Artifacts

| File | Role |
|------|------|
| `RETRIEVAL.json` | Source retrieval |
| `SHA256.txt` / `AUDIO_EXTRACT_SHA256.txt` | Hashes |
| `commons-api.json` / `commons-file-page.html` | License evidence |
| `TECHNICAL_METRICS.json` | Loudness / energy |
| `HUMAN_QA_RECORD.md` | This record |
| Local cache (gitignored) | `.cache/cc0-adhan-istanbul/` |
