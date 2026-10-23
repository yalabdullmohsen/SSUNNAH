# ملكية الملفات بين نوافذ التطبيق الأصلي

مستنتَجة من سجل git وتقارير `docs/native` (2026-10-14). تُقرأ آليًا بواسطة `scripts/native-ownership-check.mjs`: كل سطر `- \`نمط\`` تحت عنوان نافذة هو ملكية لها (glob: `*` داخل مجلد، `**` عبر المجلدات). الفحص تحذيري فقط ولا يفشل PR.
`SN` = `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative`.

## n1 — التصميم والهوية
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Shell/RootTabView.swift` (شكل الشريط والقائمة الجانبية: ألوان/أيقونات/ترتيب/تخطيط). ن4 يملك فيه سطري الحركة فقط: `.sunnahDestination($0)` و`.sunnahNavigationMotion(depth:)`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Shell/AppTab.swift`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Design/**`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Components/**`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Templates/**`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Intro/**`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Special/**`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Sections/**`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Generated/**`
- `ios-native/Sources/Design/**`
- `ios-native/SunnahWatch/**` (واجهة Apple Watch؛ الهدف مسجَّل في pbxproj عبر generate-xcodeproj.rb، وإعداداته في `ios-native/SunnahWatchResources/**` لـن4)
- `ios-native/SunnahApp/Resources/**`
- `docs/native/intro/**`
- `docs/native/store-shots/**`
- `docs/native/backend/**`
- `Shared/**`
- `docs/native/store/**` — ملكية الإصدار (قرار يوسف؛ يشمل PRIVACY_AUDIT_CLOUD.md الذي يكتبه ن5 بتفويض).
- `scripts/native-design-guard.mjs`
- `scripts/generate-swift-tokens.mjs`
- `artifacts/majalis/ios/App/PrayerWidget/PrayerWidgetViews.swift` (قرار المالك 2026-10-15: ألوان وأنماط عرض الويدجت لـن1؛ البيانات والـentry والـintents والـharness اللقطات تبقى لـن4)
- `artifacts/majalis/ios/App/PrayerWidget/Sunnah*WidgetCatalog.swift`
- `artifacts/majalis/ios/App/PrayerWidget/SunnahContentExperienceCatalog.swift`
- `artifacts/majalis/ios/App/PrayerWidget/SunnahWidgetLogoMark.swift`

## n2 — الجودة والمحتوى والبيانات
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Data/**`
- `artifacts/majalis/ios/App/SunnahDataKit/**`
- `docs/native/DATA_CONTRACT.md`
- `docs/native/data-gaps.md`
- `docs/native/data-exemptions.json`
- `docs/native/qa/**`
- `docs/native/requests/**`
- `scripts/native-data-check.mjs`
- `scripts/native-export-data.sh`
- `ios-native/scripts/prepare-data.sh`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Tasmee/**` (قرار المنسّق 22 أكتوبر: التسميع ملك ن2)
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Mushaf/MushafTasmee*`

## n3 — المصحف وأداؤه
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Sections/account/AccountWidgetCenterScreen.swift` (مركز الودجات فقط؛ قرار يوسف 2026-10-17)
- `artifacts/majalis/ios/App/SunnahNative/Tests/SunnahNativeTests/WidgetCenterTests.swift`
- `docs/native/WIDGET_CENTER_SPEC.md`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Mushaf/**`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Audio/**`
- `artifacts/majalis/ios/App/SunnahNative/Tests/SunnahNativeTests/Mushaf*`
- `artifacts/majalis/ios/App/SunnahNative/Tests/SunnahNativeTests/Quran*`
- `artifacts/majalis/ios/App/SunnahNative/Tests/SunnahNativeTests/Fixtures/MushafVisual/**`
- `docs/native/perf/mushaf.md`
- `docs/native/QURAN_QUOTE_FIXES.md`
- `tools/tasmee-bench/**`

## n4 — البنية التحتية والأداء والتنقل
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Shell/AppRouter.swift`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Shell/Route.swift`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Shell/RouteResolver.swift`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Shell/Motion.swift`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Platform/**`
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Support/**`
- `artifacts/majalis/ios/App/SunnahNative/Package.swift`
- `ios-native/SunnahApp/**`
- `ios-native/SunnahApp.xcodeproj/**`
- `ios-native/SunnahAppUITests/**`
- `ios-native/scripts/generate-xcodeproj.rb`
- `scripts/native-*.sh`
- `scripts/native-*.mjs`
- `scripts/native-*.swift`
- `scripts/ensure-sim.sh`
- `scripts/verify-merged.sh`
- `docs/native/perf/**`
- `docs/native/OWNERSHIP.md`
- `docs/native/PROGRESS.md`
- `docs/native/BACKLOG.md`
- `.github/workflows/ios-*.yml`
- `.github/workflows/native-*.yml`

- **شاشة الدخول (المقدّمة المتحركة)** — `Intro/**` و`docs/native/intro/**` و`IntroPolicyTests`/`IntroSnapshotTests`: ن2 (معتمدة من يوسف 2026-10-14، انظر `docs/native/intro/APPROVAL.md`).

## مشترك (لا تحذير)
- `docs/native/**` عدا ما ذُكر لنافذة، و`artifacts/majalis/ios/App/SunnahNative/Tests/**` للاختبارات التي تكتبها النافذة لشاشتها.

## قاعدة المراجع البصرية للمصحف (من يوسف، 2026-10-15)
لا تُعاد تسجيل مراجع `Fixtures/MushafVisual-ios` في PR إلا ومعه: صورتا قبل/بعد (في `docs/native/qa/mushaf/`)، وسبب التغيير مكتوب في وصف الـPR، وموافقة ن1 على التغيير البصري. ن3 يملك الأداء فقط؛ الشكل لـن1، وأرقام الآيات من نصوص المصحف ولا تُمَس.

## طلبات

- ~~ن1 → ن3: `/auth/callback` و`/upload`~~ — **أُغلق بقرار المالك 2026-10-15**: اعتماد حالتهما الفارغة المصمَّمة كما هي (رسالة عربية + زر رجوع)، مسجَّلتان «مقبولة» في route-audit.md.
نافذة تحتاج تعديلًا في ملف غيرها تضيف هنا سطرًا (`من → إلى: الملف — المطلوب`) ثم تتابع عملها:

- ن4 → ن1: `Components/SunnahCard.swift`, `Components/SunnahListRow.swift` — استعمال `.sunnahPressable()` من `Shell/Motion.swift` بدل `.buttonStyle(.plain)` (انظر `docs/native/perf/motion.md`).
- ن4 → ن1: `Design/Sunnah.swift` — `Sunnah.Motion.standard` يصير مرادفًا لـ`SunnahMotion.standard`؛ لن ألمس الملف.
- ن3 → ن4: `Shell/RouteResolver.swift` — أُضيف سطر واحد (فوق سطر `MushafRoute`) لمسار `/tafsir/{سورة}:{آية}` ← `TafsirAyahView` (في `Mushaf/MushafTafsirView.swift`)؛ لا تغيير آخر في الملف.
- ن1 → ن4: `Shell/RouteResolver.swift` — أضفتُ سطرًا واحدًا فقط في `redirects`: `"adhan-settings": "/notification-settings"` (لا ميزة أذان في التطبيق؛ قرار المالك). أبقِه عند أي إعادة كتابة للموجّه. اختبار `NoAdhanNamingTests` يحميه.
- ن3 → ن1: `Special/MushafScreen.swift` — تحميل المستودع والفهرس خارج الخيط الرئيسي، وبناء `MushafSearch` لاحقًا (`Loaded.search` صار `var`) + سجلات `mushaf-perf`؛ أقل تعديل. وكذا `Sections/quran/QuranSearchScreen.swift:46` ينشئ `MushafSearch` على الرئيسي: يُنقل للخلفية بالطريقة نفسها (لم ألمسه).
- ن3 → ن4: `Shell/Motion.swift` — يكسر `swift test` على macOS (`zoom(sourceID:in:)` غير متاح على macOS، و`Int` لا يملك `.soft`): يحتاج `#if canImport(UIKit)`/`#if os(iOS)` حول ما هو خاص بـUIKit؛ لم ألمس الملف. (الحارس البصري صار يعمل على iOS فلا أعتمد على macOS، لكن `swift test` المحلي مكسور.)
- ن3 → ن4: `Platform/PlatformPorts.swift`, `ios-native/SunnahApp/Platform/SharedDataPublisher.swift`, `Shared/SunnahSharedData.swift` — ويدجت المصحف («تابع») يقرأ `entry.mushaf.lastPage` لكن `SharedProgressSnapshot` و`publishProgress` لا يحملان آخر صفحة/سورة، ولا أحد في التطبيق الأصلي يستدعي `publishProgress`. المطلوب: حقل `mushafLastPage` (وسورة اختياريًا) في اللقطة، واستدعاء النشر من `MushafStore.visit` (مفتاح `mushaf.lastPage` في UserDefaults موجود)؛ المسار `SunnahWidgetDeepLinkFactory.mushaf(page:)` جاهز. لم ألمس هذه الملفات.
- ن3 → ن4: `ios-native/SunnahApp/SunnahApp.swift` — قياس Release للمصحف يحتاج قراءة `-snapshotRoute` تحت `#if MUSHAF_PROBE && !DEBUG` (سطر واحد: `router.open(path:)` بلا `readiness`)؛ لم ألمس الملف، وأطبّق التعديل محليًا مؤقتًا عند القياس.
- ن1 → ن2: `/quiz` (بيانات `quiz` المصدَّرة، `chunk.title`) — النص الحالي: «منقول من الأسئلة-edu» (3535 سؤالًا) يظهر كعنوان صف؛ المطلوب: عنوان عربي مقروء للمستخدم (مثلًا «بنك الأسئلة العام») أو حذف حقل العنوان ليعرض التطبيق عنوانًا افتراضيًا. محتوى يتبع ن2؛ لا أعدّله من جهتي.
- ن2 → ن4: `ios-native/SunnahApp.xcodeproj/project.pbxproj` — متقادم: ينقصه `SunnahWidgetLogoMark.swift` (يكسر بناء الويدجت عند إعادة التوليد). أعِد توليده/أضفه؛ لن أدفع نسخة مُعاد توليدها.
- ن2 → ن4: `Shell/RouteResolver.swift` (+ شاشته إن وُجدت) — مسار `/adhan-settings` يتيم ويفشل `testNoOrphanRoutes`؛ الميزة ممنوعة بقرار المالك، فيُحذف المسار وشاشته بدل إبقائه.
- ن1 → ن4: ويدجت `PrayerWidget/*` — (2) `accessoryInline` ومتغير المصحف الفارغ في الأداة: **منجز** (ن4، #3269). (1) ألوان الوضع الفاتح: على ن1 الآن (خلفية `AccessoryWidgetBackground` وحبر `.primary` للقفل، أبيض صريح لباقي العائلات)؛ التحقق بأداة اللقطات على حزمة المرشّح، والجهاز الحقيقي غير مفحوص. (3) `2-prayer-all` large: تجميلي، مفتوح.
- ن4 → ن1: أداة اللقطات صارت تُصدِر `accessoryInline` (prayer-next وadhkar-time وadhkar-hour) ومتغيّر المصحف الفارغ؛ 256 لقطة بلا أي تجاوز حافة (EDGE-OK). لوحتان في `docs/native/qa/widget-mushaf/` (matrix_mushaf_dark/matrix_lockscreen) جاهزتان لمراجعتك؛ ملاحظة: حلقات circ في لوحة القفل تظهر بحلقة سوداء على الأخضر في المتغيّر الفاتح (قد يكون أثر الأداة لا vibrant الحقيقي — راجع ما ذكرتَه في البند 1). ويدجت المصحف بلا عائلات قفل (قرار تصميم لك).
- ن3 → ن1: `Mushaf/MushafReaderView.swift` (قرص نهاية الآية) — **مُجاب ومُغلق**: التفاوت عيب رسم (القرص كان يتبع عرض صندوق الرمز)؛ أُصلح في #3281 بقطر موحّد 1.12em ممركز، والقبل/بعد في `docs/native/qa/mushaf/disc-page-*`.
- ن3 → ن1: `Mushaf/SurahBanner.swift` — الارتفاع صار `min(العرض/عرض الأصل، الارتفاع/ارتفاع الأصل)` فلا تقصّ اللافتة أسفل آخر سطر على iPad (ص604)؛ الرسم والألوان كما هي. وفي `MushafReaderView.swift` حشوة أفقية حول قرص نهاية الآية (`endPads`، أمان 0.06em) للمسافة فقط؛ قطر القرص `ayahDiscEm` وشكله ولونه لك، ولم ألمسها.
- ن4 → ن1: ويدجت `8-ayah-dua` (`AyahOrDuaView` في `SunnahContentExperienceCatalog.swift`) عائلة `accessoryRectangular`: تجاوز حافة من الجهة «أعلى» في 8 لقطات (light/dark × data/long/empty/nodata) بحسب `bash scripts/native-edge-check.sh` (2026-10-16، n4-sim). باقي اللقطات بلا تجاوز. هذا يُبقي EDGE-OK غير متحقق ويمنع إطلاق RC3 الآلي حتى يُصلح (قصّ/حجم/`minimumScaleFactor` للقفل). لم ألمس الملف.
- ن4 → ن1: `Sections/account/AccountLessons.swift` — في قسم ICS فقط: `plusOneHour` حُذفت، وحلّت محلها `clock()` (تقرأ «م/ص» والأرقام العربية)، و`icsTime(plusHours:)` ينقل النهاية بعد منتصف الليل إلى اليوم التالي. كان «6:00 مساءً» يُصدَّر 06:00، و23:00 تنتهي بـ«T240000» غير الصالحة. الواجهة والنماذج كما هي، والاختبارات في `AccountIcsTimeTests`. (الويب `CalendarPage.tsx` فيه الخلل نفسه، ولم ألمسه.)
- ن4 → ن1: `Sections/learn/LearnFlashcards.swift` — `intervalLabel` فقط: موعد المراجعة صار بعدد عربي سليم وأرقام عربية. كان «2 أيام» و«15 أيام» بأرقام لاتينية، وصار «يومان» و«١٥ يومًا» و«أسبوعان» و«١٠٠ يوم». يعيد استعمال `TasmeeProgressFormat.counted`، والاختبارات في `CountdownAndIntervalLabelTests`.
- ن4 → ن1: `Components/SunnahMarkdownText.swift` — `labeledParagraph` فقط: التسمية العريضة يجب أن تُغلق عند النقطتين («**x:**» أو «**x**:»). كان السطر العريض الكامل الذي فيه نقطتان («**قال رسول الله ﷺ: …**» أو «**الساعة 10:30**») يُقسَم إلى عنوان ونص، ويبقى `**` ظاهرًا. المحتوى المضمَّن فيه 85 تسمية مغلقة لا تتأثر، و0 حالة غير مغلقة. الاختبارات في `MarkdownLabelEdgeTests`.
- ن4 → ن1: `Design/ArabicCount.swift` (جديد)، ومعه `learn/LearnKnowledgeScreens.swift:109` و`learn/LearnQuizScreen.swift:9` و`learn/LearnFlashcards.swift` (رسالة نهاية الجلسة و`intervalLabel`) — دالة عدّ عربية مشتركة. كان العدد يُعرض بصيغة واحدة: «١ درسًا» و«٥ درسًا» و«أنهيت مراجعة ٥ بطاقة». **لم أعدّل** `sirah/SirahAdapters.swift:249,261` («N درسًا» للمعلّمين) لأنه مسار حسّاس، وهو يحتاج الدالة نفسها مع تحديث `SirahAdaptersTests:99`.
- ن4 → ن1: `Special/DailyWirdScreen.swift` — منطق السلسلة في `WirdState.add` فقط، مع حقل اختياري `streakDay`. كان إكمال الهدف على دفعات في اليوم نفسه لا يزيد السلسلة، والانقطاع مع إكمال على دفعات يُبقي السلسلة القديمة. وفي الواجهة سطر واحد: لا يُعرض `Text` فارغ حين لا رسالة للسلسلة (القيمة 2). الاختبارات في `DailyWirdStreakTests`. (منطق الويب `DailyWirdView.tsx` فيه الخلل نفسه، ولم ألمسه.)
- ن4 → ن1: `sirah/SirahAdapters.swift` — تتمة الطلب السابق: `teachers`/`teacher(slug:)` يستعملان `lessonCount` (أي `ArabicCount`) بدل «N درسًا» الثابتة، و`SirahAdaptersTests` حُدِّث من «2 درسًا» إلى «درسان». المسار حسّاس، فيحتاج `visually-verified`.
