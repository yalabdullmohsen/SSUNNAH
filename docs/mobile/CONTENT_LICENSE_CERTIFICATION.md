# CONTENT LICENSE CERTIFICATION — سُنّة

| Field | Value |
|-------|-------|
| **Status** | **`LICENSE_CERTIFICATION_REQUIRED`** |
| Audited (UTC) | `2026-10-01T15:20:00Z` |
| Tip | `origin/main` @ `2318e97c` · production MATCH at audit |
| Branch evidence | also on `cursor/mobile-first-expansion-masterplan` |
| Rule | لا نشر / Widget / Watch / Live Activity / Offline Package بمحتوى غير موثّق |
| Hard gate | **ANY `UNKNOWN` = BLOCK** |

## Forbidden claims (current)

```text
CONTENT_CERTIFIED          = false   (not ALL CONTENT AUDITED with clearance)
AUDIO_CERTIFIED            = false   (see ADHAN_AUDIO_AUDIT.md)
THIRD_PARTY_LICENSES_VERIFIED = true (Store RC notices + npm test:licenses; corpus OWNER rows remain)
ATTRIBUTIONS_COMPLETE      = true    (Store RC boundary — T-047; not CONTENT_CERTIFIED)
STORE_SUBMISSION_READY     = false
STORE_GO                   = false
```

## Scoreboard (live)

| Section | Cleared ☐/☑ | Blocking unknowns / OWNER |
|---------|-------------|---------------------------|
| A Quran text | 1/8 partial source doc | Offline·Watch·Widget·LA redistribute |
| B QPC / Madinah | 1/7 (Madinah images absent) | QPC redistribute written OK missing |
| C Recitations | 0/9 per-reader | STREAM_ONLY · ToS unsigned |
| D Adhan | partial (CC0 only) | INTERNAL / MISSING_EVIDENCE |
| E Lessons | 0 | Per-lesson inventory incomplete |
| F Books | 0 | ~173 mixed / source_missing |
| G Permanent Committee | 0 | No licensed integration |
| H Other fatwas | 0 | No licensed corpus |
| I Images | partial product brand | Mixed / uncatalogued |
| J Mind maps | partial (in-app UI owned) | External data unproven |
| K Fonts | OFL UI yes · QPC no | QPC/QUL OWNER |
| L Apple Watch | 0 | No Watch surface licensed |
| M Widgets / LA | prayer times only provisional | Content cards blocked |
| N Notifications | prayer schedule OK · content TBD | Corpus copy license |
| O Offline packages | 0 full package | Quran/QPC/audio offline |
| P Store compliance | PrivacyInfo present · forms TBD | Metadata OWNER |

---

## A. القرآن الكريم

| Checkbox | State | Evidence |
|----------|-------|----------|
| مصدر نص القرآن موثق | ☑ partial | `artifacts/majalis/docs/quran-data-source.md` — Hafs/Uthmani via AlQuran Cloud ← Tanzil |
| ترخيص الاستخدام موثق | ☐ | Tanzil requires explicit redistribute approval — `docs/LICENSES.md` «جزئي / مطلوب للمتجر» |
| ترخيص التوزيع موثق | ☐ | same — no written Tanzil/store grant in `docs/store-release/license-evidence/` |
| يجوز النشر داخل التطبيقات | ☐ | Web display practiced; **store redistribute not certified** |
| يجوز النشر دون اتصال | ☐ | Local `public/data/quran/` exists for integrity; **offline package license not certified** |
| يجوز النشر عبر Apple Watch | ☐ | **No evidence** of Watch redistribute grant |
| يجوز النشر عبر Widgets | ☐ | **No evidence** |
| يجوز النشر عبر Live Activities | ☐ | **No evidence** (numbers-only provisional policy in masterplan) |

| Evidence field | Value |
|----------------|-------|
| اسم المصدر | Tanzil.net (via AlQuran Cloud `quran-uthmani`) |
| الموقع الرسمي | https://tanzil.net/ · https://alquran.cloud/api |
| نوع الترخيص | Tanzil terms — explicit approval required for full redistribute |
| رابط الترخيص | https://tanzil.net/docs/quran_text (+ AlQuran Cloud terms) |
| تاريخ المراجعة | 2026-08-11 (`docs/LICENSES.md`) · reaffirmed 2026-10-01 |

**Section verdict:** `PARTIAL_DOCUMENTED` · **not cleared for Watch/Widget/LA/offline store package**

---

## B. مصحف المدينة / QPC

| Checkbox | State | Evidence |
|----------|-------|----------|
| مصدر الملفات موثق | ☑ | KFGQPC / QUL via quran.com CDN · local `public/fonts/qpc-v2/` · `public/data/quran-v2/` — `docs/LICENSES.md` |
| ترخيص استخدام مصحف المدينة موثق | ☐ | Madinah **page images not in repo** (معطّل عمدًا). QPC layout ≠ Madinah images |
| حقوق إعادة التوزيع موثقة | ☐ | **BLOCKED_LICENSE** until written QUL/KFGQPC — `LICENSE_RISKS.md` · `RELEASE_ASSET_LICENSE_MATRIX.md` |
| حقوق التضمين داخل التطبيق موثقة | ☐ | Web uses fonts; store strip `native:strip-qpc-fonts` — not a grant |
| حقوق التضمين داخل Apple Watch موثقة | ☐ | none |
| حقوق التضمين داخل Widgets موثقة | ☐ | none |
| حقوق التضمين داخل Offline Package موثقة | ☐ | none |

| Evidence field | Value |
|----------------|-------|
| الجهة المالكة | مجمع الملك فهد / QUL |
| نوع الترخيص | KFGQPC/QUL conditions — **unsigned for store redistribute** |
| رابط الاتفاقية | **MISSING** written agreement in repo |
| قيود الاستخدام | No Watch/Widget/offline expand without OWNER written OK (`STORE_LICENSE_DECISIONS.md` LIC-01) |

**Section verdict:** `BLOCKED_LICENSE` for store binary bundling of QPC

---

## C. التلاوات القرآنية

Policy SoT: `docs/LICENSES.md` · `LICENSE_RISKS.md` · remote catalogs · **STREAM_ONLY**

| Reader / source | Usage | Copy | Offline pack | Streaming | Redistribute | Embed in app binary | Class |
|-----------------|-------|------|--------------|-----------|--------------|---------------------|-------|
| everyayah.com (multi) | ☐ | ☐ | ☐ | ☑ stream practiced | ☐ | ☐ | `UNKNOWN` for bundle → **STREAM_ONLY** |
| mp3quran.net (multi) | ☐ | ☐ | ☐ | ☑ stream practiced | ☐ | ☐ | `UNKNOWN` for bundle → **STREAM_ONLY** |
| Per-qari written ToS | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | **UNKNOWN** |

Kill-switch: `quran-audio-remote.json` · no MP3 corpus in app binary (policy).  
Optional user download capped — still **not** `OWNER_PERMISSION` / `LICENSED` for store packaging.

**Section verdict:** **any bundle/`UNKNOWN` reader = BLOCK** · streaming only until ToS signed

---

## D. الأذان

Full table: `docs/mobile/ADHAN_AUDIO_AUDIT.md` (afinfo 2026-10-01).

| Class | Files | Publish? |
|-------|-------|----------|
| `OPEN_LICENSE` (CC0) | field · field-full · short CAF derivatives | Web OK · Store OWNER allowlist still open |
| `INTERNAL_PENDING_OWNER` | makkah/egypt/aqsa/gulf/… | Web UI may show · **not AUDIO_CERTIFIED** |
| `MISSING_EVIDENCE` | haram-full · soft-alert · most non-CC0 CAF | **Exclude store / Watch / Widget** |
| `EXCLUDED` | madinah · qatami | Already removed from public bundle |

| Checkbox family | State |
|-----------------|-------|
| المصدر معروف (all files) | ☐ (only CC0 + registry rows complete) |
| الترخيص معروف (all) | ☐ |
| حقوق التوزيع/تجاري (all) | ☐ |
| جودة + sample rate + bitrate موثقة | ☑ for probed set in ADHAN_AUDIO_AUDIT |

**Section verdict:** `AUDIO_LICENSE_PARTIAL` · **not** `AUDIO_CERTIFIED`

---

## E. الدروس والمحاضرات

| Checkbox | State | Evidence |
|----------|-------|----------|
| Per-lesson speaker/source/owner/permissions | ☐ | No complete per-lesson license matrix in repo |
| Classification OWNED/LICENSED/… | ☐ | Product catalog exists; **rights class not certified** |

**Section verdict:** `OWNER_PERMISSION_REQUIRED` / inventory incomplete · BLOCK native packaging of lesson media

---

## F. الكتب والمتون

| Checkbox | State | Evidence |
|----------|-------|----------|
| IP known per book | ☐ | `docs/LICENSES.md` — ~173 books mixed; many `sources: []` |
| Copyright expired or licensed | ☐ | **غير محسوم** |
| Republish legal | ☐ | |
| Search/index legal | ☐ partial metadata display with publication guards | verified-only UI policy |
| Offline legal | ☐ | |

**Section verdict:** `BLOCKED_SOURCE` for uncertified books · `RELEASE_ASSET_LICENSE_MATRIX.md`

---

## G. اللجنة الدائمة للإفتاء

| Checkbox | State | Evidence |
|----------|-------|----------|
| مصدر البيانات | ☐ | **No licensed API/RSS/DB import** documented as approved |
| حق إعادة النشر / توزيع التطبيقات | ☐ | |
| تحديثات دورية | ☐ | |
| نسبة للمصدر | ☐ | |

Channel: **none certified** (API / RSS / Database / Manual Import all ☐)

**Section verdict:** **DO NOT ADD** until written permission · Fatwa platform stays index-only design

---

## H. فتاوى العلماء الآخرين

| Checkbox | State | Evidence |
|----------|-------|----------|
| Per-source owner/license/republish/store/search/index | ☐ | `/fatwa*` · `/rulings` routes exist; **no licensed corpus certification** |

**Section verdict:** BLOCK ingestion · educational limitation banners ≠ license

---

## I. الصور

| Class | State | Evidence |
|-------|-------|----------|
| Brand / splash / app icons | ☑ product-owned | `STORE_ASSET_MANIFEST.md` VERIFIED |
| Mushaf ornament SVGs | ☑ platform-owned | `docs/LICENSES.md` · `MushafOrnaments.tsx` |
| Third-party photos / sheikh images | ☐ | Not fully catalogued — treat residual as **UNKNOWN** until inventoried |

---

## J. الخرائط الذهنية

| Checkbox | State | Evidence |
|----------|-------|----------|
| In-app UI / code owned by project | ☑ | `/mind-map` · KnowledgeGraph pages (product code) |
| External map datasets permission | ☐ | No external dataset license file |

**Section verdict:** UI owned · **data layers not certified** for redistribution on Watch/Widget

---

## K. الخطوط

| Font | License | Commercial | App embed | watchOS | Android | State |
|------|---------|------------|----------|---------|---------|-------|
| Amiri / Amiri Quran | OFL | ☑ | ☑ | ☐ unproven packaging | ☑ web | `APPROVED_WITH_ATTRIBUTION` |
| Alexandria / UI GF | OFL where applicable | ☑ | ☑ | ☐ | ☑ | `APPROVED_WITH_ATTRIBUTION` |
| QPC V2 WOFF2 | KFGQPC/QUL | ☐ | ☐ store | ☐ | ☐ store | `BLOCKED_LICENSE` |
| QCF_BSML | KFGQPC | — | not shipped | — | — | excluded |

---

## L. Apple Watch

| Checkbox | State | Evidence |
|----------|-------|----------|
| Display / sync / cache / companion use for each asset | ☐ | **No Watch app shipped** · masterplan numbers-only until L cleared |

**Allowed without further corpus license:** prayer **times** computed by app engine (not third-party content).  
**Blocked:** Quran glyphs, QPC, adhkar corpus, lesson audio, fatwa text.

---

## M. Widgets & Live Activities

| Surface | Prayer times / countdown | Ayat / Hadith / Faida cards | Quran session text |
|---------|--------------------------|----------------------------|--------------------|
| Outside app | ☐ pending product | ☐ BLOCK | ☐ BLOCK |
| Lock Screen | ☑ provisional for prayer LA existing | ☐ BLOCK | ☐ BLOCK |
| Widget | ☐ not shipped | ☐ BLOCK | ☐ BLOCK |
| Live Activity | ☑ `PrayerLiveActivity` times only | ☐ BLOCK | ☐ BLOCK |

Evidence: `artifacts/majalis/ios/App/PrayerLiveActivity/`

---

## N. Notifications

| Content | Legal send | Rights OK | Source terms |
|---------|------------|-----------|--------------|
| Prayer schedule / countdown copy (app-authored) | ☑ code paths | ☑ product copy | n/a |
| Adhkar / Hisn-derived snippets | ☐ | ☐ `BLOCKED_LICENSE` Hisn | LIC-06 |
| Lesson / fatwa bodies | ☐ | ☐ | |
| CC0 adhan sound | ☑ if selected | ☑ CC0 | Wikimedia |

---

## O. Offline Packages

| Package | Local | Long-term | Reload | In-app redistribute |
|---------|-------|-----------|--------|---------------------|
| Quran JSON surah files | ☐ cert | ☐ | ☐ | ☐ (Tanzil/store) |
| QPC fonts | ☐ | ☐ | ☐ | ☐ |
| Adhan non-CC0 | ☐ | ☐ | ☐ | ☐ |
| CC0 field packs | ☑ web | ☑ | ☑ | ☑ CC0 |
| Lesson media | ☐ | ☐ | ☐ | ☐ |

---

## P. Store Compliance

### Apple

| Item | State | Evidence |
|------|-------|----------|
| Privacy Policy | ☐ ASC complete | Route `/privacy` PARTIAL — `STORE_METADATA_TECHNICAL_GAP_REPORT.md` |
| Terms of Use | ☐ | |
| Copyright Notices | ☐ partial | `/sources` · CREDITS |
| Attribution | ☐ partial | CREDITS · rights registry |
| Audio Licenses | ☐ | ADHAN_AUDIO_AUDIT |
| Third Party Licenses | ☐ partial | `test:licenses` npm gate |
| PrivacyInfo.xcprivacy | ☑ present | `SIGNING_INVENTORY.md` |

### Google

| Item | State | Evidence |
|------|-------|----------|
| Privacy Policy | ☐ | |
| Copyright Notices | ☐ | |
| SDK Compliance | ☐ | |
| Data Safety Form | ☐ | OWNER Play Console |

---

## Final status machine

| Claim | Condition | Current |
|-------|-----------|---------|
| `LICENSE_CERTIFICATION_REQUIRED` | default until cleared | **ACTIVE** |
| `CONTENT_CERTIFIED` | ALL A–O audited + no UNKNOWN blockers | **false** |
| `AUDIO_CERTIFIED` | ALL audio OPEN/PD/LICENSED/OWNER | **false** |
| `THIRD_PARTY_LICENSES_VERIFIED` | Store RC notices + npm `test:licenses` (corpus OWNER open) | **true** (RC) |
| `ATTRIBUTIONS_COMPLETE` | Store RC ATTRIBUTIONS.md + CREDITS + `/sources` | **true** (RC) |
| `STORE_SUBMISSION_READY` | all four above + MRMP M12 | **false** |

```text
LICENSE_CERTIFICATION_REQUIRED
```

## Owner action queue (blocks certification)

1. Written QUL/KFGQPC grant **or** permanent store strip of QPC (`LIC-01`)  
2. Tanzil / offline Quran redistribute decision  
3. everyayah / mp3quran ToS accept **or** disable remote audio (`LIC-04`)  
4. Hisn edition permission **or** replace corpus (`LIC-06`)  
5. Per-book publisher clearance or keep blocked  
6. Adhan: OWNER allowlist CC0 + strip/`INTERNAL` resolution (`ADHAN_AUDIO_AUDIT.md`)  
7. ASC/Play privacy·terms·Data Safety completion  

## Related files

- `docs/LICENSES.md` · `LICENSE_RISKS.md` · `CREDITS.md`  
- `docs/legal/RELEASE_ASSET_LICENSE_MATRIX.md`  
- `docs/store-release/STORE_ASSET_MANIFEST.md` · `STORE_LICENSE_DECISIONS.md`  
- `docs/mobile/ADHAN_AUDIO_AUDIT.md`  
- `docs/mobile/SUNNAH_MOBILE_FIRST_EXPANSION_MASTERPLAN.md`  
- `artifacts/majalis/src/lib/prayer-audio-rights-registry.ts`  
- `artifacts/majalis/docs/quran-data-source.md`  
