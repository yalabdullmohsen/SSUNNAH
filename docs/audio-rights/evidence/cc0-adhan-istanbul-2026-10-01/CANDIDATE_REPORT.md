# CC0 Adhan Candidate — Adhan in Istanbul

| Field | Value |
|-------|-------|
| Status | **`CC0_ADHAN_REJECTED_QUALITY`** |
| Approved for release | **NO** |
| `AUDIO_CERTIFIED` | **false** |
| Decision phase | T-027 |
| Human QA | `HUMAN_QA_RECORD.md` |
| Retrieval | see `RETRIEVAL.json` |

## Source record

| Item | Value |
|------|-------|
| Original filename | `Adhan_in_Istanbul.webm` |
| Exact source URL | https://commons.wikimedia.org/wiki/File:Adhan_in_Istanbul.webm |
| Media URL | https://upload.wikimedia.org/wikipedia/commons/3/3d/Adhan_in_Istanbul.webm |
| Author / uploader | Viceskeeni2 (Own work) |
| Source date | 2025-09-06T02:50:33Z |
| License name | CC0 |
| License URL | https://creativecommons.org/publicdomain/zero/1.0/ |
| Retrieval date (UTC) | 2026-10-01T15:50:28Z |
| SHA-256 (WebM) | `ba0d10961d2ea2ebcb5f255383ae7dc60d980e8cfe9dab425b1ac7c85eb3e99a` |
| Wiki SHA1 | `15ea3b39550146a4b18a8d7debadb99f3ea7b5e2` |
| Bytes | 64900101 |

Committed evidence (no binary): `commons-api.json` · `commons-file-page.html` · `SHA256.txt` · `RETRIEVAL.json` · `TECHNICAL_METRICS.json` · `HUMAN_QA_RECORD.md`  
Local cache only (gitignored): `.cache/cc0-adhan-istanbul/`

## Processing (allowed ops only)

| Step | Result |
|------|--------|
| Download from official Commons URL | OK |
| Strip video track | OK |
| Transcode Opus → AAC mono 44.1 kHz ~128 kbps | OK |
| Voice clone / AI replace / lyric edit | **NOT DONE** (forbidden) |
| Loudness normalize / silence trim | **NOT DONE** (reject path — no content rewrite) |

| Extract artifact | Value |
|------------------|-------|
| Path (local) | `.cache/cc0-adhan-istanbul/adhan-istanbul-cc0-candidate.m4a` |
| Duration | **50.085 s** |
| Sample rate | 44100 Hz |
| Channels | 1 |
| Bitrate | ~128857 bps |
| SHA-256 | `5bb503354769bc6456f13d404e8683ef66185e6673acb950da7b9e5a280d1e75` |

## Quality gate (T-027)

| Check | Result |
|-------|--------|
| Rights page CC0 explicit | **PASS** |
| SHA recorded | **PASS** |
| Completeness of adhan phrases | **FAIL** (~50.085 s) |
| No extra speech / music bed / ambient | **FAIL** |
| No severe noise for notification use | **FAIL** |
| Suitable as notification / in-app alert | **FAIL** |

**Final:** `CC0_ADHAN_REJECTED_QUALITY` — Store v1 uses **system-default** OS notification sound.  
Do not set `CC0_ADHAN_APPROVED_FOR_RELEASE`. Seek another Commons CC0 original if a custom adhan is required later.

## Forbidden uses

- Store binary bundling  
- Watch / Widget / Live Activity audio  
- Claiming `AUDIO_CERTIFIED` or `CC0_ADHAN_APPROVED_FOR_RELEASE`  
- Substituting UNKNOWN / INTERNAL packs  
