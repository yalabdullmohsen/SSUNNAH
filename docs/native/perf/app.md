# أداء الإقلاع — التطبيق الأصلي (ن4)

القياس: Release على محاكي n4-sim، 10 تشغيلات، وسيط، عبر `scripts/launch-probe.sh <UDID> 10` (علامات ms منذ بدء العملية، `-perfProbe YES`). **المحاكي محمّل بعمليات كثيرة ⇒ تباين كبير؛ الأرقام للمقارنة النسبية لا لأداء الجهاز.** لا قياس على جهاز حقيقي بعد.

| العلامة | قبل | بعد |
|---|---|---|
| initStart (تحميل الثنائي) | 518 | 406 |
| initDone (registerAll + MetricKit + الإشعارات) | 552 | 427 |
| bodyEval | 826 | 557 |
| firstAppear | 1697 | 1345 |
| bodyEval → firstAppear | ≈ 870 | ≈ 790 (منها بناء PlatformServices مرة واحدة ≈ 155) |

(«قبل» و«بعد» من جلستين مختلفتي الحمل؛ الفرق المطلق في initStart وحده ≈ 110ms ضجيج، فاحسب الفرق النسبي بين العلامات.)

## ما نُفِّذ
- `HomeDailyContent.load` (فك JSON) من `.onAppear` على الخيط الرئيسي إلى `.task` + `Task.detached` — يخرج من مسار أول رسم.
- `PlatformServices` (Keychain/Supabase/Shared/Offline/LiveActivity) كانت تُنشأ داخل `body` عند كل تقييم ⇒ `static let` مرة واحدة.
- `PerformanceMetrics.start()` آمن عند التكرار (OnceGuard، #3238).

## ما لم يلزم
- تأجيل `RouteResolver.registerAll`/MetricKit/الإشعارات: كلفة `init` كلها ≈ 34ms.
- `PrayerWidgetPublisher.publish()` ≈ 14ms.
- تخزين الصور: لا ينطبق (لا تحميل صور في الكود).

## المتبقي
الفجوة الأكبر ≈ 630ms بين بناء الخدمات وأول ظهور = بناء/تخطيط `RootTabView` والرئيسية في SwiftUI؛ تحتاج Instruments (SwiftUI) على جهاز.

## حد التشغيل الدافئ (<400ms، تسامح 20% ⇒ 480ms)
غير مفروض آليًا: على المحاكي المحمّل التباين بين التشغيلات (min/max) يتجاوز ±50% فيصير الحد إنذارًا كاذبًا. يُفرض بعد قياس على جهاز أو محاكٍ معزول.

## الرئيسية خلف الحركة الافتتاحية (2026-10-15، Release على n4-sim، 10 تشغيلات باردة، وسيط ms منذ بدء العملية)
`IntroHost` يبني الرئيسية فعلًا خلف المقدّمة (ZStack، شفافية 0) لا بعدها؛ أُضيفت معالم `OSSignposter` («launch.milestone» في Points of Interest) عبر `IntroHost(onMilestone:)`:

| المعلم | وسيط | min–max |
|---|---|---|
| firstAppear (الرئيسية مبنية خلف الحركة) | 524 | 476–1250 |
| introFirstFrame (أول إطار للحركة) | 547 | 504–1298 |
| homeReady / introApproach (بدء كشف الرئيسية) | 1444 / 1447 | 1402–2233 |

- الرئيسية جاهزة قبل أول إطار للحركة بـ≈23ms، والمستخدم لا ينتظرها؛ الفاصل حتى الكشف (≈900ms) هو زمن الحركة المعتمد نفسه (IntroPolicy)، لا انتظار بيانات.
- لا «قبل» مقيس لـintroFirstFrame (المعلم جديد). قيمة firstAppear هنا أقل من 1345ms المسجّلة في #3252 لتغيّر حمل المحاكي بين الجلستين؛ المقارنة بينهما غير صالحة، والتباين بين التشغيلات يبقى كبيرًا (راجع حد التشغيل الدافئ).

## تأجيل عمل الإقلاع إلى ما بعد أول إطار (2026-10-15)
المنقول من `SunnahApp.init`/المسار الحرج إلى `PostFirstFrame` (يُطلَق عند `introFirstFrame` أو بمهلة احتياطية 600ms): بناء `PlatformServices` (Keychain/Supabase/الصوت/Live Activity)، `PrayerWidgetPublisher.publish`، و`NativeNotificationsLifecycle.didBecomeActive` (إعادة الجدولة). **باقٍ في `init`:** تسجيل BGTask (`didFinishLaunching`) لأن Apple تشترطه قبل نهاية الإطلاق وإلا يتعطل التطبيق؛ والجدولة الفعلية مؤجَّلة.
- **القياس قبل/بعد: غير مُنجز.** حدّ العمليات للمستخدم كان 96% (1289/1333) فرفض `build-slot` بناء «قبل» بعد 10 دقائق؛ لا أرقام مقارنة صالحة، ولا أدّعي تحسنًا. المرجع الأقدم (نفس المحاكي، قبل التغيير): introFirstFrame وسيط 547، firstAppear 524، homeReady 1444 ms.
- يُعاد القياس (`scripts/launch-probe.sh`) حين ينخفض الحمل، والحقيقي بعد الرفع من Xcode Organizer/MetricKit. بلا حد آلي.
