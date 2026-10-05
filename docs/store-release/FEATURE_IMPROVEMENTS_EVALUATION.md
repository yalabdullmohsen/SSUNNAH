# تقييم تحسينات الميزات — سُنّة

**التاريخ:** 2026-10-06 · **النوع:** تقرير فقط، ولم يُنفَّذ شيء.

- المسارات في هذا التقرير نسبةً إلى `artifacts/majalis/` ما لم يُذكر غير ذلك.
- مرجع الحدود بين التطبيق والويب: [`docs/architecture/APP_VS_WEB_BOUNDARY.md`](../architecture/APP_VS_WEB_BOUNDARY.md).
- **أحجام التقدير:** S = يوم إلى يومين، وأقل من 5 ملفات · M = 3 إلى 5 أيام، و5 إلى 12 ملفًا · L = أكثر من أسبوع، أو قرار منتج وإصدار.

## ملخص

| الميزة | موجودة؟ | المستوى | الحجم المتبقي | الأولوية |
|---|---|---|---|---|
| مخطط الختمة اليومي | جزئيًا | متتبّع ورد بلا واجهة تخطيط | M | عالية |
| مشاركة آية أو حديث كصورة | الكود موجود، لكنه غير موصول بالمصحف الحالي | منطق جاهز بلا نقطة دخول | S | عالية |
| وضع رمضان | لا (أجزاء متفرقة فقط) | — | M | عالية موسميًا |
| القراءة دون اتصال (مصحف وأذكار) | ويب فقط، تخزين عند الزيارة. التطبيق الأصلي متصل فقط | جزئي | ويب M · تطبيق L | متوسطة (قرار منتج) |
| تكبير الخط على مستوى التطبيق | نعم | مكتمل | — (تحسينات اختيارية) | منخفضة |
| تذكير أذكار الصباح والمساء | جزئيًا (ويب). الأصلي في PR #2648 المفتوح | جزئي | S بعد #2648 | عالية |

---

## 1) مخطط الختمة اليومي

**موجودة جزئيًا: متتبّع ورد، لا مخطط.**

**ما هو موجود:**
- مسار `/daily-wird` (`src/AppRoutes.tsx:653`) يعرض `src/pages/worship/ui/DailyWirdView.tsx`. فيه:
  - هدف صفحات يومي (`pagesPerDay`).
  - حلقة تقدم `KhatmaRing` على 604 صفحات.
  - عدد الختمات، والسلسلة، وسجل أسبوعي.
  - الحالة من `getDailyWirdState` (`src/lib/quran-api.ts`).
- `src/lib/quran-khatmah-tracker.ts` (288 سطرًا) يحتوي:
  - `setKhatmahTargetDate` و`setKhatmahPagesPerDay` و`predictKhatmahCompletion` و`computeReadingVelocity` و`maybeNotifyKhatmahBehind`.
  - المفتاح `majalis-khatmah-tracker-v1`.
  - **لا تستدعي أي واجهة `setKhatmahTargetDate` ولا `setKhatmahPagesPerDay`.** لا مستدعي لهما خارج الملف نفسه، والتنبؤ لا يُعرض.
- مخزن ثانٍ هو `src/lib/mushaf-v2/QuranKhatmaRepository.ts`، معطَّل بالعلَم `khatmaWird: false` (`src/lib/mushaf-v2/flags.ts:45`).
- تنبيه التأخر `khatmahBehind` موجود في `src/lib/smart-local-notifications.ts`، ويعمل في مسار الويب فقط.

**الناقص:**
- واجهة لاختيار «أختم في N يومًا» أو تاريخ هدف، تُحوَّل إلى ورد يومي بنطاق صفحات أو أجزاء.
- عرض التنبؤ ومقدار التأخر.
- تسجيل تلقائي للصفحات من قارئ المصحف.
- تذكير أصلي (native).
- **توحيد المخزنَين:** حذف `QuranKhatmaRepository` أو تفعيله، دون إبقاء الاثنين.

**الحجم:** M.
- الملفات: `DailyWirdView.tsx`، و`quran-khatmah-tracker.ts`، وCSS الورد، وخطاف تقدّم الصفحة في `features/mushaf-reader`، و`native-daily-reminders` (بعد #2648)، و`flags.ts`.

**الأولوية:** عالية. المنطق موجود والناقص واجهة فقط.

## 2) مشاركة آية أو حديث كصورة

**الكود موجود، لكنه غير موصول بالمصحف المعتمد.**

**ما هو موجود:**
- `html-to-image` تبعية قائمة (`package.json`).
- `src/lib/share-ayah.ts`:
  - `generateAyahImage` يرسم على Canvas.
  - `shareAyahAsImage` يستخدم `navigator.canShare({files})`، ويسقط إلى التنزيل.
- `src/lib/card-image-export.ts`: الدالتان `exportCardImage` و`exportSocialCard`، بمقاسات story وfeed وwide، مع `navigator.share({files})`. تستخدمهما `src/views/CardsPage.tsx`.

**الفجوة:**
- مسار `/mushaf` يستخدم `NewMushafReader` (`src/pages/quran/MushafReaderPage.tsx`).
- قائمة الآية فيه (`src/features/mushaf-reader/MushafControlsLayer.tsx`) تحتوي تفسيرًا واستماعًا ونسخًا وإشارة مرجعية فقط. **لا توجد مشاركة للآية.** المشاركة الوحيدة هي رابط الصفحة (`onSharePage`).
- زر «مشاركة كصورة» موصول فقط في `src/features/mushaf-madinah/VerifiedMushafReader.tsx`، وهو غير مستخدم في أي مسار.
- **الحديث:**
  - `src/components/hadith/HadithCard.tsx` يشارك نصًا فقط.
  - `CitationModal.tsx` يولّد PNG عبر `toPng`، لكنه ينزّله برابط `<a>` فقط، دون `navigator.share`.

**الناقص:**
- إضافة إجراء «مشاركة كصورة» في قائمة الآية، بإعادة استخدام `shareAyahAsImage` دون مكوّن جديد.
- إضافة `navigator.share({files})` لبطاقة الحديث، بإعادة استخدام `exportCardImage`.
- اختبار ذلك داخل WKWebView على جهاز حقيقي. iOS 15+ يدعم مشاركة الملفات، لكن ذلك لم يُتحقَّق منه في التطبيق.

**الحجم:** S.
- الملفات: `MushafControlsLayer.tsx`، و`NewMushafReader.tsx`، و`CitationModal.tsx` أو `HadithCard.tsx`.

**الأولوية:** عالية. قيمة عالية بجهد قليل.

## 3) وضع رمضان (الإمساكية وعدّاد الإفطار والسحور)

**غير موجود كميزة. توجد أجزاء متفرقة.**

**ما هو موجود:**
- جدول سنوي وشهري بعنوان «إمساكية أوفلاين — السنة كاملة» في `src/components/prayer/PrayerAnnualTimetable.tsx`.
  - يعتمد على `src/lib/prayer-annual.ts` (`generateMonthTimetable` و`generateYearTimetable` و`exportTimetableCsv`).
  - **ليس خاصًا برمضان:** لا عمود «إمساك»، ولا نطاق للشهر الهجري.
- نصوص إشعارات رمضان في `src/lib/notifications/localization.ts` (`ramadan` و`ramadanLate`).
- عنصر ويدجت `sunnah.widget.calendar.ramadan` في `src/lib/widget-data/catalog.ts`.
- محتوى فقهي في `src/views/SawmPage.tsx`.

**الناقص:**
- قسم أو مسار رمضان (مثلًا `/ramadan`) يظهر تلقائيًا في رمضان، بالاعتماد على `hijri-utils.ts` (أم القرى).
- إمساكية الشهر بعمود الإمساك، محسوبًا عرضًا: الفجر ناقص هامش يحدده المالك.
- عدّاد للإفطار (المغرب) وللسحور (الفجر).

**قيد إلزامي:** الاستهلاك فقط من المحرك القائم، **دون أي تعديل في الحساب:**
- `computePrayerEngineDay` (`src/lib/prayer-time-engine.ts`).
- `getPrayerTimes` و`computePrayerCountdown` (`src/lib/prayer-times.ts`).
- `usePrayerCountdownState` (`src/hooks/usePrayerCountdown.ts`).
- `generateMonthTimetable`.

**الحجم:** M.
- الملفات: `routes.ts` و`AppRoutes.tsx`، وصفحة أو عرض جديد، وتوسيع `PrayerAnnualTimetable` بعمود اختياري، وCSS ضمن ملف قائم، ونصوص.
- الإشعارات الرمضانية اختيارية عبر الجدولة القائمة، دون تعديل منطقها.

**الأولوية:** عالية موسميًا. يجب أن تكون جاهزة قبل رمضان 1448 هـ بوقت كافٍ.

## 4) القراءة دون اتصال (المصحف والأذكار)

**على الويب: جزئية. في التطبيق الأصلي: غير موجودة.**

**الويب (PWA):**
- عامل الخدمة `public/sw.js` مكتوب يدويًا، وتسجّله `src/lib/service-worker.ts`.
- لا يُخزَّن مسبقًا إلا الغلاف (`offline.html` والأيقونات). التنقلات لا تُخزَّن، وتسقط إلى `offline.html`.
- التخزين أثناء التشغيل:
  - `/data/*.json` و`/data/quran-v2/*` (بيانات صفحات المصحف): الشبكة أولًا ثم الكاش.
  - `/fonts/quran/`: الكاش أولًا.
  - `/api/adhkar`: الشبكة أولًا.
- **النتيجة:** الصفحة تتاح دون اتصال **فقط إذا زارها المستخدم من قبل.** لا يوجد إجراء «تنزيل المصحف أو الأذكار».
- الأذكار الأساسية مضمّنة في الحزمة (`src/lib/adhkar-seed.ts`)، لكن العناصر الموثّقة تُجلب من الشبكة (`adhkar-supabase.ts`).
- `public/quran-engine-sw.js` (Workbox) **غير مسجَّل** في `src`.

**التطبيق الأصلي (Capacitor):**
- `capacitor.config.ts` يضبط `server.url: "https://www.ssunnah.com"` و`errorPath: "native-load-error.html"`.
- `src/main.tsx` **يمنع تسجيل SW** عند `isNative`، ومنطوق التعليق: «داخل تطبيق Capacitor الأصلي نمنع تسجيل SW تمامًا».
- **لذلك لا كاش دون اتصال في التطبيق.** عند انقطاع الشبكة تظهر صفحة الخطأ.
- `APP_VS_WEB_BOUNDARY.md`:
  - SW وWeb Push للويب فقط.
  - الوضع الحالي «remote-shell».
  - وضع «local-bundle» جاهز في السكربت.
  - التشغيل دون اتصال يتطلب إزالة `server.url` واستخدام `build:native-variant`، **وهذا قرار منتج.**
  - الوثيقة تذكر أن `data/` نحو 88MB و`fonts/` نحو 95MB.

**الناقص:**
- ويب: زر «تنزيل للقراءة دون اتصال» يخزّن مسبقًا عند الطلب بيانات `quran-v2` وخطوط QPC وأذكار JSON، مع عرض الحجم والتقدم. **الحجم: M** (`sw.js` وإعدادات القراءة).
- تطبيق: الانتقال إلى local-bundle. **الحجم: L**، ويحتاج قرار المالك في حجم الثنائي والإصدار.
  - مرتبط بتراخيص خطوط QPC، لأن تضمينها في الثنائي «توزيع». راجع [`ISLAMIC_SOURCES_EVALUATION.md`](./ISLAMIC_SOURCES_EVALUATION.md).

**الأولوية:** متوسطة. التطبيق مقيَّد بقرار منتج وترخيص.

## 5) تكبير الخط على مستوى التطبيق

**موجود ومكتمل.**

**ما هو موجود:**
- `src/lib/user-preferences.ts` يحوّل التفضيلات إلى `--ui-font-scale`:
  - `fontSize`: صغير 0.92 · افتراضي 1 · كبير 1.08.
  - `seniorMode`: 1.16.
  - التقييد عبر `clampUiFontScale`.
- التطبيق في CSS على حجم خط الجذر: `src/index.css` و`typography-app.css`، بين 0.85 و1.35.
- الواجهة في `src/pages/account/ui/SettingsView.tsx`: مفتاح وضع كبار السن، وقائمة حجم الخط.
- مقاييس منفصلة:
  - `--reading-font-size` للنصوص المقروءة.
  - `--quran-font-size` عبر `useQuranPreferences`.
  - مقياس التفسير `majalis-mushaf-tafsir-font-scale-v1`.
- خط المصحف الصفحي QPC **ثابت بالتصميم** حسب نطاقات التخطيط (`sunnah-mushaf-signature-preset.ts`).

**الناقص (اختياري):**
- ثلاث درجات فقط، إضافة إلى وضع كبار السن.
- لا يتبع Dynamic Type في iOS.

**الحجم:** S إن طُلب. **الأولوية:** منخفضة.

## 6) تذكير أذكار الصباح والمساء

**موجود جزئيًا.**

**ما هو موجود:**
- `src/lib/smart-local-notifications.ts`: الصباح 06:30 (`/adhkar/morning`)، والمساء 17:30 (`/adhkar/evening`)، والنوم 21:30.
  - **الأوقات ثابتة.**
  - مسار الويب يعتمد `window.setTimeout`، فلا يعمل إلا والصفحة مفتوحة.
- **في المسار الأصلي:** يُجدول ورد القرآن وتذكيرات الأذكار القصيرة فقط. **أذكار الصباح والمساء غير مجدولة أصليًا.**
- الواجهة: `src/components/adhkar/AdhkarRemindersCard.tsx`، والإعدادات في `src/lib/notifications/sections-config.ts`، ومركز الإشعارات `/notification-settings`.
- ما دُمج: #2629 (إعادة بناء مركز الإشعارات) و#2630 (توحيد المسار).
- **PR #2648 مفتوح:** «نواة الجدولة — الساعات الهادئة وتصفية الفئات والمسار الأصلي على iOS». يضيف `lib/notifications/native-daily-reminders.ts` و`native-bootstrap.ts`.

**الناقص بعد دمج #2648:**
- التحقق من أن أذكار الصباح والمساء صارت ضمن الجدولة الأصلية.
- أوقات قابلة للضبط، أو ربطها بالصلاة. مثال: بعد الفجر أو بعد العصر بقراءة أوقات المحرك القائم **دون تعديله**.

**الحجم:** S (بعد #2648).
- الملفات: `native-daily-reminders.ts` و`sections-config.ts` و`AdhkarRemindersCard.tsx`.

**الأولوية:** عالية.

---

## ترتيب مقترح للتنفيذ

يُنفَّذ بعد موافقة المالك:

1. مشاركة الآية كصورة (S).
2. تذكير الأذكار الأصلي، بعد #2648 (S).
3. مخطط الختمة (M).
4. وضع رمضان (M).
5. تنزيل المصحف دون اتصال على الويب (M).
6. قرار local-bundle للتطبيق (L).
