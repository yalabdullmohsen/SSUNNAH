# ADHAN AUDIO AUDIT — سُنّة

| Field | Value |
|-------|-------|
| Audited at (UTC) | `2026-10-01T15:05:00Z` |
| Tip | `origin/main` @ `57bdf91e` (MATCH production at audit start) |
| Probe tool | macOS `/usr/bin/afinfo` (ffprobe unavailable on host) |
| Rights SoT | `artifacts/majalis/src/lib/prayer-audio-rights-registry.ts` |
| Store policy | `docs/store-release/STORE_ASSET_MANIFEST.md` |
| Program | Mobile First Expansion · section G |
| **Verdict** | **`AUDIO_LICENSE_PARTIAL`** — **not** `AUDIO_CERTIFIED` |

## Rules

1. أي ملف `UNKNOWN` / `rights_uncertain` / `rejected` / `MISSING_EVIDENCE` ⇒ **ممنوع** Store binary وWatch/Widget/Live Activity bundling.
2. `internal-app-asset` بلا دليل ترخيص خارجي مكتوب ⇒ **ليس** `OPEN_LICENSE` ولا `PUBLIC_DOMAIN` — يبقى `LICENSE_CERTIFICATION_REQUIRED` للمتجر.
3. لا حذف جماعي في هذه الجولة: `madinah`/`qatami` أُزيلا سابقًا من `public/audio/adhan`؛ الباقي إما CC0 موثّق أو internal بانتظار OWNER.
4. ممنوع ادعاء `AUDIO_CERTIFIED` حتى يُغلق كل صف أدناه بـ PUBLIC_DOMAIN / OPEN_LICENSE / LICENSED / OWNER_PERMISSION.

## Classification legend

| Class | Meaning |
|-------|---------|
| `PUBLIC_DOMAIN` / `OPEN_LICENSE` | دليل CC0/مفتوح موثّق |
| `INTERNAL_PENDING_OWNER` | حزمة داخلية · UI قد يعرضها على الويب · Store strip حتى OWNER |
| `EXCLUDED` | غير موجود / مرفوض / غير مؤكد — لا يُعاد إدخاله |
| `MISSING_EVIDENCE` | ملف على القرص بلا سلسلة ترخيص كافية للمتجر |

---

## A — `public/audio/adhan` (web / Capacitor sync source)

| File | Bytes | Sample rate | Bitrate (bps) | Duration (s) | Source | License | Usage rights | Quality note | Class |
|------|------:|------------:|--------------:|-------------:|--------|---------|--------------|--------------|-------|
| `adhan-field.m4a` | 389586 | 44100 | 72459 | 42.10 | Wikimedia `File:Adhan.ogg` | **CC0-1.0** | embed OK · commercial OK · attribution optional | AAC mono · good | `OPEN_LICENSE` |
| `adhan-field-short.m4a` | 83632 | 44100 | 64677 | 10.00 | same (trim) | **CC0-1.0** | same | AAC mono | `OPEN_LICENSE` |
| `adhan-field-full.m4a` | 481110 | 44100 | 64830 | 58.00 | Wikimedia `File:Beautiful_adhan.ogg` | **CC0-1.0** | same | AAC mono · good | `OPEN_LICENSE` |
| `adhan-makkah.mp3` | 449165 | 44100 | 127999 | 28.03 | internal bundle (from makkah-full) | `internal-app-asset` | app embed claimed · **no external license URL** | MP3 mono · OK | `INTERNAL_PENDING_OWNER` |
| `adhan-gulf-short.mp3` | 181019 | 44100 | 127999 | 11.28 | internal (from takbeerat) | `internal-app-asset` | same | MP3 mono · OK | `INTERNAL_PENDING_OWNER` |
| `adhan-egypt-full.m4a` | 121208 | 22050 | 31350 | 28.73 | internal | `internal-app-asset` | same | AAC · low SR | `INTERNAL_PENDING_OWNER` |
| `adhan-aqsa-full.mp3` | 460000 | 22050 | 64000 | 57.47 | internal | `internal-app-asset` | same | MP3 stereo@22k · modest | `INTERNAL_PENDING_OWNER` |
| `adhan-makkah-full.m4a` | 121139 | 22050 | 31331 | 28.73 | internal | `internal-app-asset` | same | AAC · low SR | `INTERNAL_PENDING_OWNER` |
| `adhan-makkah-fajr.mp3` | 460000 | 16000 | 32000 | 114.79 | internal | `internal-app-asset` | same | **low quality** 16 kHz/32 kbps | `INTERNAL_PENDING_OWNER` |
| `adhan-haram-full.m4a` | 241794 | 44100 | 64801 | 28.79 | internal | not in registry id map | same | AAC mono · OK | `MISSING_EVIDENCE` |
| `adhan-soft-alert.m4a` | 121705 | 22050 | 31488 | 28.73 | internal | not in registry id map | same | AAC · low SR | `MISSING_EVIDENCE` |
| `adhan-takbeerat-short.mp3` | 180000 | 22050 | 128000 | 11.25 | internal | related to kuwait/gulf | same | MP3 · OK | `INTERNAL_PENDING_OWNER` |
| `adhan-madinah.mp3` | — | — | — | — | third-party CDN (removed) | `rights_uncertain` | **forbidden** | n/a | `EXCLUDED` |
| `adhan-qatami.mp3` | — | — | — | — | celebrity risk (removed) | `rejected` | **forbidden** | n/a | `EXCLUDED` |

Evidence paths (CC0): `docs/audio-rights/evidence/wikimedia-adhan-ogg-2026-09-13.html` · `wikimedia-beautiful-adhan-2026-09-13.html`.

---

## B — iOS `Sounds/*.caf` (notification / sequence)

| File | Bytes | Sample rate | Bitrate (bps) | Duration (s) | License class | Store posture |
|------|------:|------------:|--------------:|-------------:|---------------|---------------|
| `adhan-short-field.caf` | 238390 | 44100 | 187425 | 10.00 | **CC0-1.0** (derived) | OK web/native tree · Store OWNER allowlist |
| `adhan-short-field-full.caf` | 238390 | 44100 | 187425 | 10.00 | **CC0-1.0** (derived) | same |
| `adhan-short-makkah.caf` | 135710 | 22050 | 93712 | 11.23 | `MISSING_EVIDENCE` / internal | **EXCLUDE store archive** until OWNER |
| `adhan-short-makkah-fajr.caf` | 203948 | 16000 | 68000 | 23.51 | same · **low SR** | EXCLUDE store |
| `adhan-short-egypt.caf` | 135710 | 22050 | 93712 | 11.23 | same | EXCLUDE store |
| `adhan-short-aqsa.caf` | 267290 | 22050 | 93712 | 22.47 | same | EXCLUDE store |
| `adhan-short-takbeerat.caf` | 135710 | 22050 | 93712 | 11.23 | same | EXCLUDE store |
| `adhan-seq-makkah-01..04.caf` | 340730×4 | 22050 | 93712 | 28.73 | `MISSING_EVIDENCE` | EXCLUDE store |
| `prayer_*.caf` / rings / `prayer-alert.caf` | varies | 22050–44100 | — | 0.28–8 | provisional internal / synthetic | Prefer OS default for Store RC |

---

## C — Actions (this program)

| Action | Status |
|--------|--------|
| Keep CC0 field packs on web | DONE (already) |
| Keep madinah/qatami out of bundle | DONE (already removed) |
| Retrieve Commons `Adhan_in_Istanbul.webm` | **DONE** · `CC0_ADHAN_CANDIDATE` · `docs/audio-rights/evidence/cc0-adhan-istanbul-2026-10-01/` · human QA pending (~50s) |
| Promote Istanbul → `CC0_ADHAN_APPROVED_FOR_RELEASE` | **BLOCKED** on human listen QA |
| Delete additional binaries without replacement | **DEFERRED** — يحتاج بديل APPROVED + تحديث بوابات `test:adhan-*` |
| Register `adhan-haram-full` / `adhan-soft-alert` in rights registry or strip | **OPEN** · MF-AUDIO-1 |
| OWNER allowlist for Store CAF/CC0 | **OWNER_ACTION** |
| Replace low-SR assets (16–22 kHz) with ≥44.1 kHz licensed masters | **OPEN** · MF-AUDIO-2 |

## D — Forbidden claims

```text
AUDIO_CERTIFIED = false
CONTENT_CERTIFIED = false
STORE_SUBMISSION_READY = false  (audio lane)
```

الحالة الصوتية الحالية: **`AUDIO_LICENSE_PARTIAL`**.
