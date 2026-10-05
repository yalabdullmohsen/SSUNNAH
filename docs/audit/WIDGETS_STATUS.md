# حالة الويدجيتات — تحقق شامل من الطرف إلى الطرف (2026-10-05)

البوابة: `pnpm --filter @workspace/majalis run test:widgets-integrity`
(`artifacts/majalis/src/lib/__tests__/widgets-integrity-gate.test.ts`، ومضمّنة في `test:ios-gates`).

## الجرد

| المكوّن | الموقع |
|---|---|
| امتداد WidgetKit (هدف `PrayerWidgetExtension`) | `ios/App/PrayerWidget/` — 32 ويدجت في `PrayerWidgetBundle` (صلاة 9، تقويم 5، أذكار 5، قرآن/مصحف 6، محتوى 4، الرئيسية 3) |
| النماذج المشتركة (app + widget) | `ios/App/Shared/` — `SunnahSharedData` · `SunnahWidgetEnvelope` · `SunnahWidgetRefreshCoordinator` · `SunnahPrayerDeepLink` |
| جسر Capacitor | `ios/App/App/SunnahSharedDataPlugin.swift` |
| الناشر (JS) | `src/lib/plugins/sunnah-widget-envelope-publish.ts` · `sunnah-shared-prayer-publish.ts` · `sunnah-shared-data.ts` |
| مركز الويدجيتات | `src/pages/account/ui/WidgetCenterView.tsx` |
| App Group | `group.com.yousef.majlisilm` — متطابق في entitlements (App debug/release، Widget، Live Activity) وSwift وJS |
| Android | لا ويدجيتات (المنتج iOS فقط) |

## ما تحقّق ساكنًا (البوابة)

1. **تطابق المخطط JS ↔ Swift Codable**: كل حقل Swift إلزامي في الظرف ونطاقاته الـ13 موجود في مخرجات الناشر بنوع JSON مطابق، وأرقام `schemaVersion` ضمن ما يفكّه `decodeIsolated`، وكل حقل في `SharedPrayerSnapshotPayload` (TS) يقرؤه الجسر الأصلي.
2. **App Group**: كل `CODE_SIGN_ENTITLEMENTS` في pbxproj موجود ويحمل المجموعة نفسها، ولا مجموعة أخرى في كود Swift، وملفات `Shared/` مُترجمة في الهدفين.
3. **إعادة التحميل**: `SunnahWidgetRefreshCoordinator` يكتب ثم `synchronize` ثم `reloadTimelines(ofKind:)` لعائلة النطاق فقط (مقصود بدل `reloadAllTimelines`، وبوابة العقد القائمة تمنع الأخير).
4. **سياسة الخط الزمني**: مدخل عند كل حدّ صلاة معروف (اليوم + الأيام القادمة) وقبل التالية بـ15 دقيقة وعند منتصف الليل بتوقيت الموقع؛ وويدجيتات الكتالوج عند منتصف الليل وحدود نوافذ الأذكار (04:00، 11:30، 14:30، 21:30).
5. **الروابط العميقة**: كل مسار في Swift وفي الظرف يطابق `<Route>` حقيقيًا، والأصل `www.ssunnah.com` موثوق في `native-deep-link.ts`.
6. **سجلّ الأنواع**: كل `SunnahWidgetKind` له Widget مسجّل في الحزمة بلا تكرار.

## العيوب المصلَحة في هذا الفرع

| العيب | الأثر | الإصلاح |
|---|---|---|
| `PLACEHOLDER_MODEL_INCOMPLETE` — بعد العشاء لا «تالية» إن نُشرت اللقطة قبل العشاء، وبعد منتصف الليل تبقى أوقات الأمس | عدّاد فارغ/«—» حتى فتح التطبيق | الناشر يضيف `upcomingDays` (الغد وبعده) من محرك التطبيق نفسه `getPrayerTimes` (لا حساب جديد)؛ الويدجت يشتق السابقة/الحالية/التالية من كل الحدود المعروفة ويبدّل اليوم عند منتصف الليل |
| «السابقة» تُقرأ من لحظة النشر دائمًا | بعد العصر تظهر «السابقة: الفجر» | الاشتقاق من الحدود أولًا، والحقل المنشور احتياط فقط |
| ويدجيتات التقويم/الأذكار/التقدّم مجمّدة على قيم يوم النشر | تاريخ هجري/ميلادي قديم، «أُنجزت» من الأمس، نافذة أذكار خاطئة | `SunnahWidgetDayRollover` يلفّ التاريخ (أم القرى كما في JS) والعدّادات ونافذة الأذكار لكل مدخل؛ المناسبة الفائتة تُخفى بدل اختراع غيرها |
| `publishPrayerSnapshotForWidgets` ينشر الظرف بلا `prayerTimes` | تشخيص يبلّغ «prayer» ناقصًا رغم وجوده | تمرير الحمولة و`upcomingDays` |
| نشر ظرف بلا صلاة (الأذكار/مركز الويدجيتات) يمحو نطاق الصلاة، و`loadCanonicalPrayer` يفضّل الظرف ولو أقدم | لقطة أقدم قد تغلب الأحدث | المنسّق يحتفظ بالصلاة الملتزَمة؛ القارئ يختار الأحدث `updatedAtEpochMs` |
| رابط المصحف `/mushaf/page/N?ayah=` | التحويل القديم يُسقط `?ayah=` فلا تُبرز آية العلامة | الرابط القانوني `/mushaf?page=N&ayah=s:a` |

## البناء والأدلة

- `xcodebuild -project App.xcodeproj -scheme App -sdk iphonesimulator CODE_SIGNING_ALLOWED=NO build` (Xcode 26.6): **BUILD SUCCEEDED** للتطبيق وامتداد `PrayerWidgetExtension` بعد التعديل (أُعيد التحقق 2026-10-06 فوق أحدث main)، بلا أخطاء ولا تحذيرات في ملفات الويدجت.
- لقطات الويدجت على المحاكي غير مؤتمتة: إضافة ويدجت إلى الشاشة الرئيسية تتطلب تفاعلًا يدويًا (لا واجهة `simctl` لذلك)، فلا لقطات ضمن هذا الفرع — والمحاكي ليس شهادة جهاز في كل الأحوال.

## سمات التجربة (تحقق قراءة)

- **RTL**: `layoutDirection = .rightToLeft` ولغة `ar` على كل الجذور.
- **الوضع الداكن**: سطح زمردي ثابت بنص أبيض — تباين ثابت في الوضعين (اختيار هوية مقصود).
- **Dynamic Type**: خطوط نصية نظامية (`headline/subheadline/caption/title3`) مع `minimumScaleFactor`.
- **إمكانية الوصول**: `accessibilityLabel` على الجذور (≈50 موضعًا).
- **العائلات**: Small/Medium/Large + Inline/Circular/Rectangular حسب `SunnahWidgetFamilySupport`.

## متبقٍّ (خارج المستودع)

- **App Group على ملفات توقيع المتجر = إجراء مالك**: تفعيل `group.com.yousef.majlisilm` لمعرّفات `com.yousef.majlisilm` و`.PrayerWidget` و`.PrayerLiveActivity` في Apple Developer وإعادة توليد ملفات التوقيع.
- **شهادة الجهاز**: مصفوفة `WIDGET_DEVICE_VALIDATION_MATRIX.md` على جهاز فعلي (التفاف العشاء ومنتصف الليل يحتاجان مراقبة ليلة كاملة).
- `upcomingDays` يُنشر فقط حين يطابق موقع الحمولة الموقع النشط (لا خلط مواقع)؛ غير ذلك يبقى السلوك السابق (تقريب الغد بدقائق اليوم).
