# Route & Component Inventory — Wave 1

Generated from `artifacts/majalis/src/app/router/routes.ts` on 2026-09-27.

## Counts

| Set | Count |
|---|---:|
| Unique path strings in catalog | 407 |
| Static public-ish (no admin, no param) | 287 |
| Admin paths | 36 |

## Priority public destinations (audit focus)

| Route | Purpose (product) | Primary action | Scientific type | Known UX risks |
|---|---|---|---|---|
| `/` | Home hub | Search / continue | mixed | Hero dark, grid, duplicate entries, length |
| `/mushaf` | Mushaf reader | Resume page | QURAN_TEXT | Immersive chrome, flash, digits |
| `/quran-hub` | Quran center | Open Mushaf / resume | mixed | Equal-weight cards, height |
| `/lessons` | Lesson discovery | Open detail | editorial | Large cards, filter height, nav overlap |
| `/prayer-times` | Prayer times | Next prayer | calculation | White flash (mitigated #2306) |
| `/hadith` | Hadith hub | Open collection | HADITH_TEXT | Counts honesty, empty states |
| `/fiqh` | Fiqh hub | Open book | RULING_SUMMARY | Card length, floating overlap |
| `/search` | Global search | Open result | mixed | Invalid destinations (integrity #2303) |
| `/adhkar` | Adhkar | Start set | SOURCE_QUOTATION | Density |
| `/sections` / hubs | Section grid | Enter topic | mixed | Monotone 2-col cards |
| Side drawer | Global IA | Navigate | n/a | Length, duplicates |
| Bottom nav | Primary 5 | Switch tab | n/a | Covers content / safe area |

## Shared components (design system)

| Component | Path | Wave 1 role |
|---|---|---|
| Foundation PR-1 | `sunnah-foundation-tokens.css` | SoT colors/type/space |
| Foundation V2 | `sunnah-foundation-v2.css` | Semantic roles `--sf2-*` |
| Card System | `card-system.css` + `CardSystem.tsx` | Legacy 10 types |
| Card System V2 | `card-system-v2.css` + `CardSystemV2.tsx` | Taxonomy contracts |
| EmptyStateV2 | `EmptyStateV2.tsx` | Empty |
| LoadingStateV2 | `LoadingStateV2.tsx` | Loading skeleton |
| ErrorStateV2 | `ErrorStateV2.tsx` | Error + retry |
| LazyRouteFallback | `LazyRouteFallback.tsx` | Route shell |

## Sample static routes (non-admin)

- `/`
- `/quran-hub`
- `/quran-knowledge`
- `/mushaf`
- `/mushaf/bookmarks`
- `/lessons`
- `/hadith`
- `/fiqh`
- `/library`
- `/tarikh-islami`
- `/adhkar`
- `/prayer-times`
- `/memorize`
- `/hifz-path`
- `/hifz-path/my`
- `/search`
- `/islamic-glossary`
- `/quiz`
- `/competitions`
- `/tazkiya`
- `/tawba`
- `/sins-and-rights`
- `/settings`
- `/about`
- `/about-us`
- `/academic-research`
- `/academic-research/assistant`
- `/academic-research/submit`
- `/account-deletion`
- `/adab-talab-ilm`
- `/adhan-settings`
- `/adhan-help`
- `/akhlaq`
- `/alamat-saah`
- `/amr-bil-maruf`
- `/amrad-qalbiyya`
- `/anbiya`
- `/announcements`
- `/annual-courses`
- `/arabic-language`
- `/arbaeen-nawawi`
- `/arkan`
- `/arkan-iman`
- `/asbab-al-nuzul`
- `/asma-husna`
- `/assistant`
- `/auth/callback`
- `/auth/register`
- `/auth/update-password`
- `/calendar`
- `/car-mode`
- `/cards`
- `/condolences`
- `/contact`
- `/courses`
- `/daily-wird`
- `/dalail-nubuwwah`
- `/delete-account`
- `/discover-islam`
- `/discover-islam/contact`
- `/discover-islam/doubts`
- `/discover-islam/how-to-convert`
- `/discover-islam/new-muslim`
- `/discover-islam/questions`
- `/duas`
- `/duas-quran`
- `/durus-imaniyya`
- `/durus-mutanawwia`
- `/events`
- `/explore`
- `/fadail-aamal`
- `/family`
- `/family-mode`
- `/fatwa`
- `/fatwa-policy`
- `/fatwas`
- `/fawaid`
- `/features-in-progress`
- `/fikr-waqia`
- `/fiqh-council`

… and more in `ROUTE_REGISTRY`.

## Explicit exclusions from Wave 1 code edits

- Quran/Hadith immutable text files
- Prayer calculation algorithms
- Snapshot PNG updates
- Full page redesigns (homepage/lessons/fiqh bodies)
