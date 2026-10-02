# Attributions — Store Release Candidate (سُنّة)

| Field | Value |
|-------|-------|
| Phase | T-047 |
| Status | **`ATTRIBUTIONS_COMPLETE`** for Store RC binary boundary |
| SoT | `STORE_RELEASE_ALLOWLIST.json` · `THIRD_PARTY_NOTICES.md` · `CREDITS.md` · `/sources` |

This file attributes **every class that may appear in or affect** the Store Release Candidate. It does **not** claim `CONTENT_CERTIFIED` for the full web corpus.

---

## A. Assets kept in Release Binary

| Asset | Attribution | License class |
|-------|-------------|----------------|
| Amiri / Aref Ruqaa / Noto Naskh / Scheherazade | Copyright of respective OFL authors — `public/fonts/ui/OFL.txt` | `OFL_APPROVED` |
| Field adhan (short/full) | Wikimedia Commons CC0 uploads (Adhan.ogg · Beautiful_adhan.ogg) | `CC0_APPROVED` |
| Product brand, icons, splash, SVG posters/live, SVG sheikh avatars | سُنّة product | `PRODUCT_OWNED` / `APPROVED_FOR_RELEASE` |
| `system-default` alert | Apple / OS notification sound | `APPROVED_FOR_RELEASE` |
| npm packages | Per-package LICENSE in node_modules; CI `test:licenses` | `APPROVED_FOR_RELEASE` |

## B. Stream-only (runtime; not packaged)

| Source | Attribution | Class |
|--------|-------------|-------|
| everyayah.com | Stream endpoints; no redistributed files | `STREAM_ONLY` |
| mp3quran.net | Stream / optional user download — not Store offline package | `STREAM_ONLY` |
| Quran.com / AlQuran Cloud APIs | Live fetch; ToS of providers | `STREAM_ONLY` |

## C. Stripped / blocked from Release Binary (documented)

| Asset | Attribution / owner | Class / action |
|-------|---------------------|----------------|
| QPC V2 fonts | KFGQPC / QUL — no written App Store grant | `OWNER_DECISION_REQUIRED` → `STRIP_FROM_RELEASE` |
| INTERNAL adhan (makkah/egypt/aqsa/gulf/takbeerat…) | Internal pending OWNER | `STRIP_FROM_RELEASE` |
| UNKNOWN adhan (haram-full, soft-alert, non-CC0 CAF) | Missing evidence | `STRIP_FROM_RELEASE` |
| Istanbul CC0 candidate | Wikimedia Istanbul — **rejected quality** T-027 | not in binary |
| Sheikh rasters | Unknown provenance | `STRIP_FROM_RELEASE` |
| Lessons / books / fatwa full bodies | Publishers — metadata/link only | `METADATA_ONLY` |
| Hisn full-body offline | LIC-06 OWNER | `STRIP_FROM_RELEASE` |
| Quran offline redistribute package | Tanzil approval missing | no store offline package claim |

## D. In-app surfaces

| Surface | Role |
|---------|------|
| `/sources` (`SourcesLicensesPage`) | User-facing source & license status |
| `/privacy` · `/terms` | Legal |
| `CREDITS.md` | Repo-level credits |

---

**Exit:** `ATTRIBUTIONS_COMPLETE` = true for Store RC (T-047).  
**Still false:** `CONTENT_CERTIFIED` · `AUDIO_CERTIFIED` · `STORE_GO`.
