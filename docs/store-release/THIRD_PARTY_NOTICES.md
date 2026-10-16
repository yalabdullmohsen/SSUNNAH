# Third-Party Notices — Store Release Candidate (سُنّة)

| Field | Value |
|-------|-------|
| Phase | T-047 |
| Scope | **Release Candidate binary flavor only** (after `store:prepare-release-binary`) |
| Status | **`THIRD_PARTY_NOTICES_COMPLETE`** for Store RC boundary |
| Not claimed | `CONTENT_CERTIFIED` · full web corpus clearance |

Companion: `ATTRIBUTIONS.md` · `CREDITS.md` · in-app `/sources` · `STORE_RELEASE_ALLOWLIST.json`.

---

## 1. Bundled in Store RC (must notice)

### OFL fonts (`OFL_APPROVED`)

| Family | Path | License |
|--------|------|---------|
| Almarai | `public/fonts/almarai/**` | SIL Open Font License 1.1 — see `public/fonts/almarai/OFL-Almarai.txt` |
| Aref Ruqaa (ودجت iOS) | `artifacts/majalis/ios/App/PrayerWidget/Fonts/ArefRuqaa-*.ttf` | SIL Open Font License 1.1 (الاسم المحجوز EURM10) — see `OFL-ArefRuqaa.txt`؛ المصدر google/fonts |
| Layla Thuluth (ودجت iOS) | `artifacts/majalis/ios/App/PrayerWidget/Fonts/LaylaThuluth.ttf` | SIL Open Font License 1.1 (محمد عصام؛ الاسم المحجوز Layla*) — نص الرخصة من جدول الاسم nameID 13 داخل الخط في `OFL-LaylaThuluth-name13.txt` + `FONTLOG-Layla.txt`؛ المصدر fontlibrary.org/en/font/layla-thuluth (الحزمة بلا OFL.txt مستقل) |

### CC0 adhan audio (`CC0_APPROVED`)

| Asset | Upstream | License |
|-------|----------|---------|
| `adhan-field.m4a` · `adhan-field-short.m4a` · `adhan-short-field.caf` | Wikimedia `File:Adhan.ogg` | CC0-1.0 |
| `adhan-field-full.m4a` · `adhan-short-field-full.caf` | Wikimedia `File:Beautiful_adhan.ogg` | CC0-1.0 |

Evidence HTML: `docs/audio-rights/evidence/wikimedia-adhan-ogg-2026-09-13.html` · `wikimedia-beautiful-adhan-2026-09-13.html`.

### Product-owned (`APPROVED_FOR_RELEASE` / `PRODUCT_OWNED`)

| Asset class | Note |
|-------------|------|
| Brand / icons / splash / App Store xcassets | Product-authored |
| Poster / live **SVG** illustrations | Product-authored |
| Sheikh **SVG** avatars | Product-authored illustrations (rasters stripped) |
| Prayer calculation engine | App-authored schedule math |
| npm runtime (MIT/Apache/BSD…) | Enforced by `test:licenses` (no pure GPL/AGPL) |

### OS sound (`APPROVED_FOR_RELEASE`)

| id | Note |
|----|------|
| `system-default` | Platform notification sound — **no app media file** (Store v1 primary after Istanbul reject) |

---

## 2. Explicitly not bundled (notices still required)

| Class | Asset | Notice |
|-------|-------|--------|
| `STREAM_ONLY` | everyayah / mp3quran / Quran.com / AlQuran Cloud recitations | Streamed at runtime; **not** in binary · no offline/watch/widget package |
| `STRIP_FROM_RELEASE` | QPC V2 fonts (`artifacts/majalis/public/fonts/qpc-v2/`; وأسماء السور `public/fonts/qpc-surah-names/`) | No written redistribute grant — Strip Path active (`native-strip-qpc-fonts`) |
| `STRIP_FROM_RELEASE` | INTERNAL / UNKNOWN adhan packs | Removed from Archive by `native-strip-store-release-audio` + dist strip |
| `STRIP_FROM_RELEASE` | Sheikh raster photos | UNKNOWN until clearance |
| `METADATA_ONLY` | Lessons / books / fatwa bodies | Metadata + external links only — no full body / offline / widget / watch |
| `CC0_ADHAN_REJECTED_QUALITY` | Istanbul candidate | Human QA reject — **not** in binary |

---

## 3. Completeness machine (Store RC)

```text
THIRD_PARTY_NOTICES_COMPLETE = true   # this file + CREDITS Store RC section + /sources
ATTRIBUTIONS_COMPLETE        = true   # ATTRIBUTIONS.md for RC binary classes
CONTENT_CERTIFIED            = false  # web corpus / OWNER grants remain open
AUDIO_CERTIFIED              = false  # store uses allowlist; not full audio corpus cert
```

### Layla Thuluth — اقتباس حرفي من جدول الاسم داخل الخط
المسار: `artifacts/majalis/ios/App/PrayerWidget/Fonts/LaylaThuluth.ttf` — جدول `name`، الحقل 13 (License Description)، والنص الكامل في `OFL-LaylaThuluth-name13.txt`:

> Copyright (c) <2014,2015,2016,2017>, <Mohammed Isam> (<http://sites.google.com/site/mohammedisam2000 | email: mohammed_isam1984@yahoo.com>), with Reserved Font Name <LaylaArcyArc, LaylaBasicArabic, LaylaBoxer, LaylaDigital, LaylaDiwani, LaylaThuluth, LaylaKoufi, LaylaRuqaa>.
> This Font Software is licensed under the SIL Open Font License, Version 1.1. This license is copied below, and is also available with a FAQ at: http://scripts.sil.org/OFL

الحقل 14 (License Info URL): `http://scripts.sil.org/OFL`. الصفحة التي تدرج الخط تحت OFL: https://fontlibrary.org/en/font/layla-thuluth (الحزمة: `FONTLOG-Layla.txt` بلا ملف OFL.txt مستقل).
