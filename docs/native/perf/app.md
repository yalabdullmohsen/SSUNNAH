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
