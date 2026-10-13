# BACKLOG (مولَّد آليًا — لا يُحرَّر يدويًا)

مراجع bundled: 112 · مفقود: 0 · JSON تالف: 0 · فارغ (تحذير): 0

مرتّب بالأكبر أثرًا أولًا (العدد = عدد الملفات/الشاشات المتأثرة).

| # | الأثر | النوع | البند | المالك المقترح | النافذة المالكة (من PR/فرع مفتوح) |
|---|---|---|---|---|---|
| 1 | 0 | بعد الإطلاق | Live Activity فقط (ويدجت «الصلاة القادمة» بُنيت وتُرسم على n4-sim؛ يبقى النشاط الحي ومفتاح NSSupportsLiveActivities مخفيَّين حتى بعد الإطلاق) | غير مُسنَد | غير مُسنَد — بلا PR مفتوح |

## تنظيف ما بعد الإطلاق
قرار المالك (2026-10-13): مؤجَّل إلى ما بعد الإطلاق، لا يُنفَّذ قبله. المصدر: `docs/native/CLEANUP_PLAN.md` (المرحلة 2).

- الهدف: حذف التطبيق القديم فعليًا (≈8.7MB): `ios/App/App` و`App.xcodeproj` و`CapApp-SPM` و`SunnahWeb`، ولاناتا `beta`/`build_only` في Fastfile، وworkflow `ios-testflight-deploy`.
- يستلزم تعديل/حذف بوابات تقرؤها: `test-ios-capacitor-gates.mjs` (في `ci:local`) وملفات `*-gate.test.ts` المذكورة في الخطة وworkflow `ios-capacitor-gates` — أي مساس بـCI على main فيلزم قرار صريح.
- يُنفَّذ في commit واحد قابل للتراجع، على فرع من native-app، ثم يتحقق: native-quick-check وnative-release-check وswift test (240/37) وnative_beta بـupload:false.
- يبقى كما هو: كل ما يخص الموقع وVercel و`ios-native` و`SunnahNative`/`SunnahDataKit`/`SunnahPrayer`/`Shared`/`SunnahWidgetKit`/`PrayerWidget`.
