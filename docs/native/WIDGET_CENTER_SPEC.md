# مركز الودجات — مواصفة التسليم إلى ن3 (الدفعة الثالثة)

كُتبت من الكود الفعلي في `native-app` بعد #3402. ما لم يُبنَ مذكور صراحةً تحت «المتبقي»؛ لا شيء هنا مُدّعى دون أثر في الكود.

## قرارات معتمدة (يوسف — لا يُعاد النقاش فيها)
1. ودجات الصلاة الخمسون المعتمدة كلها.
2. خطا الثلث والرقعة للودجات منفصلان عن خطوط التطبيق.
3. الأرقام لاتينية.
4. ذكر قصير يتبدل كل ساعة.
5. عدّاد الصلاة ينتقل إلى التالية بعد 30 دقيقة من دخول الوقت (دون ذكر «الأذان» في النص الظاهر).
6. ودجت المصحف يعرض آخر موضع توقف.

## ما بُني (#3065، #3402)
- الشاشة `/widget-center`: `Sections/account/AccountWidgetCenterScreen.swift` — بطاقة الصلاة القادمة (تستهلك مخرجات المحرك فقط، لا حساب مواقيت)، آية اليوم (`DailyAyahEntry.pick`، يوم Asia/Kuwait منذ epoch ثم `%` الطول كما في الموقع)، الوِرد.
- الكتالوج: `WidgetCatalogCategory` و`WidgetCatalogItem` في الملف نفسه؛ الأسماء والأوصاف كما في كتالوجات الامتداد `PrayerWidget/Sunnah*WidgetCatalog.swift`. إرشاد التخصيص (كيف تُضاف الودجة من الشاشة الرئيسية/القفل).
- الاختبارات: `Tests/SunnahNativeTests/WidgetCenterTests.swift` — الفراغ، مطابقة فهرس اليوم مع الموقع، تفرّد معرّفات الكتالوج وامتلاء كل تصنيف.
- مكوّنات الواجهة: مشتركة من `Components/**` (`SunnahListRow`، `SunnahSectionHeader`…)؛ لا نظام بطاقات جديد.

## الامتداد والبيانات (ملكية ن4/ن1 كما في OWNERSHIP.md)
- App Group: `group.com.yousef.majlisilm` (App وPrayerWidget وPrayerLiveActivity entitlements).
- App Intents: `PrayerWidget/SunnahWidgetIntents.swift` و`SelectPrayerDesignIntent` (`AppIntentConfiguration` في `PrayerTimesWidget.swift`).
- النشر من التطبيق: `ios-native/SunnahApp/Platform/PrayerWidgetPublisher.swift` و`SharedDataPublisher.swift` وجسر `SunnahSharedDataPlugin.swift`؛ التحديث: `Shared/SunnahWidgetRefreshCoordinator.swift`.
- أي ملف Swift جديد داخل `PrayerWidget/` أو App Intent جديد يحتاج تسجيلًا في `pbxproj` عبر `generate-xcodeproj.rb` (طلب لـن4)؛ لا تعديل يدوي في pbxproj.

## المتبقي للدفعة الثالثة
1. أن تتحكم الشاشة في تفضيلات الودجة (نمط الصلاة، الحجم) عبر App Group بدل الإرشاد النصي فقط — يحتاج Intent مشتركًا وتسجيلًا في pbxproj.
2. معاينة حية لكل ودجة في الكتالوج (تستخدم `SunnahWidgetPreviewFixtures.swift`) بدل الوصف.
3. حالات فارغ/تحميل/خطأ موحّدة (الأنماط جاهزة في `Templates/**`).
4. لقطات فاتح/داكن وXXXL وiPad من بناء HEAD عبر `native-shot-guard.sh` قبل أي وسم.

## قيود
- لا مساس بحساب المواقيت أو جدولة الأذان؛ ولا نص شرعي من خارج مصادر المشروع.
- لا ذكر «الأذان» في النص الظاهر (NoAdhanNamingTests).
- أرقام لاتينية؛ التصميم من رموز Swift في `Design/**` (ملكية ن1) — لا ألوان حرفية.
- لوحة التصميم المرجعية: لوحة PrayerWidgets/LockWidgets التي اعتمدها يوسف (#3399)؛ لا ملف لوحة داخل المستودع، فلتُراجع صور #3399 وبُنى `PrayerWidgetViews.swift`.

## مسارات يملكها ن3 (مقترحة لـOWNERSHIP.md)
- `Sections/account/AccountWidgetCenterScreen.swift`
- `Tests/SunnahNativeTests/WidgetCenterTests.swift`
- `docs/native/WIDGET_CENTER_SPEC.md`

## قائمة تسجيل pbxproj (لـن4 — قبل البناء النهائي)
التسجيل عبر `generate-xcodeproj.rb` فقط؛ لا تعديل يدوي. مسارات نسبة إلى `artifacts/majalis/ios/App/`.

**الدفعة الحالية (هذا الـPR): لا تسجيل مطلوب.** الملفان داخل حزمة SPM `SunnahNative` (تلتقطهما الحزمة تلقائيًا، ولا مدخل لهما في pbxproj):
- `SunnahNative/Sources/SunnahNative/Sections/account/AccountWidgetCenterScreen.swift` (معدَّل)
- `SunnahNative/Tests/SunnahNativeTests/WidgetCenterTests.swift` (اختبارات الحزمة)

**الدفعة الثالثة (لم تُكتب بعد؛ تُسجَّل فور وصولها). المقترح:**

| الملف الجديد | الهدف (target) | المجموعة (group) | الغرض |
|---|---|---|---|
| `Shared/SunnahWidgetPreferences.swift` | التطبيق + الودجت + الساعة | `Shared` | مفاتيح App Group وقراءة/كتابة تفضيلات الودجة (نمط الصلاة، الحجم) |
| `PrayerWidget/SunnahWidgetCenterIntents.swift` | الودجت فقط | `PrayerWidget` | App Intent للتحكم في التفضيلات من الشاشة |
| `PrayerWidget/SunnahWidgetCenterPreviews.swift` | الودجت فقط | `PrayerWidget` | معاينة حية لكل ودجة بـ`SunnahWidgetPreviewFixtures.swift` |

الساعة: لا ودجة ساعة جديدة؛ تستهلك `SunnahWidgetPreferences.swift` وحده إن لزم. الاختبارات الجديدة تبقى داخل حزمة SunnahNative (بلا pbxproj). إن تغيّر المقترح عند الكتابة أحدّث هذا الجدول في الـPR نفسه.
