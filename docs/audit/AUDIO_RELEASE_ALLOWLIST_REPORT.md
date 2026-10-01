# Audio Release Allowlist Report — T-027

| Field | Value |
|-------|-------|
| Phase | T-027 `ISTANBUL_ADHAN_HUMAN_QA_AND_AUDIO_RELEASE_DECISION` |
| Tip base | `origin/main` @ branch start |
| Istanbul decision | **`CC0_ADHAN_REJECTED_QUALITY`** |
| Allowlist SoT | `docs/store-release/AUDIO_RELEASE_ALLOWLIST.json` |
| Inventory | `reports/audio-release-allowlist.json` |
| QA record | `docs/audio-rights/evidence/cc0-adhan-istanbul-2026-10-01/HUMAN_QA_RECORD.md` |

## Exit claims

| Claim | Result |
|-------|--------|
| `AUDIO_RELEASE_ALLOWLIST_LOCKED` | **PASS** (`locked: true`) |
| Every audio asset classified | **PASS** (APPROVED_AUDIO or BLOCKED_AUDIO) |
| Istanbul final decision | **PASS** — `CC0_ADHAN_REJECTED_QUALITY` |
| `CC0_ADHAN_APPROVED_FOR_RELEASE` | **false** (not claimed) |
| `AUDIO_CERTIFIED` | **false** (not claimed) |

---

## 1) Approved Audio Assets

| ID | Class | Files / notes |
|----|-------|----------------|
| `system-default` | `APPROVED_FOR_RELEASE` | OS sound — **Store v1 primary alert** |
| `field` | `CC0_APPROVED` | `adhan-field.m4a` · `adhan-field-short.m4a` · `adhan-short-field.caf` |
| `field-full` | `CC0_APPROVED` | `adhan-field-full.m4a` · `adhan-short-field-full.caf` |

Inventory counts: see `reports/audio-release-allowlist.json` → `counts.APPROVED_AUDIO`.

---

## 2) Blocked Audio Assets

| Class | Examples |
|-------|----------|
| `CC0_ADHAN_REJECTED_QUALITY` | Istanbul candidate (not in `public/` / not in Store binary) |
| `INTERNAL` | makkah / egypt / aqsa / gulf / takbeerat · `public/sounds/adhan/*` |
| `UNKNOWN` / `MISSING_EVIDENCE` | `adhan-haram-full` · `adhan-soft-alert` · non-CC0 iOS `adhan-*.caf` |
| `EXCLUDED` | madinah · qatami |
| `STRIP_FROM_RELEASE` | provisional `prayer_*.caf` / rings |
| `STREAM_ONLY` | everyayah / mp3quran / remote recitations |

---

## 3) Istanbul QA Evidence

| Item | Value |
|------|-------|
| Original filename | `Adhan_in_Istanbul.webm` |
| Source URL | https://commons.wikimedia.org/wiki/File:Adhan_in_Istanbul.webm |
| License URL | https://creativecommons.org/publicdomain/zero/1.0/ |
| Author | Viceskeeni2 |
| Retrieval | `2026-10-01T15:50:28Z` |
| SHA-256 WebM | `ba0d10961d2ea2ebcb5f255383ae7dc60d980e8cfe9dab425b1ac7c85eb3e99a` |
| SHA-256 AAC | `5bb503354769bc6456f13d404e8683ef66185e6673acb950da7b9e5a280d1e75` |
| Duration | **50.085 s** |
| Format | AAC mono M4A @ 44100 Hz |
| Loudness | peak −0.48 dBFS · RMS −20.95 dBFS · crest 10.55 · clips 0 |
| Checklist | Completeness **FAIL** · ambient noise **FAIL** · phone/AirPods/notification clarity **FAIL** · ads **PASS** · no splice gaps **PASS** · technical decode **PASS** |

Full signed record: `HUMAN_QA_RECORD.md` · metrics: `TECHNICAL_METRICS.json`.

Forbidden ops not used: AI voice replace · wording edit · phrase cut.

---

## 4) Final Audio Decision

```text
CC0_ADHAN_REJECTED_QUALITY
```

Store v1 prayer alert path: **`system-default`** only (selectable catalog already constrained).  
Do not substitute UNKNOWN/INTERNAL packs.

---

## 5) Release Impact

| Surface | Impact |
|---------|--------|
| Store Archive notification | OS default sound |
| Istanbul binary | **not shipped** |
| CC0 field packs | Remain `CC0_APPROVED` (web); Archive membership still follows store strip/allowlist tools |
| Recitations | `STREAM_ONLY` unchanged |
| Watch / Widget / Push audio | No Istanbul; no UNKNOWN packs |
| `AUDIO_CERTIFIED` | remains **false** |

Commands:

```bash
test -f docs/store-release/AUDIO_RELEASE_ALLOWLIST.json
node --import tsx artifacts/majalis/src/lib/__tests__/audio-release-allowlist-gate.test.ts
pnpm run verify:store-assets
```

---

## Exit Decision

**PASS** — allowlist locked · all assets classified · Istanbul final = `CC0_ADHAN_REJECTED_QUALITY`.
