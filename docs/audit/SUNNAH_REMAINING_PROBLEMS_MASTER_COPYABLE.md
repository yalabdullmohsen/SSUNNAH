# سُنّة — تقرير المشاكل المتبقية الكامل (نسخة قابلة للنسخ / إصلاح جذري)

| Field | Value |
|---|---|
| Captured | 2026-10-02T20:40Z (Phase 0 truth sync · tip live) |
| `origin/main` | `0c4e808f8` |
| Production `https://www.ssunnah.com/version.json` | `0c4e808f` **MATCH** · builtAt=2026-10-02T20:25:53.522Z |
| Repo defects Accepted Truth | P0=0 · P1=0 · P2=0 · P3=0 (#2477) |
| Product root | `artifacts/majalis` · React 19 · Vite 7 · Tailwind 4 · Wouter · Capacitor 8 · RTL-first |
| Status claim allowed | VISUAL_INTERACTION_COMPLETE_WEB · WEB_RELEASED_NATIVE_HOLD · PROJECT_CLOSURE_PARTIAL · UNIFIED_PARTIAL |
| Status NOT claimed | STORE GO · UNIFIED_100 · WCAG CERTIFIED · FULLY COMPLETE · ZERO_INTERNAL_DEBT · mushaf silky · DEVICE_TESTED · IOS_RELEASE_CANDIDATE_READY · IOS_AUTH_CERTIFIED |

**قاعدة صادقة:** عيوب المستودع المؤكدة من قائمة Accepted Truth مغلقة؛ دين التوحيد/الإقلاع/الجهاز/الترخيص/المتجر ما زال مفتوحًا.  
**برنامج نشط:** `SUNNAH_FINAL_PRODUCT_UNIFICATION_AND_STORE_CLOSURE`  
**تصنيفات:** `FIXABLE_IN_REPOSITORY` · `DEVICE_REQUIRED` · `OWNER_ACTION` · `BLOCKED` · `KEEP_JUSTIFIED` · `MUSHAF_SPECIAL` · `ADMIN_ONLY` · `CLOSED`.

**ممنوعات عامة عند الإصلاح:** لا عائلة توكن/نظام أزرار/بطاقات جديد · لا رفع debt ceilings · لا تعطيل visual-snapshot / must-not-skip · لا مسّ نص قرآن/تشكيل/ترقيم/page mapping/604/15 سطر · لا تغيير حساب مواقيت/جدولة أذان · لا ترقيع `overflow:hidden`/`!important` لإخفاء عيب · لا إرجاع مسار مكسور للرئيسية · لا force-push / reset --hard / git clean -fd · لا ادعاء UNIFIED_100 / STORE_GO بلا أدلة.

---

## 0) ماذا أُغلق فعلًا (لا تُعد فتحه بلا regression)

| موجة | PR / tip | أُغلق |
|---|---|---|
| WAVE1 cascade | `2ffa6798` era | deferred 58→53 · توحيد hex جزئي · brand-on-surface nav |
| WAVE2 legacy pages | #2375/#2376 | حذف `home/lessons/misc-page-legacy.css` · فصل sheikh chrome |
| WAVE3 buttons | #2377/#2378 | −136 raw buttons عامة · ceilings 192/774 · floor Button 176 |
| WAVE4 feedback | #2379/#2380 | NoResults/Stale/Permission/RateLimited · مسارات عامة أولوية |
| WAVE5 startup/FOUC | #2381 → `40548c89` | Critical gzip 60125→**57171** · هامش 1315→**4269** · بوابة ازدواج CSS · دين بصري↓ |
| ChunkRecoveryToast | سابق | `return null` · لا Toast تقني |
| Prayer countdown tick | PR8 | عزل نص العدّاد · لا full-tree كل ثانية |
| Prayer theme leak | سابق | `route-surface` commit فقط |

---

## A) مقاييس حيّة (لا تخمين) — بعد WAVE5 على main=`40548c89`

### Interaction
| Metric | Live | Debt rule |
|---|---:|---|
| tsxFiles | **829** | — |
| rawButtonFiles | **192** | ceiling ≤192 |
| rawButtonElements | **774** | ceiling ≤774 |
| officialButtonImportFiles | **176** | floor ≥176 |
| actionButtonConsumerFiles | **7** | floor ≥7 |
| divSpanOnClick | **59** | ceiling ≤59 |
| formButtonsMissingType | **0** | ≤0 |
| floatingControlFileMentions | **10** | ≤10 |
| buttonRelatedImportantApprox | 1262 | ≤1262 |
| buttonRelatedHexApprox | 1728 | ≤1728 |

### Visual / CSS
| Metric | Live | Debt rule |
|---|---:|---|
| cssFiles | **356** | ≤356 |
| ruleBlocksApprox | ~20637 | — |
| `!important` | **4787** | ≤4787 |
| hexInCss | **8988** | ≤8988 |
| rgbHslInCss | **2129** | ≤2129 |
| mjTokenRefs | 9879 | — |
| sfTokenRefs | **688** | floor ≥688 |
| ssTokenRefs | **722** | floor ≥722 |
| mjDeclarations | 193 | ≤193 |
| mjDeclOutsideAllowlist | **0** | ≤0 |
| boxShadowDecls | **1113** | ≤1113 |
| zIndexRawDecls | **265** | ≤265 |
| borderRadiusPxDecls | **1303** | ≤1303 |
| inlineColorStyleMatches | **87** | ≤87 |
| mainSyncCssImports | **22** | طبقات هوية متزامنة |
| mainDeferredCssImports | **53** | call sites |
| critical CSS gzip | **57171** ≤61440 | هامش **4269** (كان 1315) |

### Forms / Pages / Routes
| Metric | Live |
|---|---:|
| public native `<select>` | ~12 (KEEP جزئيًا — مصحف/صلاة/قوائم طويلة) |
| UtilityScreen KEEP | 3 (Settings · NotificationSettings · AdhanSettings) |
| routes in ROUTE_QUALITY_MATRIX | **415** |
| WAVE4 tested routes | **15** فقط (غالب الـ400 بلا wave4TestedAt) |
| ACTIVE_LEGACY page CSS (`*-legacy.css`) | **0** (WAVE2) |

---

## B) الألوان · Light · Dark · System · الهوية البصرية

### ما أُغلق
- Foundation `--sf-*` / `--sf2-*` + Theme API `--ss-*` + `theme-aliases` → `--mj-*`
- Dark token absorb: `mjDeclOutsideAllowlist = 0`
- Theme boot قبل React: `mj-theme-boot` + مفتاح `majalis-theme` مشترك مع Provider
- WAVE5: توسيع هامش Critical · بوابة منع عودة محددات ميتة · allowlist لـ cascade reimport

### طبقات CSS الحرجة المتزامنة في `main.tsx` (22) — مصدر تنافس الهوية
1. `styles/fonts-ui.css`
2. `app/styles/theme.css` — CANONICAL `--mj-*`
3. `styles/sunnah-foundation-tokens.css` — CANONICAL `--sf-*`
4. `styles/sunnah-foundation-v2.css` — CANONICAL `--sf2-*`
5. `styles/ssunnah-theme-api.css` — CANONICAL `--ss-*`
6. `styles/brand-v4.css` — ACTIVE_COMPATIBILITY
7. `styles/tokens.css` — ACTIVE_COMPATIBILITY
8. `styles/design-tokens.css` — ACTIVE_COMPATIBILITY
9. `styles/visual-redesign-v2-tokens.css` — ACTIVE_COMPATIBILITY
10. `styles/sunnah-identity-reset.css`
11. `styles/breakpoints.css`
12. `styles/typography-scale.css`
13. `styles/typography-app.css`
14. `index.css` (~114 KiB بعد WAVE5 trim · كان ~137 KiB) — خليط قديم/حديث
15. `styles/theme-aliases.css` — CANONICAL bridge
16. `styles/semantic-layer-tokens.css`
17. `styles/visual-layer-contrast-fix.css`
18. `styles/visual-identity-unify.css` — sync + **ALLOWED_CASCADE_REIMPORT بعد final-release**
19. `styles/sections-calm-polish.css`
20. `styles/ssunnah-ux-polish.css`
21. `styles/interaction-states.css` — sync + مسار مؤجّل مسموح
22. `styles/dark-mode-recovery.css` — sync + **ALLOWED_CASCADE_REIMPORT بعد final-release**

### مشاكل متبقية (ألوان/هوية)
| ID | المشكلة | أثر | FIXABLE؟ |
|---|---|---|---|
| C1 | طبقات هوية متزامنة كثيرة تتنافس | صعوبة معرفة «من يفوز» · ثقل · انحراف بصري | FIXABLE تدريجي — امتصاص |
| C2 | `final-release.css` يفرض reload لـ unify+recovery | وميض هوية محتمل بعد idle | FIXABLE بعد إثبات parity ثم حذف reload |
| C3 | hex≈8988 · `!important`≈4787 | دين بصري هائل | FIXABLE تدريجي بلا رفع سقف |
| C4 | inline colors≈87 في JSX | تجاوز التوكن · كسر Dark | FIXABLE |
| C5 | rgb/hsl≈2129 | ألوان غير موحّدة | FIXABLE |
| C6 | box-shadow 1113 · z-index خام 265 · radius px 1303 | انحراف Foundation · بطاقات/أزرار غير متسقة | FIXABLE |
| C7 | Theme flash إقلاع داكن على جهاز | وميض لحظة | PARTIAL بالكود · DEVICE للصفر |
| C8 | System theme بلا مصفوفة جهاز | UNKNOWN سلس | DEVICE_REQUIRED |
| C9 | وثائق حالة قديمة قد تذكر SHA قبل WAVE5 | تضليل | FIXABLE docs |
| C10 | طبقات dark مؤجّلة كبيرة: premium-dark / surfaces / design-system | تباين ليلي غير متجانس على بطاقات قديمة | FIXABLE بحذر COMPATIBILITY |
| C11 | `index.css` ما زال خليطًا كبيرًا | قواعد قديمة تختلط | FIXABLE موجي |
| C12 | semantic/contrast/polish فوق Foundation | طبقات تصحيح فوق طبقات | FIXABLE — امتصاص ثم حذف |

### أعراض Light / Dark / System
| عرض | تصنيف | إصلاح |
|---|---|---|
| وميض ثيم cold start داكن | PARTIAL | أبقِ recovery مبكرًا · امتصّ surfaces · لا تؤجّل ما يلوّن أول شاشة |
| FOUC هوية صفحة قبل CSS المسار | مخفَّف بعد WAVE5 (هامش أوضح) · ليس صفر جهاز | أكمل عزل CSS المسار · DEVICE |
| بطاقة/قسم «من تطبيق آخر» ليليًا | ACTIVE_COMPATIBILITY | رحّل لـ Card Authority + tokens |
| System preference | يعمل عبر preference | قياس جهاز NOT_MEASURED |
| Active tab brand-on-surface | أُصلح WAVE1 | راقب الرجوع في m2030 nav |

### قواعد إصلاح ألوان
- لا توكن family جديدة · لا hex/rgb/hsl/`!important`/inline **جديد**
- لا تخفيض تباين · لا رفع debt ceilings
- Light + Dark + System + RTL + refresh + cold start لكل تغيير هوية
- Contrast CI + On-brand contrast يبقيان PASS

---

## C) البطاقات والأسطح

| بند | حالة |
|---|---|
| soft-cards.css | **REMOVED** |
| سلطة البطاقة | AppCard / `cs-card` / `ss-app-card` / Card System v2 الموجود |
| متبقي | ظلال 1113 · radius px 1303 · قواعد مبعثرة في unify/polish/final-release/index |
| خطر | إنشاء Card System / «بطاقات v3» — **ممنوع** |

**إصلاح جذري:** امتصاص القواعد الحية → Card Authority + Foundation فقط → consumers القديمة=0 → حذف التكرار من polish/unify/final-release → خفض ceilings بعد القياس.

---

## D) الأزرار والتفاعل الدلالي

### سقف عند الحد
أي زيادة في rawButtonFiles / rawButtonElements / divSpanOnClick تفشل بوابة الدين.

### أعلى ملفات `<button>` خام (حي بعد WAVE3)
| n | ملف | تصنيف |
|---:|---|---|
| 29 | `views/admin/learning-paths/LearningPathTreeEditor.tsx` | ADMIN_ONLY |
| 25 | `features/mushaf-reader/MushafControlsLayer.tsx` | MUSHAF_SPECIAL |
| 24 | `views/admin/CategoriesSection.tsx` | ADMIN_ONLY |
| 21 | `features/mushaf-madinah/AyahActionSheet.tsx` | MUSHAF_SPECIAL / legacy path — صنّف |
| 16 | `features/mushaf-madinah/MushafAudioDock.tsx` | MUSHAF_SPECIAL / legacy |
| 14 | `components/QuranViewer.tsx` | عام/قديم — صنّف قبل المس |
| 13 | `views/admin/SmartCmsSection.tsx` | ADMIN_ONLY |
| 12 | QuranMemorizationView · QuranMiniPlayerBar | عام |
| 11 | MushafSearchSheet | MUSHAF |
| 10 | UniversitiesAdmin · MushafControls | مختلط |
| 8–7 | SurahIndex · MushafBookmarks · admin sections · … | مختلط |

> ملاحظة: IslamicQuizGame / Vault / MyCitations انخفضت في WAVE3 — لا تفترض الأرقام القديمة 22/18/13.

### أعلى `div`/`span` onClick (إجمالي 59)
AsmaaHusna · FiqhQawaid · QuranViewer (3) · Vault · ProphetStories · Calendar · HadithBooks · GlobalSearchModal · HomeCustomizeSheet · admin imports…

### تصنيف قبل كل إصلاح
USE_BUTTON · USE_ICON_BUTTON · USE_LINK · USE_TOGGLE · USE_MENU_TRIGGER · USE_INTERACTIVE_CARD · EVENT_DELEGATION · DRAG_HANDLE · THIRD_PARTY_WRAPPER · NATIVE_JUSTIFIED · FALSE_POSITIVE · BLOCKED · MUSHAF_SPECIAL · ADMIN_ONLY

### ممنوعات أزرار
- لا Link↔Button
- لا div/span قابل للنقر إن وُجد عنصر دلالي
- السلطة فقط: `components/ui/button.tsx` + IconButton + ActionButton
- اخفض ceiling فقط بعد قياس inventory حي

---

## E) النماذج · Feedback · الحالات

| بند | حالة | إصلاح |
|---|---|---|
| PR5 Selects / Login / Search / alertdialog | مدمج | لا تُعد `window.confirm` |
| Feedback V2 / WAVE4 | **15 مسارًا** مُختبرة · ~400 بلا تغطية WAVE4 | أكمل العامة ثم الثانوية |
| Loading/Empty/Error/Offline على العامة | غالب COMPLETE/PARTIAL على الأولوية | املأ PARTIAL (offline/stale/system/light/desktop) |
| NoResults/Stale/Permission/RateLimited | سلطة WAVE4 موجودة | وسّع الاستهلاك |
| UtilityScreen KEEP=3 | مبرَّر | لا تُلغَ بلا بديل |
| public native select≈12 | KEEP_JUSTIFIED جزئيًا | لا تهجّر بلا مبرر |

مرجع: `docs/audit/ROUTE_QUALITY_MATRIX.json` · `SUNNAH_WAVE4_ROUTE_FEEDBACK_CLOSURE_REPORT.md`

### عيّنة حالة Feedback (WAVE4)
| Route | نقاط ضعف متبقية |
|---|---|
| `/` | offline PARTIAL · stale PARTIAL |
| `/search` | system/desktop ناقصان في المصفوفة |
| `/lessons` `/hadith` `/fiqh` | offline PARTIAL · light/system/desktop ناقص |
| `/quran-hub` | empty/error/offline/noResults PARTIAL |
| `/settings` | error PARTIAL · offline PARTIAL |
| `/mushaf` `/prayer-times` | offline PARTIAL · light/system/desktop ناقص في الحقول |
| بقية 400 مسار | بلا `wave4TestedAt` — دين كبير |

---

## F) CSS · صفحات · خريطة ملفات التطبيق

### ACTIVE_LEGACY page CSS
| ملف | حالة |
|---|---|
| home-legacy / lessons-legacy / misc-page-legacy | **GONE** (WAVE2) |
| soft-cards.css | **GONE** |
| search-legacy / section-hub | REMOVED سابقًا |

### ACTIVE_COMPATIBILITY كبيرة (لا حذف جماعي)
- `design-system.css` · `final-release.css` · `brand-v4*` · `m2030/*`
- `premium-dark-refine` · `dark-mode-surfaces` · `dark-design-system`
- أجزاء كبيرة من `index.css` · unify · polish · recovery

### BLOCKED من التقاعد العشوائي
- CSS المصحف / خطوط القرآن / QPC
- CSS الصلاة / الأذان
- Admin CSS الضخم
- أي ملف يمس page mapping أو ayah positions

### شرط SAFE_REMOVE
consumer=0 · لا dynamic class · لا اختبار يفرض القديم · visual-snapshot + contrast + route tests + build + smoke PASS

### خريطة التطبيق — أين تصلح ماذا
| مسار | دور / دين |
|---|---|
| `src/main.tsx` | إقلاع + CSS cascade (22 sync + 53 deferred) |
| `src/App.tsx` | توجيه / أسطح / chrome |
| `src/lib/route-surface.ts` | مالك سطح المسار · prefetch بلا theme |
| `src/pages/**` | صفحات مجال |
| `src/views/**` | صفحات مسطّحة — مصدر raw buttons (خصوصًا admin) |
| `src/components/**` | مشتركة · Quiz · QuranViewer · UI |
| `src/components/ui/button.tsx` | Button Authority |
| `src/features/mushaf-reader/**` | مصحف الإنتاج `/mushaf` |
| `src/features/mushaf-madinah/**` | legacy محتمل — صنّف قبل المس |
| `src/styles/**` + `index.css` | أكبر دين CSS |
| `src/admin-v3/**` | Admin (~17 tsx) — موجة منفصلة |
| `public/fonts/qpc-v2` | 604 خطوط مصحف WOFF2 |
| `public/data/quran-v2` | بيانات صفحات QPC |
| `docs/audit/*` · `docs/mushaf/*` · `docs/performance/*` | جرد/تشخيص |
| Native iOS/Android / Expo / Flutter | خارج مسار الإنتاج الويب ما لم يُفتح صراحة |

---

## G) القفزات عند الدخول · الوميض · FOUC · CLS · التعليق

| عرض | السبب | حالة | إصلاح |
|---|---|---|---|
| FOUC عند الفتح | critical + هوية صفحة مؤجّلة | مخفَّف WAVE5 (هامش 4269) | أكمل عزل CSS المسار · DEVICE إثبات صفر |
| وميض ثيم | recovery/surfaces + reload-to-win | PARTIAL | امتصاص cascade · احذف reload بعد parity |
| قفزة تخطيط تنقّل | أحجام غير محجوزة · كروم · خطوط | PARTIAL (بوابات home/prayer) | حجز ارتفاع · قياس جهاز |
| قفزة شريط أسفل أثناء قلب مصحف | تجميد bottom stack | مقصود | لا تكسر بلا بديل |
| Toast تحديث تقني | ChunkRecoveryToast=null | CLOSED | لا تُعد |
| تعليق إقلاع / شاشة بيضاء نادرة | SW قديم · chunk | DEVICE + quiet recovery | مصفوفة جهاز |
| CLS رقمي جهاز | NOT_MEASURED | DEVICE_REQUIRED | LHCI/Playwright جهاز |
| صلاة كل ثانية | عُزل countdown | CLOSED | — |
| تسرّب ثيم صلاة | route-surface | CLOSED | — |
| LHCI TBT على main | فشل عابر 2225>2100 ثم rerun SUCCESS | Class C مرّ | راقب flaky · لا ترفع عتبة |

مراجع: `STARTUP_AND_DARK_MODE_ROOT_CAUSE.md` · `ZERO_FLICKER_LAYOUT_SHIFT_ROOT_CAUSE_PR0.md` · `WAVE5_*` · `SUNNAH_WAVE5_STARTUP_FOUC_CLS_CLOSURE_REPORT.md`

---

## H) المصحف — تشخيص كامل للثقل وعسر التقليب (WAVE6 التالي)

التقرير المطوّل: `docs/mushaf/MUSHAF_HEAVINESS_AND_PAGE_TURN_REPORT.md`

### حقيقة المسار الإنتاجي
```
/mushaf → MushafReaderPage (lazy)
       → NewMushafReader (~1800+ سطر)
           ├─ MushafPager          ← translate3d لثلاث لوحات
           │   └─ MushafPage × ≤3  ← صفوف QPC + كلمات + علامات آيات
           ├─ MushafPageArrows / Scrubber / Controls
           ├─ Audio dock + Tafsir/Search sheets (lazy)
           └─ Selection overlay + bookmarks
```

### لماذا ثقيل؟
1. ليس صورًا — كل كلمة `<span class="nm-word">` × **3 لوحات**.
2. **604 خطوط WOFF2** (`p1`…`p604`) متوسط ~**158 KiB**/خط.
3. اشتراك كل كلمة في selected/playing/search → إعادة تقييم مع التلاوة.
4. NewMushafReader جذر ضخم + لقطات صوت.
5. Selection overlay: `getClientRects()`.
6. CSS/ظلال/`color-mix` على مسار القراءة.

### لماذا التقليب عسير؟
1. قفل pager: `SETTLE_MS=220` + `locking`.
2. قفل reader حتى `fontReady && layoutMatchesPage && displayView` (سقف ~2800ms).
3. `go()` ينتظر `ensureQpcPageFont`.
4. slop نص **14px** · مناطق ignore واسعة.
5. الالتزام بعد `transitionend` ثم React يعيد تدوير الجار.
6. تجميد bottom stack أثناء القلب.

### مسار زمني لتقليبة
```
pointerdown → (قد يُرفض إن locking)
pointermove → بعد slop: translate3d (rAF)
pointerup → transition 220ms + locking
transitionend → go(page)
beginPageTurn → قفل منتج + تجميد أسفل
ensureQpcPageFont + load layout
React يعيد الجار
fontReady && layoutMatches && displayView → finishPageTurn
```

### تصنيف أسباب المصحف
| ID | السبب | شدة | قابلية |
|---|---|---|---|
| H1 | DOM كلمات × 3 | عالية | جزئي |
| H2 | خط لكل صفحة + fontReady | عالية جدًا | عالي بحذر |
| H3 | قفل مزدوج | عالية | عالي |
| H4 | اشتراكات لكل كلمة | متوسطة–عالية مع الصوت | عالي |
| H5 | جذر القارئ + audio | متوسطة | متوسط |
| H6 | getClientRects | متوسطة | متوسط |
| H7 | تحكيم إيماءة/slop | متوسطة («عسر») | متوسط |
| H8 | طلاء CSS/ظلال | منخفضة–متوسطة | متوسط |
| H9 | شبكة/SW miss | متغيرة | متوسط + DEVICE |

### ما ليس السبب
- رسم 604 صفحة معًا (النوافذ **3** فقط)
- غياب translate3d
- كسر RTL كامل كعقد سحب (متسق داخليًا)

### ممنوعات مصحف
لا تغيّر: نص · تشكيل · ترقيم · 604 · 15 سطر · page mapping · ayah positions · QPC fonts SoT · حساب مواقيت

### اتجاه WAVE6 (سلاسة فقط)
1. فصل القفل البصري عن قفل المنتج  
2. Prefetch خطوط ±2 على idle  
3. رفع اشتراكات الآية فوق مستوى الكلمة  
4. تأجيل رسم الجار غير المرئي  
5. عزل audio snapshots عن صفحة الكلمات  
6. تخفيف slop/ignore بعد قياس  
7. قياس جهاز: `mushaf-turn-telemetry=1` / `mushaf-experience-perf=1`  
   touch→translate · pointerup→transitionend · transitionend→finish · dropped frames · ×25/100 · مع/بدون تلاوة

**الحالة:** `MUSHAF_HEAVY_BY_ARCHITECTURE` · `PAGE_TURN_GATED_BY_FONT_AND_LOCK` · لا يُعلن «مصحف سلس بالكامل».

---

## I) الصلاة · الأذان · الملاحة

| بند | حالة |
|---|---|
| تسرّب ثيم الصلاة | CLOSED |
| عزل tick العدّاد | CLOSED |
| حساب المواقيت / جدولة الأذان | **لا تُغيَّر** في موجات UI |
| Prefetch صلاة | أصول فقط · لا theme |
| ودجت أصلي / native | OWNER / native |
| AdhanSettings UtilityScreen | KEEP_JUSTIFIED |
| `/admin/v3` على الإنتاج | HTTP 404 HTML قصير (~336B) — تحقق عقد النشر/الحماية؛ ليس مسار مستخدم عام |

---

## J) الأداء · Critical CSS · Bundle · LHCI

| بند | حالة | إصلاح |
|---|---|---|
| Critical gzip 57171/61440 | هامش 4269 | حافظ الهامش · لا ترفع الميزانية · لا تغيّر gzip L9 |
| reload-to-win unify/recovery | ما زال مطلوبًا بعقد | احذف بعد parity مع final-release |
| Entry JS | كبير (~122 KiB gz أكبر chunk) | لا ترفع budgets · قس قبل أي زيادة |
| LHCI home | مطلوب · flaky TBT مرّ على main ثم SUCCESS | راقب · لا ترفع عتبة |
| Contrast / On-brand / visual-snapshot | مطلوبة | لا تخفف |
| Prefetch | موجود | قياس جهاز ناقص |
| Service Worker stale | خطر نادر | DEVICE + quiet موجود |

---

## K) إمكانية الوصول

| بند | حالة |
|---|---|
| بوابات focus/أسماء | تُحفظ |
| VoiceOver / TalkBack / WCAG Certified | **غير مُدَّعى** · DEVICE_REQUIRED |
| Color contrast CI | PASS مطلوب |
| On-brand contrast | PASS مطلوب |
| RTL-first + أرقام عربية في المصحف/القراءة | لا تُكسر |

---

## L) خارج الإصلاح بالكود فقط (EXTERNAL)

| Class | أمثلة |
|---|---|
| OWNER_ACTION | حسابات App Store/Play · شهادات توقيع · أسرار إنتاج |
| DEVICE_REQUIRED | مصفوفة أجهزة · CLS فيزيائي · SW قديم · TestFlight · FPS مصحف · System theme سلس · cold/warm FCP/LCP |
| BLOCKED_CREDENTIAL / LICENSE | مواد توقيع / قيود مصدر |
| Native widgets / Expo / Flutter | خارج برنامج الإغلاق الويب |
| SQL/RLS إنتاج | ممنوع من وكيل الإغلاق |

---

## M) طابور إصلاح جذري موصى به (بالترتيب)

1. WAVE1 ✅  
2. WAVE2 Legacy CSS ✅  
3. WAVE3 Buttons عامة ✅  
4. WAVE4 Feedback أولوية ✅  
5. WAVE5 Critical/FOUC ✅ (`40548c89` MATCH)  
6. **WAVE6 Mushaf fluidity** ← **التالي** (بعد استقرار WAVE5 فقط)  
7. امتصاص هوية متبقٍ: brand-v4/tokens/redesign/unify/polish → Foundation · احذف reload-to-win بعد parity  
8. Buttons: Admin + Mushaf_SPECIAL بحذر · ثم خفض ceilings  
9. Route Feedback: أكمل PARTIAL على الـ15 ثم وسّع العامة من 415  
10. ظلال/radius/hex/`!important`/inline colors — موجات امتصاص  
11. Docs sync: CURRENT_PROJECT_STATUS → `40548c89`  
12. ختم نهائي: داخلي مغلق / خارجي فقط متبقي  

**قاعدة حديدية:** لا موجة جديدة قبل دمج+نشر+استقرار السابقة · لا رفع ceilings · لا تعطيل visual-snapshot · PR واحد لكل موجة من أحدث main.

---

## N) قائمة تحقق «إصلاح جذري كامل» — تعريف الإنجاز الصادق

- [x] WAVE2–WAVE5 مدمجة ومنشورة وMATCH
- [x] critical gzip بهامش أوضح (≥4269 الآن)
- [x] ACTIVE_LEGACY page CSS = 0
- [x] mjDeclOutsideAllowlist = 0
- [ ] rawButtonFiles/Elements↓ إضافية (Admin/Mushaf) + ceilings↓
- [ ] divSpanOnClick↓ أو مبرَّر بندًا بندًا
- [ ] hex / `!important` في انخفاض مستمر
- [ ] لا وميض هوية بعد إزالة reload-to-win (مع قياس)
- [ ] Feedback COMPLETE على المسارات العامة ذات الأولوية (ليس 15 فقط)
- [ ] مصحف: touch→move و commit latency مقيسان ومقبولان على جهاز
- [ ] mushaf-gates + contrast + visual-snapshot + Verify build + LHCI خضراء مستقرة
- [ ] production version.json = main (حاليًا نعم)
- [ ] المتبقي الموثّق = EXTERNAL فقط
- [ ] لا ادّعاء STORE GO / WCAG CERTIFIED بلا أدلة

---

## O) ملخص سريع للمصلّح (ماذا تصلح أولًا الآن؟)

| الأولوية | المجال | أكبر ألم | مدخل البداية |
|---:|---|---|---|
| 1 | **مصحف سلاسة (WAVE6)** | DOM×3 + 604 خطوط + قفل مزدوج | NewMushafReader · useMushafPager · useQpcPageFont |
| 2 | هوية/ألوان cascade | 22 sync + reload-to-win + hex 8988 + !important 4787 | `main.tsx` · final-release ↔ unify/recovery |
| 3 | أزرار خام متبقية | 192/774 عند السقف — أغلبها Admin/Mushaf | MushafControlsLayer · Admin editors · QuranViewer |
| 4 | Route Feedback | 400/415 بلا WAVE4 test · PARTIAL على العامة | ROUTE_QUALITY_MATRIX |
| 5 | بطاقات/ظلال/radius | 1113 shadow · 1303 radius | Card Authority absorb |
| 6 | Dark deferred layers | surfaces/premium/design-system | امتصاص بحذر |
| 7 | inline colors 87 | JSX | رحّل لتوكن |
| 8 | DEVICE matrix | FOUC/CLS/System/FPS مصحف | أجهزة حقيقية |
| 9 | docs tip | SHA قديم في بعض التقارير | CURRENT_PROJECT_STATUS |

---

## P) القرار الحالي

| الحكم | القيمة |
|---|---|
| هل انتهى المشروع؟ | **لا** |
| هل انتهت WAVE1–WAVE5؟ | **نعم (ويب منشور · MATCH `40548c89`)** |
| هل الدين الداخلي صفر؟ | **لا** |
| أكبر دين FIXABLE التالي | سلاسة المصحف · cascade/hex/!important · أزرار Admin/Mushaf · route feedback · ظلال/radius · Dark bridges |
| أكبر دين EXTERNAL | جهاز · متاجر · توقيع · native |
| FINAL | **IN_PROGRESS_CLOSURE** — ابدأ WAVE6 من `40548c89` بعد ثبات الإنتاج فقط |
| ادّعاءات ممنوعة | STORE GO · FULLY COMPLETE · ZERO_INTERNAL_DEBT · DEVICE_TESTED · WCAG CERTIFIED · mushaf silky |

---

## Q) مراجع

```
docs/audit/SUNNAH_REMAINING_PROBLEMS_MASTER_COPYABLE.md   ← هذا الملف
docs/audit/SUNNAH_REMAINING_PROBLEMS_FULL_INVENTORY.md
docs/audit/SUNNAH_WAVE2_LEGACY_PAGE_CSS_CLOSURE_REPORT.md
docs/audit/SUNNAH_WAVE3_BUTTON_SEMANTIC_CLOSURE_REPORT.md
docs/audit/SUNNAH_WAVE4_ROUTE_FEEDBACK_CLOSURE_REPORT.md
docs/performance/SUNNAH_WAVE5_STARTUP_FOUC_CLS_CLOSURE_REPORT.md
docs/performance/WAVE5_CRITICAL_FOUC_BASELINE.md
docs/performance/WAVE5_CSS_IMPORT_GRAPH.md
docs/performance/WAVE5_SCOPE_MANIFEST.md
docs/mushaf/MUSHAF_HEAVINESS_AND_PAGE_TURN_REPORT.md
docs/mushaf/MUSHAF_EXPERIENCE_ROOT_CAUSE.md
docs/performance/STARTUP_AND_DARK_MODE_ROOT_CAUSE.md
docs/performance/ZERO_FLICKER_LAYOUT_SHIFT_ROOT_CAUSE_PR0.md
docs/audit/ROUTE_QUALITY_MATRIX.json
docs/design/DESIGN_TOKEN_AUTHORITY.md
docs/design/DARK_MODE_AUTHORITY.md
docs/design/LEGACY_CSS_RETIREMENT_MATRIX.md
artifacts/majalis/reports/interaction-system-debt-budget.json
artifacts/majalis/reports/visual-system-debt-budget.json
artifacts/majalis/reports/visual-system-baseline.json
```
