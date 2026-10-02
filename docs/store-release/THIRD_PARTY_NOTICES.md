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
| Amiri · Aref Ruqaa · Noto Naskh Arabic · Scheherazade New | `public/fonts/ui/**` | SIL Open Font License 1.1 — see `public/fonts/ui/OFL.txt` |

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
| `STRIP_FROM_RELEASE` | QPC V2 fonts | No written redistribute grant — Strip Path active (`native-strip-qpc-fonts`) |
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
